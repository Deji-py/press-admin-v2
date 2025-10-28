import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UploadReportParams {
  file: Buffer;
  fileName: string;
  releaseId: string;
  userId: string;
}

export async function uploadReportToSupabase({
  file,
  fileName,
  releaseId,
  userId,
}: UploadReportParams) {
  try {
    const filePath = `${userId}/${releaseId}/${Date.now()}-${fileName}`;
    const bucketName = "press-release-reports";

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      path: data?.path,
      publicUrl: publicData?.publicUrl,
    };
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}
