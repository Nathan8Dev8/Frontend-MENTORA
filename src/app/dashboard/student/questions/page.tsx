"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, MessageSquare, Clock, CheckCircle, XCircle, ArrowLeft, Plus } from "lucide-react";
import api from "@/lib/api";

export default function StudentQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showAskForm, setShowAskForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ teacher_id: "", title: "", content: "" });

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();
    if (!token || role !== "student") { router.push("/login"); return; }
    fetchQuestions();
    fetchTeachers();
  }, [router]);

  const fetchQuestions = async () => {
    try {
      const res = await api.get("/questions/my-questions");
      setQuestions(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teachers/list");
      setTeachers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teacher_id || !form.title || !form.content) return;
    setLoading(true);
    try {
      await api.post("/questions/ask", {
        teacher_id: parseInt(form.teacher_id),
        title: form.title,
        content: form.content
      });
      setShowAskForm(false);
      setForm({ teacher_id: "", title: "", content: "" });
      fetchQuestions();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de l'envoi");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <button onClick={() => router.push("/dashboard/student")} className="flex items-center gap-2 text-sm text-mentora-fg/60 hover:text-secondary mb-6 font-bold">
        <ArrowLeft size={16} /> Retour au tableau de bord
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mes Questions</h1>
          <p className="text-mentora-fg/60 text-sm">Posez une question a un professeur pour 100 F.</p>
        </div>
        <button onClick={() => setShowAskForm(!showAskForm)} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={18} /> {showAskForm ? "Annuler" : "Poser une Question"}
        </button>
      </div>

      {showAskForm && (
        <form onSubmit={handleAsk} className="glass-card p-6 sm:p-8 mb-8 space-y-5">
          <h2 className="text-xl font-bold">Nouvelle question</h2>
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">Professeur</label>
            <select required value={form.teacher_id} onChange={(e) => setForm({...form, teacher_id: e.target.value})}
              className="w-full bg-white border border-border/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 outline-none">
              <option value="">Selectionnez un professeur...</option>
              {teachers.map((t: any) => (
                <option key={t.id} value={t.id}>{t.profile?.full_name || t.email} - {t.profile?.grade_or_position || "Professeur"}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">Titre</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
              className="w-full bg-white border border-border/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 outline-none"
              placeholder="Ex: Orientation apres le Bac C" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">Votre question</label>
            <textarea required rows={5} value={form.content} onChange={(e) => setForm({...form, content: e.target.value})}
              className="w-full bg-white border border-border/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary/20 outline-none resize-none"
              placeholder="Decrivez votre situation en details..." />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <strong>Note :</strong> 100 F seront debloques de votre portefeuille. Si le professeur ne repond pas sous 48h, vous serez automatiquement rembourse.
          </div>
          <button type="submit" disabled={loading} className="btn-secondary w-full py-4 text-lg font-bold disabled:opacity-50">
            {loading ? "Envoi en cours..." : "Envoyer ma question (100 F)"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MessageSquare size={48} className="text-mentora-fg/20 mx-auto mb-4" />
            <p className="text-mentora-fg/40 italic">Vous n'avez pas encore pose de question.</p>
            <button onClick={() => setShowAskForm(true)} className="btn-secondary mt-6 inline-flex items-center gap-2">
              <Plus size={16} /> Poser ma premiere question
            </button>
          </div>
        ) : (
          questions.map((q: any) => (
            <div key={q.id} className="bg-white p-5 rounded-2xl card-white hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="font-bold text-lg text-foreground">{q.title}</h3>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                  q.status === "ANSWERED" ? "bg-green-100 text-green-700" :
                  q.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                  q.status === "REFUNDED" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {q.status === "ANSWERED" ? "Repondue" : q.status === "PENDING" ? "En attente" : q.status === "REFUNDED" ? "Remboursee" : q.status}
                </span>
              </div>
              <p className="text-mentora-fg/60 mb-4 italic">{q.content}</p>
              {q.answer_content && (
                <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/10 mb-3">
                  <p className="text-xs font-bold text-secondary mb-2">Reponse du professeur :</p>
                  <p className="text-sm text-foreground/80">{q.answer_content}</p>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-mentora-fg/40 pt-3 border-t border-border/30">
                <span>Professeur #{q.teacher_id}</span>
                <span>{new Date(q.created_at).toLocaleDateString()}</span>
                {q.answered_at && <span>Repondu le {new Date(q.answered_at).toLocaleDateString()}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
