// components/emails/ReportEmailTemplate.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Section,
  Text,
  Img,
} from "@react-email/components";

interface ReportEmailTemplateProps {
  userName: string;
  releaseTitle: string;
  reportUrl: string;
  isPremium: boolean;
  ctaUrl: string;
  adminNotes?: string;
}

export function ReportEmailTemplate({
  userName,
  releaseTitle,
  reportUrl,
  isPremium,
  ctaUrl,
  adminNotes,
}: ReportEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Img
              src="https://res.cloudinary.com/dmr4fxsg4/image/upload/v1752692344/logo_lwxqev.png"
              width="150"
              height="auto"
              alt="PressRelease Logo"
            />
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={paragraph}>
              Great news! Your press release{" "}
              <strong style={highlight}>{releaseTitle}</strong> has been
              featured on PressRelease.in.
            </Text>

            <Text style={paragraph}>
              We&apos;ve prepared a detailed report for you to track the
              performance and reach of your press release.
            </Text>

            {/* Admin Notes */}
            {adminNotes && (
              <Section style={notesSection}>
                <Text style={notesLabel}>Your Press Release Update</Text>
                <Text style={notesContent}>{adminNotes}</Text>
              </Section>
            )}

            {/* Premium/Free Message */}
            {isPremium ? (
              <Section style={premiumSection}>
                <Text style={paragraph}>
                  As a premium member, you have access to detailed analytics and
                  insights in your dashboard.
                </Text>
              </Section>
            ) : (
              <Section style={freeSection}>
                <Text style={paragraph}>
                  Ready to unlock advanced analytics and reach more audiences?
                  Consider upgrading to our premium plan for detailed insights
                  and enhanced distribution.
                </Text>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={ctaUrl}>
                {isPremium ? "View Dashboard" : "Upgrade to Premium"}
              </Button>
            </Section>

            {/* Report Download */}
            <Section style={reportSection}>
              <Text style={reportLabel}>Your Report:</Text>
              <Link
                href={isPremium ? reportUrl : "https://pressrelease.in/pricing"}
                style={reportLink}
              >
                Download Report PDF
              </Link>
            </Section>

            <Hr style={divider} />

            {/* Footer */}
            <Text style={footer}>
              Thank you for using Press Release India. If you have any
              questions, feel free to contact us.
            </Text>
          </Section>

          {/* Footer Section */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © 2025 Press Release India. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f3f3f5",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginBottom: "64px",
  padding: "20px 0 48px",
  marginTop: "40px",
};

const headerSection = {
  backgroundColor: "#006bff30",
  padding: "24px",
  textAlign: "center" as const,
};

const contentSection = {
  padding: "24px",
};

const greeting = {
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px 0",
  color: "#1a1a1a",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 16px 0",
  color: "#555555",
};

const highlight = {
  color: "#1a1a1a",
};

const notesSection = {
  backgroundColor: "#f5f5f5",
  padding: "16px",
  borderRadius: "8px",
  margin: "16px 0",
};

const notesLabel = {
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "0 0 8px 0",
  color: "#666666",
};

const notesContent = {
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
  color: "#555555",
};

const premiumSection = {
  backgroundColor: "#f0f7ff",
  padding: "16px",
  borderRadius: "8px",
  margin: "16px 0",
};

const freeSection = {
  backgroundColor: "#fff5f0",
  padding: "16px",
  borderRadius: "8px",
  margin: "16px 0",
};

const buttonSection = {
  textAlign: "center" as const,
  padding: "24px 0",
};

const button = {
  backgroundColor: "#006bff",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block" as const,
};

const reportSection = {
  padding: "16px 0",
  textAlign: "center" as const,
};

const reportLabel = {
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "0 0 8px 0",
  color: "#666666",
};

const reportLink = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#0066cc",
  textDecoration: "underline",
};

const divider = {
  borderColor: "#e5e5e5",
  margin: "24px 0",
};

const footer = {
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "16px 0 0 0",
  color: "#999999",
  textAlign: "center" as const,
};

const footerSection = {
  backgroundColor: "#f3f3f5",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#888888",
  margin: "0",
};
