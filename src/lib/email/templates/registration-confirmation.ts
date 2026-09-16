export type RegistrationEmailPayload = {
  reference: string;
  fullName: string;
  email: string;
  phone?: string;
  programmeTitle: string;
  programmeCategory?: string;
  programmeSlug?: string;
  politicianName?: string;
  politicianOffice?: string;
  politicianConstituency?: string;
  appUrl?: string;
};

export function renderRegistrationConfirmationEmail(data: RegistrationEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const politicianName = data.politicianName || "Mr. Temple";
  const politicianOffice = data.politicianOffice || "Governor of the state";
  const politicianConstituency = data.politicianConstituency || "Ife East Federal Constituency";
  const appUrl = data.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const programmeUrl = `${appUrl}/programmes/${data.programmeSlug || ""}`;

  const subject = `Registration Confirmed [${data.reference}]: ${data.programmeTitle}`;

  const text = `
Registration Confirmed - Scan My Record

Dear ${data.fullName},

Thank you for registering for "${data.programmeTitle}".
Your application has been received and logged into the public accountability record.

YOUR OFFICIAL REFERENCE NUMBER:
${data.reference}

Programme: ${data.programmeTitle}
Category: ${data.programmeCategory || "Community Empowerment"}
Office: ${politicianOffice} (${politicianConstituency})
Leader: ${politicianName}

Please save this reference number. It will be required for accreditation and beneficiary verification.

View details: ${programmeUrl}

Scan My Record — Public Civic Accountability Platform
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
    .reference-box { background-color: #fdf8ec; border: 2px dashed #d97706; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .reference-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #92400e; margin: 0; }
    .reference-code { font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 800; color: #060c1a; margin: 8px 0 0 0; letter-spacing: 0.1em; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .details-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .details-table td:first-child { font-weight: 600; color: #64748b; width: 35%; }
    .details-table td:last-child { color: #0f172a; font-weight: 500; }
    .instructions { background-color: #f8fafc; border-left: 4px solid #060c1a; border-radius: 0 8px 8px 0; padding: 14px 16px; margin-bottom: 28px; font-size: 13px; color: #475569; line-height: 1.5; }
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
      <h1 class="header-title">Registration Confirmed</h1>
      <p class="header-sub">Public Accountability Record</p>
    </div>

    <div class="body">
      <p class="greeting">Dear ${data.fullName},</p>
      <p class="lead-text">
        Thank you for registering. Your application for <strong>${data.programmeTitle}</strong> has been received and securely logged into the civic accountability database.
      </p>

      <div class="reference-box">
        <p class="reference-label">Your Tracking Reference Code</p>
        <p class="reference-code">${data.reference}</p>
      </div>

      <table class="details-table">
        <tr>
          <td>Initiative</td>
          <td><strong>${data.programmeTitle}</strong></td>
        </tr>
        <tr>
          <td>Target Sector</td>
          <td>${data.programmeCategory || "Community Welfare"}</td>
        </tr>
        <tr>
          <td>Office Holder</td>
          <td>${politicianName} (${politicianOffice})</td>
        </tr>
        <tr>
          <td>Constituency</td>
          <td>${politicianConstituency}</td>
        </tr>
        <tr>
          <td>Registered Email</td>
          <td>${data.email}</td>
        </tr>
      </table>

      <div class="instructions">
        <strong>Important Next Steps:</strong><br>
        Please save this tracking reference number. It will be required for physical accreditation, beneficiary roll-call, and workshop participation.
      </div>

      <div class="btn-container">
        <a href="${programmeUrl}" class="btn">View Programme Details →</a>
      </div>
    </div>

    <div class="footer">
      <p class="footer-politician">${politicianName} &bull; ${politicianOffice}</p>
      <p>${politicianConstituency}</p>
      <p style="margin-top: 12px; font-size: 11px;">This automated notification was generated by the Scan My Record platform.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html, text };
}
