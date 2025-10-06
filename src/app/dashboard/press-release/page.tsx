/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import InToolTable, {
  ColumnOverrides,
} from "@/components/core/InToolTable/intool-table";
import { DataTableAction } from "@/components/core/InToolTable/types/table.types";
import { CheckCircle, XCircle } from "lucide-react";
import React, { useState } from "react";
import RejectionReason from "./dialogs/RejactionReason";

function Page() {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const column_overrides: ColumnOverrides = [
    {
      column_name: "admin_status",
      input_type: "select",
      options: [
        {
          label: "Approved",
          value: "approved",
        },
        {
          label: "Pending",
          value: "pending",
        },
        {
          label: "Rejected",
          value: "rejected",
        },
      ],
    },
  ];

  const handleReject = (row: any) => {
    setSelectedRow(row);
    setShowRejectDialog(true);
  };

  const Press_Release_Actions: DataTableAction<unknown>[] = [
    {
      label: "Approve",
      onClick: (row) => {
        // Add your approval logic here
        console.log("Approving press release:", row);
      },
      icon: <CheckCircle />,
    },
    {
      label: "Reject",
      onClick: handleReject,
      icon: <XCircle />,
    },
  ];

  return (
    <div className="p-5">
      <InToolTable
        onView={(row) => {
          window.open(`https://pressrelease.in/newsroom/${row.slug}`, "_blank");
        }}
        additional_actions={Press_Release_Actions}
        excluded_columns={[
          "user_id",
          "role",
          "location",
          "embedded_video_url",
          "embedded_video_title",
          "status",
          "distribution_package",
          "created_at",
          "payment_id",
          "order_id",
          "show_email",
          "show_phone",
          "summary",
          "body",
          "is_immediate",
          "location_city",
          "location_state",
          "location_country",
          "location_zip",
          "language",
          "pr_pdf_url",
        ]}
        table_name="press_releases"
        table_hidden_columns={["slug"]}
        column_overrides={column_overrides}
      />

      <RejectionReason
        selectedRow={selectedRow}
        open={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          setSelectedRow(null);
        }}
      />
    </div>
  );
}

export default Page;
