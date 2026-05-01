import { useEffect, useState } from "react";

/**
 * Cinematic intro: peacock "A" draws itself, wordmark reveals, brand sweep,
 * then the whole layer slides up to reveal the site. Plays once per session.
 */
export const IntroAnimation = () => {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("ak_intro_seen");
  });
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (!visible) return;
    // total ~3.2s of content, then slide away
    const t1 = setTimeout(() => setExit(true), 3200);
    const t2 = setTimeout(() => {
      sessionStorage.setItem("ak_intro_seen", "1");
      setVisible(false);
    }, 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      data-testid="intro-animation"
      className={`fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center overflow-hidden transition-transform duration-[900ms] ${exit ? "-translate-y-full" : ""}`}
      style={{ willChange: "transform", transitionTimingFunction: "cubic-bezier(.8,.05,.2,1)" }}
    >
      {/* Gradient wash behind */}
      <div className="absolute inset-0 opacity-70 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[46rem] h-[46rem] rounded-full bg-gradient-to-br from-[#9D4CDD] via-[#3B82F6] to-transparent blur-3xl ak-intro-blob-1" />
        <div className="absolute -bottom-40 -right-40 w-[46rem] h-[46rem] rounded-full bg-gradient-to-br from-[#F97316] via-[#EC4899] to-transparent blur-3xl ak-intro-blob-2" />
      </div>

      {/* Noise/grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Center content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated A mark */}
        <svg width="148" height="148" viewBox="0 0 64 64" className="ak-intro-logo" aria-hidden="true">
          <defs>
            <linearGradient id="ak_intro_grad" x1="0" y1="64" x2="64" y2="0">
              <stop offset="0%" stopColor="#9D4CDD" />
              <stop offset="35%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <path
            d="M32 4 L58 58 H44 L32 28 L20 58 H6 Z"
            fill="url(#ak_intro_grad)"
            stroke="white"
            strokeWidth="0.5"
            className="ak-intro-path"
          />
          {/* Star */}
          <path
            d="M32 3.5 L32.6 8 L37 8.6 L32.6 9.2 L32 13.7 L31.4 9.2 L27 8.6 L31.4 8 Z"
            fill="#FACC15"
            className="ak-intro-star"
          />
        </svg>

        {/* Wordmark — letters stagger in */}
        <div className="ak-intro-word font-display text-white text-4xl sm:text-6xl tracking-tight flex items-baseline">
          {"ArtistKhojo".split("").map((ch, i) => (
            <span
              key={i}
              className="ak-intro-letter inline-block"
              style={{ animationDelay: `${0.8 + i * 0.04}s` }}
            >
              {ch}
            </span>
          ))}
          <span className="text-[#EC4899] text-[0.55em] ml-1 ak-intro-letter" style={{ animationDelay: "1.4s" }}>.in</span>
        </div>

        {/* Tagline fades in last */}
        <div className="ak-intro-tag text-white/60 text-xs uppercase tracking-[0.38em] font-medium">
          Skilled Indians ka Single Platform
        </div>

        {/* Sweeping gradient bar */}
        <div className="relative mt-2 h-[2px] w-56 bg-white/10 overflow-hidden rounded-full">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#9D4CDD] via-[#3B82F6] via-[#F97316] to-[#EC4899] ak-intro-sweep" />
        </div>
      </div>

      <style>{`
        @keyframes akIntroLogoIn {
          0%   { transform: scale(0.6) rotate(-6deg); opacity: 0; filter: blur(12px); }
          55%  { transform: scale(1.06) rotate(2deg); opacity: 1; filter: blur(0); }
          100% { transform: scale(1) rotate(0); opacity: 1; filter: blur(0); }
        }
        @keyframes akIntroStarPop {
          0%,30% { transform: scale(0); opacity: 0; }
          55%    { transform: scale(1.6); opacity: 1; }
          100%   { transform: scale(1); opacity: 1; }
        }
        @keyframes akIntroLetter {
          0%   { opacity: 0; transform: translateY(18px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes akIntroTag {
          0%,60%  { opacity: 0; letter-spacing: 0.12em; }
          100%    { opacity: 1; letter-spacing: 0.38em; }
        }
        @keyframes akIntroSweep {
          0%   { left: -50%; }
          100% { left: 100%; }
        }
        @keyframes akIntroBlob1 {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50%     { transform: translate3d(60px,40px,0) scale(1.1); }
        }
        @keyframes akIntroBlob2 {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50%     { transform: translate3d(-60px,-40px,0) scale(1.15); }
        }

        .ak-intro-logo      { animation: akIntroLogoIn 1.1s cubic-bezier(.2,.7,.2,1) forwards; transform-origin: center; }
        .ak-intro-path      { transform-origin: center; }
        .ak-intro-star      { transform-origin: 32px 8.6px; animation: akIntroStarPop 1.2s cubic-bezier(.5,1.6,.5,1) .7s both; }
        .ak-intro-letter    { opacity: 0; animation: akIntroLetter .55s cubic-bezier(.2,.7,.2,1) forwards; }
        .ak-intro-tag       { animation: akIntroTag 1.1s ease forwards 1.9s; opacity: 0; }
        .ak-intro-sweep     { animation: akIntroSweep 1.6s ease-in-out 1.4s forwards; }
        .ak-intro-blob-1    { animation: akIntroBlob1 6s ease-in-out infinite; }
        .ak-intro-blob-2    { animation: akIntroBlob2 7s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ak-intro-logo, .ak-intro-star, .ak-intro-letter, .ak-intro-tag, .ak-intro-sweep {
            animation-duration: .01ms !important;
            animation-delay: 0s !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};
