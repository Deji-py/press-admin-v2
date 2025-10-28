import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { uploadReportToSupabase } from "@/services/file-upload";
import { sendReportEmail } from "@/services/email-service";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const releaseId = formData.get("releaseId") as string;
    const userId = formData.get("userId") as string;
    const userEmail = formData.get("userEmail") as string;
    const userName = formData.get("userName") as string;
    const releaseTitle = formData.get("releaseTitle") as string;
    const isPremium = formData.get("isPremium") === "true";
    const adminNotes = (formData.get("adminNotes") as string) || undefined;

    // Validate inputs
    if (!file || !releaseId || !userId || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // Upload to Supabase
    const uploadResult = await uploadReportToSupabase({
      file: fileBuffer,
      fileName: file.name,
      releaseId,
      userId,
    });

    if (!uploadResult.publicUrl) {
      return NextResponse.json(
        { error: "Failed to get public URL for report" },
        { status: 500 }
      );
    }

    // Send email
    await sendReportEmail({
      email: userEmail,
      userName: userName || "User",
      releaseTitle: releaseTitle || "Your Press Release",
      reportUrl: uploadResult.publicUrl,
      isPremium,
      adminNotes,
    });

    // Update press release with report URL
    const { error: updateError } = await supabaseAdmin
      .from("press_releases")
      .update({
        pr_pdf_url: uploadResult.publicUrl,
        report_sent_at: new Date().toISOString(),
      })
      .eq("id", releaseId);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: updateError || "Failed to update press release" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        uploadPath: uploadResult.path,
        reportUrl: uploadResult.publicUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload report",
      },
      { status: 500 }
    );
  }
}
