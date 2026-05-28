"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Users, ShieldCheck, Zap, Menu, X } from "lucide-react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mentora-bg selection:bg-primary selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-border/50 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Mentora" width={36} height={36} className="rounded-full shadow-sm" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-secondary">MENTORA</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-8 font-medium text-mentora-fg/70">
            <Link href="#features" className="hover:text-secondary transition-colors">Fonctionnalités</Link>
            <Link href="#pricing" className="hover:text-secondary transition-colors">Tarifs</Link>
            <Link href="#mentors" className="hover:text-secondary transition-colors">Mentors</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex gap-4 items-center">
            <Link href="/login" className="text-secondary font-semibold hover:underline decoration-2 underline-offset-4">Connexion</Link>
            <Link href="/register" className="btn-primary shadow-lg shadow-primary/20">S'inscrire</Link>
          </div>

          {/* Mobile: Burger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-mentora-bg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} className="text-secondary" /> : <Menu size={24} className="text-secondary" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-border/50 shadow-xl px-6 py-6 flex flex-col gap-5"
            >
              <Link href="#features" className="font-medium text-mentora-fg/70 hover:text-secondary" onClick={() => setMenuOpen(false)}>Fonctionnalités</Link>
              <Link href="#pricing" className="font-medium text-mentora-fg/70 hover:text-secondary" onClick={() => setMenuOpen(false)}>Tarifs</Link>
              <Link href="#mentors" className="font-medium text-mentora-fg/70 hover:text-secondary" onClick={() => setMenuOpen(false)}>Mentors</Link>
              <div className="h-px bg-border/40" />
              <Link href="/login" className="text-secondary font-bold text-center py-2">Se connecter</Link>
              <Link href="/register" className="btn-primary text-center shadow-lg shadow-primary/20">S'inscrire gratuitement</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10 md:gap-12">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-dark font-bold text-xs sm:text-sm mb-5 sm:mb-6">
              Nouveau : Découvrez l'orientation personnalisée
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-5 sm:mb-6 text-foreground">
              Éclairez votre <span className="text-secondary">Avenir</span> avec Mentora
            </h1>
            <p className="text-base sm:text-xl text-mentora-fg/70 mb-6 sm:mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Connectez-vous avec les meilleurs conseillers d'orientation au Cameroun. Obtenez des conseils personnalisés, participez à des webinaires exclusifs et lancez votre carrière aujourd'hui.
            </p>

            {/* Hero Image — mobile only, between description and buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative md:hidden mb-8"
            >
              <div className="glass-card p-3 relative z-10">
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop"
                  alt="Mentorship Session"
                  width={800}
                  height={500}
                  className="rounded-xl shadow-inner w-full h-auto object-cover"
                />
                <div className="absolute top-6 right-6 bg-white p-2.5 rounded-xl shadow-xl border border-border/50 animate-bounce cursor-default">
                  <p className="font-bold text-secondary text-xs">Session Live</p>
                  <p className="text-[10px] text-mentora-fg/60">Orientation en cours</p>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <Link href="/register" className="btn-secondary text-base sm:text-lg flex items-center justify-center gap-2 px-6 sm:px-8">
                Trouver un Mentor <ArrowRight size={20} />
              </Link>
              <Link href="#features" className="btn-primary bg-white border border-border text-base sm:text-lg hover:bg-surface-hover text-center">
                Comment ça marche ?
              </Link>
            </div>
            <div className="mt-8 sm:mt-10 flex items-center gap-4 text-sm text-mentora-fg/60 justify-center md:justify-start">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-secondary/10 overflow-hidden shadow-sm">
                    <Image
                      src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i}`}
                      alt="Avatar"
                      width={40}
                      height={40}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <p><span className="font-bold text-foreground">Plusieurs étudiants</span> nous font déjà confiance</p>
            </div>
          </motion.div>

          {/* Hero Image — desktop only */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden md:block"
          >
            <div className="absolute -top-12 -left-12 w-48 sm:w-64 h-48 sm:h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 -right-12 w-48 sm:w-64 h-48 sm:h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
            <div className="glass-card p-4 relative z-10">
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop"
                alt="Mentorship Session"
                width={800}
                height={600}
                className="rounded-xl shadow-inner w-full h-auto"
              />
              <div className="absolute top-8 right-8 bg-white p-3 sm:p-4 rounded-xl shadow-xl border border-border/50 animate-bounce cursor-default">
                <p className="font-bold text-secondary text-xs sm:text-sm">Session Live</p>
                <p className="text-xs text-mentora-fg/60">Orientation en cours</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-y border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pourquoi choisir <span className="text-secondary">Mentora</span> ?</h2>
            <p className="text-mentora-fg/60 max-w-2xl mx-auto text-sm sm:text-base">Une plateforme complète conçue pour l'accompagnement pédagogique et professionnel.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            <FeatureCard
              icon={<Zap className="text-primary-dark" />}
              title="Conseils Rapides"
              description="Posez une question à 100F et obtenez une réponse experte en moins de 48h."
            />
            <FeatureCard
              icon={<Users className="text-secondary" />}
              title="Mentorat de Groupe"
              description="Participez à des webinaires thématiques pour découvrir les grandes écoles."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-green-600" />}
              title="Paiement Sécurisé"
              description="Système de tokens sécurisé avec remboursement automatique si pas de réponse."
            />
            <FeatureCard
              icon={<BookOpen className="text-orange-600" />}
              title="Suivi de Carrière"
              description="Gardez un historique de vos échanges avec les mentors pour votre avenir."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary text-white px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 mb-5 justify-center sm:justify-start">
              <Image src="/logo.png" alt="Mentora" width={30} height={30} className="brightness-200" />
              <span className="text-xl font-bold tracking-tight">MENTORA</span>
            </div>
            <p className="text-white/60 text-sm">La plateforme n°1 de l'orientation scolaire et professionnelle au Cameroun.</p>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-bold mb-5 text-lg">Liens Rapides</h3>
            <div className="flex flex-col gap-3 text-white/70 text-sm">
              <Link href="#" className="hover:text-white transition-colors">Notre Vision</Link>
              <Link href="#" className="hover:text-white transition-colors">Devenir Mentor</Link>
              <Link href="#" className="hover:text-white transition-colors">Support Clients</Link>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-bold mb-5 text-lg">Contact</h3>
            <p className="text-white/70 text-sm">Yaoundé, Cameroun</p>
            <p className="text-white/70 mt-2 text-sm">Email: contact@mentora.cm</p>
            <div className="flex gap-4 mt-6 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-sm font-bold">FB</div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-sm font-bold">IG</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-10 sm:mt-12 pt-6 sm:pt-8 text-center text-white/50 text-xs sm:text-sm italic">
          &copy; 2024 Mentora Platform. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 sm:p-8 rounded-2xl card-white hover:border-secondary/30 transition-all hover:shadow-xl hover:shadow-secondary/5 group">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-mentora-bg flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-3">{title}</h3>
      <p className="text-mentora-fg/60 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
