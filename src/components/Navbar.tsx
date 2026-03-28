import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useInstitution } from '../context/InstitutionContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentAuth, setIsLoginModalOpen, setStudentAuth } = useInstitution();
  
  const tabs = [
    { name: 'Home', path: '/' },
    { name: 'Register Institution', path: '/register' },
    { name: 'Grievance Cell', path: '/dashboard' },
    { name: 'Student Portal', path: '/portal' },
  ];

  const handlePortalClick = (e: React.MouseEvent, path: string) => {
    if (path === '/portal') {
      e.preventDefault();
      if (!studentAuth) {
        setIsLoginModalOpen(true);
      } else {
        navigate('/portal');
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-[56px] bg-surf border-b border-b flex items-center px-6">
      <div className="flex items-center gap-2 mr-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-[30px] h-[30px] bg-acc rounded-[8px] flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-all">
            G
          </div>
          <span className="text-[17px] font-bold tracking-tight">GrievanceGPT</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center bg-bg border border-b rounded-full p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            onClick={(e) => handlePortalClick(e, tab.path)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-medium transition-all",
              location.pathname === tab.path 
                ? "bg-acc text-white shadow-lg shadow-acc/20" 
                : "text-tx2 hover:text-tx"
            )}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2 bg-grn/10 border border-grn/20 rounded-full px-3 py-1.5">
        <div className="pulsing-dot" />
        <span className="text-[11px] font-bold text-grn uppercase tracking-wider">100% Anonymous</span>
      </div>
    </nav>
  );
}
