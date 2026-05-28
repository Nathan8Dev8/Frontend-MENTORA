"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Video, ArrowLeft, CheckCircle, XCircle, Calendar, Users, Clock } from "lucide-react";
import api from "@/lib/api";

export default function AdminWebinarsPage() {
  const router = useRouter();
  const [webinars, setWebinars] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();
    if (!token || role !== "admin") { router.push("/login"); return; }
    fetchWebinars();
  }, [router]);

  const fetchWebinars = async () => {
    try {
      const res = await api.get("/webinars/");
      setWebinars(res.data);
    } catch (err) { console.error(err); }
  };

  const handleComplete = async (webinarId: number) => {
    if (!confirm("Marquer ce webinaire comme termine ? Le professeur recevra 80% des revenus.")) return;
    try {
      await api.post(`/webinars/${webinarId}/complete`);
      alert("Webinaire marque comme termine. Fonds verses au professeur.");
      fetchWebinars();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
      <button onClick={() => router.push("/dashboard/admin")} className="flex items-center gap-2 text-sm text-mentora-fg/60 hover:text-secondary mb-6 font-bold">
        <ArrowLeft size={16} /> Retour a la console
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Gestion des Webinaires</h1>
      <p className="text-mentora-fg/60 mb-8">Suivez et validez les webinaires de la plateforme.</p>

      <div className="bg-white rounded-3xl card-white overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-mentora-bg text-mentora-fg/40 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Titre</th>
              <th className="px-6 py-4">Professeur</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Places</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {webinars.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-mentora-fg/40 italic">Aucun webinaire.</td>
              </tr>
            ) : (
              webinars.map((w: any) => (
                <tr key={w.id} className="hover:bg-mentora-bg/30">
                  <td className="px-6 py-4 font-bold text-sm">{w.title}</td>
                  <td className="px-6 py-4 text-sm text-mentora-fg/60">#{w.teacher_id}</td>
                  <td className="px-6 py-4 text-sm text-mentora-fg/60">{new Date(w.scheduled_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">{w.seats_taken}/{w.max_seats}</td>
                  <td className="px-6 py-4 text-sm font-bold">{w.price.toLocaleString()} F</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                      w.status === "UPCOMING" ? "bg-green-100 text-green-700" :
                      w.status === "COMPLETED" ? "bg-gray-100 text-gray-700" :
                      "bg-red-100 text-red-700"
                    }`}>{w.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {w.status === "UPCOMING" ? (
                      <button onClick={() => handleComplete(w.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-all flex items-center gap-1 ml-auto">
                        <CheckCircle size={14} /> Terminer
                      </button>
                    ) : (
                      <span className="text-xs text-mentora-fg/40 italic">--</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="bg-white p-5 rounded-2xl card-white">
          <p className="text-xs font-bold text-mentora-fg/40 uppercase mb-1">Total webinaires</p>
          <p className="text-2xl font-black">{webinars.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl card-white">
          <p className="text-xs font-bold text-mentora-fg/40 uppercase mb-1">A venir</p>
          <p className="text-2xl font-black">{webinars.filter((w: any) => w.status === "UPCOMING").length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl card-white">
          <p className="text-xs font-bold text-mentora-fg/40 uppercase mb-1">Termines</p>
          <p className="text-2xl font-black">{webinars.filter((w: any) => w.status === "COMPLETED").length}</p>
        </div>
      </div>
    </div>
  );
}
