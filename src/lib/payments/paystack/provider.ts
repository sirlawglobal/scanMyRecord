import crypto from "node:crypto";
import type {
  IPaymentProvider,
  InitializePaymentParams,
  PaymentInitResult,
  PaymentVerifyResult,
  WebhookResult,
} from "../interface";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY?.trim();
}

async function mockInitializePayment(params: InitializePaymentParams): Promise<PaymentInitResult> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    authorizationUrl: `https://example-paystack.com/checkout/${params.reference}?amount=${params.amount}&email=${encodeURIComponent(params.email)}&callback=${encodeURIComponent(params.callbackUrl ?? "/")}`,
    accessCode: `access_${params.reference}`,
    reference: params.reference,
  };
}

async function mockVerifyPayment(reference: string): Promise<PaymentVerifyResult> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return { status: "success", reference, amount: 0, currency: "NGN" };
}

export const paystackProvider: IPaymentProvider = {
  async initializePayment(params) {
    const secretKey = getSecretKey();

    if (!secretKey) {
      return mockInitializePayment(params);
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amount * 100),
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });

    const body = await response.json();

    if (!response.ok || !body?.status) {
      throw new Error(body?.message ?? "Failed to initialize Paystack transaction.");
    }

    return {
      authorizationUrl: body.data.authorization_url,
      accessCode: body.data.access_code,
      reference: body.data.reference,
    };
  },

  async verifyPayment(reference) {
    const secretKey = getSecretKey();

    if (!secretKey) {
      return mockVerifyPayment(reference);
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    const body = await response.json();

    if (!response.ok || !body?.status) {
      throw new Error(body?.message ?? "Failed to verify Paystack transaction.");
    }

    const status: PaymentVerifyResult["status"] =
      body.data.status === "success" ? "success" : body.data.status === "abandoned" ? "pending" : "failed";

    return {
      status,
      reference: body.data.reference,
      amount: Number(body.data.amount ?? 0) / 100,
      currency: body.data.currency ?? "NGN",
    };
  },

  async handleWebhook(rawBody, signature): Promise<WebhookResult> {
    const secretKey = getSecretKey();

    if (!secretKey || !signature) {
      return { valid: false };
    }

    const expectedSignature = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

    if (expectedSignature !== signature) {
      return { valid: false };
    }

    let payload: {
      event?: string;
      data?: { reference?: string; status?: string; amount?: number };
    };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return { valid: false };
    }

    const reference = payload.data?.reference;

    if (!payload.event || !reference) {
      return { valid: false };
    }

    return {
      valid: true,
      event: payload.event,
      reference,
      status: payload.data?.status === "success" ? "success" : "failed",
      amount: Number(payload.data?.amount ?? 0) / 100,
    };
  },
};
