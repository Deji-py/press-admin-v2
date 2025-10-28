/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== UPLOAD DIALOG COMPONENT ====================
// components/dialogs/UploadReportDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCrud";

const reportSchema = z.object({
  report: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Report PDF is required")
    .refine((file) => file.type === "application/pdf", "File must be a PDF"),
  adminNotes: z
    .string()
    .max(500, "Notes must not exceed 500 characters")
    .optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface UploadReportDialogProps {
  open: boolean;
  selectedRow: any;
  onClose: () => void;
}

function UploadReportDialog({
  open,
  selectedRow,
  onClose,
}: UploadReportDialogProps) {
  const { readOne: readOneUser } = useCRUD("users");
  const { readOne: readOneRelease } = useCRUD("press_releases");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      adminNotes: "",
    },
  });

  // Fetch press release data
  const { data: pressReleaseData, isLoading: isLoadingRelease } = useQuery({
    queryKey: ["press-release", selectedRow?.id],
    queryFn: async () => {
      if (!selectedRow?.id) return null;
      return await readOneRelease({
        where: "id",
        equalTo: selectedRow.id,
      });
    },
    enabled: open && !!selectedRow?.id,
  });

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", pressReleaseData?.user_id],
    queryFn: async () => {
      if (!pressReleaseData?.user_id) return null;
      return await readOneUser({
        where: "user_id",
        equalTo: pressReleaseData.user_id,
      });
    },
    enabled: !!pressReleaseData?.user_id,
  });

  // Submit to API route
  const { mutate: handleSubmitReport, isPending } = useMutation({
    mutationFn: async (values: ReportFormValues) => {
      if (!selectedFile || !selectedRow?.id || !userData?.email) {
        throw new Error("Missing required data");
      }

      const isPremium = userData?.isPremium === "premium";

      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("releaseId", selectedRow.id);
      formData.append("userId", userData.user_id);
      formData.append("userEmail", userData.email);
      formData.append("userName", userData.full_name || "User");
      formData.append(
        "releaseTitle",
        pressReleaseData?.title || "Your Press Release"
      );
      formData.append("isPremium", isPremium.toString());
      if (values.adminNotes) {
        formData.append("adminNotes", values.adminNotes);
      }

      // Call API route
      const response = await fetch("/api/upload-report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload report");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Report uploaded and email sent successfully!");
      form.reset();
      setSelectedFile(null);
      onClose();
    },
    onError: (error) => {
      console.error("Report submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload report. Please try again."
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      setSelectedFile(file);
      form.setValue("report", file);
    }
  };

  const handleCloseDialog = () => {
    form.reset();
    setSelectedFile(null);
    onClose();
  };

  const isLoading = isLoadingRelease || isLoadingUser;
  const hasRequiredData = userData?.email && pressReleaseData?.title;

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Press Release Report</DialogTitle>
          <DialogDescription>
            Upload a PDF report for this press release. An email will be sent to
            the user with their report link.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => handleSubmitReport(values))}
            className="space-y-4"
          >
            {/* Release Info Display */}
            {pressReleaseData && (
              <div className="bg-slate-50 p-3 rounded-md">
                <p className="text-sm font-medium text-slate-900">
                  {pressReleaseData.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  To: {userData?.email || "Loading..."}
                </p>
              </div>
            )}

            {/* File Upload Field */}
            <FormField
              control={form.control}
              name="report"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Report PDF <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={isPending || isLoading}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isPending || isLoading}
                      >
                        {selectedFile ? (
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              ✓ {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              PDF files only
                            </p>
                          </div>
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Admin Notes Field */}
            <FormField
              control={form.control}
              name="adminNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes for the user..."
                      className="min-h-[100px] resize-none"
                      disabled={isPending || isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These notes will be included in the email (max 500
                    characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isPending || isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending || isLoading || !selectedFile || !hasRequiredData
                }
              >
                {isPending
                  ? "Uploading..."
                  : isLoading
                    ? "Loading..."
                    : "Send Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(UploadReportDialog);
