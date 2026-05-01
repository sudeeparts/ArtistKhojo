import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { toast } from "sonner";
import { Palette, ShoppingBag, ArrowRight } from "lucide-react";

const RoleSelect = () => {
  const { refresh, user } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const pref = sp.get("pref");
  const [picking, setPicking] = useState(null);

  useEffect(() => {
    if (user && user.role) {
      if (user.role === "artist") navigate("/artist-dashboard");
      else if (user.role === "customer") navigate("/customer");
    }
  }, [user, navigate]);

  const pick = async (role) => {
    setPicking(role);
    try {
      const { data } = await api.post("/users/set-role", { role });
      localStorage.setItem("ak_token", data.token);
      await refresh();
      toast.success(`Welcome, ${role}!`);
      if (role === "artist") navigate("/artist-dashboard");
      else navigate("/customer");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
    setPicking(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col" data-testid="role-select-page">
      <div className="max-w-3xl mx-auto w-full px-6 pt-10"><Logo /></div>

      <div className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto w-full px-6 py-10">
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight">How will you use ArtistKhojo?</h1>
          <p className="mt-3 text-zinc-600">Pick a role. You can create a second account later if you need both.</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            <button
              data-testid="role-customer-btn"
              onClick={() => pick("customer")}
              disabled={!!picking}
              className={`group text-left p-7 rounded-3xl border-2 transition-all ${pref === "artist" ? "border-zinc-200 bg-white/60" : "border-zinc-900 bg-white"} hover:shadow-xl hover:-translate-y-1`}
            >
              <ShoppingBag className="text-[#3B82F6]" size={32} />
              <div className="mt-5 font-display text-2xl font-semibold">I'm a Customer</div>
              <p className="mt-2 text-zinc-600 text-sm">Browse verified artists, post requirements and book instantly.</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium">
                {picking === "customer" ? "Setting up..." : "Continue"} <ArrowRight size={14} />
              </span>
            </button>

            <button
              data-testid="role-artist-btn"
              onClick={() => pick("artist")}
              disabled={!!picking}
              className={`group text-left p-7 rounded-3xl border-2 transition-all ${pref === "artist" ? "border-zinc-900 bg-white" : "border-zinc-200 bg-white/60"} hover:shadow-xl hover:-translate-y-1`}
            >
              <Palette className="text-[#EC4899]" size={32} />
              <div className="mt-5 font-display text-2xl font-semibold">I'm an Artist</div>
              <p className="mt-2 text-zinc-600 text-sm">Showcase 4 best works, get blue-tick verified, receive bookings.</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium">
                {picking === "artist" ? "Setting up..." : "Continue"} <ArrowRight size={14} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
