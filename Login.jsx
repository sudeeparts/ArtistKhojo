import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Phone, Shield } from "lucide-react";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const preferred = sp.get("role");

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/send-otp", { phone });
      setDevOtp(data.dev_otp || "");
      setStep("otp");
      toast.success(`OTP sent to +91 ${phone}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to send OTP");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { phone, otp });
      login(data.token, data.user);
      toast.success("Welcome to ArtistKhojo!");
      if (!data.user.role) {
        navigate("/role" + (preferred ? `?pref=${preferred}` : ""));
      } else if (data.user.role === "artist") {
        navigate("/artist-dashboard");
      } else {
        navigate("/customer");
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Invalid OTP");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden" data-testid="login-page">
      <div className="absolute inset-0 -z-0 pointer-events-none opacity-50">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#9D4CDD]/40 to-[#EC4899]/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#3B82F6]/30 to-[#F97316]/30 blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto px-6 pt-10">
        <button onClick={() => navigate("/")} data-testid="login-back-btn" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="mt-8"><Logo size={32} /></div>

        <div className="mt-10 bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-3xl p-8 shadow-xl ak-scale-in">
          {step === "phone" ? (
            <>
              <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Sign in with mobile.</h1>
              <p className="mt-2 text-zinc-600 text-sm">We'll send a one-time password to verify.</p>

              <div className="mt-8">
                <label className="text-xs uppercase tracking-widest text-zinc-500">Mobile Number</label>
                <div className="mt-2 flex rounded-full border border-zinc-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900/10">
                  <span className="inline-flex items-center gap-2 px-4 text-sm text-zinc-500 border-r border-zinc-200">
                    <Phone size={14} /> +91
                  </span>
                  <input
                    data-testid="login-phone-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className="flex-1 px-4 py-3 bg-transparent outline-none text-sm"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <Button
                data-testid="login-send-otp-btn"
                onClick={sendOtp}
                disabled={loading}
                className="mt-6 w-full rounded-full h-12 bg-zinc-900 hover:bg-zinc-800"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Verify OTP</h1>
              <p className="mt-2 text-zinc-600 text-sm">Sent to +91 {phone}. <button className="underline" onClick={() => setStep("phone")}>Change</button></p>
              {devOtp && (
                <div className="mt-3 text-xs px-3 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  <strong>Demo:</strong> Use OTP <span className="font-mono">{devOtp}</span>
                </div>
              )}

              <Input
                data-testid="login-otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                className="mt-6 rounded-full h-12 text-center tracking-[0.6em] font-mono text-lg"
                inputMode="numeric"
              />

              <Button
                data-testid="login-verify-otp-btn"
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="mt-5 w-full rounded-full h-12 bg-gradient-to-r from-[#9D4CDD] via-[#3B82F6] to-[#EC4899] hover:opacity-90"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </>
          )}

          <p className="mt-6 text-xs text-zinc-500 inline-flex items-center gap-1.5">
            <Shield size={12} /> Protected by OTP. Never share your code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
