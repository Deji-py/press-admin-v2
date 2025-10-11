/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseClient } from "@/utils/client";
import { PostgrestError } from "@supabase/supabase-js";
import { OpenAI } from "openai";

type FetchTableDataParams = {
  table_name: string;
  excluded_columns?: string[];
  current_page: number;
  page_size: number;
  order_by?: string;
  search_query?: string;
  excluded_search_columns?: string[];
};

type FetchTableDataResult = {
  count: number | null;
  data: any[] | null;
  error: PostgrestError | null;
};

export const fetchTableData = async ({
  table_name,
  excluded_columns = [],
  current_page,
  page_size,
  order_by = "id",
  search_query = "",
}: FetchTableDataParams): Promise<FetchTableDataResult> => {
  try {
    // If search query exists, use the rich_search function
    if (search_query && search_query.trim()) {
      const { data, error } = await supabaseClient.rpc("full_text_search", {
        p_table_name: table_name,
        query_text: search_query,
        p_excluded_columns: excluded_columns,
      });

      if (error) {
        console.log(error);
        throw error;
      }

      // Extract results from JSONB response
      const result = data?.[0].result || [];
      const totalCount = data?.total_count || 0;

      return {
        count: totalCount,
        data: Array.isArray(result) ? result : [],
        error: null,
      };
    }

    // Original fetch logic for non-search queries
    const from = (current_page - 1) * page_size;
    const to = from + page_size - 1;

    // First fetch one row to figure out the column names
    const { data: sample, error: sampleError } = await supabaseClient
      .from(table_name)
      .select("*")
      .range(0, 0);

    if (sampleError) {
      throw sampleError;
    }

    // Build column selection dynamically
    const columns =
      sample && sample.length > 0
        ? Object.keys(sample[0]).filter(
            (col) => !excluded_columns.includes(col)
          )
        : ["*"];

    // Fetch actual data with filtered columns and correct pagination
    const { data, count, error } = await supabaseClient
      .from(table_name)
      .select(columns.join(","), { count: "exact" })
      .range(from, to)
      .order(order_by, { ascending: false });

    if (error) {
      throw error;
    }

    return {
      count,
      data,
      error: null,
    };
  } catch (err: any) {
    if (err.code && err.message && err.details) {
      throw err;
    } else {
      throw {
        code: "UNKNOWN_ERROR",
        message: err.message || "An unknown error occurred",
        details: err.details || null,
        hint: err.hint || null,
      } as PostgrestError;
    }
  }
};

type DeleteTableDataParams = {
  table_name: string;
  data: string[] | string;
  id_column?: string;
};

type DeleteTableDataResult = {
  data: any[] | null;
  error: PostgrestError | null;
  success: boolean;
};

export const deleteTableData = async ({
  table_name,
  data,
  id_column = "id",
}: DeleteTableDataParams): Promise<DeleteTableDataResult> => {
  try {
    const ids = Array.isArray(data) ? data : [data];

    const { data: deletedData, error } = await supabaseClient
      .from(table_name)
      .delete()
      .in(id_column, ids)
      .select();

    if (error) {
      throw error;
    }

    return {
      data: deletedData,
      error: null,
      success: true,
    };
  } catch (err: any) {
    if (err.code && err.message && err.details !== undefined) {
      throw err;
    } else {
      throw {
        code: "UNKNOWN_ERROR",
        message: err.message || "An unknown error occurred during deletion",
        details: err.details || null,
        hint: err.hint || null,
      } as PostgrestError;
    }
  }
};

type UpdateTableDataParams = {
  table_name: string;
  id: string | number;
  data: Record<string, any>;
  id_column?: string;
};

type UpdateTableDataResult = {
  data: any[] | null;
  error: PostgrestError | null;
  success: boolean;
};

export const updateTableData = async ({
  table_name,
  id,
  data,
  id_column = "id",
}: UpdateTableDataParams): Promise<UpdateTableDataResult> => {
  try {
    const { data: updatedData, error } = await supabaseClient
      .from(table_name)
      .update(data)
      .eq(id_column, id)
      .select();

    if (error) {
      throw error;
    }

    return {
      data: updatedData,
      error: null,
      success: true,
    };
  } catch (err: any) {
    if (err.code && err.message && err.details !== undefined) {
      throw err;
    } else {
      throw {
        code: "UNKNOWN_ERROR",
        message: err.message || "An unknown error occurred during update",
        details: err.details || null,
        hint: err.hint || null,
      } as PostgrestError;
    }
  }
};

type CreateTableDataParams = {
  table_name: string;
  data: Record<string, any>;
};

type CreateTableDataResult = {
  data: any[] | null;
  error: PostgrestError | null;
  success: boolean;
};

export const createTableData = async ({
  table_name,
  data,
}: CreateTableDataParams): Promise<CreateTableDataResult> => {
  try {
    const { data: createdData, error } = await supabaseClient
      .from(table_name)
      .insert(data)
      .select();

    if (error) {
      throw error;
    }

    return {
      data: createdData,
      error: null,
      success: true,
    };
  } catch (err: any) {
    if (err.code && err.message && err.details !== undefined) {
      throw err;
    } else {
      throw {
        code: "UNKNOWN_ERROR",
        message: err.message || "An unknown error occurred during creation",
        details: err.details || null,
        hint: err.hint || null,
      } as PostgrestError;
    }
  }
};
