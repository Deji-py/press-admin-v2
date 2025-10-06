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
import { Label } from "@/components/ui/label";

import React, { useState } from "react";

function RejectionReason({
  open,
  selectedRow,
  onClose,
}: {
  open: boolean;
  selectedRow: any;
  onClose: () => void;
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      // You can add toast notification here
      alert("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);

    try {
      // Add your rejection logic here
      console.log("Rejecting press release:", selectedRow);
      console.log("Reason:", rejectionReason);

      // Example API call:
      // await rejectPressRelease(selectedRow.id, rejectionReason);

      // Close dialog and reset state

      setRejectionReason("");

      onClose?.();

      // You can add success toast notification here
    } catch (error) {
      console.error("Error rejecting press release:", error);
      // You can add error toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setRejectionReason("");
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

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rejection-reason">
              Reason for Rejection <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter the reason for rejecting this press release..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Be specific and constructive with your feedback
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCloseDialog}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmReject}
            disabled={isSubmitting || !rejectionReason.trim()}
          >
            {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(RejectionReason)  ;
