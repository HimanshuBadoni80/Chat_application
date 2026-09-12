// this file is specific to resend
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  email: string = "himanshubadoni80@gmail.com",
  verifyToken: string,
  redirectTo: string,
  from: string | null,
) {
  const domain = process.env.NEXT_PUBLIC_APP_URL;
  let verificationUrl = `${domain}${redirectTo}?token=${verifyToken}&email=${encodeURIComponent(email)}`;

  // Only append 'from' if it actually exists
  if (from) {
    verificationUrl += `&from=${encodeURIComponent(from)}`;
  }
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Hello world",
      html: ` <h1>welcome</h1>
      <p>click the link below to verify your email to get start with chat</p>
      <a href="${verificationUrl}">verify email</a>`,
    });
  } catch (error) {
    console.error("failed to send email:", error);
    // We throw the error so the API route knows it failed
    throw new Error("failed to send email");
  }
}
