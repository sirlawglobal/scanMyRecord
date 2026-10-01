"use client";

import { useState } from "react";
import Spinner from "@/components/ui/Spinner";

export type ProjectMediaItem = {
  url: string;
  type: "image" | "video";
  stage: "before" | "after" | "general";
  caption: string;
};

type ProjectMediaManagerProps = {
  value: ProjectMediaItem[];
  onChange: (media: ProjectMediaItem[]) => void;
};

const MAX_VIDEO_SECONDS = 60 * 60;

const STAGE_LABELS: Record<ProjectMediaItem["stage"], string> = {
  before: "Before",
  after: "After",
  general: "General",
};

type UploadBody = {
  url?: string;
  type?: string;
  message?: string;
  secure_url?: string;
  error?: { message?: string };
};
type UploadResponse = { ok: boolean; body: UploadBody };

// fetch() cannot report upload progress, so uploads use XMLHttpRequest.
function postWithProgress(
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      let body: UploadBody = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON response (e.g. a proxy error page)
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, body });
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.send(formData);
  });
}

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

// Videos go straight from the browser to Cloudinary: Vercel rejects request
// bodies over ~4.5MB, so they cannot be proxied through our own API.
async function uploadVideoDirect(
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ url: string; type: "video" }> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error("Unsupported video type. Use MP4, WEBM or MOV.");
  }

  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`"${file.name}" is too large. Maximum video size is 100MB.`);
  }

  const signResponse = await fetch("/api/admin/media/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resourceType: "video" }),
  });
  const sign = await signResponse.json().catch(() => ({}));

  if (!signResponse.ok) {
    throw new Error(sign?.message ?? "Could not authorise the video upload.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);

  const { ok, body } = await postWithProgress(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`,
    formData,
    onProgress,
  );

  if (!ok || !body?.secure_url) {
    throw new Error(body?.error?.message ?? `Failed to upload "${file.name}" to Cloudinary.`);
  }

  return { url: body.secure_url as string, type: "video" };
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Could not read video metadata."));
    };
    video.src = URL.createObjectURL(file);
  });
}

export function ProjectMediaManager({ value, onChange }: ProjectMediaManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ percent: number; name: string; index: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const uploads: ProjectMediaItem[] = [];

      const fileList = Array.from(files);

      for (const [fileIndex, file] of fileList.entries()) {
        const report = (percent: number) =>
          setProgress({ percent, name: file.name, index: fileIndex + 1, total: fileList.length });
        report(0);

        if (file.type.startsWith("video/")) {
          const duration = await readVideoDuration(file).catch(() => 0);
          if (duration > MAX_VIDEO_SECONDS) {
            throw new Error(
              `"${file.name}" is ${Math.round(duration)}s long. Keep clips under ${MAX_VIDEO_SECONDS / 60} minutes.`,
            );
          }
        }

        const isVideo = file.type.startsWith("video/");
        let data: { url?: string; type?: string };

        if (isVideo) {
          data = await uploadVideoDirect(file, report);
        } else {
          const formData = new FormData();
          formData.append("file", file);

          const result = await postWithProgress("/api/admin/media/upload", formData, report);

          data = result.body;

          if (!result.ok) {
            throw new Error((data as { message?: string })?.message ?? `Failed to upload "${file.name}".`);
          }
        }

        uploads.push({
          url: data.url as string,
          type: data.type === "video" ? "video" : "image",
          stage: "general",
          caption: "",
        });
      }

      onChange([...value, ...uploads]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload media.");
    } finally {
      setIsUploading(false);
      setProgress(null);
      event.target.value = "";
    }
  }

  function updateStage(index: number, stage: ProjectMediaItem["stage"]) {
    onChange(value.map((item, i) => (i === index ? { ...item, stage } : item)));
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;

    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {value.length > 0 ? (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <div className="relative aspect-square">
                {item.type === "video" ? (
                  <video src={item.url} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                )}

                {item.type === "video" ? (
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    ▶ Video
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                >
                  Remove
                </button>

                <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="rounded-full bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white disabled:opacity-30"
                    aria-label="Move earlier"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === value.length - 1}
                    className="rounded-full bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white disabled:opacity-30"
                    aria-label="Move later"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="flex gap-1 p-1.5">
                {(["before", "after", "general"] as const).map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => updateStage(index, stage)}
                    className={`flex-1 rounded-lg px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                      item.stage === stage
                        ? "bg-navy-900 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {STAGE_LABELS[stage]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-3 py-6 text-sm font-medium text-slate-600 transition hover:border-navy-900 hover:text-navy-900">
        {isUploading ? (
          <span className="flex items-center gap-2">
            <Spinner size={18} label="Uploading" />
            Uploading...
          </span>
        ) : (
          "Click to upload photos or short video clips"
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={handleFiles}
          disabled={isUploading}
        />
      </label>
      {isUploading && progress ? (
        <div className="mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
            <span className="truncate">
              Uploading {progress.index}/{progress.total}: {progress.name}
            </span>
            <span>{progress.percent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-200"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      ) : null}
      <p className="mt-1.5 text-xs text-slate-400">
        Tag each photo as Before / After to power the comparison slider on the public page. Video clips should be under {MAX_VIDEO_SECONDS / 60} minutes and 100MB.
      </p>

      {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
