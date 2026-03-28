import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentPortal from './pages/StudentPortal';
import Track from './pages/Track';
import LetterPreview from './pages/LetterPreview';
import { InstitutionProvider } from './context/InstitutionContext';
import StudentLoginModal from './components/StudentLoginModal';

export default function App() {
  return (
    <InstitutionProvider>
      <Router>
        <div className="min-h-screen bg-bg text-tx font-sans selection:bg-acc/30 selection:text-acc2">
          <Navbar />
          <StudentLoginModal />
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/portal" element={<StudentPortal />} />
              <Route path="/track" element={<Track />} />
              <Route path="/preview" element={<LetterPreview />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Background Decor */}
          <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </Router>
    </InstitutionProvider>
  );
}

