/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { CustomButton, DataTable } from "./data-table";
import useTableQuery from "./hooks/useTableQuery";
import {
  CellType,
  DataTableAction,
  DataTableColumn,
} from "./types/table.types";
import { generateTableColumns } from "./column-transformer";
import { EyeIcon, PenBox, Trash, Search, X } from "lucide-react";
import { IconRotate } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";
import CreateEditRecord from "./create-edit-record";
import ViewRecord from "./view-record";
import DebouncedSearchInput from "./table-search";

export type ColumnOverrides = Array<{
  column_name: string;
  input_type?:
    | "text"
    | "password"
    | "email"
    | "number"
    | "textarea"
    | "checkbox"
    | "select"
    | "date"
    | "otp"
    | "combobox"
    | "image-upload"
    | "image-url"
    | "slug";
  cell_type?: CellType;
  options?: Array<{ label: string; value: string | number }>;
}>;

interface TableQueryProps {
  table_name: string;
  excluded_columns?: string[];
  table_hidden_columns?: string[];
  id_column?: string;
  column_overrides?: ColumnOverrides;
  onView?: (data: any) => void;
  additional_actions?: DataTableAction[];
  additional_buttons?: CustomButton[];
  order_by?: string;
  disableCreate?: boolean;
  enableSearch?: boolean;
  excluded_search_columns?: string[];
}

