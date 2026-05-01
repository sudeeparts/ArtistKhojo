import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("admin@artistkhojo.in");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/admin-login", { email, password });
      login(data.token, data.user);
      toast.success("Admin signed in");
      navigate("/admin");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="admin-login-page">
      <div className="max-w-md mx-auto px-6 pt-10">
        <Logo />
        <div className="mt-10 p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500"><Shield size={14}/> Admin Console</div>
          <h1 className="font-display text-3xl tracking-tight mt-3">Sign in</h1>
          <div className="mt-6 space-y-3">
            <Input data-testid="admin-email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="rounded-xl h-11" />
            <Input data-testid="admin-password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="rounded-xl h-11" />
            <Button data-testid="admin-login-btn" onClick={submit} disabled={loading} className="w-full rounded-full bg-zinc-900 hover:bg-zinc-800 h-11">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
