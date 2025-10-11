/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { supabaseClient } from "@/utils/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
interface CRUDOptions {
  queryKey?: string[];
  enabled?: boolean;
}

interface CreateInput {
  [key: string]: any;
}

interface UpdateInput {
  id: string;
  [key: string]: any;
}

interface FilterOptions {
  [key: string]: any;
}

interface ReadOneInput {
  where: string;
  equalTo: string;
  [key: string]: any;
}

// Adaptor Interface
interface CRUDAdaptor {
  fetch: (table: string, filters?: FilterOptions) => Promise<any[]>;
  fetchOne: (table: string, data: ReadOneInput) => Promise<any>;
  create: (table: string, data: CreateInput) => Promise<any>;
  update: (table: string, data: UpdateInput) => Promise<any>;
  delete: (table: string, id: string) => Promise<void>;
}

// Supabase SDK Adaptor Implementation
const supabaseAdaptor: CRUDAdaptor = {
  fetch: async (table: string, filters?: FilterOptions) => {
    let query = supabaseClient.from(table).select("*");

    // Apply filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
  },

  fetchOne: async (table: string, { where, equalTo }: ReadOneInput) => {
    const { data, error } = await supabaseClient
      .from(table)
      .select("*")
      .eq(where, equalTo)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  create: async (table: string, data: CreateInput) => {
    const { data: newData, error } = await supabaseClient
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newData;
  },

  update: async (table: string, data: UpdateInput) => {
    const { id, ...rest } = data;
    const { data: updatedData, error } = await supabaseClient
      .from(table)
      .update(rest)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedData;
  },

  delete: async (table: string, id: string) => {
    const { error } = await supabaseClient.from(table).delete().eq("id", id);

    if (error) throw new Error(error.message);
  },
};

// Main useCRUD Hook
export function useCRUD<T = any>(
  table: string,
  adaptor: CRUDAdaptor = supabaseAdaptor,
  options: CRUDOptions = {}
) {
  const queryClient = useQueryClient();
  const defaultQueryKey = [table];
  const queryKey = options.queryKey || defaultQueryKey;

  // Fetch All
  const {
    data: items = [],
    isLoading: isFetching,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => adaptor.fetch(table),
    enabled: options.enabled !== false,
  });

  // Fetch One (standalone function for manual calls)
  const readOne = async ({
    where,
    equalTo,
  }: ReadOneInput): Promise<T | null> => {
    try {
      const data = await adaptor.fetchOne(table, {
        where,
        equalTo,
      });
      return data as T;
    } catch (error) {
      console.error(`Error fetching ${table} with ${where} ${equalTo}:`, error);
      throw error;
    }
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateInput) => adaptor.create(table, data),
    onSuccess: (newData) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Created successfully");
      return newData;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateInput) => adaptor.update(table, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adaptor.delete(table, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete");
    },
  });

  return {
    // Data
    items: items as T[],
    isFetching,
    fetchError,

    // Read Operations
    readOne,

    // Mutations
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Utilities
    refetch,
    isLoading:
      isFetching ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}

// Export adaptor and supabase client for custom implementations
export type { CRUDAdaptor, CRUDOptions };
export { supabaseAdaptor };
