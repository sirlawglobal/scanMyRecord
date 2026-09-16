export type DonationReceiptEmailPayload = {
  reference: string;
  donorName: string;
  amount: number;
  campaignTitle: string;
  campaignSlug?: string;
  politicianName?: string;
  politicianOffice?: string;
  politicianConstituency?: string;
  appUrl?: string;
};

export function renderDonationReceiptEmail(data: DonationReceiptEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const politicianName = data.politicianName || "Mr. Temple";
  const politicianOffice = data.politicianOffice || "Governor of the state";
  const politicianConstituency = data.politicianConstituency || "Ife East Federal Constituency";
  const appUrl = data.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const campaignUrl = `${appUrl}/fundraising/${data.campaignSlug || ""}`;
  const verifyUrl = `${appUrl}/fundraising/${data.campaignSlug || ""}/contribute/verify?ref=${data.reference}`;

  const formattedAmount = `₦${Number(data.amount || 0).toLocaleString()}`;
  const subject = `Official Donation Receipt [${data.reference}]: ${formattedAmount} - ${data.campaignTitle}`;

  const text = `
Official Donation Receipt - Scan My Record

Dear ${data.donorName},

Thank you for your generous contribution of ${formattedAmount} to "${data.campaignTitle}".
Your contribution has been confirmed, logged, and credited to the public accountability registry.

OFFICIAL RECEIPT REFERENCE:
${data.reference}

Amount Contributed: ${formattedAmount}
Campaign Drive: ${data.campaignTitle}
Constituency Office: ${politicianOffice} (${politicianConstituency})
Representative: ${politicianName}

Every contribution is tracked transparently for public trust and community impact.

Verify and view campaign progress:
${campaignUrl}

Scan My Record — Public Civic Accountability & Transparency Platform
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); }
    .header { background-color: #060c1a; padding: 32px 24px; text-align: center; color: #ffffff; background-image: radial-gradient(ellipse at 50% 0%, rgba(192, 138, 38, 0.25), transparent); }
    .logo-badge { display: inline-block; padding: 6px 14px; background: rgba(192, 138, 38, 0.15); border: 1px solid rgba(192, 138, 38, 0.35); border-radius: 20px; font-size: 11px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; color: #f2d98a; margin-bottom: 12px; }
    .header-title { margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; }
    .header-sub { margin-top: 6px; font-size: 13px; color: #94a3b8; }
    .body { padding: 32px 24px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
    .lead-text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .amount-box { background-color: #060c1a; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px; color: #ffffff; }
    .amount-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #f2d98a; margin: 0; }
    .amount-value { font-size: 36px; font-weight: 800; color: #ffffff; margin: 8px 0 0 0; }
    .reference-pill { display: inline-block; margin-top: 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 30px; padding: 4px 14px; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #e2e8f0; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .details-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .details-table td:first-child { font-weight: 600; color: #64748b; width: 35%; }
    .details-table td:last-child { color: #0f172a; font-weight: 500; }
    .transparency-note { background-color: #f8fafc; border-left: 4px solid #c08a26; border-radius: 0 8px 8px 0; padding: 14px 16px; margin-bottom: 28px; font-size: 13px; color: #475569; line-height: 1.5; }
    .btn-container { text-align: center; margin-bottom: 24px; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #060c1a; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 12px rgba(6, 12, 26, 0.25); }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5; }
    .footer-politician { font-weight: 600; color: #475569; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">Scan My Record</div>
      <h1 class="header-title">Official Donation Receipt</h1>
      <p class="header-sub">Civic Accountability & Community Development</p>
    </div>

    <div class="body">
      <p class="greeting">Dear ${data.donorName},</p>
      <p class="lead-text">
        Thank you for supporting community progress. Your contribution to <strong>${data.campaignTitle}</strong> has been successfully processed and verified.
      </p>

      <div class="amount-box">
        <p class="amount-label">Verified Contribution</p>
        <p class="amount-value">${formattedAmount}</p>
        <div class="reference-pill">Ref: ${data.reference}</div>
      </div>

      <table class="details-table">
        <tr>
          <td>Campaign Drive</td>
          <td><strong>${data.campaignTitle}</strong></td>
        </tr>
        <tr>
          <td>Payment Status</td>
          <td><strong style="color: #16a34a;">Confirmed / Verified</strong></td>
        </tr>
        <tr>
          <td>Constituency</td>
          <td>${politicianConstituency}</td>
        </tr>
        <tr>
          <td>Office</td>
          <td>${politicianOffice}</td>
        </tr>
        <tr>
          <td>Leadership</td>
          <td>${politicianName}</td>
        </tr>
      </table>

      <div class="transparency-note">
        <strong>Public Trust Commitment:</strong> All donations are accounted for directly in the constituency record and published transparently on Scan My Record.
      </div>

      <div class="btn-container">
        <a href="${campaignUrl}" class="btn" target="_blank" rel="noopener noreferrer">View Live Campaign Progress &rarr;</a>
      </div>
    </div>

    <div class="footer">
      <p class="footer-politician">${politicianName} &mdash; ${politicianOffice}</p>
      <p style="margin: 0;">Scan My Record &bull; Official Public Record Platform</p>
      <p style="margin: 6px 0 0 0; font-size: 11px; color: #cbd5e1;">Receipt ID: ${data.reference}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html, text };
}
