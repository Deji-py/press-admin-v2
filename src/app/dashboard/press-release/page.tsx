/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import InToolTable, {
  ColumnOverrides,
} from "@/components/core/InToolTable/intool-table";
import { DataTableAction } from "@/components/core/InToolTable/types/table.types";
import { CheckCircle, File, XCircle } from "lucide-react";
import { useState } from "react";
import RejectionReason from "./dialogs/RejactionReason";
import { useCRUD } from "@/hooks/useCrud";
import { toast } from "sonner";
import UploadReport from "./dialogs/UploadReport";

function Page() {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const { isUpdating, update } = useCRUD("press_releases");
  const { items: packages } = useCRUD<{ name: string; id: string }>("packages");
  const { items: industries } = useCRUD<{ name: string; id: string }>(
    "industries"
  );

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
    {
      column_name: "distribution_package",
      input_type: "select",
      options: packages.map((item) => ({ label: item.name, value: item.id })),
    },
    {
      column_name: "distribution_channels",
      input_type: "select",
      options: [
        { label: "pressrelease.in only", value: "pressrelease.in only" },
        {
          label: "national pr distribution",
          value: "national pr distribution",
        },
        {
          label: "international pr distribution",
          value: "international pr distribution",
        },
      ],
    },
    {
      column_name: "industry",
      input_type: "select",
      options: industries.map((item) => ({
        label: item.name,
        value: item.name,
      })),
    },
    {
      column_name: "cover_image_url",
      input_type: "image-url",
    },
    {
      column_name: "slug",
      input_type: "slug",
    },
  ];

  const handleReject = (row: any) => {
    setSelectedRow(row);
    setShowRejectDialog(true);
  };

  const handleUploadReport = (row: any) => {
    setSelectedRow(row);
    setShowReportDialog(true);
  };

  const Press_Release_Actions: DataTableAction<unknown>[] = [
    {
      label: "Approve",
      onClick: async (row: any) => {
        if (!row) return;
        if (row.admin_status === "approved") {
          toast.error("Press release already approved");
          return;
        }
        await update({
          id: row.id,
          admin_status: "approved",
        });
      },
      disabled: () => isUpdating,
      icon: isUpdating ? (
        <div className="animate-spin h-4 w-4 rounded-full border-2 border-secondary border-t-transparent"></div>
      ) : (
        <CheckCircle />
      ),
    },
    {
      label: "Reject",
      onClick: (row: any) => handleReject(row),
      icon: <XCircle />,
    },
    {
      label: "Add Report",
      onClick: (row: any) => handleUploadReport(row),
      icon: <File />,
    },
  ];

  return (
    <div className="p-5">
      <InToolTable
        onView={(row) => {
          window.open(`https://pressrelease.in/newsroom/${row.slug}`, "_blank");
        }}
        enableSearch
        disableCreate
        order_by="release_date"
        additional_actions={Press_Release_Actions}
        excluded_columns={[
          "role",
          "location",
          "embedded_video_url",
          "embedded_video_title",
          "status",
          "created_at",
          "payment_id",
          "order_id",
          "show_email",
          "show_phone",
          "is_immediate",
          "location_city",
          "location_state",
          "location_country",
          "location_zip",
          "language",
          "fts",
        ]}
        table_name="press_releases"
        table_hidden_columns={[
          "slug",
          "user_id",
          "summary",
          "distribution_package",
        ]}
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

      <UploadReport
        selectedRow={selectedRow}
        open={showReportDialog}
        onClose={() => {
          setShowReportDialog(false);
          setSelectedRow(null);
        }}
      />
    </div>
  );
}

export default Page;
