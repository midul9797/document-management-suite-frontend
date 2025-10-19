// ===========================
// Imports
// ===========================
import { formatDistanceToNow } from "date-fns";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { INotification } from "@/interfaces";

// ===========================
// Types & Interfaces
// ===========================
interface NotificationItemProps {
  notification: INotification;
  markAsRead: (id: string) => void;
}

// ===========================
// Component
// ===========================
export default function NotificationItem({
  notification,
  markAsRead,
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
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAsRead(notification._id)}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark as read
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
