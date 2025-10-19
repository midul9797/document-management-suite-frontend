/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// ===========================
// Imports
// ===========================
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import { IconSettings, IconUserBolt } from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
import { useStore } from "@/zustand/store";
import { Bell, Files, LogOutIcon, Trash } from "lucide-react";
import logo from "../../public/pulikidz-icon-100x100.png";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

// ===========================
// Main Component
// ===========================
export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  // ===========================
  // Hooks & State
  // ===========================
  const { user, unreadCount } = useStore();
  const [open, setOpen] = useState(false);

  // Initialize socket connection for notifications
  useNotificationSocket();

  // ===========================
  // Navigation Links Config
  // ===========================
  const links = [
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },

    {
      label: "Documents",
      href: "/dashboard/documents",
      icon: (
        <Files className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Notifications",
      href: "/dashboard/notifications",
      icon: (
        <div className="relative">
          <Bell className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Trash",
      href: "/dashboard/trash",
      icon: (
        <Trash className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onclick: () => console.log("first"),
    },
    {
      label: <SignOutButton redirectUrl="/login" />,
      href: "#",
      icon: (
        <LogOutIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  // ===========================
  // Render Component
  // ===========================
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1  mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen w-full"
      )}
    >
      {/* Sidebar Component */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          {/* Navigation Links Container */}
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link as any} />
              ))}
            </div>
          </div>
          {/* User Profile Section */}
          <div>
            <SidebarLink
              link={{
                label: user?.name || "",
                href: "#",
                icon: (
                  <Image
                    src={
                      user?.profileImage ||
                      "https://assets.aceternity.com/manu.png"
                    }
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}

// ===========================
// Logo Components
// ===========================
export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        src={logo}
        width={100}
        height={100}
        className="h-7 w-7"
        alt="Icon"
      ></Image>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg tracking-[2px] font-semibold text-black dark:text-white whitespace-pre"
      >
        Document Suite
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        src={logo}
        width={100}
        height={100}
        className="h-7 w-7"
        alt="Icon"
      ></Image>
    </Link>
  );
};

// Dummy dashboard component with content
