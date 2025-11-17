"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email } = useAuth();
  const router = useRouter();

  /* useEffect(() => {
    if (!email) router.push("/login");
  }, [email, router]); */

  return (
    <div className="flex min-h-screen">
            

      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
