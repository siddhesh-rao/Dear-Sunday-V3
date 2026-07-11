import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import Dashboard   from './pages/Dashboard';
import WritePage   from './pages/WritePage';
import InboxPage   from './pages/InboxPage';
import ArchivePage from './pages/ArchivePage';
import ProfilePage from './pages/ProfilePage';
import AdminLogin  from './pages/AdminLogin';
import AdminDash   from './pages/AdminDash';
import AdminPairing from './pages/AdminPairing';

function GuardParticipant({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || role !== 'participant') return <Navigate to="/login" replace />;
  return children;
}
function GuardAdmin({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDE8DF' }}>
      <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.5rem', color: '#9B8878' }}>dear sunday</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#F5F0E8', color: '#2C2018',
            fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
            border: '1px solid rgba(44,32,24,0.1)',
            boxShadow: '0 4px 24px rgba(44,32,24,0.1)',
            borderRadius: '12px', padding: '12px 18px'
          }
        }} />
        <Routes>
          <Route path="/"              element={<Landing />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/signup"        element={<Signup />} />
          <Route path="/dashboard"     element={<GuardParticipant><Dashboard /></GuardParticipant>} />
          <Route path="/prompt"        element={<GuardParticipant><WritePage /></GuardParticipant>} />
          <Route path="/inbox"         element={<GuardParticipant><InboxPage /></GuardParticipant>} />
          <Route path="/archive"       element={<GuardParticipant><ArchivePage /></GuardParticipant>} />
          <Route path="/profile"       element={<GuardParticipant><ProfilePage /></GuardParticipant>} />
          <Route path="/admin/login"   element={<AdminLogin />} />
          <Route path="/admin"         element={<GuardAdmin><AdminDash /></GuardAdmin>} />
          <Route path="/admin/pairing" element={<GuardAdmin><AdminPairing /></GuardAdmin>} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
