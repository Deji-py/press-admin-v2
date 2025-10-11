/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { FieldValues, useFormContext, UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, X } from "lucide-react"; // Added X for badge removal
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Added Badge import
import { Editor } from "@/components/blocks/editor-x/editor";
import { SerializedEditorState } from "lexical";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";

export type FormType = {
  options?: { label: string; value: string | number }[];
  label?: string;
  name: string;
  input_type:
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
    | "rich-text"
    | "image-upload"
    | "image-url"
    | "slug";
  defaultValue?: string | number | boolean | string[]; // Added string[] for combobox
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  slugSourceField?: string;
}[];

// Wrapper for inputs with icons and password toggle
const InputWrapper: React.FC<{
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  input_type: FormType[number]["input_type"];
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
}> = ({
  children,
  leftIcon,
  rightIcon,
  input_type,
  showPassword,
  togglePasswordVisibility,
}) => (
  <div className="relative flex flex-1 items-center">
    {leftIcon && (
      <span className="absolute left-3 text-gray-500">{leftIcon}</span>
    )}
    {children}
    {rightIcon && (
      <span className="absolute right-3 text-gray-500">{rightIcon}</span>
    )}
    {input_type === "password" && togglePasswordVisibility && (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-2"
        onClick={togglePasswordVisibility}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </Button>
    )}
  </div>
);

export const initialValue = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Hello World 🚀",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

