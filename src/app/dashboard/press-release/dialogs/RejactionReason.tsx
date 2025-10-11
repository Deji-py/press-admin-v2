/* eslint-disable @typescript-eslint/no-explicit-any */
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

import React, { useEffect, useState } from "react";
import { useCRUD } from "@/hooks/useCrud";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const rejectionSchema = z.object({
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters long")
    .max(1000, "Reason must not exceed 1000 characters")
    .trim(),
});

type RejectionFormValues = z.infer<typeof rejectionSchema>;

interface RejectionReasonProps {
  open: boolean;
  selectedRow: any;
  onClose: () => void;
}

function RejectionReason({ open, selectedRow, onClose }: RejectionReasonProps) {
  const { create } = useCRUD("press-release-rejections");
  const { update } = useCRUD("press_releases");
  const { readOne } = useCRUD("users");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const form = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: {
      reason: "",
    },
  });

  // Fetch user email when dialog opens and selectedRow changes
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!open || !selectedRow?.user_id) {
        if (!open) {
          // Reset form when dialog closes
          form.reset();
          setUserEmail(null);
        }
        return;
      }

      setIsLoadingUser(true);
      try {
        const userData = await readOne({
          where: "user_id",
          equalTo: selectedRow.user_id,
        });
        if (userData?.email) {
          setUserEmail(userData.email);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
        toast.error("Could not load user email");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserEmail();
  }, [open, selectedRow?.user_id, userEmail, setUserEmail, setIsLoadingUser]);

  const handleConfirmReject = async (values: RejectionFormValues) => {
    try {
      if (!selectedRow?.id) {
        toast.error("No press release selected");
        return;
      }

      if (!userEmail) {
        toast.error("User email not loaded. Please try again.");
        return;
      }

      // Create rejection record
      const rejectionData = {
        release_id: selectedRow.id,
        reason: values.reason,
        email: userEmail,
      };

      await create(rejectionData);

      // Update press release status
      await update({
        id: selectedRow.id,
        admin_status: "rejected",
      });

      toast.success("Press release has been rejected successfully");

      // Reset form and close dialog
      form.reset();
      setUserEmail(null); // Reset email for next use
      onClose?.();
    } catch (error) {
      console.error("Error rejecting press release:", error);
      toast.error("Failed to reject press release. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    if (!open) {
      form.reset();
      setUserEmail(null); // Reset email when closing
    }
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reject Press Release</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this press release. This will
            be sent to the user.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleConfirmReject)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason for Rejection{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the reason for rejecting this press release..."
                      className="min-h-[120px] resize-none"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific and constructive with your feedback (10-1000
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
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  form.formState.isSubmitting || isLoadingUser || !userEmail
                }
              >
                {form.formState.isSubmitting
                  ? "Rejecting..."
                  : isLoadingUser
                  ? "Loading..."
                  : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(RejectionReason);
