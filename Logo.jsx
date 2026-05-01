import { Link } from "react-router-dom";

export const Logo = ({ size = 28, withText = true, className = "" }) => {
  return (
    <Link to="/" data-testid="logo-home-link" className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ArtistKhojo">
        <defs>
          <linearGradient id="ak_grad" x1="0" y1="64" x2="64" y2="0">
            <stop offset="0%" stopColor="#9D4CDD" />
            <stop offset="35%" stopColor="#3B82F6" />
            <stop offset="70%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <path d="M32 4 L58 58 H44 L32 28 L20 58 H6 Z" fill="url(#ak_grad)" />
        <circle cx="32" cy="10" r="2.2" fill="#FACC15" />
        <path d="M32 3.5 L32.6 8 L37 8.6 L32.6 9.2 L32 13.7 L31.4 9.2 L27 8.6 L31.4 8 Z" fill="#FACC15" />
      </svg>
      {withText && (
        <span className="font-display tracking-tight text-[1.15rem] font-semibold text-zinc-900 leading-none">
          Artist<span className="bg-gradient-to-r from-[#F97316] to-[#EC4899] bg-clip-text text-transparent">Khojo</span>
          <span className="text-[0.7em] text-[#EC4899]">.in</span>
        </span>
      )}
    </Link>
  );
};
