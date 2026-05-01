import { Link } from "react-router-dom";
import { BlueTick } from "./BlueTick";
import { Star, MapPin } from "lucide-react";

const Placeholder = ({ label }) => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400 text-[10px] uppercase tracking-widest">
    {label}
  </div>
);

export const ArtistCard = ({ artist }) => {
  const portfolio = (artist.portfolio || []).slice(0, 4);
  const slots = [0, 1, 2, 3];

  const initial = (artist.name || "A").charAt(0).toUpperCase();

  return (
    <Link
      to={`/artist/${artist.id}`}
      data-testid={`artist-card-${artist.id}`}
      className="group block bg-white rounded-3xl border border-zinc-200/80 overflow-hidden ak-card-lift relative"
    >
      {/* Portfolio 4-grid Instagram style */}
      <div className="grid grid-cols-2 gap-px bg-zinc-100 aspect-square">
        {slots.map((i) => {
          const item = portfolio[i];
          return (
            <div key={i} className="relative overflow-hidden bg-zinc-100">
              {item ? (
                item.type === "video" ? (
                  <video src={item.data} className="w-full h-full object-cover ak-img-zoom" muted playsInline />
                ) : (
                  <img src={item.data} alt="" className="w-full h-full object-cover ak-img-zoom" />
                )
              ) : (
                <Placeholder label={`Slot ${i + 1}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9D4CDD] via-[#3B82F6] to-[#EC4899] p-[2px] shrink-0">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-display font-semibold text-zinc-800">
                {initial}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-semibold text-zinc-900 truncate">{artist.name}</h3>
                {artist.verified && <BlueTick size={14} />}
              </div>
              <p className="text-xs text-zinc-500 truncate">{artist.category}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} /> {artist.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star size={12} className="fill-amber-400 stroke-amber-400" /> {artist.rating || "New"}
            <span className="text-zinc-400">· {artist.reviews_count} reviews</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
