"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import api from "@/lib/api";
import BackButton from "@/components/BackButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("mentora_token", res.data.access_token);
      const role = (res.data.role || "").toLowerCase();
      localStorage.setItem("mentora_role", role);
      
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (!res.data.profile_completed) {
        router.push("/setup-profile");
      } else {
        router.push(`/dashboard/${role}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mentora-bg flex items-center justify-center p-6">
      <BackButton href="/" label="Retour à l'accueil" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-full" />
            <span className="text-3xl font-extrabold text-secondary">MENTORA</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Bon retour !</h1>
          <p className="text-mentora-fg/60 mt-2">Connectez-vous pour accéder à votre espace.</p>
        </div>

        <div className="glass-card p-8 shadow-2xl shadow-secondary/10">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 italic">
                {error}
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-bold mb-2 text-foreground/80">Adresse Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-mentora-fg/40" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-border/50 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-foreground/80">Mot de passe</label>
                <Link href="#" className="text-xs text-secondary font-bold hover:underline">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-mentora-fg/40" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-border/50 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-secondary text-lg font-bold py-4 shadow-lg shadow-secondary/20 disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-mentora-fg/60">
            Nouveau sur Mentora ?{" "}
            <Link href="/register" className="text-secondary font-bold hover:underline">Créer un compte</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
