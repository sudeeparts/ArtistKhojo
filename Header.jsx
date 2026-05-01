import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogOut, LayoutDashboard, Wallet, Search } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashPath = user?.role === "admin" ? "/admin" : user?.role === "artist" ? "/artist-dashboard" : "/customer";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FDFBF7]/85 backdrop-blur-md border-b border-zinc-200/70">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-600">
          <Link to="/artists" data-testid="nav-browse" className="hover:text-zinc-900 transition-colors">Browse Artists</Link>
          <Link to="/login?role=artist" data-testid="nav-become-artist" className="hover:text-zinc-900 transition-colors">Become an Artist</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/artists")}
            data-testid="header-search-btn"
            className="md:hidden p-2 rounded-full hover:bg-zinc-100"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          {user ? (
            <>
              {user.role !== "admin" && (
                <Link
                  to="/customer"
                  data-testid="header-wallet-link"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-zinc-200 hover:bg-zinc-50 transition"
                >
                  <Wallet size={14} /> ₹{user.wallet_balance ?? 0}
                </Link>
              )}
              <Button
                onClick={() => navigate(dashPath)}
                data-testid="header-dashboard-btn"
                variant="outline"
                className="rounded-full gap-1.5"
                size="sm"
              >
                <LayoutDashboard size={14} /> Dashboard
              </Button>
              <Button
                onClick={() => { logout(); navigate("/"); }}
                data-testid="header-logout-btn"
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <LogOut size={14} />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate("/login")}
                data-testid="header-login-btn"
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                Sign in
              </Button>
              <Button
                onClick={() => navigate("/login")}
                data-testid="header-cta-btn"
                size="sm"
                className="rounded-full bg-zinc-900 hover:bg-zinc-800"
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
