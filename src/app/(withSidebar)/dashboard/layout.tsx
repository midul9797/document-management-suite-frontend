/* eslint-disable react-hooks/exhaustive-deps */
"use client";

// ===========================
// Imports
// ===========================
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ApiGateway } from "@/shared/axios";
import { useStore } from "@/zustand/store";
import { useAuth } from "@clerk/nextjs";
import React, { useEffect } from "react";

const WithSidebarLayout = ({ children }: { children: React.ReactNode }) => {
  // ===========================
  // Hooks & State
  // ===========================
  const { isLoaded, getToken, isSignedIn } = useAuth();
  const { user, setUser } = useStore();

  // ===========================
  // Data Fetching
  // ===========================
  const fetchUser = async () => {
    const token = await getToken();
    const res = await ApiGateway.get("/user", {
      headers: { Authorization: token },
    });
    setUser(res.data);
  };

  // ===========================
  // Effects
  // ===========================
  useEffect(() => {
    if (isLoaded && !user) fetchUser();
    if (!isSignedIn) setUser(null);
  }, [isSignedIn]);

  // ===========================
  // Render Component
  // ===========================
  return (
    <>
      {/* Dashboard Sidebar Wrapper */}
      <DashboardSidebar>
        {/* Main Content Area */}
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900  w-full h-full overflow-y-scroll">
          {children}
        </div>
      </DashboardSidebar>
      {/* Commented out duplicate children */}
      {/* {children} */}
    </>
  );
};

export default WithSidebarLayout;
