"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "@/components/NotificationItem";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import { INotification } from "@/interfaces";
import { Loading } from "@/components/Loading";

const socket = io(process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_API as string, {
  autoConnect: false,
});

export default function NotificationsPage() {
  // ===========================
  // State & Hooks
  // ===========================
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ===========================
  // Event Handlers
  // ===========================
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const toggleRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification._id === id
          ? { ...notification, read: !notification.read }
          : notification
      )
    );
  };

  // ===========================
  // Computed Values
  // ===========================
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // ===========================
  // Data Fetching
  // ===========================
  const fetchNotifications = async () => {
    const tempToken = await getToken();
    setToken(tempToken);
    const response = await ApiGateway("/notification", {
      headers: { Authorization: tempToken },
    });
    if (response.data) {
      setNotifications(response.data);
    }
    setLoading(false);
  };

  // ===========================
  // Effects
  // ===========================
  useEffect(() => {
    if (notifications.length === 0) {
      fetchNotifications();
    }
    if (token) {
      socket.connect();

      socket.emit("subscribe", jwtDecode<{ clerkId: string }>(token).clerkId);
      socket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      return () => {
        socket.disconnect();
        socket.off("notification");
      };
    }
  }, [token]);

  if (loading) return <Loading />;

  // ===========================
  // Render Component
  // ===========================
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Bell className="mr-2" />
          Notifications
          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500  text-xs font-bold rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </h1>
        {/* Mark All Read Button */}
        <Button onClick={markAllAsRead} variant="outline">
          Mark all as read
        </Button>
      </div>
      {/* Notifications List */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            toggleRead={toggleRead}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
