"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Users, CreditCard, AlertCircle, Check, X, FileText, TrendingUp, User, LogOut, Settings, Plus, Trash2, Edit2, Menu, Search, Filter, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({ users: 0, questions: 0, volume: "0 F" });
  const [allUsers, setAllUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("nathan.pichele8456@gmail.com");
  const [authChecked, setAuthChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showPassword, setShowPassword] = useState(false);
  const [adminFullName, setAdminFullName] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1 = connexion, 2 = profil
  const [editingUser, setEditingUser] = useState<any>(null);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  // Add form: step 1
  const [addCredentials, setAddCredentials] = useState({ email: "", password: "", role: "student" });
  // Add/Edit form: step 2 (profil)
  const [profileForm, setProfileForm] = useState({
    first_name: "", last_name: "", gender: "", phone: "",
    birth_date: "", birth_place: "", country: "", address: "",
    institution: "", grade_or_position: "", bio: "", specialties: ""
  });
  // Edit form step 1
  const [editCredentials, setEditCredentials] = useState({ email: "", role: "student", is_verified: false });

  const fetchData = async () => {
    try {
      const [teachRes, withRes, statsRes, usersRes] = await Promise.all([
        api.get("/admin/pending-teachers"),
        api.get("/admin/pending-withdrawals"),
        api.get("/admin/stats"),
        api.get("/admin/users")
      ]);
      setPendingTeachers(teachRes.data);
      setWithdrawals(withRes.data);
      setStats(statsRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();

    if (!token || role !== "admin") {
      window.location.href = "/login";
      return;
    }

    setAuthChecked(true);
    fetchData();
    const savedName = localStorage.getItem("admin_user_name");
    if (savedName) setUserName(savedName);
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

  const handleVerify = async (userId: number) => {
    try {
      await api.post(`/admin/verify-teacher/${userId}`);
      fetchData();
      alert("Professeur validé !");
    } catch (err) {
      alert("Erreur lors de la validation");
    }
  };

  const handleReject = async (userId: number) => {
    if (!confirm("Voulez-vous vraiment rejeter ce professeur ?")) return;
    try {
      await api.post(`/admin/reject-teacher/${userId}`);
      fetchData();
      alert("Professeur rejeté !");
    } catch (err) {
      alert("Erreur lors du rejet");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const resetAddModal = () => {
    setIsAddModalOpen(false);
    setModalStep(1);
    setCreatedUserId(null);
    setShowPassword(false);
    setAdminFullName("");
    setAddCredentials({ email: "", password: "", role: "student" });
    setProfileForm({ first_name: "", last_name: "", gender: "", phone: "", birth_date: "", birth_place: "", country: "", address: "", institution: "", grade_or_position: "", bio: "", specialties: "" });
  };

  // ADD - Step 2 (connexion): create account then go to step 3 (profile)
  const handleAddStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For admin, we use adminFullName from the same step
      const payload = addCredentials.role === 'admin' 
        ? { ...addCredentials, full_name: adminFullName }
        : addCredentials;
        
      const res = await api.post("/admin/users", payload);
      const newId = res.data.id;
      
      if (addCredentials.role === 'admin') {
        // Since we passed full_name in create_user and it's handled by backend, we're done
        resetAddModal();
        fetchData();
        return;
      }

      setCreatedUserId(newId);
      setModalStep(3); // step 3 = profil
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la création");
    }
  };

  // ADD - Step 2: save profile
  const handleAddStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdUserId) return;
    try {
      await api.patch(`/admin/users/${createdUserId}/profile`, profileForm);
      resetAddModal();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la sauvegarde du profil");
    }
  };

  const handleEditClick = async (u: any) => {
    setEditingUser(u);
    setEditCredentials({ email: u.email, role: u.role, is_verified: u.is_verified });
    // Load full profile
    const p = u.profile;
    setAdminFullName(p ? (u.role === 'admin' ? p.full_name : `${p.first_name || ""} ${p.last_name || ""}`.trim()) : "");
    setProfileForm({
      first_name: p?.first_name || "",
      last_name: p?.last_name || "",
      gender: p?.gender || "",
      phone: p?.phone || "",
      birth_date: p?.birth_date || "",
      birth_place: p?.birth_place || "",
      country: p?.country || "",
      address: p?.address || "",
      institution: p?.institution || "",
      grade_or_position: p?.grade_or_position || "",
      bio: p?.bio || "",
      specialties: p?.specialties || "",
    });
    setModalStep(1);
    setIsEditModalOpen(true);
  };

  const handleUpdateStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.patch(`/admin/users/${editingUser.id}`, editCredentials);
      
      if (editCredentials.role === 'admin') {
        // Save name immediately for admin and close
        await api.patch(`/admin/users/${editingUser.id}/profile`, { full_name: adminFullName });
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchData();
        return;
      }

      setModalStep(2);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la mise à jour");
    }
  };

  const handleUpdateStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      if (editCredentials.role === 'admin') {
        await api.patch(`/admin/users/${editingUser.id}/profile`, { 
          full_name: adminFullName
        });
      } else {
        await api.patch(`/admin/users/${editingUser.id}/profile`, profileForm);
      }
      setIsEditModalOpen(false);
      setEditingUser(null);
      setModalStep(1);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la sauvegarde du profil");
    }
  };

  const handleUpdateOwnName = async () => {
    try {
      const me = await api.get("/profile/me");
      await api.patch(`/admin/users/${me.data.id}/profile`, { 
        full_name: userName
      });
      localStorage.setItem("admin_user_name", userName);
      fetchData();
      alert("Profil mis à jour !");
    } catch (err) {
      console.error("Error updating admin name", err);
      alert("Erreur lors de la mise à jour.");
    }
  };

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const filteredUsers = allUsers.filter((u: any) => {
    const name = u.profile ? (u.role === 'admin' ? u.profile.full_name : `${u.profile.first_name || ""} ${u.profile.last_name || ""}`) : "";
    const email = u.email.toLowerCase();
    const searchMatch = name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    
    if (!searchMatch) return false;
    
    if (filterStatus === "all") return true;
    if (filterStatus === "admin") return u.role === "admin";
    if (filterStatus === "teacher") return u.role === "teacher";
    if (filterStatus === "student") return u.role === "student";
    if (filterStatus === "teacher_verified") return u.role === "teacher" && u.is_verified;
    if (filterStatus === "teacher_pending") return u.role === "teacher" && !u.is_verified && u.is_active !== false;
    if (filterStatus === "teacher_rejected") return u.role === "teacher" && (u.is_active === false);
    
    return true;
  });

  return (
    <div className="min-h-screen bg-mentora-bg flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Shield className="text-primary" size={24} />
          <span className="text-lg font-black">ADMIN</span>
          {userName && <span className="text-xs text-primary/60 ml-1">• {userName}</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <User size={18} className="text-primary" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Account Menu */}
      {showAccountMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowAccountMenu(false)}>
          <div className="absolute right-4 top-16 w-72 bg-white rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <p className="text-xs font-bold text-mentora-fg/40 uppercase mb-1">Email Connecté</p>
            <p className="text-sm font-bold text-foreground mb-6 truncate">{email}</p>
            <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-2">Votre Nom</label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Ex: Nathan Pichele"
                        className="w-full bg-mentora-bg border border-border/50 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-secondary/20 outline-none"
                      />
                      <button onClick={handleUpdateOwnName} className="w-full py-1.5 bg-secondary/10 text-secondary rounded-lg text-[10px] font-bold hover:bg-secondary/20 transition-all">Sauvegarder</button>
                    </div>
                  </div>
              <button onClick={() => setShowAccountMenu(false)} className="w-full btn-secondary !py-2 text-xs">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-72 bg-slate-900 text-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-10">
              <Shield className="text-primary" size={28} />
              <span className="text-lg font-black">ADMIN PANEL</span>
            </div>
            <nav className="space-y-2 mb-8">
              <AdminSidebarLink icon={<TrendingUp size={20}/>} label="Vue d'ensemble" active={activeTab === "overview"} onClick={() => switchTab("overview")} />
              <AdminSidebarLink icon={<Users size={20}/>} label="Gestion Utilisateurs" active={activeTab === "users"} onClick={() => switchTab("users")} />
              <AdminSidebarLink icon={<Check size={20}/>} label="Validation Profs" active={activeTab === "profs"} onClick={() => switchTab("profs")} />
              <AdminSidebarLink icon={<CreditCard size={20}/>} label="Retraits" />
              <AdminSidebarLink icon={<AlertCircle size={20}/>} label="Litiges" />
            </nav>
            <div className="pt-6 border-t border-white/10">
              <button className="text-white/40 hover:text-white flex items-center gap-2 font-bold" onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}>
                <LogOut size={18}/>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col shrink-0">
        {userName && (
          <div className="mb-2 text-xs font-bold text-primary/60 tracking-widest uppercase">
            {userName}
          </div>
        )}
        <div className="flex items-center gap-2 mb-12">
          <Shield className="text-primary" size={32} />
          <span className="text-xl font-black">ADMIN PANEL</span>
        </div>

        <nav className="flex-1 space-y-2">
           <AdminSidebarLink icon={<TrendingUp size={20}/>} label="Vue d'ensemble" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
           <AdminSidebarLink icon={<Users size={20}/>} label="Gestion Utilisateurs" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
           <AdminSidebarLink icon={<Check size={20}/>} label="Validation Profs" active={activeTab === "profs"} onClick={() => setActiveTab("profs")} />
           <AdminSidebarLink icon={<CreditCard size={20}/>} label="Retraits" />
           <AdminSidebarLink icon={<AlertCircle size={20}/>} label="Litiges" />
        </nav>

        <div className="pt-6 border-t border-white/10">
          <button className="text-white/40 hover:text-white flex items-center gap-2 font-bold" onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}>
            <LogOut size={18}/>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto relative">
        {/* Desktop Account Button */}
        <div className="hidden lg:block absolute top-10 right-10 z-20">
           <button
             onClick={() => setShowAccountMenu(!showAccountMenu)}
             className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-mentora-bg transition-colors"
           >
             <User size={24} className="text-secondary" />
           </button>

           {showAccountMenu && (
             <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl p-6">
                <p className="text-xs font-bold text-mentora-fg/40 uppercase mb-1">Email Connecté</p>
                <p className="text-sm font-bold text-foreground mb-6 truncate">{email}</p>
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-2">Votre Nom</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Ex: Nathan Pichele"
                          className="w-full bg-mentora-bg border border-border/50 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-secondary/20 outline-none"
                        />
                        <button onClick={handleUpdateOwnName} className="w-full py-1.5 bg-secondary/10 text-secondary rounded-lg text-[10px] font-bold hover:bg-secondary/20 transition-all">Sauvegarder le nom</button>
                      </div>
                   </div>
                   <button onClick={() => setShowAccountMenu(false)} className="w-full btn-secondary !py-2 text-xs">Fermer</button>
                </div>
             </div>
           )}
        </div>

        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Console d'administration</h1>
          <p className="text-mentora-fg/60 text-sm sm:text-base">Gérez les utilisateurs et les opérations de la plateforme MENTORA.</p>
        </header>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
               <AdminStatCard title="Total Utilisateurs" value={stats.users} color="border-secondary" />
               <AdminStatCard title="Profils à valider" value={pendingTeachers.length} color="border-primary" />
               <AdminStatCard title="Volume d'affaires" value={stats.volume} color="border-green-500" />
            </div>

            <section className="mb-10 sm:mb-12">
               <div className="bg-secondary p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-xl shadow-secondary/20">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Bienvenue dans la console</h2>
                    <p className="text-white/70 max-w-md text-sm sm:text-base">Vous avez le contrôle total sur les utilisateurs et les flux financiers de MENTORA--Education.</p>
                  </div>
                  <Shield size={48} className="text-white/20 hidden sm:block" />
               </div>
            </section>
          </>
        )}

        {activeTab === "users" && (
          <section>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Users className="text-secondary" />
                Liste des Utilisateurs
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary !py-2 !px-4 text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus size={18} />
                Ajouter
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mentora-fg/40" size={18} />
                <input 
                  type="text"
                  placeholder="Chercher par nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-border/50 rounded-2xl text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2 bg-white shadow-sm rounded-2xl px-3 py-1.5 min-w-[200px]">
                <Filter className="text-secondary" size={16} />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-mentora-fg/60 outline-none w-full cursor-pointer"
                >
                  <option value="all">Tous les utilisateurs</option>
                  <option value="admin">Les admins</option>
                  <option value="teacher">Les profs</option>
                  <option value="student">Les Etudiants</option>
                  <option value="teacher_verified">Les profs validés</option>
                  <option value="teacher_pending">Les profs en attente</option>
                  <option value="teacher_rejected">Les prof non validé/rejeté</option>
                </select>
              </div>
            </div>

            {/* Mobile: Cards / Desktop: Table */}
            <div className="hidden md:block bg-white rounded-3xl card-white overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-mentora-bg text-mentora-fg/40 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Utilisateur</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-mentora-fg/40 italic">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-mentora-bg/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary/10 flex items-center justify-center font-bold text-secondary text-xs">
                             {u.profile?.profile_picture ? (
                               <Image 
                                 src={u.profile.profile_picture.startsWith('http') ? u.profile.profile_picture : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${u.profile.profile_picture.replace(/^\//, "")}`}
                                 alt="Avatar" width={32} height={32} className="object-cover" unoptimized
                               />
                             ) : (
                               u.profile?.first_name?.[0] || u.email[0].toUpperCase()
                             )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{u.profile ? (u.role === 'admin' ? u.profile.full_name : `${u.profile.first_name} ${u.profile.last_name}`) : "Non configuré"}</p>
                            <p className="text-xs text-mentora-fg/40">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700' :
                          u.role === 'teacher' ? 'bg-primary/20 text-primary-dark' :
                          'bg-secondary/10 text-secondary'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${u.is_active === false ? 'bg-red-500' : u.is_verified ? 'bg-green-500' : 'bg-amber-500'}`} />
                          <span className="text-xs font-medium text-mentora-fg/60">
                            {u.is_active === false ? 'Rejeté' : u.is_verified ? 'Vérifié' : 'En attente'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2 text-mentora-fg/40">
                           <button onClick={() => handleEditClick(u)} className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-lg transition-colors"><Edit2 size={16}/></button>
                           <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                         </div>
                      </td>
                    </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            {/* Mobile User Cards */}
            <div className="md:hidden space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="card-white p-8 text-center text-mentora-fg/40 italic">Aucun utilisateur trouvé.</div>
              ) : filteredUsers.map((u: any) => (
                <div key={u.id} className="bg-white p-4 rounded-2xl card-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary/10 flex items-center justify-center font-bold text-secondary text-sm">
                        {u.profile?.profile_picture ? (
                          <Image 
                            src={u.profile.profile_picture.startsWith('http') ? u.profile.profile_picture : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${u.profile.profile_picture.replace(/^\//, "")}`}
                            alt="Avatar" width={40} height={40} className="object-cover" unoptimized
                          />
                        ) : (
                          u.profile?.first_name?.[0] || u.email[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{u.profile ? (u.role === 'admin' ? u.profile.full_name : `${u.profile.first_name} ${u.profile.last_name}`) : "Non configuré"}</p>
                        <p className="text-xs text-mentora-fg/40 truncate max-w-[180px]">{u.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'teacher' ? 'bg-primary/20 text-primary-dark' :
                        'bg-secondary/10 text-secondary'
                      }`}>{u.role}</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${u.is_active === false ? 'bg-red-500' : u.is_verified ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] text-mentora-fg/60">{u.is_active === false ? 'Rejeté' : u.is_verified ? 'Vérifié' : 'En attente'}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditClick(u)} className="p-2 hover:bg-secondary/10 hover:text-secondary rounded-lg transition-colors text-mentora-fg/40"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-mentora-fg/40"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
                ))
              }
            </div>
          </section>
        )}

        {activeTab === "profs" && (
          <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <Check className="text-secondary" />
                Validation des Professeurs
              </h2>

              {/* Desktop table */}
              <div className="hidden md:block bg-white rounded-3xl card-white overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-mentora-bg text-mentora-fg/40 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Professeur</th>
                      <th className="px-6 py-4">Sexe</th>
                      <th className="px-6 py-4">Spécialité</th>
                      <th className="px-6 py-4">Documents</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {pendingTeachers.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-mentora-fg/40 italic">Aucun profil en attente.</td></tr>
                    ) : (
                      pendingTeachers.map((t: any) => (
                        <tr key={t.user.id} className="hover:bg-mentora-bg/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary/10 flex items-center justify-center font-bold text-secondary text-xs">
                                 {t.profile?.profile_picture ? (
                                   <Image 
                                     src={t.profile.profile_picture.startsWith('http') ? t.profile.profile_picture : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${t.profile.profile_picture.replace(/^\//, "")}`}
                                     alt="Avatar" width={32} height={32} className="object-cover" unoptimized
                                   />
                                 ) : (
                                   <>{t.profile?.first_name?.[0] || ""}{t.profile?.last_name?.[0] || t.user.email[0].toUpperCase()}</>
                                 )}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{t.profile.first_name} {t.profile.last_name}</p>
                                <p className="text-xs text-mentora-fg/40">{t.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-mentora-fg/60">{t.profile.gender || '-'}</td>
                          <td className="px-6 py-4 text-sm text-mentora-fg/60">{t.profile.grade_or_position}</td>
                          <td className="px-6 py-4">
                             <div className="flex gap-2">
                                {t.profile.id_document && <a href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${t.profile.id_document.replace(/^\//, "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-secondary/5 rounded-lg text-secondary hover:bg-secondary/10" title="Voir CNI"><FileText size={16}/></a>}
                                {t.profile.credentials_document && <a href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${t.profile.credentials_document.replace(/^\//, "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-green-50 rounded-lg text-green-600 hover:bg-green-100" title="Voir Diplôme"><FileText size={16}/></a>}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 text-white">
                               <button onClick={() => handleVerify(t.user.id)} className="bg-green-500 p-2 rounded-lg hover:bg-green-600" title="Approuver"><Check size={16}/></button>
                               <button onClick={() => handleReject(t.user.id)} className="bg-red-500 p-2 rounded-lg hover:bg-red-600" title="Rejeter"><X size={16}/></button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {pendingTeachers.length === 0 ? (
                  <div className="card-white p-8 text-center text-mentora-fg/40 italic">Aucun profil en attente.</div>
                ) : pendingTeachers.map((t: any) => (
                  <div key={t.user.id} className="bg-white p-4 rounded-2xl card-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary/10 flex items-center justify-center font-bold text-secondary text-sm">
                          {t.profile.profile_picture ? (
                            <Image 
                              src={t.profile.profile_picture.startsWith('http') ? t.profile.profile_picture : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${t.profile.profile_picture.replace(/^\//, "")}`}
                              alt="Avatar" width={40} height={40} className="object-cover" unoptimized
                            />
                          ) : (
                            <>{t.profile.first_name[0]}{t.profile.last_name[0]}</>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t.profile.first_name} {t.profile.last_name}</p>
                          <p className="text-xs text-mentora-fg/40">{t.user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3 text-xs">
                        <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-lg font-bold">{t.profile.gender || '-'}</span>
                        <span className="bg-mentora-bg text-mentora-fg/60 px-2 py-1 rounded-lg">{t.profile.grade_or_position}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {t.profile.id_document && <a href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${t.profile.id_document.replace(/^\//, "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-secondary/5 rounded-lg text-secondary"><FileText size={16}/></a>}
                          {t.profile.credentials_document && <a href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${t.profile.credentials_document.replace(/^\//, "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-green-50 rounded-lg text-green-600"><FileText size={16}/></a>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleVerify(t.user.id)} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"><Check size={16}/></button>
                          <button onClick={() => handleReject(t.user.id)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"><X size={16}/></button>
                        </div>
                      </div>
                    </div>
                ))
                }
              </div>
          </section>
        )}
      </main>

      {/* ============ ADD USER MODAL (3 phases: rôle → connexion → profil) ============ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header + stepper */}
            <div className="px-8 pt-8 pb-4 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">Ajouter un utilisateur</h3>
                <button onClick={resetAddModal} className="p-2 rounded-xl hover:bg-mentora-bg"><X size={20} /></button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                {["Rôle", "Connexion", "Profil"].map((label, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`h-1.5 w-full rounded-full transition-colors ${modalStep > i ? 'bg-secondary' : 'bg-border'}`} />
                    <span className={`text-[10px] font-bold ${modalStep === i + 1 ? 'text-secondary' : 'text-mentora-fg/40'}`}>{i + 1}. {label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 pb-8 overflow-y-auto">
              {/* STEP 1: Choix du rôle */}
              {modalStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-mentora-fg/60 mb-4">Quel type de compte souhaitez-vous créer ?</p>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: "student", label: "🎓 Étudiant", desc: "Accède aux questions et aux profs" },
                      { value: "teacher", label: "📚 Professeur", desc: "Répond aux questions, en attente de validation" },
                      { value: "admin", label: "🔑 Administrateur", desc: "Accès complet au panneau d'admin" },
                    ].map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => { setAddCredentials({...addCredentials, role: opt.value}); setModalStep(2); }}
                        className="flex items-start gap-4 p-4 bg-mentora-bg rounded-2xl hover:bg-secondary/10 hover:border-secondary border-2 border-transparent transition-all text-left group">
                        <span className="text-2xl">{opt.label.split(' ')[0]}</span>
                        <div>
                          <p className="font-bold text-foreground">{opt.label.replace(/^\S+\s/, '')}</p>
                          <p className="text-xs text-mentora-fg/40 mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={resetAddModal} className="w-full py-3 font-bold text-mentora-fg/40 hover:text-foreground transition-colors">Annuler</button>
                </div>
              )}

              {/* STEP 2: Connexion */}
              {modalStep === 2 && (
                <form onSubmit={handleAddStep1} className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-xl text-xs font-bold mb-2">
                    {addCredentials.role === 'student' ? '🎓 Étudiant' : addCredentials.role === 'teacher' ? '📚 Professeur' : '🔑 Admin'}
                  </div>
                  
                  {addCredentials.role === 'admin' && (
                    <div>
                      <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">Nom complet *</label>
                      <input type="text" required className="w-full bg-mentora-bg border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                        value={adminFullName} onChange={e => setAdminFullName(e.target.value)} placeholder="Ex: Nathan Pichele" />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">Email *</label>
                    <input type="email" required className="w-full bg-mentora-bg border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 transition-all"
                      value={addCredentials.email} onChange={e => setAddCredentials({...addCredentials, email: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">Mot de passe *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required minLength={6} 
                        className="w-full bg-mentora-bg border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 transition-all pr-12"
                        value={addCredentials.password} onChange={e => setAddCredentials({...addCredentials, password: e.target.value})} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-mentora-fg/40 hover:text-secondary transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalStep(1)} className="flex-1 py-3 font-bold text-mentora-fg/40 hover:text-foreground transition-colors">← Retour</button>
                    <button type="submit" className="flex-1 btn-primary">
                      {addCredentials.role === 'admin' ? "Enregistrer" : "Suivant →"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Profil (adapté au rôle) */}
              {modalStep === 3 && (
                <form onSubmit={handleAddStep2} className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-xl text-xs font-bold mb-1">
                    {addCredentials.role === 'student' ? '🎓 Profil Étudiant' : addCredentials.role === 'teacher' ? '📚 Profil Professeur' : '🔑 Profil Admin'}
                  </div>
                  {addCredentials.role === 'student' ? (
                    <StudentProfileFields form={profileForm} onChange={setProfileForm} />
                  ) : addCredentials.role === 'teacher' ? (
                    <TeacherProfileFields form={profileForm} onChange={setProfileForm} />
                  ) : (
                    <AdminProfileFields adminFullName={adminFullName} setAdminFullName={setAdminFullName} />
                  )}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalStep(2)} className="flex-1 py-3 font-bold text-mentora-fg/40 hover:text-foreground transition-colors">← Retour</button>
                    <button type="submit" className="flex-1 btn-primary">Enregistrer</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ EDIT USER MODAL (2 phases: connexion → profil adapté) ============ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-8 pt-8 pb-4 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">Modifier l'utilisateur</h3>
                <button onClick={() => { setIsEditModalOpen(false); setModalStep(1); }} className="p-2 rounded-xl hover:bg-mentora-bg"><X size={20} /></button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                {["Connexion", "Profil"].map((label, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`h-1.5 w-full rounded-full transition-colors ${modalStep > i ? 'bg-secondary' : 'bg-border'}`} />
                    <span className={`text-[10px] font-bold ${modalStep === i + 1 ? 'text-secondary' : 'text-mentora-fg/40'}`}>{i + 1}. {label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 pb-8 overflow-y-auto">
              {modalStep === 1 ? (
                <form onSubmit={handleUpdateStep1} className="space-y-4">
                  {editCredentials.role === 'admin' && (
                    <div>
                      <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">Nom complet *</label>
                      <input type="text" required className="w-full bg-mentora-bg border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                        value={adminFullName} onChange={e => setAdminFullName(e.target.value)} />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">Email *</label>
                    <input type="email" required className="w-full bg-mentora-bg border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                      value={editCredentials.email} onChange={e => setEditCredentials({...editCredentials, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">Rôle *</label>
                    <select className="w-full bg-mentora-bg border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                      value={editCredentials.role} onChange={e => setEditCredentials({...editCredentials, role: e.target.value})}>
                      <option value="student">Étudiant</option>
                      <option value="teacher">Professeur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 py-3 px-4 bg-mentora-bg rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setEditCredentials({...editCredentials, is_verified: !editCredentials.is_verified})}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${editCredentials.is_verified ? 'bg-secondary border-secondary' : 'border-mentora-fg/20'}`}>
                      {editCredentials.is_verified && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm font-bold">Compte vérifié</span>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setIsEditModalOpen(false); setModalStep(1); }} className="flex-1 py-3 font-bold text-mentora-fg/40 hover:text-foreground transition-colors">Annuler</button>
                    <button type="submit" className="flex-1 btn-primary">
                      {editCredentials.role === 'admin' ? "Enregistrer" : "Suivant →"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleUpdateStep2} className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-xl text-xs font-bold mb-1">
                    {editCredentials.role === 'student' ? '🎓 Profil Étudiant' : editCredentials.role === 'teacher' ? '📚 Profil Professeur' : '🔑 Profil Admin'}
                  </div>
                  {editCredentials.role === 'student' ? (
                    <StudentProfileFields form={profileForm} onChange={setProfileForm} />
                  ) : editCredentials.role === 'teacher' ? (
                    <TeacherProfileFields form={profileForm} onChange={setProfileForm} />
                  ) : (
                    <AdminProfileFields adminFullName={adminFullName} setAdminFullName={setAdminFullName} />
                  )}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalStep(1)} className="flex-1 py-3 font-bold text-mentora-fg/40 hover:text-foreground transition-colors">← Retour</button>
                    <button type="submit" className="flex-1 btn-primary">Enregistrer</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Shared field helpers ─── */

function FieldInput({ label, value, onChange, type = "text", placeholder = "" }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">{label}</label>
      <input type={type} placeholder={placeholder}
        className="w-full bg-mentora-bg border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 transition-all"
        value={value} onChange={onChange} />
    </div>
  );
}

function AdminProfileFields({ adminFullName, setAdminFullName }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">Nom complet *</label>
      <input type="text" required className="w-full bg-mentora-bg border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
        value={adminFullName} onChange={e => setAdminFullName(e.target.value)} placeholder="Ex: Nathan Pichele" />
    </div>
  );
}

function GenderField({ value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">Genre</label>
      <div className="flex gap-2">
        {[{v:"Homme", l:"Homme"},{v:"Femme", l:"Femme"}].map(g => (
          <button key={g.v} type="button" onClick={() => onChange(g.v)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${value === g.v ? 'bg-secondary text-white border-secondary' : 'border-border/30 text-mentora-fg/50 hover:border-secondary/30'}`}>
            {g.l}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Common base fields (identity) ─── */
function CommonProfileFields({ form, onChange }: any) {
  const set = (k: string) => (e: any) => onChange({...form, [k]: e.target.value});
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Prénom" value={form.first_name} onChange={set('first_name')} />
        <FieldInput label="Nom" value={form.last_name} onChange={set('last_name')} />
      </div>
      <GenderField value={form.gender} onChange={(v: string) => onChange({...form, gender: v})} />
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Téléphone" value={form.phone} onChange={set('phone')} type="tel" />
        <FieldInput label="Pays" value={form.country} onChange={set('country')} />
      </div>
      <FieldInput label="Adresse" value={form.address} onChange={set('address')} />
    </>
  );
}

/* ─── STUDENT profile fields ─── */
function StudentProfileFields({ form, onChange }: any) {
  const set = (k: string) => (e: any) => onChange({...form, [k]: e.target.value});
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Prénom" value={form.first_name} onChange={set('first_name')} />
        <FieldInput label="Nom" value={form.last_name} onChange={set('last_name')} />
      </div>
      <GenderField value={form.gender} onChange={(v: string) => onChange({...form, gender: v})} />
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Téléphone" value={form.phone} onChange={set('phone')} type="tel" />
        <FieldInput label="Pays" value={form.country} onChange={set('country')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Date de naissance" value={form.birth_date} onChange={set('birth_date')} type="date" />
        <FieldInput label="Lieu de naissance" value={form.birth_place} onChange={set('birth_place')} />
      </div>
      <FieldInput label="Adresse" value={form.address} onChange={set('address')} />
      <FieldInput label="Établissement fréquenté" value={form.institution} onChange={set('institution')} placeholder="Lycée, Université..." />
      <FieldInput label="Classe / Filière" value={form.grade_or_position} onChange={set('grade_or_position')} placeholder="Terminale C, Licence 2 Info..." />
      <div>
        <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">À propos</label>
        <textarea rows={3} placeholder="Centres d'intérêt, objectifs..."
          className="w-full bg-mentora-bg border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 transition-all resize-none"
          value={form.bio} onChange={(e: any) => onChange({...form, bio: e.target.value})} />
      </div>
    </>
  );
}

/* ─── TEACHER profile fields ─── */
function TeacherProfileFields({ form, onChange }: any) {
  const set = (k: string) => (e: any) => onChange({...form, [k]: e.target.value});
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Prénom" value={form.first_name} onChange={set('first_name')} />
        <FieldInput label="Nom" value={form.last_name} onChange={set('last_name')} />
      </div>
      <GenderField value={form.gender} onChange={(v: string) => onChange({...form, gender: v})} />
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Téléphone" value={form.phone} onChange={set('phone')} type="tel" />
        <FieldInput label="Pays" value={form.country} onChange={set('country')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Date de naissance" value={form.birth_date} onChange={set('birth_date')} type="date" />
        <FieldInput label="Lieu de naissance" value={form.birth_place} onChange={set('birth_place')} />
      </div>
      <FieldInput label="Adresse" value={form.address} onChange={set('address')} />
      <FieldInput label="Établissement d'enseignement" value={form.institution} onChange={set('institution')} placeholder="Université de Yaoundé I..." />
      <FieldInput label="Spécialité / Matière principale" value={form.grade_or_position} onChange={set('grade_or_position')} placeholder="Mathématiques, Physique-Chimie..." />
      <FieldInput label="Autres spécialités" value={form.specialties} onChange={set('specialties')} placeholder="Séparées par des virgules..." />
      <div>
        <label className="block text-xs font-bold text-mentora-fg/40 uppercase mb-1">Présentation / Bio</label>
        <textarea rows={3} placeholder="Expériences, méthodes pédagogiques..."
          className="w-full bg-mentora-bg border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 transition-all resize-none"
          value={form.bio} onChange={(e: any) => onChange({...form, bio: e.target.value})} />
      </div>
    </>
  );
}

function AdminSidebarLink({ icon, label, active = false, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold cursor-pointer transition-all ${
        active ? 'bg-primary text-slate-900 shadow-lg' : 'text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function AdminStatCard({ title, value, color }: any) {
  return (
    <div className={`bg-white p-4 sm:p-6 rounded-2xl border-l-4 ${color} shadow-sm`}>
       <p className="text-xs font-bold text-mentora-fg/40 uppercase tracking-wider mb-1 sm:mb-2">{title}</p>
       <p className="text-2xl sm:text-3xl font-black text-foreground">{value}</p>
    </div>
  );
}
