import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import RoleSelect from "@/pages/RoleSelect";
import Browse from "@/pages/Browse";
import ArtistProfile from "@/pages/ArtistProfile";
import CustomerDashboard from "@/pages/CustomerDashboard";
import ArtistDashboard from "@/pages/ArtistDashboard";
import BookingCheckout from "@/pages/BookingCheckout";
import AdminLogin from "@/pages/AdminLogin";
import AdminPanel from "@/pages/AdminPanel";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/role" element={<Protected><RoleSelect /></Protected>} />
          <Route path="/artists" element={<Browse />} />
          <Route path="/artist/:id" element={<ArtistProfile />} />
          <Route path="/customer" element={<Protected><CustomerDashboard /></Protected>} />
          <Route path="/artist-dashboard" element={<Protected><ArtistDashboard /></Protected>} />
          <Route path="/book/:artistId" element={<Protected><BookingCheckout /></Protected>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
