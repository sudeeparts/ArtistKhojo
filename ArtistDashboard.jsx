import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { CATEGORIES, CITIES } from "../constants/categories";
import { Navigate, Link } from "react-router-dom";
import { BlueTick } from "../components/BlueTick";
import { UploadCloud, Instagram, Share2, CheckCircle2 } from "lucide-react";

const fileToBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file);
});

const ArtistDashboard = () => {
  const { user, profile, refresh } = useAuth();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    name: "", bio: "", category: "", city: "", instagram_followers: 0, instagram_link: "",
    whatsapp: "", email: "", hourly_rate: 0, portfolio: [], aadhaar_file: "", intro_video: "",
  });
  const [reqs, setReqs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name || "",
      bio: profile.bio || "",
      category: profile.category || "",
      city: profile.city || "",
      instagram_followers: profile.instagram_followers || 0,
      instagram_link: profile.instagram_link || "",
      whatsapp: profile.whatsapp || "",
      email: profile.email || "",
      hourly_rate: profile.hourly_rate || 0,
      portfolio: profile.portfolio || [],
      aadhaar_file: profile.aadhaar_file || "",
      intro_video: profile.intro_video || "",
    });
  }, [profile]);

  useEffect(() => {
    if (user?.role === "artist") {
      api.get("/requirements").then(r => setReqs(r.data));
      api.get("/bookings/mine").then(r => setBookings(r.data));
    }
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "artist") return <Navigate to="/" />;

  const onPortfolio = async (files, index) => {
    const arr = [...form.portfolio];
    for (let i = 0; i < files.length && arr.length < 4; i++) {
      const f = files[i];
      const type = f.type.startsWith("video") ? "video" : "image";
      const data = await fileToBase64(f);
      if (index !== undefined) arr[index] = { type, data };
      else arr.push({ type, data });
    }
    setForm((f) => ({ ...f, portfolio: arr.slice(0, 4) }));
  };

  const removePortfolio = (i) => {
    const arr = form.portfolio.filter((_, idx) => idx !== i);
    setForm((f) => ({ ...f, portfolio: arr }));
  };

  const onAadhaar = async (file) => {
    const data = await fileToBase64(file);
    setForm((f) => ({ ...f, aadhaar_file: data }));
  };

  const onIntro = async (file) => {
    const data = await fileToBase64(file);
    setForm((f) => ({ ...f, intro_video: data }));
  };

  const save = async () => {
    if (!form.name || !form.category || !form.city) return toast.error("Name, category & city required");
    setSaving(true);
    try {
      await api.post("/artists", form);
      toast.success("Profile saved");
      await refresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    }
    setSaving(false);
  };

  const shareProfile = async () => {
    if (!profile?.id) return toast.error("Save your profile first");
    const url = `${window.location.origin}/artist/${profile.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `${form.name} on ArtistKhojo`, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
    } catch {}
  };

  const setStatus = async (id, status) => {
    await api.patch(`/bookings/${id}/status?status=${status}`);
    toast.success(`Marked ${status}`);
    const r = await api.get("/bookings/mine"); setBookings(r.data);
  };

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "verification", label: "Verification" },
    { key: "requirements", label: "Customer Requirements" },
    { key: "bookings", label: "Bookings" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="artist-dashboard">
      <Header />
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Artist Studio</h1>
            <p className="text-zinc-600 mt-2 flex items-center gap-2">
              {profile?.verified ? (<><BlueTick size={16}/> Your profile is verified</>) : profile?.verification_submitted ? "Verification submitted — awaiting admin review" : "Complete your profile & submit verification to earn the blue tick."}
            </p>
          </div>
          {profile?.id && (
            <Button data-testid="artist-share-btn" onClick={shareProfile} variant="outline" className="rounded-full">
              <Share2 size={14} className="mr-2" /> Share my profile
            </Button>
          )}
        </div>

        <div className="mt-8 flex gap-2 flex-wrap border-b border-zinc-200">
          {tabs.map((t) => (
            <button key={t.key} data-testid={`atab-${t.key}`} onClick={() => setTab(t.key)} className={`px-5 py-3 text-sm -mb-px border-b-2 ${tab === t.key ? "border-zinc-900 text-zinc-900 font-medium" : "border-transparent text-zinc-500"}`}>{t.label}</button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "profile" && (
            <div className="space-y-8">
              {/* Basic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                <Field label="Stage name *"><Input data-testid="artist-name" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} className="rounded-xl" /></Field>
                <Field label="Category *">
                  <select data-testid="artist-category" value={form.category} onChange={(e)=>setForm(f=>({...f,category:e.target.value}))} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm">
                    <option value="">Select</option>
                    {CATEGORIES.map(c=> <option key={c.key}>{c.key}</option>)}
                  </select>
                </Field>
                <Field label="City *">
                  <select data-testid="artist-city" value={form.city} onChange={(e)=>setForm(f=>({...f,city:e.target.value}))} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm">
                    <option value="">Select</option>
                    {CITIES.map(c=> <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Hourly rate (₹)"><Input data-testid="artist-rate" type="number" value={form.hourly_rate} onChange={(e)=>setForm(f=>({...f,hourly_rate:Number(e.target.value)}))} className="rounded-xl" /></Field>
                <div className="md:col-span-2"><Field label="Bio"><Textarea data-testid="artist-bio" value={form.bio} onChange={(e)=>setForm(f=>({...f,bio:e.target.value}))} className="rounded-xl" rows={4} /></Field></div>
                <Field label="Instagram followers"><Input data-testid="artist-followers" type="number" value={form.instagram_followers} onChange={(e)=>setForm(f=>({...f,instagram_followers:Number(e.target.value)}))} className="rounded-xl" /></Field>
                <Field label="Instagram link"><Input data-testid="artist-iglink" value={form.instagram_link} onChange={(e)=>setForm(f=>({...f,instagram_link:e.target.value}))} placeholder="https://instagram.com/@you" className="rounded-xl" /></Field>
                <Field label="WhatsApp (private)"><Input data-testid="artist-wa" value={form.whatsapp} onChange={(e)=>setForm(f=>({...f,whatsapp:e.target.value}))} className="rounded-xl" /></Field>
                <Field label="Email (private)"><Input data-testid="artist-email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} className="rounded-xl" /></Field>
              </div>
              <div className="text-xs text-zinc-500">🔒 WhatsApp, email and phone are never shown on your public profile.</div>

              {/* Portfolio 4 slots */}
              <div>
                <h3 className="font-display text-xl">Portfolio — exactly 4 items</h3>
                <p className="text-sm text-zinc-500">Upload images or short videos. The 4-grid shows on your card & profile.</p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
                  {[0,1,2,3].map((i)=> {
                    const item = form.portfolio[i];
                    return (
                      <div key={i} className="aspect-square relative rounded-2xl bg-zinc-100 border border-dashed border-zinc-300 overflow-hidden" data-testid={`portfolio-upload-${i}`}>
                        {item ? (
                          <>
                            {item.type === "video" ? <video src={item.data} className="w-full h-full object-cover" controls /> : <img src={item.data} alt="" className="w-full h-full object-cover" />}
                            <button data-testid={`portfolio-remove-${i}`} onClick={()=>removePortfolio(i)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs">✕</button>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-zinc-500 text-xs">
                            <UploadCloud size={20} />
                            <span className="mt-2">Slot {i+1}</span>
                            <input type="file" accept="image/*,video/*" className="hidden" onChange={(e)=>onPortfolio(Array.from(e.target.files))} />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button data-testid="artist-save-btn" onClick={save} disabled={saving} className="rounded-full bg-gradient-to-r from-[#9D4CDD] via-[#3B82F6] to-[#EC4899]">
                {saving ? "Saving..." : "Save profile"}
              </Button>
            </div>
          )}

          {tab === "verification" && (
            <div className="max-w-xl space-y-5">
              <div className="p-5 rounded-2xl bg-white border border-zinc-200">
                <h3 className="font-display text-xl flex items-center gap-2">
                  {profile?.verified ? <><BlueTick size={18} /> Verified</> : "Verification pending"}
                </h3>
                <p className="text-sm text-zinc-600 mt-2">Upload your Aadhaar and a 10-20s intro video. Admin will review and award the blue tick.</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500">Aadhaar (PDF / Image)</label>
                <input data-testid="verif-aadhaar" type="file" accept="image/*,application/pdf" onChange={(e)=>onAadhaar(e.target.files[0])} className="mt-2 text-sm block" />
                {form.aadhaar_file && <span className="text-xs text-emerald-600 inline-flex items-center gap-1 mt-2"><CheckCircle2 size={12}/> Aadhaar uploaded</span>}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500">Intro video (10-20s)</label>
                <input data-testid="verif-video" type="file" accept="video/*" onChange={(e)=>onIntro(e.target.files[0])} className="mt-2 text-sm block" />
                {form.intro_video && <span className="text-xs text-emerald-600 inline-flex items-center gap-1 mt-2"><CheckCircle2 size={12}/> Intro video uploaded</span>}
              </div>
              <Button data-testid="verif-submit" onClick={save} className="rounded-full bg-zinc-900 hover:bg-zinc-800">Submit for review</Button>
              {form.instagram_link && (
                <div className="mt-3 text-xs text-zinc-500 inline-flex items-center gap-1"><Instagram size={12}/> IG linked: {form.instagram_link}</div>
              )}
            </div>
          )}

          {tab === "requirements" && (
            <div className="space-y-3">
              {reqs.length === 0 && <div className="text-sm text-zinc-500">No open requirements in your category yet.</div>}
              {reqs.map(r => (
                <div key={r.id} className="p-5 rounded-2xl bg-white border border-zinc-200" data-testid={`req-card-${r.id}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100">{r.category}</span>
                    <span className="text-xs text-zinc-500">by {r.customer_name}</span>
                    <span className="ml-auto font-medium">₹{r.budget}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-700">{r.description}</p>
                  <div className="mt-2 text-xs text-zinc-500">{r.date} · {r.location}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "bookings" && (
            <div className="space-y-3">
              {bookings.length === 0 && <div className="text-sm text-zinc-500">No bookings yet.</div>}
              {bookings.map(b => (
                <div key={b.id} className="p-5 rounded-2xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" data-testid={`art-booking-${b.id}`}>
                  <div>
                    <div className="font-medium">{b.customer_name}</div>
                    <div className="text-xs text-zinc-500">{b.date} · ₹{b.amount} · <span className="px-2 py-0.5 rounded-full bg-zinc-100">{b.status}</span></div>
                    {b.notes && <div className="mt-1 text-sm text-zinc-700">{b.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    {b.status === "confirmed" && <Button data-testid={`complete-${b.id}`} size="sm" onClick={()=>setStatus(b.id,"completed")} className="rounded-full bg-zinc-900">Mark completed</Button>}
                    {b.status === "pending_payment" && <span className="text-xs text-amber-600">Awaiting payment</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="text-xs uppercase tracking-widest text-zinc-500">{label}</label>
    <div className="mt-2">{children}</div>
  </div>
);

export default ArtistDashboard;