// Utility to render form inputs
export const RenderFormInput = (
  {
    fieldConfig,
    field,
    form,
  }: {
    fieldConfig: FormType[number];
    field: any;
    form: UseFormReturn<FieldValues, any, FieldValues>;
  } // Receive options here
) => {
  const { input_type, leftIcon, rightIcon, placeholder } = fieldConfig;
  const { user } = useAuth();

  // Handle password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // State for combobox input
  const [comboboxInputValue, setComboboxInputValue] = useState("");
  // Initialize selected items from field.value (which should be an array)
  const selectedComboboxItems = Array.isArray(field.value) ? field.value : [];

  const handleComboboxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " && comboboxInputValue.trim() !== "") {
      e.preventDefault(); // Prevent space from being typed
      const newItem = comboboxInputValue.trim();
      if (newItem && !selectedComboboxItems.includes(newItem)) {
        const newItems = [...selectedComboboxItems, newItem];
        field.onChange(newItems); // Update react-hook-form value
      }
      setComboboxInputValue(""); // Clear input
    } else if (
      e.key === "Backspace" &&
      comboboxInputValue === "" &&
      selectedComboboxItems.length > 0
    ) {
      e.preventDefault(); // Prevent default backspace behavior
      const newItems = selectedComboboxItems.slice(0, -1); // Remove last item
      field.onChange(newItems); // Update react-hook-form value
    }
  };

  const handleRemoveComboboxItem = (itemToRemove: string) => {
    const newItems = selectedComboboxItems.filter(
      (item: string) => item !== itemToRemove
    );
    field.onChange(newItems); // Update react-hook-form value
  };

  // State for image preview
  const [imagePreview, setImagePreview] = useState<string>(
    typeof field.value === "string" ? field.value : ""
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        field.onChange(result); // Store base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
    field.onChange(url);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSlugChange = (e: any) => {
    const value = e.target.value;
    field.onChange(generateSlug(value));
  };

  const handleAutoGenerate = () => {
    const sourceFields = fieldConfig.slugSourceField || "title";

    const sourceValue = form.getValues()[sourceFields];

    if (sourceValue) {
      field.onChange(generateSlug(sourceValue));
    }
  };

  switch (input_type) {
    case "rich-text":
      return (
        <Editor
          htmlContent={field.value}
          editorSerializedState={initialValue}
          onHtmlChange={(state) => {
            field.onChange(state); // Update react-hook-form with editor state
          }}
        />
      );
    case "text":
    case "email":
    case "password":
    case "textarea":
    case "number": // Pass number input value as string, schema will handle coercion
    case "date":
      const dateValue =
        input_type === "date" && field.value
          ? new Date(field.value).toISOString().split("T")[0]
          : field.value;

      return (
        <InputWrapper
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          input_type={input_type}
          showPassword={showPassword}
          togglePasswordVisibility={
            input_type === "password" ? togglePasswordVisibility : undefined
          }
        >
          {input_type === "textarea" ? (
            <Textarea
              {...field}
              placeholder={placeholder}
              className={leftIcon || rightIcon ? "pl-10 pr-10" : ""}
              onChange={(e) => field.onChange(e.target.value)}
            />
          ) : (
            <Input
              type={
                input_type === "password" && showPassword ? "text" : input_type
              }
              {...field}
              disabled={field?.name.includes("user_id") ? true : field.disabled}
              value={
                input_type === "date"
                  ? dateValue
                  : field?.name.includes("user_id")
                  ? field.value || user?.id
                  : field.value
              }
              placeholder={placeholder}
              className={
                leftIcon || rightIcon || input_type === "password"
                  ? "pl-10 pr-10"
                  : ""
              }
              onChange={(e) => {
                if (input_type === "date") {
                  // Convert YYYY-MM-DD back to ISO string with time
                  const dateStr = e.target.value;
                  field.onChange(dateStr ? `${dateStr}T00:00:00` : "");
                } else {
                  if (field.name === "user_id") {
                    field.onChange(user?.id);
                    return;
                  }
                  field.onChange(e.target.value);
                }
              }}
            />
          )}
        </InputWrapper>
      );
    case "checkbox":
      return (
        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      );
    case "select":
      return (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.options?.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "combobox":
      return (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-0 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          {selectedComboboxItems.map((item: string) => (
            <Badge
              key={item}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemoveComboboxItem(item)}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {item}</span>
              </button>
            </Badge>
          ))}
          <Input
            name={field.name}
            onBlur={field.onBlur}
            ref={field.ref}
            value={comboboxInputValue}
            onChange={(e) => setComboboxInputValue(e.target.value)}
            onKeyDown={handleComboboxKeyDown}
            placeholder={placeholder || "Type and press space to add..."}
            className="flex-1 border-none !p-0 shadow-none focus-visible:ring-0"
          />
        </div>
      );
    case "image-upload":
      return (
        <div className="space-y-4">
          {imagePreview && (
            <div className="relative w-full h-[300px]">
              <Image
                layout="fill"
                objectFit="cover"
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto rounded-lg border border-gray-300"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagePreview("");
                  field.onChange("");
                }}
              >
                <X size={16} />
              </Button>
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="cursor-pointer"
          />
        </div>
      );
    case "image-url":
      return (
        <div className="space-y-4">
          {imagePreview && (
            <div className="relative w-full h-[300px] ">
              <Image
                layout="fill"
                objectFit="cover"
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto rounded-lg border border-gray-300"
                onError={() => setImagePreview("")}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagePreview("");
                  field.onChange("");
                }}
              >
                <X size={16} />
              </Button>
            </div>
          )}
          <Input
            type="text"
            {...field}
            placeholder={placeholder || "Paste image URL..."}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            className={leftIcon || rightIcon ? "pl-10 pr-10" : ""}
          />
        </div>
      );
    case "slug":
      return (
        <div className="space-y-2">
          <div className="flex w-full items-center  gap-2">
            <InputWrapper
              leftIcon={leftIcon}
              rightIcon={rightIcon}
              input_type={input_type}
            >
              <Input
                {...field}
                placeholder={
                  placeholder || "Auto-generated or type manually..."
                }
                onChange={handleSlugChange}
                className={leftIcon || rightIcon ? "pl-10 pr-10" : ""}
              />
            </InputWrapper>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAutoGenerate}
              className="whitespace-nowrap ring-4 ring-secondary-foreground/30 border-primary border"
            >
              Auto Generate
            </Button>
          </div>
        </div>
      );
    default:
      return (
        <InputWrapper
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          input_type={input_type}
        >
          <Input
            {...field}
            value={field.value || user?.id}
            disabled={field?.name.includes("user_id") ? true : field.disabled}
            placeholder={placeholder}
            className={leftIcon || rightIcon ? "pl-10 pr-10" : ""}
            onChange={(e) => field.onChange(e.target.value)} // Pass raw string
          />
        </InputWrapper>
      );
  }
};

interface FormBuilderProps {
  formConfig: FormType;
  // requiredInputs is handled by initializeForm, not directly by FormBuilder
  fieldOptions?: {
    [fieldName: string]: { value: string | number; label: string }[];
  }; // Pass options down to renderFormInput
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  formConfig,
  fieldOptions = {},
}) => {
  const form = useFormContext();
  return (
    <div className="space-y-6">
      {formConfig.map((fieldConfig) => (
        <FormField
          key={fieldConfig.name}
          control={form.control}
          name={fieldConfig.name}
          render={({ field }) => (
            <FormItem>
              {fieldConfig.label && (
                <FormLabel>
                  {fieldConfig.input_type === "checkbox" ? (
                    <div className="flex items-center gap-2">
                      <span>{fieldConfig.label}</span>
                      {
                        <RenderFormInput
                          fieldConfig={fieldConfig}
                          field={field}
                          form={form}
                        />
                      }
                    </div>
                  ) : (
                    fieldConfig.label
                  )}
                </FormLabel>
              )}
              <FormControl>
                {fieldConfig.input_type !== "checkbox" && (
                  <RenderFormInput
                    fieldConfig={fieldConfig}
                    field={field}
                    form={form}
                  />
                )}
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default FormBuilder;
