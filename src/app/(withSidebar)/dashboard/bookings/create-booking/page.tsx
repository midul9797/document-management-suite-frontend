"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";

// ===========================
// Type Definitions
// ===========================
type BookingFormData = {
  title: string;
  description: string;
  date: Date;
  time: string;
  documents: { name: string; type: string; size: number; data: string }[];
};

export default function CreateBookingForm() {
  // ===========================
  // State & Hooks
  // ===========================
  const [loading, setLoading] = useState<boolean>(false);
  const { getToken } = useAuth();

  // ===========================
  // Form Setup
  // ===========================
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    defaultValues: {
      documents: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  // ===========================
  // Event Handlers
  // ===========================
  const onSubmit = async (data: BookingFormData) => {
    try {
      setLoading(true);
      const token = await getToken();
      const payload = {
        title: data.title,
        bookingDate: format(data.date, "PPP") + " " + data.time,
        description: data.description,
        documents: data.documents,
      };
      const res = await ApiGateway.post("/booking", payload, {
        headers: {
          Authorization: token,
        },
      });
      if (res.data) alert("booking created successfully");
      setLoading(false);
      reset();
    } catch (error) {
      console.log(error);
      setLoading(false);
      alert("Something went wrong!!! Try Again");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const maxFileSize = 10 * 1024 * 1024;
    if (files) {
      const file = files[0];
      if (file.size > maxFileSize) {
        alert(
          `The file "${file.name}" exceeds the 10MB size limit and will not be uploaded.`
        );
      } else {
        const base64 = await convertToBase64(file);
        remove();
        append({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
        });
      }
    }
  };

  // ===========================
  // Utility Functions
  // ===========================
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // ===========================
  // Render Form
  // ===========================
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Create a New Booking</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Field */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Date Field */}
        <div>
          <Label>Date</Label>
          <Controller
            name="date"
            control={control}
            rules={{ required: "Date is required" }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Time Field */}
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            {...register("time", { required: "Time is required" })}
          />
          {errors.time && (
            <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
          )}
        </div>

        {/* Documents Upload */}
        <div>
          <Label htmlFor="documents">Documents</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center mt-2">
              <span className="flex-grow truncate">{field.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
          {errors.documents && (
            <p className="text-red-500 text-sm mt-1">
              {errors.documents.message}
            </p>
          )}
          <div className="mt-4 flex justify-end items-center w-full">
            <Input
              id="documents"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" asChild className="mb-2">
              <label htmlFor="documents">Upload Document</label>
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Booking"}
        </Button>
      </form>
    </div>
  );
}
