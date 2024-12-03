import { IUser, stateType } from "@/interfaces";
import { create } from "zustand";

export const useStore = create<stateType>((set) => ({
  user: null,
  token: null,
  setUser: (value: IUser | null) =>
    set((state: stateType) => ({ ...state, user: value as IUser })),

  setToken: (value: string | null) =>
    set((state: stateType) => ({ ...state, token: value })),
}));
