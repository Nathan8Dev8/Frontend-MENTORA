"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href, label = "Retour" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-border/50 text-mentora-fg/70 hover:text-secondary hover:border-secondary/40 hover:bg-white font-semibold text-sm px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
      aria-label={label}
    >
      <ArrowLeft size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
