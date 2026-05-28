"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, ArrowLeft, TrendingUp, History, CreditCard, Download } from "lucide-react";
import api from "@/lib/api";

export default function TeacherEarningsPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();
    if (!token || role !== "teacher") { router.push("/login"); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [balRes, histRes] = await Promise.all([
        api.get("/tokens/balance"),
        api.get("/tokens/history")
      ]);
      setBalance(balRes.data.balance);
      setHistory(histRes.data);
    } catch (err) { console.error(err); }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount < 1000) { alert("Montant minimum de retrait : 1 000 F"); return; }
    if (withdrawAmount > balance) { alert("Solde insuffisant"); return; }
    setLoading(true);
    try {
      await api.post("/tokens/withdraw", null, { params: { amount: withdrawAmount } });
      alert("Demande de retrait soumise. L'administrateur va la valider.");
      setShowWithdraw(false);
      setWithdrawAmount(0);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors du retrait");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <button onClick={() => router.push("/dashboard/teacher")} className="flex items-center gap-2 text-sm text-mentora-fg/60 hover:text-secondary mb-6 font-bold">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mes Gains</h1>
          <p className="text-mentora-fg/60 text-sm">Consultez vos revenus et effectuez des retraits.</p>
        </div>
        <button onClick={() => setShowWithdraw(!showWithdraw)} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <CreditCard size={18} /> {showWithdraw ? "Annuler" : "Effectuer un retrait"}
        </button>
      </div>

      <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 rounded-3xl text-white mb-8 shadow-xl shadow-green-600/20">
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={24} className="text-primary" />
          <span className="font-bold text-sm uppercase tracking-widest text-primary">Solde disponible</span>
        </div>
        <p className="text-4xl sm:text-5xl font-black mb-2">{balance.toLocaleString()} F</p>
        <p className="text-white/60 text-sm">Gagnez 80 F par question et 80% du prix des webinaires.</p>
      </div>

      {showWithdraw && (
        <div className="glass-card p-6 sm:p-8 mb-8 space-y-5">
          <h2 className="text-xl font-bold">Demande de retrait</h2>
          <p className="text-sm text-mentora-fg/60">Montant minimum : 1 000 F. La demande sera validee par l'administrateur.</p>
          <div className="flex items-center gap-4">
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
              className="flex-1 bg-white border border-border/50 rounded-xl py-4 px-6 text-2xl font-bold text-center focus:ring-2 focus:ring-secondary/20 outline-none"
              placeholder="Montant" />
            <span className="font-bold text-2xl text-mentora-fg/60">F</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[5000, 10000, 25000, 50000].map(amount => (
              <button key={amount} type="button" onClick={() => setWithdrawAmount(amount)}
                className={`px-4 py-2 rounded-xl font-bold border-2 text-sm transition-all ${withdrawAmount === amount ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border/50 text-mentora-fg/60'}`}>
                {amount.toLocaleString()} F
              </button>
            ))}
          </div>
          <button onClick={handleWithdraw} disabled={loading || withdrawAmount < 1000 || withdrawAmount > balance}
            className="btn-secondary w-full py-4 font-bold disabled:opacity-50">
            {loading ? "Traitement..." : `Soumettre la demande de retrait (${withdrawAmount.toLocaleString()} F)`}
          </button>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <History size={20} className="text-secondary" /> Historique des transactions
      </h2>
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="glass-card p-12 text-center text-mentora-fg/40 italic">Aucune transaction.</div>
        ) : (
          history.map((tx: any) => (
            <div key={tx.id} className="bg-white p-4 sm:p-5 rounded-2xl card-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <TrendingUp size={18} className={tx.amount > 0 ? 'text-green-600' : 'text-red-500'} />
                </div>
                <div>
                  <p className="font-bold text-sm">{tx.type === "EARNING_80" ? "Reponse a une question" : tx.type === "WEBINAR_EARNING" ? "Gain webinaire" : tx.type === "WITHDRAWAL" ? "Retrait" : tx.type}</p>
                  <p className="text-xs text-mentora-fg/40">{new Date(tx.created_at).toLocaleDateString()} - {tx.status}</p>
                </div>
              </div>
              <span className={`font-black text-lg ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} F
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
