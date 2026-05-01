import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BlueTick } from "../components/BlueTick";

const BookingCheckout = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [artist, setArtist] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [form, setForm] = useState({ date: "", amount: "", notes: "" });
  const [step, setStep] = useState("details"); // details | pay

  useEffect(() => {
    api.get(`/artists/${artistId}`).then(r => {
      setArtist(r.data);
      setForm(f => ({ ...f, amount: r.data.hourly_rate || 1000 }));
    });
    api.get("/wallet").then(r => setWallet(r.data));
  }, [artistId]);

  if (!user || user.role !== "customer") {
    return (<div className="min-h-screen bg-[#FDFBF7]"><Header /><div className="p-10">Please login as a customer.</div></div>);
  }

  const confirm = async () => {
    if (!form.date || !form.amount) return toast.error("Pick a date and confirm amount");
    try {
      const { data } = await api.post("/bookings", { artist_id: artistId, date: form.date, amount: Number(form.amount), notes: form.notes });
      // try immediate pay
      if (wallet.balance >= Number(form.amount)) {
        await api.post(`/bookings/${data.id}/pay`);
        toast.success("Booking confirmed & paid!");
        await refresh();
        navigate("/customer");
      } else {
        toast.message(`Booking created. Add ₹${Number(form.amount) - wallet.balance} to wallet to confirm.`);
        navigate("/customer");
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Booking failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="booking-page">
      <Header />
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10">
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Book artist</h1>

        {artist && (
          <div className="mt-6 p-5 rounded-2xl bg-white border border-zinc-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#9D4CDD] via-[#3B82F6] to-[#EC4899] p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-semibold">{artist.name.charAt(0)}</div>
            </div>
            <div>
              <div className="font-medium flex items-center gap-2">{artist.name} {artist.verified && <BlueTick size={14} />}</div>
              <div className="text-xs text-zinc-500">{artist.category} · {artist.city}</div>
            </div>
            <div className="ml-auto text-sm text-zinc-500">Wallet: ₹{wallet.balance}</div>
          </div>
        )}

        <div className="mt-6 space-y-4 max-w-lg">
          <div>
            <label className="text-xs uppercase tracking-widest text-zinc-500">Event date</label>
            <Input data-testid="book-date" type="date" value={form.date} onChange={(e)=>setForm(f=>({...f,date:e.target.value}))} className="mt-2 rounded-xl" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-zinc-500">Amount (₹)</label>
            <Input data-testid="book-amount" type="number" value={form.amount} onChange={(e)=>setForm(f=>({...f,amount:e.target.value}))} className="mt-2 rounded-xl" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-zinc-500">Notes for the artist</label>
            <Textarea data-testid="book-notes" value={form.notes} onChange={(e)=>setForm(f=>({...f,notes:e.target.value}))} className="mt-2 rounded-xl" rows={3} />
          </div>
          <Button data-testid="book-confirm-btn" onClick={confirm} className="rounded-full bg-gradient-to-r from-[#9D4CDD] via-[#3B82F6] to-[#EC4899] hover:opacity-90 w-full h-12">
            Confirm booking & pay
          </Button>
          <p className="text-xs text-zinc-500">Secure payment via platform wallet. Contact details unlock once artist accepts.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckout;
