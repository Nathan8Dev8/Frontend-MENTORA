"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Briefcase, GraduationCap } from "lucide-react";
import api from "@/lib/api";
import BackButton from "@/components/BackButton";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await api.post("/auth/register", { email, password, role });
      // After register, we should login to get the token
      const loginRes = await api.post("/auth/login", { email, password });
      localStorage.setItem("mentora_token", loginRes.data.access_token);
      localStorage.setItem("mentora_role", loginRes.data.role.toLowerCase());
      
      // Redirect to profile setup
      router.push("/setup-profile");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Une erreur est survenue lors de l'inscription.");
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
          <h1 className="text-3xl font-bold text-foreground">Créer un compte</h1>
          <p className="text-mentora-fg/60 mt-2">Commencez votre voyage d'orientation aujourd'hui.</p>
        </div>

        <div className="glass-card p-8 shadow-2xl shadow-secondary/10">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 italic">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">Je suis un...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    role === "student" ? "border-secondary bg-secondary/5 text-secondary" : "border-border/50 text-mentora-fg/40"
                  }`}
                >
                  <GraduationCap size={20} />
                  <span className="font-bold">Étudiant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    role === "teacher" ? "border-secondary bg-secondary/5 text-secondary" : "border-border/50 text-mentora-fg/40"
                  }`}
                >
                  <Briefcase size={20} />
                  <span className="font-bold">Professeur</span>
                </button>
              </div>
            </div>

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
              <label className="block text-sm font-bold mb-2 text-foreground/80">Mot de passe</label>
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
              {loading ? "Chargement..." : "S'inscrire"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-mentora-fg/60">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-secondary font-bold hover:underline">Connectez-vous</Link>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-mentora-fg/40 leading-relaxed max-w-xs mx-auto">
          En vous inscrivant, vous acceptez nos <span className="underline">Conditions d'utilisation</span> et notre <span className="underline">Politique de confidentialité</span>.
        </p>
      </motion.div>
    </div>
  );
}
