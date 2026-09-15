export default async function RegistrationConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const reference = ref ?? "SMR-2026-000000";

  return (
    <main>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-elevated">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Registration received</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900">Thank you for registering</h1>
          <p className="mt-4 text-slate-600">Your application has been submitted successfully.</p>

          <div className="mt-8 rounded-2xl border border-gold-100 bg-gold-50 p-6">
            <p className="text-sm text-slate-500">Reference number</p>
            <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-navy-900">{reference}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
