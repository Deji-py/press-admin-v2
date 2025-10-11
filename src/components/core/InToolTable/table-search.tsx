import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface DebouncedSearchInputProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
  debounceDelay?: number;
}

const DebouncedSearchInput = React.memo(
  ({
    onSearchChange,
    placeholder = "Search all columns...",
    debounceDelay = 300,
  }: DebouncedSearchInputProps) => {
    const [inputValue, setInputValue] = useState("");
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Clear previous timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Set new timer
        debounceTimerRef.current = setTimeout(() => {
          onSearchChange(value);
        }, debounceDelay);
      },
      [onSearchChange, debounceDelay]
    );

    const handleClearSearch = useCallback(() => {
      setInputValue("");
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onSearchChange("");
    }, [onSearchChange]);

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-64">
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            className="w-full px-4 py-2 pl-10 pr-10 border  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          {inputValue && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

DebouncedSearchInput.displayName = "DebouncedSearchInput";

export default DebouncedSearchInput;
