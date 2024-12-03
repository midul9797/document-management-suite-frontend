"use client";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

function App() {
  const { userId } = useAuth();

  return userId ? redirect("/dashboard") : redirect("/login");
}
export default App;
