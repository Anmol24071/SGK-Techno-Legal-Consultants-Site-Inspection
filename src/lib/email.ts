import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  name: string;
  type: "GRANTED" | "DENIED" | "NEW_REQUEST" | "PROFILE_SHARED";
}

export async function sendAccessEmail({ to, name, type }: SendEmailParams) {
  const fromEmail = process.env.EMAIL_FROM || "SGK Techno-Legal Consultants <noreply@sgkconsultants.com>";

  const isGranted = type === "GRANTED";
  const isNewRequest = type === "NEW_REQUEST";
  const isProfileShared = type === "PROFILE_SHARED";

  const subject = isProfileShared
    ? `Profile Information Received – SGK Techno-Legal Consultants`
    : isNewRequest
    ? `New Employee Access Request – ${name}`
    : isGranted
    ? "Access Granted – SGK Techno-Legal Consultants"
    : "Access Request Update – SGK Techno-Legal Consultants";

  const bodyText = isProfileShared
    ? `Hello ${name},

Your profile and access request information has been successfully received by SGK Techno-Legal Consultants.

Your access request is currently pending Administrator approval. You will receive an email notification once your access request has been reviewed.

You can sign in using your approved Google account (${to}) once access is granted.

Regards,
SGK Techno-Legal Consultants`
    : isNewRequest
    ? `Hello Administrator,

A new user has submitted an access request for SGK Techno-Legal Consultants:

Name: ${name}
Email: ${to}

Please log in to your Admin Dashboard at ${process.env.NEXTAUTH_URL || 'https://sgk-techno-legal-consultants-si.vercel.app'} to approve or deny this request.

Regards,
SGK Techno-Legal Consultants`
    : isGranted
    ? `Hello ${name},

Your access request for SGK Techno-Legal Consultants has been approved.

You can now sign in using the Google account associated with:
${to}

Regards,
SGK Techno-Legal Consultants`
    : `Hello ${name},

Your access request for SGK Techno-Legal Consultants has been denied.

If you believe this was done in error, please contact the administrator.

Regards,
SGK Techno-Legal Consultants`;

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 16px; border-radius: 6px 6px 0 0; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">SGK TECHNO-LEGAL CONSULTANTS</h2>
      </div>
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        ${
          isProfileShared
            ? `<p style="font-size: 16px; font-weight: bold; margin-top: 0;">Hello ${name},</p>
               <p>Your profile and access request information has been successfully received.</p>
               <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 14px; color: #0f172a; margin: 16px 0;">
                 <strong>Google Account Email:</strong> ${to}<br/>
                 <strong>Status:</strong> Pending Administrator Approval
               </div>
               <p>Your access request is currently under review by our administration team. You will receive an automated email as soon as your access is approved.</p>`
            : isNewRequest
            ? `<p style="font-size: 16px; font-weight: bold; margin-top: 0;">New Access Request Submitted</p>
               <p>A new employee has signed in with Google and is awaiting administrator approval:</p>
               <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 14px; color: #0f172a; margin: 16px 0;">
                 <strong>Name:</strong> ${name}<br/>
                 <strong>Email:</strong> ${to}
               </div>
               <div style="text-align: center; margin: 24px 0;">
                 <a href="${process.env.NEXTAUTH_URL || 'https://sgk-techno-legal-consultants-si.vercel.app'}/admin/requests" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Manage Access Requests</a>
               </div>`
            : `<p style="font-size: 16px; font-weight: bold; margin-top: 0;">Hello ${name},</p>
               ${
                 isGranted
                   ? `<p>Your access request for <strong>SGK Techno-Legal Consultants</strong> has been approved.</p>
                      <p>You can now sign in using your Google account associated with:</p>
                      <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px; color: #0f172a; margin: 16px 0;">
                        ${to}
                      </div>
                      <div style="text-align: center; margin: 24px 0;">
                        <a href="${process.env.NEXTAUTH_URL || 'https://sgk-techno-legal-consultants-si.vercel.app'}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Inspection Portal</a>
                      </div>`
                   : `<p>Your access request for <strong>SGK Techno-Legal Consultants</strong> has been denied.</p>
                      <p>If you believe this was done in error, please contact the administrator.</p>`
               }`
        }
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">
          Regards,<br />
          <strong>SGK Techno-Legal Consultants</strong>
        </p>
      </div>
    </div>
  `;

  // Always log the email to server output for audit and local verification
  console.log(`\n=================== TRANSACTIONAL EMAIL DISPATCH ===================`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY:\n${bodyText}`);
  console.log(`===================================================================\n`);

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text: bodyText,
        html: bodyHtml,
      });

      return { success: true, mode: "smtp" };
    }

    return { success: true, mode: "simulated_log" };
  } catch (err: any) {
    console.error("Failed to send transactional email via SMTP:", err.message);
    return { success: false, error: err.message };
  }
}
