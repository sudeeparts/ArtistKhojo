import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { Header } from "../components/Header";
import { BlueTick } from "../components/BlueTick";
import { Star, MapPin, Share2, Instagram, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const ArtistProfile = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/artists/${id}`).then((r) => setArtist(r.data)).catch(() => setArtist(null)).finally(() => setLoading(false));
  }, [id]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${artist.name} on ArtistKhojo`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied!");
      }
    } catch {}
  };

  if (loading) return (<div className="min-h-screen bg-[#FDFBF7]"><Header /><div className="p-10 text-zinc-500">Loading...</div></div>);
  if (!artist) return (<div className="min-h-screen bg-[#FDFBF7]"><Header /><div className="p-10">Artist not found.</div></div>);

  const portfolio = (artist.portfolio || []).slice(0, 4);

  const book = () => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "customer") { toast.error("Switch to a customer account to book"); return; }
    navigate(`/book/${artist.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="artist-profile-page">
      <Header />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#9D4CDD] via-[#3B82F6] to-[#EC4899] p-[3px] shrink-0">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-display text-4xl font-semibold text-zinc-900">
              {artist.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-3xl sm:text-4xl tracking-tight" data-testid="profile-name">{artist.name}</h1>
              {artist.verified && <BlueTick size={22} />}
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-zinc-600 flex-wrap">
              <span>{artist.category}</span>
              <span className="inline-flex items-center gap-1"><MapPin size={14} /> {artist.city}</span>
              {artist.instagram_followers > 0 && (
                <span className="inline-flex items-center gap-1"><Instagram size={14} /> {artist.instagram_followers.toLocaleString()} followers</span>
              )}
            </div>
            <p className="mt-5 text-zinc-700 leading-relaxed max-w-2xl" data-testid="profile-bio">{artist.bio || "No bio yet."}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                data-testid="profile-book-btn"
                onClick={book}
                className="rounded-full bg-gradient-to-r from-[#9D4CDD] via-[#3B82F6] to-[#EC4899] hover:opacity-90"
              >
                <MessageCircle size={16} className="mr-2" /> Message via Platform
              </Button>
              <Button data-testid="profile-book-now-btn" onClick={book} className="rounded-full bg-zinc-900 hover:bg-zinc-800">
                Book Now <ArrowRight size={14} className="ml-2" />
              </Button>
              <Button data-testid="profile-share-btn" onClick={share} variant="outline" className="rounded-full">
                <Share2 size={14} className="mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-3 max-w-md" data-testid="profile-stats">
          <Stat label="Rating" value={artist.rating ? `${artist.rating} ★` : "New"} />
          <Stat label="Reviews" value={artist.reviews_count} />
          <Stat label="Completed" value={artist.completed_works} />
        </div>

        {/* Portfolio – exactly 4 */}
        <div className="mt-12">
          <h2 className="font-display text-2xl tracking-tight">Portfolio</h2>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl">
            {[0, 1, 2, 3].map((i) => {
              const item = portfolio[i];
              return (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200" data-testid={`portfolio-slot-${i}`}>
                  {item ? (
                    item.type === "video" ? (
                      <video src={item.data} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.data} alt="" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs uppercase tracking-widest">Empty slot</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="font-display text-2xl tracking-tight">Reviews</h2>
          <div className="mt-4 space-y-3">
            {(artist.reviews || []).length === 0 && (
              <p className="text-sm text-zinc-500">No reviews yet. Be the first to book!</p>
            )}
            {(artist.reviews || []).map((r) => (
              <div key={r.id} className="p-5 rounded-2xl bg-white border border-zinc-200" data-testid={`review-${r.id}`}>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{r.customer_name}</div>
                  <span className="inline-flex items-center gap-0.5 text-amber-500 text-sm">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 stroke-amber-400" />)}
                  </span>
                </div>
                <p className="mt-2 text-zinc-700 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <strong>Safety first:</strong> All communication and payment happens on ArtistKhojo to protect both parties. Contact details are hidden until the booking is confirmed.
        </div>

        <Link to="/artists" data-testid="profile-back-to-browse" className="inline-block mt-8 text-sm underline">← Back to browse</Link>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-white border border-zinc-200">
    <div className="text-xs uppercase tracking-widest text-zinc-500">{label}</div>
    <div className="mt-1 font-display text-xl">{value}</div>
  </div>
);

export default ArtistProfile;
