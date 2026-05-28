"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowLeft, CheckCircle, Clock, Send } from "lucide-react";
import api from "@/lib/api";

export default function TeacherRepliesPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();
    if (!token || role !== "teacher") { router.push("/login"); return; }
    fetchQuestions();
  }, [router]);

  const fetchQuestions = async () => {
    try {
      const res = await api.get("/questions/my-questions");
      setQuestions(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAnswer = async (questionId: number) => {
    if (!answer.trim()) return;
    setSending(true);
    try {
      await api.post(`/questions/${questionId}/answer`, answer, {
        headers: { "Content-Type": "application/json" },
        params: { answer: answer }
      });
      setReplyingTo(null);
      setAnswer("");
      fetchQuestions();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de l'envoi");
    } finally { setSending(false); }
  };

  const pending = questions.filter((q: any) => q.status === "PENDING");
  const answered = questions.filter((q: any) => q.status === "ANSWERED");

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <button onClick={() => router.push("/dashboard/teacher")} className="flex items-center gap-2 text-sm text-mentora-fg/60 hover:text-secondary mb-6 font-bold">
        <ArrowLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Questions des etudiants</h1>
      <p className="text-mentora-fg/60 mb-8">Repondez aux questions et gagnez 80 F par reponse.</p>

      {/* Pending Questions */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock size={20} className="text-amber-500" /> En attente ({pending.length})
      </h2>
      <div className="space-y-4 mb-10">
        {pending.length === 0 ? (
          <div className="glass-card p-8 text-center text-mentora-fg/40 italic">
            Aucune question en attente.
          </div>
        ) : pending.map((q: any) => (
          <div key={q.id} className="bg-white p-5 sm:p-6 rounded-2xl card-white">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-bold text-lg text-foreground">{q.title}</h3>
                <p className="text-xs text-mentora-fg/40 mt-1">Par Etudiant #{q.student_id} - {new Date(q.created_at).toLocaleDateString()}</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold whitespace-nowrap">+80 F</span>
            </div>
            <p className="text-mentora-fg/60 italic mb-4 bg-mentora-bg p-4 rounded-xl">{q.content}</p>

            {replyingTo === q.id ? (
              <div className="space-y-3">
                <textarea rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)}
                  className="w-full bg-white border border-border/50 rounded-xl p-4 focus:ring-2 focus:ring-secondary/20 outline-none resize-none"
                  placeholder="Redigez votre reponse..." />
                <div className="flex gap-3">
                  <button onClick={() => { setReplyingTo(null); setAnswer(""); }} className="flex-1 py-3 font-bold text-mentora-fg/40 hover:text-foreground transition-colors">
                    Annuler
                  </button>
                  <button onClick={() => handleAnswer(q.id)} disabled={sending || !answer.trim()}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-50">
                    <Send size={16} /> {sending ? "Envoi..." : "Envoyer la reponse (+80 F)"}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setReplyingTo(q.id)} className="btn-secondary !py-2.5 text-sm">
                Repondre
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Answered Questions */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <CheckCircle size={20} className="text-green-500" /> Repondues ({answered.length})
      </h2>
      <div className="space-y-3">
        {answered.length === 0 ? (
          <div className="glass-card p-8 text-center text-mentora-fg/40 italic">
            Aucune question repondue pour le moment.
          </div>
        ) : answered.map((q: any) => (
          <div key={q.id} className="bg-white p-5 rounded-2xl card-white">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-foreground">{q.title}</h3>
              <span className="text-xs text-green-600 font-bold">+80 F</span>
            </div>
            <p className="text-sm text-mentora-fg/60 mb-3 italic">{q.content}</p>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-xs font-bold text-green-700 mb-1">Votre reponse :</p>
              <p className="text-sm text-foreground/80">{q.answer_content}</p>
            </div>
            <p className="text-xs text-mentora-fg/40 mt-2">Repondu le {new Date(q.answered_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
