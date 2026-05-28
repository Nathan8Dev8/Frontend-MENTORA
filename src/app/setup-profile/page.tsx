"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Phone, MapPin, School, BookOpen, Upload, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import BackButton from "@/components/BackButton";

export default function SetupProfilePage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    phone: "",
    birth_date: "",
    birth_place: "",
    country: "Cameroun",
    address: "",
    institution: "",
    grade_or_position: "",
    bio: "",
    specialties: ""
  });

  useEffect(() => {
    const savedRole = localStorage.getItem("mentora_role");
    if (savedRole) setRole(savedRole);
    else router.push("/login"); // Safety

    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me");
        if (res.data.id) {
          setFormData({
            first_name: res.data.first_name || "",
            last_name: res.data.last_name || "",
            gender: res.data.gender || "",
            phone: res.data.phone || "",
            birth_date: res.data.birth_date || "",
            birth_place: res.data.birth_place || "",
            country: res.data.country || "Cameroun",
            address: res.data.address || "",
            institution: res.data.institution || "",
            grade_or_position: res.data.grade_or_position || "",
            bio: res.data.bio || "",
            specialties: res.data.specialties || ""
          });
          if (res.data.profile_picture) setAvatarPreview(res.data.profile_picture);
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, [router]);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await api.post("/profile/upload-avatar", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAvatarPreview(res.data.path);
    } catch (err) {
      alert("Erreur lors du téléchargement de l'avatar");
    }
  };

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/profile/update", formData);
      if (role === "student") {
        router.push("/dashboard");
      } else {
        setStep(2); // Go to document upload for teachers
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: any, type: string) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", type);

    try {
      await api.post("/profile/upload-document", formData, {
        params: { doc_type: type },
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(`Document ${type === 'id' ? 'ID' : 'Professionnel'} téléchargé avec succès`);
    } catch (err) {
      alert("Erreur lors du téléchargement du document");
    }
  };

  return (
    <div className="min-h-screen bg-mentora-bg py-8 sm:py-12 px-4 sm:px-6">
      <BackButton label="Se déconnecter" href="/login" />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-3 sm:mb-4">Complétez votre Profil</h1>
          <p className="text-mentora-fg/60 text-sm sm:text-base">Ces informations nous aident à personnaliser votre expérience sur Mentora.</p>
          
          {/* Step Indicator */}
          {role === "teacher" && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-secondary text-white' : 'bg-border text-mentora-fg/40'}`}>1</div>
              <div className="w-12 h-0.5 bg-border"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-secondary text-white' : 'bg-border text-mentora-fg/40'}`}>2</div>
            </div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-5 sm:p-8 md:p-12 shadow-2xl shadow-secondary/5"
        >
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-mentora-bg flex items-center justify-center">
                    {avatarPreview ? (
                      <Image src={avatarPreview.startsWith('data:') ? avatarPreview : (avatarPreview.startsWith('http') ? avatarPreview : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "")}/${avatarPreview.replace(/^\//, "")}`)} alt="Avatar" width={128} height={128} className="object-cover" unoptimized />
                    ) : (
                      <User size={64} className="text-secondary/20" />
                    )}
                  </div>
                  <input type="file" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Upload className="text-white" size={24} />
                  </div>
                </div>
                <p className="text-xs font-bold text-mentora-fg/40 mt-4 uppercase tracking-widest">Photo de profil</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="Prénom" name="first_name" value={formData.first_name} onChange={handleInputChange} icon={<User size={18}/>} />
                <InputGroup label="Nom" name="last_name" value={formData.last_name} onChange={handleInputChange} icon={<User size={18}/>} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-3 text-foreground/80">Sexe</label>
                  <div className="flex gap-4">
                    {['Homme', 'Femme'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                          formData.gender === g 
                          ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20' 
                          : 'bg-white text-mentora-fg/60 border-border/50 hover:border-secondary/30'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <InputGroup label="Pays" name="country" value={formData.country} onChange={handleInputChange} icon={<MapPin size={18}/>} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="Téléphone" name="phone" value={formData.phone} onChange={handleInputChange} icon={<Phone size={18}/>} type="tel" />
                <InputGroup label="Adresse" name="address" value={formData.address} onChange={handleInputChange} icon={<MapPin size={18}/>} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="Date de naissance" name="birth_date" value={formData.birth_date} onChange={handleInputChange} icon={<User size={18}/>} type="date" />
                <InputGroup label="Lieu de naissance" name="birth_place" value={formData.birth_place} onChange={handleInputChange} icon={<MapPin size={18}/>} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup 
                  label={role === 'student' ? 'Établissement fréquenté' : "Établissement d'enseignement"} 
                  name="institution" value={formData.institution} onChange={handleInputChange} icon={<School size={18}/>} 
                  placeholder={role === 'student' ? 'Lycée, Université...' : 'Université de Yaoundé I...'}
                />
                <InputGroup 
                  label={role === 'student' ? 'Classe / Filière' : 'Spécialité / Matière principale'} 
                  name="grade_or_position" value={formData.grade_or_position} onChange={handleInputChange} icon={<BookOpen size={18}/>} 
                  placeholder={role === 'student' ? 'Terminale C, Licence 2 Info...' : 'Mathématiques, Physique-Chimie...'}
                />
              </div>

              {role === 'teacher' && (
                <InputGroup 
                  label="Autres spécialités" 
                  name="specialties" value={formData.specialties} onChange={handleInputChange} icon={<BookOpen size={18}/>} 
                  placeholder="Séparées par des virgules..."
                />
              )}

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80">
                  {role === 'student' ? 'À propos de vous' : 'Présentation / Bio'}
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-white border border-border/50 rounded-xl p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                  placeholder={role === 'student' ? "Décrivez vos intérêts, vos objectifs..." : "Expériences, méthodes pédagogiques..."}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-secondary text-lg font-bold py-4 disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : (role === "teacher" ? "Continuer vers les documents" : "Terminer mon profil")}
              </button>
            </form>
          ) : (
            <div className="space-y-12 py-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Vérification Professionnelle</h2>
                <p className="text-mentora-fg/60">Veuillez télécharger vos documents pour que l'administrateur puisse valider votre compte.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <UploadBox 
                  label="CNI, Passeport ou Permis" 
                  onUpload={(e) => handleFileUpload(e, 'id')}
                  icon={<Upload size={32} className="text-secondary" />}
                />
                <UploadBox 
                  label="Diplôme ou Habilitation" 
                  onUpload={(e) => handleFileUpload(e, 'credentials')}
                  icon={<Upload size={32} className="text-secondary" />}
                />
              </div>

              <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/20 flex gap-4">
                <CheckCircle className="text-secondary shrink-0" size={24} />
                <p className="text-sm text-secondary/80 leading-relaxed">
                  <strong>Note importante :</strong> Vos documents seront vérifiés manuellement par notre équipe sous 24h à 48h. Vous recevrez une notification par email dès que votre compte sera prêt à répondre aux questions.
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full btn-secondary text-lg font-bold py-4"
              >
                J'ai terminé, accéder au tableau de bord
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, icon, type = "text", placeholder = "" }: any) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2 text-foreground/80">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mentora-fg/40">{icon}</div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-white border border-border/50 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
        />
      </div>
    </div>
  );
}

function UploadBox({ label, onUpload, icon }: any) {
  return (
    <div className="relative border-2 border-dashed border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white transition-colors group cursor-pointer">
      <input 
        type="file" 
        onChange={onUpload} 
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="font-bold text-foreground/80 text-sm mb-1">{label}</p>
      <p className="text-xs text-mentora-fg/40">PNG, JPG ou PDF (Max 10MB)</p>
    </div>
  );
}
