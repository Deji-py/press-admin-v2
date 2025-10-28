import { ReportEmailTemplate } from "@/emails/ReportEmailTemplate";
import { render } from "@react-email/components";
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

interface SendReportEmailParams {
  email: string;
  userName: string;
  releaseTitle: string;
  reportUrl: string;
  isPremium: boolean;
  adminNotes?: string;
}

export async function sendReportEmail({
  email,
  userName,
  releaseTitle,
  reportUrl,
  isPremium,
  adminNotes,
}: SendReportEmailParams) {
  try {
    const dashboardUrl = "https://pressrelease.in/dashboard";
    const pricingUrl = "https://pressrelease.in/pricing";
    const ctaUrl = isPremium ? dashboardUrl : pricingUrl;

    const htmlElement = await render(
      ReportEmailTemplate({
        userName,
        releaseTitle,
        reportUrl,
        isPremium,
        ctaUrl,
        adminNotes,
      })
    );

    const result = await resend.emails.send({
      from: "Your Press Release Report<hello@pressrelease.in>",
      to: email,
      subject: `Your Press Release Report: ${releaseTitle}`,
      html: htmlElement,
    });

    if (result.error) {
      throw new Error(`Email send failed: ${result.error.message}`);
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Email service error:", error);
    throw error;
  }
}
