"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, parse } from "date-fns";
import { ApiGateway } from "@/shared/axios";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { IBooking } from "@/interfaces";
import { Loading } from "@/components/Loading";

export default function BookingDetailsPage() {
  // ===========================
  // State & Hooks
  // ===========================
  const { id } = useParams();
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  // ===========================
  // Booking Data Fetching
  // ===========================
  const fetchBooking = async () => {
    setLoading(true);
    const token = await getToken();
    const response = await ApiGateway.get(`/booking/${id}`, {
      headers: { Authorization: token },
    });

    if (response.data) {
      setBooking(response.data);

      const documentResponse = await ApiGateway.get(
        `/document-metadata/booking/${id}`,
        { headers: { Authorization: token } }
      );
      if (documentResponse.data) {
        setBooking((prev: IBooking | null) => {
          if (prev) {
            return { ...prev, documents: documentResponse.data };
          }
          return prev;
        });
      }
    }
    setLoading(false);
  };

  // ===========================
  // Effects
  // ===========================
  useEffect(() => {
    if (!booking) fetchBooking();
  }, [booking]);

  if (loading) return <Loading />;

  // ===========================
  // Render Component
  // ===========================
  return (
    <div className="container mx-auto py-10">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-5">Booking</h1>

      {/* Booking Details Form */}
      <form className="space-y-6">
        {/* Title Field */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            disabled
            id="title"
            defaultValue={booking?.title}
            className="disabled:opacity-100"
          />
        </div>

        {/* Description Field */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            defaultValue={booking?.description}
            disabled
            className="disabled:opacity-100"
          />
        </div>

        {/* Date Field */}
        <div>
          <Label>Date</Label>
          <Input
            disabled
            defaultValue={
              booking?.bookingDate
                ? booking?.bookingDate?.split(" ").slice(0, -1).join(" ")
                : ""
            }
            id="date"
            className="disabled:opacity-100"
          />
        </div>

        {/* Time Field */}
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            disabled
            defaultValue={
              booking?.bookingDate
                ? format(
                    parse(
                      booking?.bookingDate?.split(" ")[3],
                      "HH:mm",
                      new Date()
                    ),
                    "HH:mm a"
                  )
                : ""
            }
            id="time"
            className="disabled:opacity-100"
          />
        </div>

        {/* Documents Section */}
        <div>
          <Label htmlFor="documents">Documents</Label>
          {booking?.documents &&
            booking?.documents.map((field) => (
              <div key={field?.id} className="flex items-center mt-2">
                <span className="flex-grow truncate">{field?.title}</span>
              </div>
            ))}
        </div>
      </form>
    </div>
  );
}
