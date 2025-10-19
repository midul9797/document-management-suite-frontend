import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@clerk/nextjs";
import { useStore } from "@/zustand/store";
import { INotification } from "@/interfaces";

export const useNotificationSocket = () => {
  const { getToken } = useAuth();
  const { addNotification } = useStore();
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await getToken();
        if (!token || isConnectedRef.current) return;

        // Create socket connection
        const socket = io(
          process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_API as string,
          {
            autoConnect: false,
          }
        );

        socketRef.current = socket;

        // Connect to socket
        socket.connect();

        // Subscribe to notifications
        const decodedToken = jwtDecode<{ clerkId: string }>(token);
        socket.emit("subscribe", decodedToken.clerkId);

        // Listen for new notifications
        socket.on("notification", (notification: INotification) => {
          addNotification(notification);
        });

        // Listen for connection events
        socket.on("connect", () => {
          console.log("Socket connected");
          isConnectedRef.current = true;
        });

        socket.on("disconnect", () => {
          console.log("Socket disconnected");
          isConnectedRef.current = false;
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    };

    initializeSocket();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off("notification");
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current = null;
        isConnectedRef.current = false;
      }
    };
  }, [getToken, addNotification]);

  return {
    socket: socketRef.current,
    isConnected: isConnectedRef.current,
  };
};
