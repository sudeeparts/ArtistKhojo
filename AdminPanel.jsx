import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { BlueTick } from "../components/BlueTick";
import { CheckCircle2, XCircle, Users, ShieldCheck, Briefcase, Clock } from "lucide-react";

const AdminPanel = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("verifications");
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});

  const reload = async () => {
    const [p, u, b, s] = await Promise.all([
      api.get("/admin/pending-verifications"),
      api.get("/admin/users"),
      api.get("/admin/bookings"),
      api.get("/admin/stats"),
    ]);
    setPending(p.data); setUsers(u.data); setBookings(b.data); setStats(s.data);
  };

  useEffect(() => { if (user?.role === "admin") reload(); }, [user]);

  if (!user) return <Navigate to="/admin/login" />;
  if (user.role !== "admin") return <Navigate to="/" />;

  const verify = async (id, approve) => {
    await api.post(`/admin/verify/${id}?approve=${approve}`);
    toast.success(approve ? "Verified ✓" : "Rejected");
    await reload();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="admin-panel">
      <Header />
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Admin Console</h1>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon={<Users size={14}/>} label="Users" value={stats.users} />
          <StatCard icon={<Briefcase size={14}/>} label="Artists" value={stats.artists} />
          <StatCard icon={<ShieldCheck size={14}/>} label="Verified" value={stats.verified_artists} />
          <StatCard icon={<Clock size={14}/>} label="Pending" value={stats.pending_verifications} />
          <StatCard icon={<Briefcase size={14}/>} label="Bookings" value={stats.bookings} />
        </div>

        <div className="mt-8 flex gap-2 flex-wrap border-b border-zinc-200">
          {["verifications","users","bookings"].map(t => (
            <button key={t} data-testid={`admin-tab-${t}`} onClick={()=>setTab(t)} className={`px-5 py-3 text-sm -mb-px border-b-2 capitalize ${tab===t?"border-zinc-900 text-zinc-900 font-medium":"border-transparent text-zinc-500"}`}>{t}</button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "verifications" && (
            <div className="space-y-3">
              {pending.length === 0 && <div className="text-sm text-zinc-500">No pending verifications.</div>}
              {pending.map(a => (
                <div key={a.id} className="p-5 rounded-2xl bg-white border border-zinc-200 flex flex-col sm:flex-row gap-4" data-testid={`pending-${a.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{a.name}</div>
                      <span className="text-xs text-zinc-500">{a.category} · {a.city}</span>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500 flex gap-4 flex-wrap">
                      {a.aadhaar_file && <a href={a.aadhaar_file} target="_blank" rel="noreferrer" className="underline" data-testid={`aadhaar-${a.id}`}>View Aadhaar</a>}
                      {a.intro_video && <details><summary className="cursor-pointer underline">Intro video</summary><video src={a.intro_video} controls className="mt-2 max-w-xs rounded-xl" /></details>}
                    </div>
                  </div>
                  <div className="flex gap-2 self-end">
                    <Button data-testid={`approve-${a.id}`} onClick={()=>verify(a.id,true)} className="rounded-full bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 size={14} className="mr-1"/>Approve</Button>
                    <Button data-testid={`reject-${a.id}`} onClick={()=>verify(a.id,false)} variant="outline" className="rounded-full"><XCircle size={14} className="mr-1"/>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-200">
                  <tr><th className="text-left py-3">Name</th><th className="text-left py-3">Phone</th><th className="text-left py-3">Role</th><th className="text-left py-3">City</th><th className="text-left py-3">Wallet</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-zinc-100">
                      <td className="py-3">{u.name || "—"}</td><td>{u.phone}</td>
                      <td><span className="px-2 py-0.5 rounded-full bg-zinc-100 text-xs">{u.role || "none"}</span></td>
                      <td>{u.city || "—"}</td><td>₹{u.wallet_balance || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "bookings" && (
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b.id} className="p-4 rounded-xl bg-white border border-zinc-200 flex items-center gap-4 text-sm">
                  <div className="flex-1"><span className="font-medium">{b.customer_name}</span> → <span>{b.artist_name}</span></div>
                  <span className="text-xs text-zinc-500">{b.date}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100">{b.status}</span>
                  <span>₹{b.amount}</span>
                </div>
              ))}
              {bookings.length === 0 && <div className="text-sm text-zinc-500">No bookings yet.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="p-4 rounded-2xl bg-white border border-zinc-200">
    <div className="text-xs uppercase tracking-widest text-zinc-500 inline-flex items-center gap-1.5">{icon} {label}</div>
    <div className="font-display text-2xl mt-1">{value ?? 0}</div>
  </div>
);

export default AdminPanel;
