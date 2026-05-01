import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { Header } from "../components/Header";
import { ArtistCard } from "../components/ArtistCard";
import { CATEGORIES, CITIES } from "../constants/categories";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "../components/ui/input";

const Browse = () => {
  const [sp, setSp] = useSearchParams();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(sp.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(() => ({
    category: sp.get("category") || "",
    city: sp.get("city") || "",
    min_rating: sp.get("min_rating") || "0",
    min_followers: sp.get("min_followers") || "0",
    verified_only: sp.get("verified_only") === "1",
  }), [sp]);

  const setFilter = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v === "" || v === "0" || v === false) n.delete(k);
    else n.set(k, v === true ? "1" : v);
    setSp(n);
  };

  useEffect(() => {
    setLoading(true);
    const params = { ...filters };
    if (q) params.q = q;
    if (!params.category) delete params.category;
    if (!params.city) delete params.city;
    if (params.min_rating === "0") delete params.min_rating;
    if (params.min_followers === "0") delete params.min_followers;
    if (!params.verified_only) delete params.verified_only;
    api.get("/artists", { params }).then((r) => setArtists(r.data)).finally(() => setLoading(false));
  }, [filters, q]);

  const clearAll = () => setSp(new URLSearchParams());
  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.min_rating !== "0" ? 1 : 0) +
    (filters.min_followers !== "0" ? 1 : 0) +
    (filters.verified_only ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="browse-page">
      <Header />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <h1 className="font-display text-4xl sm:text-6xl tracking-tight ak-fade-up">
          Discover <em className="font-display-italic ak-brand-gradient-text">artists</em>.
        </h1>
        <p className="text-zinc-600 mt-3 ak-fade-up ak-delay-1">Search 15+ categories across India.</p>

        {/* Search + Filter toggle */}
        <div className="mt-8 flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              data-testid="browse-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, craft, or bio..."
              className="pl-12 rounded-full h-12"
            />
          </div>
          <button
            data-testid="browse-filter-toggle"
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 px-5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-sm"
          >
            <SlidersHorizontal size={14} /> Filters {activeCount > 0 && <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-zinc-900 text-white">{activeCount}</span>}
          </button>
        </div>

        {/* Category pills */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
          <button
            data-testid="cat-pill-all"
            onClick={() => setFilter("category", "")}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition ${!filters.category ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:border-zinc-300"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              data-testid={`cat-pill-${c.key.split(" ")[0].toLowerCase()}`}
              onClick={() => setFilter("category", c.key)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition whitespace-nowrap ${filters.category === c.key ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:border-zinc-300"}`}
            >
              {c.emoji} {c.key}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="mt-5 p-5 rounded-2xl bg-white border border-zinc-200 grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="filter-panel">
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500">City</label>
              <select
                data-testid="filter-city"
                value={filters.city}
                onChange={(e) => setFilter("city", e.target.value)}
                className="mt-2 w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="">All cities</option>
                {CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500">Min Rating</label>
              <select
                data-testid="filter-rating"
                value={filters.min_rating}
                onChange={(e) => setFilter("min_rating", e.target.value)}
                className="mt-2 w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="0">Any</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500">Min Instagram Followers</label>
              <select
                data-testid="filter-followers"
                value={filters.min_followers}
                onChange={(e) => setFilter("min_followers", e.target.value)}
                className="mt-2 w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="0">Any</option>
                <option value="1000">1k+</option>
                <option value="10000">10k+</option>
                <option value="100000">100k+</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  data-testid="filter-verified"
                  type="checkbox"
                  checked={filters.verified_only}
                  onChange={(e) => setFilter("verified_only", e.target.checked)}
                  className="w-4 h-4 accent-zinc-900"
                />
                Verified only
              </label>
              {activeCount > 0 && (
                <button onClick={clearAll} data-testid="filter-clear-btn" className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mt-8">
          {loading ? (
            <div className="text-zinc-500 text-sm">Loading artists...</div>
          ) : artists.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-5xl">🎭</div>
              <div className="mt-4 font-display text-2xl">No artists yet.</div>
              <p className="text-zinc-500 mt-2 text-sm">Be the first to sign up in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {artists.map((a, i) => (
                <div key={a.id} className="ak-fade-up" style={{ animationDelay: `${0.05 * (i % 8)}s` }}>
                  <ArtistCard artist={a} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;
