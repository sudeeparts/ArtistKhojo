import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, TrendingUp, Star, MapPin, Briefcase, CalendarDays, Building2, Quote } from "lucide-react";
import { Header } from "../components/Header";
import { CATEGORIES } from "../constants/categories";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { ArtistCard } from "../components/ArtistCard";
import { IntroAnimation } from "../components/IntroAnimation";

const ensembleImg = "https://customer-assets.emergentagent.com/job_ca65f773-3c93-4072-8d20-dcc5be5b8c4c/artifacts/orc5tf8n_WhatsApp%20Image%202026-05-01%20at%2011.24.50%20%281%29.jpeg";

// Featured categories mirroring artistkhojo.in
const FEATURED_CATS = [
  { key: "Dance & Music", label: "Musician", emoji: "🎻" },
  { key: "Content Creator", label: "Content Creator", emoji: "📱" },
  { key: "Photography & Film", label: "Photographer", emoji: "📷" },
  { key: "Model & Influencer", label: "Influencer", emoji: "✨" },
  { key: "Visual Artist", label: "Painter", emoji: "🎨" },
  { key: "Digital Artist", label: "Graphic Designer", emoji: "🖌️" },
];

const SAMPLE_EVENTS = [
  { title: "Jaipur Literature Festival — Poetry Night", date: "Feb 14 — 16, 2026", city: "Jaipur", kind: "Literary" },
  { title: "Mumbai Indie Music Showcase", date: "Feb 22, 2026", city: "Mumbai", kind: "Music" },
  { title: "Bengaluru Street Photography Walk", date: "Mar 02, 2026", city: "Bengaluru", kind: "Photography" },
];

const SAMPLE_JOBS = [
  { title: "Wedding Photographer — 3 days", type: "Freelance", budget: "₹60,000", city: "Udaipur" },
  { title: "Lead Dancer for Brand Film", type: "Part-time", budget: "₹18,000", city: "Mumbai" },
  { title: "Voice Artist — Hindi VO", type: "Project", budget: "₹8,500", city: "Remote" },
];

