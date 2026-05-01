import { Check } from "lucide-react";

export const BlueTick = ({ size = 16, className = "" }) => (
  <span
    data-testid="blue-tick-verified"
    title="Verified by ArtistKhojo"
    className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#9D4CDD] text-white shadow-sm ${className}`}
    style={{ width: size, height: size }}
  >
    <Check strokeWidth={3.5} style={{ width: size * 0.65, height: size * 0.65 }} />
  </span>
);
