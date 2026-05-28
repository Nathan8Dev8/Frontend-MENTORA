"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, MapPin, BookOpen, GraduationCap, MessageSquare, ArrowLeft, Star, ChevronRight } from "lucide-react";
import api from "@/lib/api";

export default function StudentMentorsPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("mentora_token");
    const role = localStorage.getItem("mentora_role")?.toLowerCase();
    if (!token || role !== "student") { router.push("/login"); return; }
    fetchTeachers();
  }, [router]);

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teachers/list");
      setTeachers(res.data);
    } catch (err) { console.error(err); }
  };

  const filteredTeachers = teachers.filter((t: any) => {
    const name = (t.profile?.full_name || t.email).toLowerCase();
    const specialty = (t.profile?.grade_or_position || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || specialty.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
      <button onClick={() => router.push("/dashboard/student")} className="flex items-center gap-2 text-sm text-mentora-fg/60 hover:text-secondary mb-6 font-bold">
        <ArrowLeft size={16} /> Retour au tableau de bord
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Trouver un Mentor</h1>
      <p className="text-mentora-fg/60 mb-8">Parcourez notre selection de professeurs qualifies.</p>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mentora-fg/40" size={20} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-border/50 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-secondary/20 outline-none shadow-sm"
          placeholder="Chercher par nom ou specialite..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-mentora-fg/40 italic">
            Aucun professeur trouve.
          </div>
        ) : filteredTeachers.map((t: any) => (
          <div key={t.id} className="bg-white rounded-3xl card-white p-6 hover:shadow-xl transition-all group">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-secondary/10 mb-4 bg-mentora-bg flex items-center justify-center">
                {t.profile?.profile_picture ? (
                  <Image src={t.profile.profile_picture} alt="" width={80} height={80} className="object-cover" unoptimized />
                ) : (
                  <span className="text-2xl font-bold text-secondary">{t.profile?.full_name?.[0] || "?"}</span>
                )}
              </div>
              <h3 className="font-bold text-lg text-foreground">{t.profile?.full_name || "Professeur"}</h3>
              <div className="flex items-center gap-1 mt-1">
                <GraduationCap size={14} className="text-secondary" />
                <span className="text-sm text-mentora-fg/60">{t.profile?.grade_or_position || "Specialiste"}</span>
              </div>
            </div>

            <div className="space-y-2 mb-5 text-sm">
              {t.profile?.institution && (
                <div className="flex items-center gap-2 text-mentora-fg/60">
                  <MapPin size={14} />
                  <span>{t.profile.institution}</span>
                </div>
              )}
              {t.profile?.specialties && (
                <div className="flex items-center gap-2 text-mentora-fg/60">
                  <BookOpen size={14} />
                  <span>{t.profile.specialties}</span>
                </div>
              )}
              {t.profile?.bio && (
                <p className="text-mentora-fg/50 text-xs italic mt-3 line-clamp-2">{t.profile.bio}</p>
              )}
            </div>

            <button onClick={() => router.push("/dashboard/student/questions")}
              className="w-full btn-secondary flex items-center justify-center gap-2 py-3">
              <MessageSquare size={16} /> Poser une question
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
