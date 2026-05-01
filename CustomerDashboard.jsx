import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { CATEGORIES, CITIES } from "../constants/categories";
import { Wallet, PlusCircle, FileText, Calendar, Star } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

const fileToBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file);
});

const CustomerDashboard = () => {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState("profile");
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [requirements, setRequirements] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [city, setCity] = useState(user?.city || "");
  const [email, setEmail] = useState(user?.email || "");

  // Requirement form
  const [reqForm, setReqForm] = useState({ category: "", description: "", budget: "", date: "", location: "", reference_images: [] });
  const [topup, setTopup] = useState(500);

  const reload = async () => {
    const [w, r, b] = await Promise.all([api.get("/wallet"), api.get("/requirements"), api.get("/bookings/mine")]);
    setWallet(w.data); setRequirements(r.data); setBookings(b.data);
  };

  useEffect(() => { if (user?.role === "customer") reload(); }, [user]);
  useEffect(() => { setName(user?.name || ""); setCity(user?.city || ""); setEmail(user?.email || ""); }, [user]);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "customer") return <Navigate to={user.role === "artist" ? "/artist-dashboard" : "/"} />;

  const saveProfile = async () => {
    await api.put("/users/me", { name, city, email });
    await refresh();
    toast.success("Profile updated");
  };

  const addMoney = async () => {
    const amt = Number(topup); if (!amt || amt <= 0) return toast.error("Invalid amount");
    await api.post("/wallet/add", { amount: amt, razorpay_payment_id: `mock_pay_${Date.now()}` });
    toast.success(`₹${amt} added via Razorpay (mock)`);
    await reload(); await refresh();
  };

  const postReq = async () => {
    if (!reqForm.category || !reqForm.description || !reqForm.budget) return toast.error("Fill category, description & budget");
    await api.post("/requirements", { ...reqForm, budget: Number(reqForm.budget) });
    toast.success("Requirement posted");
    setReqForm({ category: "", description: "", budget: "", date: "", location: "", reference_images: [] });
    await reload();
  };

  const uploadRefs = async (files) => {
    const arr = [];
    for (const f of files) arr.push(await fileToBase64(f));
    setReqForm((f) => ({ ...f, reference_images: [...f.reference_images, ...arr] }));
  };

  const payBooking = async (id) => {
    try {
      await api.post(`/bookings/${id}/pay`);
      toast.success("Payment successful. Booking confirmed.");
      await reload(); await refresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Payment failed");
    }
  };

  const reviewBooking = async (id) => {
    const rating = Number(prompt("Rate 1-5", "5") || 0);
    const comment = prompt("Your review") || "";
    if (!rating) return;
    await api.post(`/bookings/${id}/review`, { rating, comment });
    toast.success("Review posted"); await reload();
  };

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "wallet", label: "Wallet" },
    { key: "requirements", label: "Requirements" },
    { key: "bookings", label: "Bookings" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="customer-dashboard">
      <Header />
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Namaste {user.name || "there"}.</h1>
        <p className="text-zinc-600 mt-2">Manage your profile, wallet, requirements and bookings.</p>

        <div className="mt-8 flex gap-2 flex-wrap border-b border-zinc-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              data-testid={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm -mb-px border-b-2 ${tab === t.key ? "border-zinc-900 text-zinc-900 font-medium" : "border-transparent text-zinc-500"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "profile" && (
            <div className="max-w-lg space-y-4">
              <div><label className="text-xs uppercase tracking-widest text-zinc-500">Full name</label><Input data-testid="cust-name" value={name} onChange={(e)=>setName(e.target.value)} className="mt-2 rounded-xl" /></div>
              <div><label className="text-xs uppercase tracking-widest text-zinc-500">City</label>
                <select data-testid="cust-city" value={city} onChange={(e)=>setCity(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="text-xs uppercase tracking-widest text-zinc-500">Email (optional)</label><Input data-testid="cust-email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 rounded-xl" /></div>
              <Button data-testid="cust-save-profile" onClick={saveProfile} className="rounded-full bg-zinc-900 hover:bg-zinc-800">Save profile</Button>
            </div>
          )}

          {tab === "wallet" && (
            <div>
              <div className="p-8 rounded-3xl bg-zinc-900 text-white inline-block">
                <div className="text-xs uppercase tracking-widest text-white/60 inline-flex items-center gap-2"><Wallet size={14}/> Wallet balance</div>
                <div className="mt-2 font-display text-5xl tracking-tight" data-testid="wallet-balance">₹{wallet.balance}</div>
              </div>
              <div className="mt-6 flex gap-2 items-end">
                <div>
                  <label className="text-xs uppercase tracking-widest text-zinc-500">Amount to add (INR)</label>
                  <Input data-testid="wallet-amount-input" type="number" value={topup} onChange={(e)=>setTopup(e.target.value)} className="mt-2 rounded-full w-40" />
                </div>
                <Button data-testid="wallet-add-btn" onClick={addMoney} className="rounded-full bg-gradient-to-r from-[#9D4CDD] via-[#3B82F6] to-[#EC4899]">
                  <PlusCircle size={14} className="mr-2" /> Add via Razorpay
                </Button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Mock payment — integrate real Razorpay by adding Key ID & Secret.</p>

              <h3 className="font-display text-xl mt-10">Recent transactions</h3>
              <div className="mt-3 space-y-2">
                {wallet.transactions.length === 0 && <div className="text-sm text-zinc-500">No transactions yet.</div>}
                {wallet.transactions.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-white border border-zinc-200 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{t.type.replace("_"," ")}</div>
                      <div className="text-xs text-zinc-500">{new Date(t.created_at).toLocaleString()}</div>
                    </div>
                    <div className={t.amount < 0 ? "text-red-600" : "text-emerald-600"}>{t.amount < 0 ? "" : "+"}₹{t.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "requirements" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h3 className="font-display text-xl">Post a requirement</h3>
                <div className="mt-4 space-y-3">
                  <select data-testid="req-category" value={reqForm.category} onChange={(e)=>setReqForm(f=>({...f,category:e.target.value}))} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm">
                    <option value="">Category *</option>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
                  </select>
                  <Textarea data-testid="req-description" placeholder="Describe what you need *" value={reqForm.description} onChange={(e)=>setReqForm(f=>({...f,description:e.target.value}))} className="rounded-xl" />
                  <Input data-testid="req-budget" type="number" placeholder="Budget in INR *" value={reqForm.budget} onChange={(e)=>setReqForm(f=>({...f,budget:e.target.value}))} className="rounded-xl" />
                  <Input data-testid="req-date" type="date" value={reqForm.date} onChange={(e)=>setReqForm(f=>({...f,date:e.target.value}))} className="rounded-xl" />
                  <select data-testid="req-location" value={reqForm.location} onChange={(e)=>setReqForm(f=>({...f,location:e.target.value}))} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm">
                    <option value="">Location</option>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-zinc-500">Reference images</label>
                    <input data-testid="req-refs" type="file" accept="image/*" multiple onChange={(e)=>uploadRefs(Array.from(e.target.files))} className="mt-2 text-sm" />
                    {reqForm.reference_images.length > 0 && <div className="mt-2 flex gap-2 flex-wrap">{reqForm.reference_images.map((r,i)=>(<img key={i} src={r} alt="" className="w-16 h-16 object-cover rounded-lg" />))}</div>}
                  </div>
                  <Button data-testid="req-submit" onClick={postReq} className="rounded-full bg-zinc-900 hover:bg-zinc-800">Post requirement</Button>
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl">Your requirements</h3>
                <div className="mt-4 space-y-3">
                  {requirements.length === 0 && <div className="text-sm text-zinc-500">No requirements yet.</div>}
                  {requirements.map((r) => (
                    <div key={r.id} className="p-5 rounded-2xl bg-white border border-zinc-200">
                      <div className="flex items-center gap-2"><FileText size={14} /><span className="font-medium">{r.category}</span><span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-zinc-100">{r.status}</span></div>
                      <p className="mt-2 text-sm text-zinc-700">{r.description}</p>
                      <div className="mt-2 text-xs text-zinc-500 flex items-center gap-3 flex-wrap">
                        <span>Budget: ₹{r.budget}</span>
                        {r.date && <span className="inline-flex items-center gap-1"><Calendar size={10}/> {r.date}</span>}
                        {r.location && <span>{r.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "bookings" && (
            <div className="space-y-3">
              {bookings.length === 0 && (
                <div className="p-10 text-center rounded-2xl bg-white border border-dashed border-zinc-300">
                  <div className="text-4xl">📭</div>
                  <div className="mt-3 font-display text-xl">No bookings yet</div>
                  <Link to="/artists" className="inline-block mt-3 text-sm underline">Browse artists</Link>
                </div>
              )}
              {bookings.map((b) => (
                <div key={b.id} className="p-5 rounded-2xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" data-testid={`booking-${b.id}`}>
                  <div>
                    <div className="font-medium">{b.artist_name}</div>
                    <div className="text-xs text-zinc-500">{b.date} · ₹{b.amount} · <span className="px-2 py-0.5 rounded-full bg-zinc-100">{b.status}</span></div>
                    {b.notes && <div className="mt-1 text-sm text-zinc-700">{b.notes}</div>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {b.status === "pending_payment" && (
                      <Button data-testid={`pay-btn-${b.id}`} onClick={() => payBooking(b.id)} className="rounded-full bg-gradient-to-r from-[#9D4CDD] via-[#3B82F6] to-[#EC4899]">Pay ₹{b.amount}</Button>
                    )}
                    {b.status === "completed" && (
                      <Button data-testid={`review-btn-${b.id}`} onClick={() => reviewBooking(b.id)} variant="outline" className="rounded-full"><Star size={14} className="mr-2"/> Review</Button>
                    )}
                    <Link to={`/artist/${b.artist_id}`} className="text-sm underline self-center">View artist</Link>
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

export default CustomerDashboard;
