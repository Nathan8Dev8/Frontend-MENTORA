"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Wallet, MessageSquare, Calendar, Star, TrendingUp, Bell, Users, Settings, LogOut, Menu, X } from "lucide-react";
import api from "@/lib/api";

export default function StudentDashboard() {
  const [balance, setBalance] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();

    if (!token || role !== "student") {
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
        const wRes = await api.get("/webinars/");
        setWebinars(wRes.data);
        const profRes = await api.get("/profile/me");
        setProfile(profRes.data);
      } catch (err) {
        console.error("Error fetching student data", err);
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
                    <Users size={28} className="text-secondary/20" />
                  )}
                </div>
              </div>
              <p className="font-bold text-sm text-foreground">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] font-bold text-mentora-fg/40 uppercase tracking-widest mt-1">Étudiant</p>
            </div>

            <nav className="space-y-2 mb-8">
              <MobileSidebarLink icon={<TrendingUp size={20}/>} label="Tableau de bord" active href="/dashboard/student" onClick={() => setMobileMenuOpen(false)} />
              <MobileSidebarLink icon={<Search size={20}/>} label="Trouver un Mentor" href="/dashboard/student/mentors" onClick={() => setMobileMenuOpen(false)} />
              <MobileSidebarLink icon={<MessageSquare size={20}/>} label="Mes Questions" href="/dashboard/student/questions" onClick={() => setMobileMenuOpen(false)} />
              <MobileSidebarLink icon={<Calendar size={20}/>} label="Webinaires" href="/dashboard/student/webinars" onClick={() => setMobileMenuOpen(false)} />
              <MobileSidebarLink icon={<Wallet size={20}/>} label="Portefeuille" href="/dashboard/student/wallet" onClick={() => setMobileMenuOpen(false)} />
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

        {/* Profile Info in Sidebar */}
        <div className="flex flex-col items-center mb-10 pb-6 border-b border-border/50">
           <div className="w-20 h-20 rounded-full border-2 border-secondary/20 p-1 mb-3">
              <div className="w-full h-full rounded-full overflow-hidden bg-mentora-bg flex items-center justify-center">
                {profile?.profile_picture ? (
                  <Image
                    src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${profile.profile_picture.replace(/^\//, "")}`}
                    alt="Profile" width={80} height={80} className="object-cover" unoptimized
                  />
                ) : (
                  <Users size={32} className="text-secondary/20" />
                )}
              </div>
           </div>
           <p className="font-bold text-sm text-foreground truncate w-full text-center">{profile?.first_name} {profile?.last_name}</p>
           <p className="text-[10px] font-bold text-mentora-fg/40 uppercase tracking-widest mt-1">Étudiant</p>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<TrendingUp size={20}/>} label="Tableau de bord" active href="/dashboard/student" />
          <SidebarLink icon={<Search size={20}/>} label="Trouver un Mentor" href="/dashboard/student/mentors" />
          <SidebarLink icon={<MessageSquare size={20}/>} label="Mes Questions" href="/dashboard/student/questions" />
          <SidebarLink icon={<Calendar size={20}/>} label="Webinaires" href="/dashboard/student/webinars" />
          <SidebarLink icon={<Wallet size={20}/>} label="Portefeuille" href="/dashboard/student/wallet" />
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bonjour, <span className="text-secondary">{profile?.first_name || 'Étudiant'}</span> 👋</h1>
            <p className="text-mentora-fg/60 text-sm sm:text-base">Contre l'incertitude, l'orientation est votre meilleure alliée.</p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="bg-white/80 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm backdrop-blur-sm">
              <Wallet className="text-secondary" size={20} />
              <span className="font-bold">{balance} F</span>
              <Link href="/dashboard/student/wallet" className="ml-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-dark font-bold hover:scale-110 transition-transform">+</Link>
            </div>
            <button className="w-10 h-10 rounded-xl bg-white flex shadow-sm items-center justify-center text-mentora-fg/60 hover:bg-surface-hover">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <StatCard title="Questions posées" value={questions.length} icon={<MessageSquare className="text-secondary" />} />
          <StatCard title="Webinaires inscrits" value="0" icon={<Calendar className="text-primary-dark" />} />
          <StatCard title="Session mentorat" value="0" icon={<Star className="text-orange-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8 lg:space-y-10">
            <section>
              <div className="flex justify-between items-end mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Mes Questions Récentes</h2>
                <Link href="/dashboard/student/questions" className="text-secondary text-sm font-bold hover:underline">Voir tout</Link>
              </div>

              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="glass-card p-8 sm:p-12 text-center text-mentora-fg/40 italic">
                    Vous n'avez pas encore posé de questions.
                  </div>
                ) : (
                  questions.map((q: any) => (
                    <QuestionCard key={q.id} data={q} />
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Webinaires Recommandés</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {webinars.slice(0, 2).map((w: any) => (
                  <WebinarCard key={w.id} data={w} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8 lg:space-y-10">
            <section className="bg-secondary p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-secondary/30">
              <div className="relative z-10">
                <h3 className="text-lg sm:text-xl font-bold mb-4 leading-tight">Besoin d'un conseil immédiat ?</h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">Trouvez un expert et posez votre question pour seulement 100 F. Réponse garantie en 48h. En cas de silence du prof, vous etes rembousé dans les 48h suivant l'envoie de la question.</p>
                <button onClick={() => window.location.href='/dashboard/student/questions'} className="w-full btn-primary !bg-white !text-secondary font-bold text-sm">Poser une Question</button>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
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

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl card-white flex items-center gap-4 sm:gap-6">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-mentora-bg flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs sm:text-sm font-bold text-mentora-fg/40 mb-1">{title}</p>
        <p className="text-xl sm:text-2xl font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}

function QuestionCard({ data }: any) {
  const statusColor = data.status === 'ANSWERED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
  const statusLabel = data.status === 'ANSWERED' ? 'Répondue' : 'En attente';

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl card-white hover:shadow-lg transition-shadow group cursor-pointer">
      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
        <h3 className="font-bold text-base sm:text-lg group-hover:text-secondary transition-colors line-clamp-1">{data.title}</h3>
        <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${statusColor}`}>{statusLabel}</span>
      </div>
      <p className="text-sm text-mentora-fg/60 line-clamp-2 mb-3 sm:mb-4 italic">"{data.content}"</p>
      <div className="flex flex-wrap justify-between items-center text-xs pt-3 sm:pt-4 border-t border-border/30 gap-2">
        <div className="flex gap-3 sm:gap-4">
          <span className="text-secondary font-bold">Professeur #{data.teacher_id}</span>
          <span className="text-mentora-fg/40">{new Date(data.created_at).toLocaleDateString()}</span>
        </div>
        <Link href="/dashboard/student/questions" className="font-bold text-secondary hover:underline">Détails</Link>
      </div>
    </div>
  );
}

function WebinarCard({ data }: any) {
  return (
    <div className="glass-card overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
      <div className="h-28 sm:h-32 bg-secondary/5 relative">
        <div className="absolute inset-0 flex items-center justify-center">
            <Calendar size={48} className="text-secondary/10" />
        </div>
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-primary px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black text-primary-dark shadow-sm uppercase tracking-wider">
          Live {new Date(data.scheduled_at).toLocaleDateString()}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="font-bold mb-2 text-base sm:text-lg line-clamp-1">{data.title}</h3>
        <div className="flex items-center gap-3 sm:gap-4 text-xs text-mentora-fg/40 mb-3 sm:mb-4 font-medium">
          <span className="flex items-center gap-1"><Users size={12}/> {data.seats_taken}/{data.max_seats}</span>
          <span className="flex items-center gap-1"><Calendar size={12}/> {data.duration_minutes} min</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg sm:text-xl font-black text-secondary">{data.price} F</span>
          <button className="btn-secondary !py-2 !px-3 sm:!px-4 text-xs">S'inscrire</button>
        </div>
      </div>
    </div>
  );
}
