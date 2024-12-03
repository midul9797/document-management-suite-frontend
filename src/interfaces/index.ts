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
  id: string;
  fileId: string;
  title: string;
  lastModified: string;
  bookingTitle: string;
  bookingDate: string;
}
export interface stateType {
  user: IUser | null;
  token: string | null;
  setUser: (value: IUser | null) => void;
  setToken: (value: string | null) => void;
}

export interface IBooking {
  id: number;
  title: string;
  bookingDate: string;
  documents?: { id: string; title: string }[];
  description?: string;
}
export interface INotification {
  _id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}
