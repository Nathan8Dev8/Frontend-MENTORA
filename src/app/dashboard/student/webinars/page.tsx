"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Clock, ArrowLeft, Video, MapPin } from "lucide-react";
import api from "@/lib/api";

export default function StudentWebinarsPage() {
  const router = useRouter();
  const [webinars, setWebinars] = useState([]);
  const [joining, setJoining] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();
    if (!token || role !== "student") { router.push("/login"); return; }
    fetchWebinars();
  }, [router]);

  const fetchWebinars = async () => {
    try {
      const res = await api.get("/webinars/");
      setWebinars(res.data);
    } catch (err) { console.error(err); }
  };

  const handleJoin = async (webinarId: number, price: number) => {
    if (!confirm(`Voulez-vous rejoindre ce webinaire pour ${price} F ?`)) return;
    setJoining(webinarId);
    try {
      await api.post(`/webinars/${webinarId}/join`);
      alert("Inscription reussie ! Le lien vous sera communique 10 minutes avant le debut.");
      fetchWebinars();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de l'inscription");
    } finally { setJoining(null); }
  };

  const statusBadge = (w: any) => {
    const now = new Date();
    const start = new Date(w.scheduled_at);
    if (w.status === "CANCELLED") return { label: "Annule", class: "bg-red-100 text-red-700" };
    if (w.status === "COMPLETED") return { label: "Termine", class: "bg-gray-100 text-gray-700" };
    if (start <= now && w.status === "UPCOMING") return { label: "En cours", class: "bg-green-100 text-green-700" };
    return { label: "A venir", class: "bg-primary/20 text-primary-dark" };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
      <button onClick={() => router.push("/dashboard/student")} className="flex items-center gap-2 text-sm text-mentora-fg/60 hover:text-secondary mb-6 font-bold">
        <ArrowLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Webinaires</h1>
      <p className="text-mentora-fg/60 mb-8">Participez a des sessions live avec des professeurs qualifies.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webinars.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-mentora-fg/40 italic">
            Aucun webinaire disponible pour le moment.
          </div>
        ) : webinars.map((w: any) => {
          const badge = statusBadge(w);
          return (
            <div key={w.id} className="bg-white rounded-3xl card-white overflow-hidden hover:shadow-xl transition-all group">
              <div className="h-32 bg-gradient-to-br from-secondary to-secondary-light relative flex items-center justify-center">
                <Video size={48} className="text-white/20" />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${badge.class}`}>{badge.label}</span>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold">{w.duration_minutes} min</span>
                  <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold">
                    <Users size={12} className="inline mr-1" />{w.seats_taken}/{w.max_seats}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{w.title}</h3>
                <p className="text-sm text-mentora-fg/60 mb-4 line-clamp-2">{w.description}</p>
                <div className="flex items-center gap-2 text-xs text-mentora-fg/40 mb-4">
                  <Calendar size={14} />
                  <span>{new Date(w.scheduled_at).toLocaleDateString()} a {new Date(w.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-secondary">{w.price.toLocaleString()} F</span>
                  <button onClick={() => handleJoin(w.id, w.price)} disabled={joining === w.id || w.status !== "UPCOMING" || w.seats_taken >= w.max_seats}
                    className="btn-secondary !py-2.5 !px-5 text-sm disabled:opacity-50">
                    {joining === w.id ? "..." : w.seats_taken >= w.max_seats ? "Complet" : "S'inscrire"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