// ========================================
// SEARCH BAR COMPONENT (Memoized)
// ========================================
interface SearchBarProps {
  searchInput: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

const SearchBar = React.memo(
  ({ searchInput, onSearchChange, onClearSearch }: SearchBarProps) => (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 min-w-64">
        <input
          type="text"
          placeholder="Search all columns..."
          value={searchInput}
          onChange={onSearchChange}
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        {searchInput && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
);

SearchBar.displayName = "SearchBar";

function InToolTable({
  table_name,
  excluded_columns = [],
  table_hidden_columns = [],
  id_column = "id",
  column_overrides,
  onView,
  additional_actions = [],
  additional_buttons = [],
  order_by = "created_at",
  disableCreate = false,
  enableSearch = false,
  excluded_search_columns = ["id", "created_at", "updated_at"],
}: TableQueryProps) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showDeleteConsent, setShowDeleteConsent] = useState(false);
  const [row_ids, setRowIds] = useState<string[] | string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  // Dialog state management
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [currentEditRow, setCurrentEditRow] = useState<any>(null);
  const [currentViewRow, setCurrentViewRow] = useState<any>(null);

  // ========================================
  // URL PARAMS & NAVIGATION
  // ========================================
  const searchParams = useSearchParams();

  const currentPage = searchParams.get("page");
  const pageSize = searchParams.get("pageSize");
  const params_ready = currentPage && pageSize;

  const {
    data,
    loading,
    delete: deleteMutation,
    update: updateMutation,
    create: createMutation,
  } = useTableQuery({
    table_name,
    excluded_columns,
    id_column,
    order_by,
    excluded_search_columns,
    search_query: searchInput,
  });

  // ========================================
  // COLUMN PROCESSING
  // ========================================

  const table_columns: DataTableColumn[] = useMemo(
    () => generateTableColumns(data?.data as any),
    [data?.data]
  );

  const form_columns = useMemo(
    () =>
      table_columns.filter(
        (col) => !excluded_columns?.includes(col.key) && col.key !== id_column
      ),
    [table_columns, excluded_columns, id_column]
  );

  const required_columns = useMemo(
    () =>
      form_columns
        .filter((col) => col.type === "text" || col.type === "email")
        .map((col) => col.key),
    [form_columns]
  );

  // ========================================
  // ROW SELECTION HANDLERS
  // ========================================
  const handleSelectedRowsChange = useCallback((rows: any[]) => {
    setSelectedRows(rows);
  }, []);

  // ========================================
  // DELETE OPERATIONS
  // ========================================

  const handleDeleteRow = useCallback(
    (row: any) => {
      const rowId = row[id_column];
      if (rowId) {
        setRowIds(rowId);
        setShowDeleteConsent(true);
      }
    },
    [id_column]
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedRows.length > 0) {
      const rowIds = selectedRows.map((row) => row[id_column]).filter(Boolean);
      if (rowIds.length > 0) {
        setRowIds(rowIds);
        setShowDeleteConsent(true);
      }
    }
  }, [selectedRows, id_column]);

  const handleConfirmDeletion = async () => {
    setSelectedRows([]);
    if (row_ids) {
      await deleteMutation.mutateAsync({
        data: row_ids,
      });
      setShowDeleteConsent(false);
      setRowIds(null);
    }
  };

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  const handleCreate = useCallback(() => {
    setShowCreateDialog(true);
  }, []);

  const handleEdit = useCallback((row: any) => {
    setCurrentEditRow(row);
    setShowEditDialog(true);
  }, []);

  const handleView = useCallback((row: any) => {
    setCurrentViewRow(row);
    setShowViewDialog(true);
  }, []);

  const handleCreateSubmit = useCallback(
    async (formData: any) => {
      try {
        await createMutation.mutateAsync({ data: formData });
        setShowCreateDialog(false);
      } catch (error) {
        console.error("Error creating record:", error);
      }
    },
    [createMutation]
  );

  const handleEditSubmit = useCallback(
    async (formData: any) => {
      if (!currentEditRow) return;

      try {
        await updateMutation.mutateAsync({
          id: currentEditRow[id_column],
          data: formData,
        });
        setShowEditDialog(false);
        setCurrentEditRow(null);
      } catch (error) {
        console.error("Error updating record:", error);
      }
    },
    [currentEditRow, id_column, updateMutation]
  );

  const handleEditFromView = useCallback((row: any) => {
    setShowViewDialog(false);
    setCurrentViewRow(null);
    setCurrentEditRow(row);
    setShowEditDialog(true);
  }, []);

  // ========================================
  // DIALOG HELPERS
  // ========================================

  const getDialogContent = () => {
    const count = Array.isArray(row_ids) ? row_ids?.length : 1;
    if (count === 0) return { title: "", description: "" };

    return {
      title: `Delete ${count} ${count === 1 ? "Record" : "Records"}`,
      description: `Are you sure you want to delete ${count} ${
        count === 1 ? "record" : "records"
      } from ${table_name.replace(/_/g, " ")}? This action cannot be undone.`,
    };
  };

  // ========================================
  // TABLE CONFIGURATION
  // ========================================

  const actions: DataTableAction[] = useMemo(() => {
    const defaultActions: DataTableAction[] = [
      {
        label: "Edit",
        icon: <PenBox />,
        onClick: handleEdit,
      },
      {
        label: "View",
        icon: <EyeIcon />,
        onClick: onView || handleView,
      },
    ];

    return [
      ...defaultActions,
      ...additional_actions,
      {
        label: "Delete",
        icon: <Trash />,
        onClick: handleDeleteRow,
        variant: "destructive",
      },
    ];
  }, [handleEdit, handleView, handleDeleteRow, onView, additional_actions]);

  const custom_buttons: CustomButton[] = useMemo(() => {
    const defaultButtons: CustomButton[] = [
      ...(!disableCreate
        ? [
            {
              label: "Create New",
              onClick: handleCreate,
              variant: "default" as const,
            },
          ]
        : []),
      ...(selectedRows.length > 0
        ? [
            {
              label: `Delete Selected (${selectedRows.length})`,
              onClick: handleBulkDelete,
              variant: "destructive" as const,
            },
          ]
        : []),
    ];

    return [...defaultButtons, ...additional_buttons];
  }, [
    handleCreate,
    handleBulkDelete,
    selectedRows.length,
    additional_buttons,
    disableCreate,
  ]);

  // ========================================
  // COMPUTED VALUES
  // ========================================
  const { title: dialogTitle, description: dialogDescription } =
    getDialogContent();

  const formattedTableTitle = table_name
    ?.replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // ========================================
  // MEMOIZED SEARCH BAR
  // ========================================
  const searchBar = useMemo(
    () =>
      enableSearch ? (
        <DebouncedSearchInput
          onSearchChange={setSearchInput}
          debounceDelay={300}
        />
      ) : null,
    [enableSearch, searchInput]
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <>
      {/* Create Record Dialog */}
      <CreateEditRecord
        isOpen={showCreateDialog}
        columns={form_columns}
        required_columns={required_columns}
        overrides={column_overrides}
        onSubmit={handleCreateSubmit}
        onClose={() => setShowCreateDialog(false)}
        title={`Create New ${formattedTableTitle.slice(0, -1)}`}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Record Dialog */}
      <CreateEditRecord
        isOpen={showEditDialog}
        row={currentEditRow}
        columns={form_columns}
        required_columns={required_columns}
        overrides={column_overrides}
        onSubmit={handleEditSubmit}
        onClose={() => {
          setShowEditDialog(false);
          setCurrentEditRow(null);
        }}
        title={`Edit ${formattedTableTitle.slice(0, -1)}`}
        isSubmitting={updateMutation.isPending}
      />

      {/* View Record Sheet */}
      <ViewRecord
        isOpen={showViewDialog}
        row={currentViewRow}
        onClose={() => {
          setShowViewDialog(false);
          setCurrentViewRow(null);
        }}
        onEdit={handleEditFromView}
        title={`View ${formattedTableTitle.slice(0, -1)}`}
        excludedFields={[id_column, ...excluded_columns]}
      />

      {/* Data Table */}
      <DataTable
        customButtons={custom_buttons}
        title={formattedTableTitle}
        actions={actions}
        onSelectedRowsChange={handleSelectedRowsChange}
        table_hidden_columns={table_hidden_columns}
        onClose={() => {
          setShowDeleteConsent(false);
          setRowIds(null);
        }}
        customComponentCenter={searchBar}
        onConfirm={handleConfirmDeletion}
        isDeleting={deleteMutation.isPending}
        showDeleteConsent={showDeleteConsent}
        dialogTitle={dialogTitle}
        dialogDescription={dialogDescription}
        disableFiltering
        data={data?.data as any}
        columns={table_columns}
        isLoading={loading}
        totalCount={data?.count as number}
        noDataComponent={
          data && params_ready ? null : (
            <div className="flex flex-col justify-center items-center">
              <IconRotate className="animate-spin" />
            </div>
          )
        }
      />
    </>
  );
}

export default React.memo(InToolTable);
