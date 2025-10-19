import { IUser, stateType, INotification } from "@/interfaces";
import { create } from "zustand";

export const useStore = create<stateType>((set) => ({
  user: null,
  token: null,
  notifications: [] as INotification[],
  unreadCount: 0,
  setUser: (value: IUser | null) =>
    set((state: stateType) => ({ ...state, user: value as IUser })),

  setToken: (value: string | null) =>
    set((state: stateType) => ({ ...state, token: value })),

  setNotifications: (notifications: INotification[]) =>
    set((state: stateType) => ({
      ...state,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    })),

  addNotification: (notification: INotification) =>
    set((state: stateType) => {
      const newNotifications = [notification, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.read).length,
      };
    }),

  markNotificationAsRead: (id: string) =>
    set((state: stateType) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification._id === id ? { ...notification, read: true } : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.read).length,
      };
    }),

  markAllNotificationsAsRead: () =>
    set((state: stateType) => {
      const updatedNotifications = state.notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    }),
}));