const Landing = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/artists/featured").then((r) => setFeatured(r.data)).catch(() => {});
  }, []);

  const marqueeCats = [...CATEGORIES, ...CATEGORIES];

  return (
    <div className="min-h-screen bg-[#FDFBF7] overflow-x-hidden" data-testid="landing-page">
      <IntroAnimation />
      <Header />

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#9D4CDD]/35 via-[#3B82F6]/25 to-transparent blur-3xl ak-drift" />
          <div className="absolute top-20 right-[-10%] w-[460px] h-[460px] rounded-full bg-gradient-to-br from-[#F97316]/25 via-[#EC4899]/30 to-transparent blur-3xl ak-float-slow" />
          <div className="absolute bottom-[-15%] left-[25%] w-[380px] h-[380px] rounded-full bg-gradient-to-br from-[#3B82F6]/20 via-[#9D4CDD]/25 to-transparent blur-3xl ak-float" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-16 sm:pt-24 pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-300 bg-white/70 backdrop-blur text-xs uppercase tracking-widest text-zinc-600 ak-fade-up">
                <Sparkles size={12} className="text-[#EC4899]" /> India's Artist Discovery & Hiring Platform
              </span>

              <h1 className="font-display text-[2.75rem] sm:text-[3.75rem] lg:text-[5.25rem] leading-[0.96] tracking-tight mt-6 text-zinc-900">
                <span className="block ak-fade-up ak-delay-1">Skilled</span>
                <span className="block ak-fade-up ak-delay-2">
                  <em className="font-display-italic ak-brand-gradient-text">Indians ka</em>
                </span>
                <span className="block ak-fade-up ak-delay-3">Single Platform.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base sm:text-lg text-zinc-600 leading-relaxed ak-fade-up ak-delay-4">
                <em className="font-display-italic">Find Artists. Hire Talents. Get Work Done.</em> From painters and
                photographers to dancers, voice artists and content creators —
                one roof, across India. <span className="text-zinc-900 font-medium">Beginners welcome.</span>
              </p>

              <div className="mt-9 flex flex-wrap gap-3 ak-fade-up ak-delay-5">
                <Link
                  to="/login"
                  data-testid="hero-get-started-btn"
                  className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-all hover:gap-3"
                >
                  Get Started <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/artists"
                  data-testid="hero-browse-btn"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-zinc-300 bg-white/80 font-medium hover:bg-white hover:border-zinc-900 transition-colors"
                >
                  Browse Artists
                </Link>
                <Link
                  to="/login?role=artist"
                  data-testid="hero-register-artist-btn"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-transparent bg-gradient-to-r from-[#9D4CDD]/10 via-[#3B82F6]/10 to-[#EC4899]/10 font-medium hover:from-[#9D4CDD]/20 hover:to-[#EC4899]/20 transition-colors"
                >
                  Register as an Artist
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-6 text-xs uppercase tracking-widest text-zinc-500 ak-fade-up ak-delay-5">
                <span className="inline-flex items-center gap-2"><Shield size={14} /> Blue-Tick Verified</span>
                <span className="inline-flex items-center gap-2"><TrendingUp size={14} /> Ratings & Reviews</span>
                <span>Pan-India · 15+ Categories</span>
              </div>
            </div>

            <div className="lg:col-span-5 relative ak-scale-in ak-delay-3">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-zinc-200 ak-float-slow">
                <img src={ensembleImg} alt="Artists on ArtistKhojo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-4 sm:left-6 bg-white rounded-2xl shadow-xl border border-zinc-100 p-4 w-64 ak-fade-up ak-delay-5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Live on the platform</div>
                <div className="mt-2 flex -space-x-3">
                  {[0,1,2,3].map((i)=> (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9D4CDD] via-[#3B82F6] to-[#EC4899] p-[2px]">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-semibold">{"AKSR"[i]}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 font-display text-lg">2.4k+ verified artists</div>
              </div>
              <div className="absolute -top-5 -right-3 bg-white/90 backdrop-blur rounded-full shadow-lg border border-zinc-100 px-4 py-2 flex items-center gap-2 ak-fade-up ak-delay-4">
                <Star size={14} className="fill-amber-400 stroke-amber-400" />
                <span className="text-sm font-medium">4.9 average rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR PILLARS — Artists · Events · Jobs · Places */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 -mt-4 mb-14" data-testid="landing-pillars">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Sparkles size={16}/>, label: "Artists", hint: "Discover talent", to: "/artists" },
            { icon: <CalendarDays size={16}/>, label: "Events", hint: "What's happening", to: "/artists" },
            { icon: <Briefcase size={16}/>, label: "Jobs", hint: "Find gigs", to: "/artists" },
            { icon: <Building2 size={16}/>, label: "Places", hint: "Studios & venues", to: "/artists" },
          ].map((p, i) => (
            <Link
              key={p.label}
              to={p.to}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-200 ak-card-lift ak-fade-up"
              style={{ animationDelay: `${0.08 * i}s` }}
              data-testid={`pillar-${p.label.toLowerCase()}`}
            >
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9D4CDD]/15 to-[#EC4899]/15 flex items-center justify-center text-zinc-900">{p.icon}</span>
              <span>
                <span className="block font-display text-lg leading-none">{p.label}</span>
                <span className="block text-xs text-zinc-500 mt-1">{p.hint}</span>
              </span>
              <ArrowRight size={14} className="ml-auto text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-900" />
            </Link>
          ))}
        </div>
      </section>

      {/* MARQUEE strip */}
      <section className="border-y border-zinc-200 bg-white/60 backdrop-blur overflow-hidden">
        <div className="relative flex py-5">
          <div className="flex gap-12 whitespace-nowrap ak-marquee">
            {marqueeCats.map((c, i) => (
              <div key={i} className="flex items-center gap-3 text-zinc-600">
                <span className="text-lg">{c.emoji}</span>
                <span className="font-display text-xl">{c.key}</span>
                <span className="text-zinc-300">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCOVER ARTIST — highlighted categories like real site */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24" data-testid="landing-discover">
        <div className="ak-fade-up">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Discover Artist</div>
          <h2 className="font-display text-3xl sm:text-5xl tracking-tight mt-2">
            Talent, <em className="font-display-italic ak-brand-gradient-text">all around India</em>.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {FEATURED_CATS.map((c, i) => (
            <Link
              key={c.label}
              to={`/artists?category=${encodeURIComponent(c.key)}`}
              data-testid={`disc-${c.label.split(" ")[0].toLowerCase()}`}
              className="group relative rounded-2xl border border-zinc-200 bg-white p-5 ak-card-lift ak-fade-up"
              style={{ animationDelay: `${0.06 * i}s` }}
            >
              <div className="text-3xl">{c.emoji}</div>
              <div className="mt-4 font-display text-xl leading-tight">{c.label}</div>
              <div className="mt-1 text-xs text-zinc-500">Top-rated</div>
              <div className="absolute inset-x-5 bottom-3 h-[2px] bg-gradient-to-r from-[#9D4CDD] via-[#3B82F6] to-[#EC4899] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
            </Link>
          ))}
        </div>
      </section>

      {/* POETRY QUOTE — William Blake (from the real site) */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20" data-testid="landing-quote">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-zinc-200 p-10 sm:p-16">
          <Quote className="absolute top-8 left-8 text-zinc-100" size={120} />
          <div className="absolute -bottom-16 -right-10 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-[#9D4CDD]/15 via-[#3B82F6]/10 to-[#EC4899]/15 blur-3xl ak-float-slow" />
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="font-display-italic text-2xl sm:text-4xl leading-[1.3] text-zinc-800">
              "To see a World in a Grain of Sand<br />
              And a <span className="ak-brand-gradient-text">Heaven</span> in a Wild Flower,<br />
              Hold Infinity in the palm of your hand<br />
              And Eternity in an hour."
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
              <span className="h-px w-10 bg-zinc-300" /> William Blake <span className="h-px w-10 bg-zinc-300" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ARTISTS */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16" data-testid="landing-featured">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div className="ak-fade-up">
              <div className="text-xs uppercase tracking-widest text-zinc-500">Handpicked</div>
              <h2 className="font-display text-3xl sm:text-5xl tracking-tight mt-2">
                <em className="font-display-italic ak-brand-gradient-text">Verified</em> talent this week.
              </h2>
            </div>
            <Link to="/artists" className="text-sm text-zinc-900 underline underline-offset-4 hover:no-underline">Discover more →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.slice(0, 4).map((a, i) => (
              <div key={a.id} className="ak-fade-up" style={{ animationDelay: `${0.08 * i}s` }}>
                <ArtistCard artist={a} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EVENTS + JOBS two-column */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10" data-testid="landing-events-jobs">
        {/* Events */}
        <div className="ak-fade-up">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">What's happening?</div>
              <h3 className="font-display text-2xl sm:text-4xl tracking-tight mt-2">
                <em className="font-display-italic">Events</em> throughout your city.
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            {SAMPLE_EVENTS.map((e, i) => (
              <div
                key={i}
                className="group p-5 rounded-2xl bg-white border border-zinc-200 ak-card-lift flex items-center gap-4"
                data-testid={`event-${i}`}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9D4CDD]/15 via-[#3B82F6]/15 to-[#EC4899]/15 flex items-center justify-center">
                  <CalendarDays className="text-zinc-800" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg leading-tight">{e.title}</div>
                  <div className="text-xs text-zinc-500 mt-1 inline-flex items-center gap-3">
                    <span>{e.date}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={10}/> {e.city}</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100">{e.kind}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-900" />
              </div>
            ))}
          </div>
        </div>

        {/* Jobs */}
        <div className="ak-fade-up ak-delay-2">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">Job openings</div>
              <h3 className="font-display text-2xl sm:text-4xl tracking-tight mt-2">
                Find <em className="font-display-italic ak-brand-gradient-text">gigs</em> near you.
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            {SAMPLE_JOBS.map((j, i) => (
              <div key={i} className="group p-5 rounded-2xl bg-white border border-zinc-200 ak-card-lift" data-testid={`job-${i}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <Briefcase size={16} className="text-zinc-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg leading-tight">{j.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 inline-flex items-center gap-3 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100">{j.type}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={10}/> {j.city}</span>
                    </div>
                  </div>
                  <div className="font-display text-xl">{j.budget}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTIST CTA */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 bg-zinc-900 text-white">
          <div className="absolute -right-20 -top-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-[#9D4CDD] via-[#3B82F6] to-[#EC4899] opacity-30 blur-3xl ak-drift" />
          <div className="absolute -left-10 -bottom-20 w-[22rem] h-[22rem] rounded-full bg-gradient-to-tr from-[#F97316] to-[#EC4899] opacity-20 blur-3xl ak-float" />
          <div className="relative max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-white/60">For Artists</div>
            <h3 className="font-display text-3xl sm:text-6xl tracking-tight mt-4 leading-[1.02]">
              Showcase your <em className="font-display-italic bg-gradient-to-r from-[#F97316] to-[#EC4899] bg-clip-text text-transparent">craft</em>.<br />Get booked.
            </h3>
            <p className="mt-6 text-white/70 max-w-lg text-lg">
              Upload 4 best works, earn the blue-tick, and start receiving booking requests from customers near you.
            </p>
            <Link
              to="/login?role=artist"
              data-testid="landing-become-artist-btn"
              className="group inline-flex items-center gap-2 mt-10 px-7 py-4 rounded-full bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-all hover:gap-3"
            >
              Become an Artist <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 mt-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-display text-lg">ArtistKhojo<span className="text-[#EC4899]">.in</span></div>
            <p className="mt-3 text-zinc-500 leading-relaxed text-xs">India's Artist Discovery & Hiring Platform. Find Artists. Hire Talents. Get Work Done.</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Explore</div>
            <ul className="space-y-2 text-zinc-700">
              <li><Link to="/artists">Artists</Link></li>
              <li><Link to="/artists">Events</Link></li>
              <li><Link to="/artists">Jobs</Link></li>
              <li><Link to="/artists">Places</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">For Artists</div>
            <ul className="space-y-2 text-zinc-700">
              <li><Link to="/login?role=artist">Register</Link></li>
              <li><Link to="/login?role=artist">Get Verified</Link></li>
              <li><Link to="/login?role=artist">Earnings</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Company</div>
            <ul className="space-y-2 text-zinc-700">
              <li><Link to="/admin/login" data-testid="footer-admin-link">Admin</Link></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 text-xs text-zinc-500 flex flex-col md:flex-row gap-3 justify-between">
            <div>© {new Date().getFullYear()} ArtistKhojo.in — <em className="font-display-italic">Skilled Indians ka Single Platform</em></div>
            <div>Made with care in India 🇮🇳</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
