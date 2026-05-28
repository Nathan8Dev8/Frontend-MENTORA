"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardDispatcher() {
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem("mentora_role");
    if (!savedRole) {
      router.push("/login");
    } else {
      router.push(`/dashboard/${savedRole.toLowerCase()}`);
    }
  }, [router]);

  return <div className="flex items-center justify-center min-h-screen">Redirection vers votre espace...</div>;
}
