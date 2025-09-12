export interface ExtendedFile extends File {
  data: string;
}
export interface IUser {
  name: string;
  id: string;
  clerkId: string;
  email: string;
  phone: string | null;
  country: string | null;
  address: string | null;
  profileImage: string | null;
}
export interface IDocument {
  _id: string;
  url: string;
  fileId: string;
  title: string;
  size: number;
  type: string;
  version: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface stateType {
  user: IUser | null;
  token: string | null;
  setUser: (value: IUser | null) => void;
  setToken: (value: string | null) => void;
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}
