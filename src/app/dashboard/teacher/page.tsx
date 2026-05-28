"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Wallet, MessageSquare, Video, Star, AlertCircle, CheckCircle, Settings, LogOut, Menu, X } from "lucide-react";
import api from "@/lib/api";

export default function TeacherDashboard() {
  const [balance, setBalance] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();

    if (!token || role !== "teacher") {
      window.location.href = "/login";
      return;
    }

    setAuthChecked(true);

    const fetchData = async () => {
      try {
        const balRes = await api.get("/tokens/balance");
        setBalance(balRes.data.balance);
        const qRes = await api.get("/questions/my-questions");
        setQuestions(qRes.data);
        const profRes = await api.get("/profile/me");
        setProfile(profRes.data);
        setIsVerified(profRes.data.user.is_verified);
      } catch (err) {
        console.error("Error fetching teacher data", err);
      }
    };
    fetchData();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-mentora-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-mentora-fg/40 font-bold text-sm">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mentora-bg flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border/50 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-full" />
          <span className="text-lg font-black text-secondary">MENTORA</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-mentora-bg px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm">
            <Wallet className="text-secondary" size={16} />
            <span className="font-bold">{balance} F</span>
          </div>
          {isVerified ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : (
            <AlertCircle size={20} className="text-amber-500 animate-pulse" />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-mentora-bg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} className="text-secondary" /> : <Menu size={24} className="text-secondary" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Profile Info */}
            <div className="flex flex-col items-center mb-8 pb-6 border-b border-border/50">
              <div className="w-16 h-16 rounded-full border-2 border-secondary/20 p-1 mb-3">
                <div className="w-full h-full rounded-full overflow-hidden bg-mentora-bg flex items-center justify-center">
                  {profile?.profile_picture ? (
                    <Image
                      src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${profile.profile_picture.replace(/^\//, "")}`}
                      alt="Profile" width={64} height={64} className="object-cover" unoptimized
                    />
                  ) : (
                    <Clock size={28} className="text-secondary/20" />
                  )}
                </div>
              </div>
              <p className="font-bold text-sm text-foreground">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] font-bold text-mentora-fg/40 uppercase tracking-widest mt-1">Professeur</p>
            </div>

            <nav className="space-y-2 mb-8">
              <MobileSidebarLink icon={<Clock size={20}/>} label="Tableau de bord" active href="/dashboard/teacher" onClick={() => setMobileMenuOpen(false)} />
              <MobileSidebarLink icon={<MessageSquare size={20}/>} label="Questions (80F)" href="/dashboard/teacher/replies" onClick={() => setMobileMenuOpen(false)} />
              <MobileSidebarLink icon={<Video size={20}/>} label="Mes Webinaires" href="/dashboard/teacher/webinars" onClick={() => setMobileMenuOpen(false)} />
              <MobileSidebarLink icon={<Wallet size={20}/>} label="Paiements" href="/dashboard/teacher/earnings" onClick={() => setMobileMenuOpen(false)} />
            </nav>

            <div className="pt-6 border-t border-border/50 space-y-4">
              <Link href="/setup-profile" className="flex items-center gap-3 text-mentora-fg/60 font-bold hover:text-secondary transition-colors">
                <Settings size={20} />
                <span>Compte</span>
              </Link>
              <button className="flex items-center gap-3 text-red-500 font-bold hover:underline" onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}>
                <LogOut size={20} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white p-6 hidden lg:flex flex-col shrink-0 shadow-sm">
        <div className="flex items-center gap-2 mb-12">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
          <span className="text-xl font-black text-secondary">MENTORA</span>
        </div>

        <div className="flex flex-col items-center mb-10 pb-6 border-b border-border/50">
           <div className="w-20 h-20 rounded-full border-2 border-secondary/20 p-1 mb-3">
              <div className="w-full h-full rounded-full overflow-hidden bg-mentora-bg flex items-center justify-center">
                {profile?.profile_picture ? (
                  <Image
                    src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${profile.profile_picture.replace(/^\//, "")}`}
                    alt="Profile" width={80} height={80} className="object-cover" unoptimized
                  />
                ) : (
                  <Clock size={32} className="text-secondary/20" />
                )}
              </div>
           </div>
           <p className="font-bold text-sm text-foreground truncate w-full text-center">{profile?.first_name} {profile?.last_name}</p>
           <p className="text-[10px] font-bold text-mentora-fg/40 uppercase tracking-widest mt-1">Professeur</p>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<Clock size={20}/>} label="Tableau de bord" active href="/dashboard/teacher" />
          <SidebarLink icon={<MessageSquare size={20}/>} label="Questions (80F)" href="/dashboard/teacher/replies" />
          <SidebarLink icon={<Video size={20}/>} label="Mes Webinaires" href="/dashboard/teacher/webinars" />
          <SidebarLink icon={<Wallet size={20}/>} label="Paiements" href="/dashboard/teacher/earnings" />
        </nav>

        <div className="pt-6 border-t border-border/50 space-y-4">
          <Link href="/setup-profile" className="flex items-center gap-3 text-mentora-fg/60 font-bold hover:text-secondary transition-colors">
            <Settings size={20} />
            <span>Compte</span>
          </Link>
          <button className="flex items-center gap-3 text-red-500 font-bold hover:underline" onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bonjour, <span className="text-secondary">{profile?.first_name || 'Professeur'}</span> 🎓</h1>
            <p className="text-mentora-fg/60 text-sm sm:text-base">Transmettez votre expérience, bâtissez l'avenir.</p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="bg-white/80 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm backdrop-blur-sm">
              <Wallet className="text-secondary" size={20} />
              <span className="font-bold">{balance} F</span>
              <button className="ml-2 btn-secondary !py-1 !px-3 font-bold !text-xs !rounded-lg">Retirer</button>
            </div>
            {!isVerified && (
              <div className="flex gap-2 items-center bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-200 text-sm font-bold animate-pulse">
                <AlertCircle size={18} />
                <span className="hidden md:inline">En attente de validation</span>
              </div>
            )}
            {isVerified && (
              <div className="flex gap-2 items-center bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200 text-sm font-bold">
                <CheckCircle size={18} />
                <span className="hidden md:inline">Profil Vérifié</span>
              </div>
            )}
          </div>
        </header>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <TeacherStatCard title="Gains totaux" value={`${balance} F`} icon={<TrendingUpIcon />} />
          <TeacherStatCard title="Questions en attente" value={questions.filter((q:any) => q.status === 'PENDING').length} icon={<MessageSquare />} />
          <TeacherStatCard title="Prochain Webinaire" value="Aucun" icon={<Video />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8 lg:space-y-10">
            <section>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-4 sm:mb-6 gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Questions à répondre <span className="text-xs ml-1 sm:ml-2 bg-secondary/10 text-secondary px-2 py-1 rounded-full">+80F</span></h2>
              </div>
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="glass-card p-8 sm:p-12 text-center text-mentora-fg/40 italic">
                    Aucune question pour le moment.
                  </div>
                ) : (
                  questions.map((q: any) => (
                    <TeacherQuestionRow key={q.id} data={q} />
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8 lg:space-y-10">
             <section className="bg-white p-4 sm:p-6 rounded-3xl card-white">
                <h3 className="font-bold text-lg mb-4 sm:mb-6">Résumé de l'activité</h3>
                <div className="space-y-4 sm:space-y-6">
                  <ActivityItem label="Taux de réponse" value="-" color="text-green-600" />
                  <ActivityItem label="Temps moyen" value="-" color="text-secondary" />
                  <ActivityItem label="Évaluation" value="-" color="text-orange-500" />
                </div>
                <button className="w-full mt-6 sm:mt-8 bg-mentora-bg py-3 rounded-xl text-sm font-bold text-mentora-fg/70 hover:bg-surface-hover transition-colors">
                  Voir rapport complet
                </button>
             </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false, href = "#" }: any) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
      active ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-mentora-fg/60 hover:bg-surface-hover hover:text-secondary'
    }`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileSidebarLink({ icon, label, active = false, onClick, href = "#" }: any) {
  return (
    <Link href={href} onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
      active ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-mentora-fg/60 hover:bg-surface-hover hover:text-secondary'
    }`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function TeacherStatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl card-white">
       <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
            {icon}
          </div>
          <span className="text-xs sm:text-sm font-bold text-mentora-fg/40">{title}</span>
       </div>
       <p className="text-xl sm:text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}

function TrendingUpIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
}

function TeacherQuestionRow({ data }: any) {
  return (
    <div className="p-4 sm:p-5 card-white flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-xl transition-transform group">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-mentora-bg border border-border/20 shrink-0">
        <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${data.id}`} alt="Avatar" width={48} height={48} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate text-foreground group-hover:text-secondary transition-colors text-sm sm:text-base">{data.title}</p>
        <p className="text-xs text-mentora-fg/40 truncate italic mt-1">Par Étudiant #{data.student_id} • {new Date(data.created_at).toLocaleDateString()}</p>
      </div>
      <button className="btn-secondary !py-2 !px-4 sm:!px-5 text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto">Répondre (+80F)</button>
    </div>
  );
}

function ActivityItem({ label, value, color }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-mentora-fg/60">{label}</span>
      <span className={`font-black ${color}`}>{value}</span>
    </div>
  );
}
