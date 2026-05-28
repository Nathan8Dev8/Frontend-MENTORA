"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, ArrowLeft, Plus, History, CreditCard, TrendingDown, TrendingUp } from "lucide-react";
import api from "@/lib/api";

export default function StudentWalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [showPurchase, setShowPurchase] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(500);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();
    if (!token || role !== "student") { router.push("/login"); return; }
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

  const handlePurchase = async () => {
    if (purchaseAmount < 100) { alert("Montant minimum : 100 F"); return; }
    setLoading(true);
    try {
      await api.post("/tokens/purchase", {
        amount: purchaseAmount,
        payment_method: "Mobile Money"
      });
      setShowPurchase(false);
      setPurchaseAmount(500);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de l'achat");
    } finally { setLoading(false); }
  };

  const typeLabel = (type: string) => {
    const labels: any = {
      PURCHASE: "Achat de tokens",
      QUESTION_FREEZE: "Question posee (100 F)",
      EARNING_80: "Gain (80 F)",
      REFUND: "Remboursement",
      WITHDRAWAL: "Retrait"
    };
    return labels[type] || type;
  };

  const typeColor = (type: string) => {
    if (["PURCHASE", "EARNING_80", "REFUND"].includes(type)) return "text-green-600";
    if (["QUESTION_FREEZE", "WITHDRAWAL"].includes(type)) return "text-red-500";
    return "text-mentora-fg/60";
  };

  const typeIcon = (type: string) => {
    if (["PURCHASE", "EARNING_80", "REFUND"].includes(type)) return <TrendingUp size={16} className="text-green-600" />;
    return <TrendingDown size={16} className="text-red-500" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <button onClick={() => router.push("/dashboard/student")} className="flex items-center gap-2 text-sm text-mentora-fg/60 hover:text-secondary mb-6 font-bold">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Portefeuille</h1>
          <p className="text-mentora-fg/60 text-sm">Gerer vos tokens et vos transactions.</p>
        </div>
        <button onClick={() => setShowPurchase(!showPurchase)} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={18} /> Acheter des tokens
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-secondary p-8 rounded-3xl text-white mb-8 shadow-xl shadow-secondary/20">
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={24} className="text-primary" />
          <span className="font-bold text-sm uppercase tracking-widest text-primary">Solde disponible</span>
        </div>
        <p className="text-4xl sm:text-5xl font-black mb-2">{balance.toLocaleString()} F</p>
        <p className="text-white/60 text-sm">Utilisez vos tokens pour poser des questions (100 F/question)</p>
      </div>

      {/* Purchase Form */}
      {showPurchase && (
        <div className="glass-card p-6 sm:p-8 mb-8 space-y-5">
          <h2 className="text-xl font-bold">Acheter des tokens</h2>
          <p className="text-sm text-mentora-fg/60">Simulation d'achat (pas d'integration de paiement reelle pour le moment).</p>
          <div className="flex gap-3 flex-wrap">
            {[500, 1000, 2000, 5000, 10000].map(amount => (
              <button key={amount} type="button" onClick={() => setPurchaseAmount(amount)}
                className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${purchaseAmount === amount ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border/50 text-mentora-fg/60 hover:border-secondary/30'}`}>
                {amount.toLocaleString()} F
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <input type="number" value={purchaseAmount} onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 0)}
              className="w-40 bg-white border border-border/50 rounded-xl py-3 px-4 text-center font-bold text-lg focus:ring-2 focus:ring-secondary/20 outline-none" />
            <span className="font-bold text-mentora-fg/60">FCFA</span>
          </div>
          <button onClick={handlePurchase} disabled={loading} className="btn-secondary w-full py-4 font-bold disabled:opacity-50">
            {loading ? "Traitement..." : `Acheter pour ${purchaseAmount.toLocaleString()} F`}
          </button>
        </div>
      )}

      {/* Transaction History */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <History size={20} className="text-secondary" /> Historique des transactions
      </h2>
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="glass-card p-12 text-center text-mentora-fg/40 italic">Aucune transaction.</div>
        ) : (
          history.map((tx: any) => (
            <div key={tx.id} className="bg-white p-5 rounded-2xl card-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-mentora-bg flex items-center justify-center">
                  {typeIcon(tx.type)}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{typeLabel(tx.type)}</p>
                  <p className="text-xs text-mentora-fg/40">{new Date(tx.created_at).toLocaleDateString()} - {tx.status}</p>
                </div>
              </div>
              <span className={`font-black text-lg ${typeColor(tx.type)}`}>
                {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} F
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
