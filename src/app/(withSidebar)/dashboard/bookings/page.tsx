"use client";
import { Loading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IBooking } from "@/interfaces";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import { CalendarIcon, FileTextIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Booking() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ===========================
  // Fetch Bookings Function
  // ===========================
  const fetchBookings = async () => {
    setLoading(true);
    const token = await getToken();

    const response = await ApiGateway.get("/booking", {
      headers: { Authorization: token },
    });
    if (response.data) setBookings(response.data);
    setLoading(false);
  };

  // ===========================
  // Use Effect to Fetch Bookings
  // ===========================
  useEffect(() => {
    if (bookings.length === 0) fetchBookings();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Records</h1>
        <Link href={"/dashboard/bookings/create-booking"}>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Booking
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Link href={`/dashboard/bookings/${booking.id}`} key={booking.id}>
            <Card className="w-full my-4">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {booking.title}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{booking.bookingDate}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  <span>1 document</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
