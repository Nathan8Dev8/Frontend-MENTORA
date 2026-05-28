"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Video, ArrowLeft, Plus, Calendar, Users, Clock, Trash2 } from "lucide-react";
import api from "@/lib/api";

export default function TeacherWebinarsPage() {
  const router = useRouter();
  const [webinars, setWebinars] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", scheduled_at: "", duration_minutes: 60, price: 500, max_seats: 50
  });

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();
    if (!token || role !== "teacher") { router.push("/login"); return; }
    fetchWebinars();
  }, [router]);

  const fetchWebinars = async () => {
    try {
      const res = await api.get("/webinars/");
      setWebinars(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/webinars/create", {
        ...form,
        scheduled_at: new Date(form.scheduled_at).toISOString()
      });
      setShowCreate(false);
      setForm({ title: "", description: "", scheduled_at: "", duration_minutes: 60, price: 500, max_seats: 50 });
      fetchWebinars();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la creation");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
      <button onClick={() => router.push("/dashboard/teacher")} className="flex items-center gap-2 text-sm text-mentora-fg/60 hover:text-secondary mb-6 font-bold">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mes Webinaires</h1>
          <p className="text-mentora-fg/60 text-sm">Creez et gerer vos sessions live.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={18} /> {showCreate ? "Annuler" : "Creer un webinaire"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card p-6 sm:p-8 mb-8 space-y-5">
          <h2 className="text-xl font-bold">Nouveau webinaire</h2>
          <div>
            <label className="block text-sm font-bold mb-2">Titre</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
              className="w-full bg-white border border-border/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 outline-none"
              placeholder="Ex: Orientation post-bac 2025" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full bg-white border border-border/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Date et heure</label>
              <input type="datetime-local" required value={form.scheduled_at} onChange={(e) => setForm({...form, scheduled_at: e.target.value})}
                className="w-full bg-white border border-border/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Duree (minutes)</label>
              <input type="number" required min={15} value={form.duration_minutes} onChange={(e) => setForm({...form, duration_minutes: parseInt(e.target.value)})}
                className="w-full bg-white border border-border/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Prix (F CFA)</label>
              <input type="number" required min={0} value={form.price} onChange={(e) => setForm({...form, price: parseInt(e.target.value)})}
                className="w-full bg-white border border-border/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Places maximum</label>
              <input type="number" required min={1} value={form.max_seats} onChange={(e) => setForm({...form, max_seats: parseInt(e.target.value)})}
                className="w-full bg-white border border-border/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-secondary w-full py-4 font-bold disabled:opacity-50">
            {loading ? "Creation..." : "Creer le webinaire"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webinars.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-mentora-fg/40 italic">
            Aucun webinaire cree.
          </div>
        ) : webinars.map((w: any) => (
          <div key={w.id} className="bg-white rounded-3xl card-white overflow-hidden hover:shadow-xl transition-all">
            <div className="h-32 bg-gradient-to-br from-primary to-primary-dark relative flex items-center justify-center">
              <Video size={48} className="text-white/20" />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold">{w.duration_minutes} min</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  w.status === "UPCOMING" ? "bg-green-500/80 text-white" :
                  w.status === "COMPLETED" ? "bg-gray-500/80 text-white" : "bg-red-500/80 text-white"
                }`}>{w.status}</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2">{w.title}</h3>
              <div className="flex items-center gap-3 text-xs text-mentora-fg/40 mb-3">
                <span className="flex items-center gap-1"><Calendar size={12} />{new Date(w.scheduled_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Users size={12} />{w.seats_taken}/{w.max_seats}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-secondary">{w.price.toLocaleString()} F</span>
                <span className="text-xs text-mentora-fg/40">{w.seats_taken * w.price * 0.8} F estimes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
