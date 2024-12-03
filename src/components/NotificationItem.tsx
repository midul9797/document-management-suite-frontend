// ===========================
// Imports
// ===========================
import { formatDistanceToNow } from "date-fns";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// ===========================
// Types & Interfaces
// ===========================
interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  toggleRead: (id: string) => void;
}

// ===========================
// Component
// ===========================
export default function NotificationItem({
  notification,
  toggleRead,
}: NotificationItemProps) {
  // Format the time distance
  const timeAgo = formatDistanceToNow(notification.createdAt, {
    addSuffix: true,
  });

  return (
    <Card
      className={`mb-4 ${
        notification.read
          ? "bg-gray-100 dark:bg-neutral-700"
          : "bg-white dark:bg-neutral-800"
      }`}
    >
      {/* Header section with title and timestamp */}
      <CardHeader>
        <CardTitle className="text-lg">{notification.title}</CardTitle>
        <CardDescription>{timeAgo}</CardDescription>
      </CardHeader>

      {/* Content section with message */}
      <CardContent>
        <p>{notification.message}</p>
      </CardContent>

      {/* Footer with read status and action button */}
      <CardFooter className="flex justify-between">
        <span
          className={`text-sm ${
            notification.read ? "text-gray-500" : "text-blue-500 font-semibold"
          }`}
        >
          {notification.read ? "Read" : "Unread"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRead(notification._id)}
        >
          {notification.read ? (
            <X className="h-4 w-4 mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          {notification.read ? "Mark as unread" : "Mark as read"}
        </Button>
      </CardFooter>
    </Card>
  );
}
