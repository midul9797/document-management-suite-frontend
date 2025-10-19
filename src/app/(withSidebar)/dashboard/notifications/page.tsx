"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "@/components/NotificationItem";
import { ApiGateway } from "@/shared/axios";
import { useAuth } from "@clerk/nextjs";
import { Loading } from "@/components/Loading";
import { useStore } from "@/zustand/store";

export default function NotificationsPage() {
  // ===========================
  // State & Hooks
  // ===========================
  const {
    notifications,
    unreadCount,
    setNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useStore();
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ===========================
  // Event Handlers
  // ===========================
  const markAllAsRead = async () => {
    markAllNotificationsAsRead();
    await ApiGateway.patch(
      `/notification/read-all`,
      {},
      {
        headers: { Authorization: token },
      }
    );
  };

  const markAsRead = async (id: string) => {
    markNotificationAsRead(id);
    await ApiGateway.patch(
      `/notification/${id}`,
      { read: true },
      {
        headers: { Authorization: token },
      }
    );
  };

  // ===========================
  // Computed Values
  // ===========================
  // unreadCount is now managed by the global store

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
    // Socket connection is now handled by the useNotificationSocket hook in the sidebar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            markAsRead={() => markAsRead(notification._id)}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
