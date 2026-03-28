import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInstitution } from '../context/InstitutionContext';
import { cn } from '../lib/utils';


export default function StudentLoginModal() {
  const { isLoginModalOpen, setIsLoginModalOpen, setStudentAuth, studentAccounts, institutionName, registerStudent, resetPassword } = useInstitution();
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ field: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDepartment('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network call
    await new Promise(resolve => setTimeout(resolve, 800));

    const student = studentAccounts.find(s => s.email === email);

    if (!student) {
      setError({ field: 'email', message: "No account found with this email. Check with your institution admin." });
      setIsLoading(false);
      return;
    }

    if (student.status === 'Revoked') {
      setError({ field: 'email', message: "This account has been revoked. Please contact your institution admin." });
      setIsLoading(false);
      return;
    }

    if (student.password !== password) {
      setError({ field: 'password', message: "Incorrect password. Contact your institution admin if you've forgotten it." });
      setIsLoading(false);
      return;
    }

    // Success
    setStudentAuth({
      email: student.email,
      institution: institutionName
    });
    setIsLoginModalOpen(false);
    setIsLoading(false);
    navigate('/portal');
    
    // Reset form
    resetForm();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await registerStudent(email, department, password);
    
    if (result.success) {
      setSuccessMessage("Account created! You can now login.");
      setTimeout(() => {
        setView('login');
        setSuccessMessage(null);
      }, 2000);
    } else {
      setError({ field: 'email', message: result.message });
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await resetPassword(email, password);
    
    if (result.success) {
      setSuccessMessage("Password reset successfully! You can now login.");
      setTimeout(() => {
        setView('login');
        setSuccessMessage(null);
      }, 2000);
    } else {
      setError({ field: 'email', message: result.message });
    }
    setIsLoading(false);
  };

  if (!isLoginModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setIsLoginModalOpen(false);
            setView('login');
            resetForm();
          }}
          className="absolute inset-0 bg-surf/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[420px] bg-card border border-b rounded-[24px] shadow-2xl overflow-hidden"
        >
          <button 
            onClick={() => {
              setIsLoginModalOpen(false);
              setView('login');
              resetForm();
            }}
            className="absolute right-4 top-4 p-2 hover:bg-b/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-tx3" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-[44px] h-[44px] bg-acc rounded-[12px] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-acc/20">
                G
              </div>
              <h2 className="text-[22px] font-bold tracking-tight mb-1">
                {view === 'login' ? 'Student Login' : view === 'register' ? 'Student Registration' : 'Reset Password'}
              </h2>
              <p className="text-[13px] text-tx2">
                {view === 'login' 
                  ? 'Use the email and password provided by your institution' 
                  : view === 'register' 
                    ? 'Create an account to start filing grievances'
                    : 'Enter your email and a new password to reset'}
              </p>
            </div>

            {successMessage && (
              <div className="bg-green/10 border border-green/20 rounded-[12px] p-3 mb-6 text-center">
                <p className="text-[12px] font-bold text-green uppercase tracking-wider">{successMessage}</p>
              </div>
            )}

            <div className="bg-acc/5 border border-acc/20 rounded-[12px] p-3 mb-8 flex items-center gap-3">
              <Lock className="w-4 h-4 text-acc shrink-0" />
              <p className="text-[11px] font-medium text-acc leading-tight">
                Your identity is used only to verify enrollment. Complaints are filed anonymously.
              </p>
            </div>

            {/* Form */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider ml-1">Institution Email</label>
                  <input 
                    type="email" 
                    placeholder="yourname@dsce.edu.in"
                    className={cn(
                      "input-base w-full",
                      error?.field === 'email' && "border-red focus:ring-red/20"
                    )}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  {error?.field === 'email' && (
                    <p className="text-[11px] font-bold text-red uppercase tracking-wider ml-1 mt-1">{error.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Password</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setView('forgot-password');
                        setError(null);
                      }}
                      className="text-[11px] font-bold text-tx3 hover:text-acc transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className={cn(
                        "input-base w-full pr-12",
                        error?.field === 'password' && "border-red focus:ring-red/20"
                      )}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-b/50 rounded-md text-tx3 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error?.field === 'password' && (
                    <p className="text-[11px] font-bold text-red uppercase tracking-wider ml-1 mt-1">{error.message}</p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="btn-primary w-full h-[48px] text-base font-bold shadow-lg shadow-acc/20 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Login & Continue <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>
              </form>
            )}

            {view === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider ml-1">Institution Email</label>
                  <input 
                    type="email" 
                    placeholder="yourname@dsce.edu.in"
                    className={cn(
                      "input-base w-full",
                      error?.field === 'email' && "border-red focus:ring-red/20"
                    )}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  {error?.field === 'email' && (
                    <p className="text-[11px] font-bold text-red uppercase tracking-wider ml-1 mt-1">{error.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider ml-1">Department / Year</label>
                  <input 
                    type="text" 
                    placeholder="CSE 3rd Year"
                    className="input-base w-full"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider ml-1">Create Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="input-base w-full pr-12"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-b/50 rounded-md text-tx3 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || !email || !password || !department}
                  className="btn-primary w-full h-[48px] text-base font-bold shadow-lg shadow-acc/20 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Registering...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError(null);
                  }}
                  className="w-full text-center text-[11px] font-bold text-tx3 hover:text-acc uppercase tracking-widest transition-colors"
                >
                  Already have an account? Login
                </button>
              </form>
            )}

            {view === 'forgot-password' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider ml-1">Institution Email</label>
                  <input 
                    type="email" 
                    placeholder="yourname@dsce.edu.in"
                    className={cn(
                      "input-base w-full",
                      error?.field === 'email' && "border-red focus:ring-red/20"
                    )}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  {error?.field === 'email' && (
                    <p className="text-[11px] font-bold text-red uppercase tracking-wider ml-1 mt-1">{error.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider ml-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="input-base w-full pr-12"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-b/50 rounded-md text-tx3 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="btn-primary w-full h-[48px] text-base font-bold shadow-lg shadow-acc/20 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Resetting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Reset Password <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError(null);
                  }}
                  className="w-full text-center text-[11px] font-bold text-tx3 hover:text-acc uppercase tracking-widest transition-colors"
                >
                  Back to Login
                </button>
              </form>
            )}

            {view === 'login' && (
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-b"></div>
                </div>
                <div className="relative flex justify-center text-[11px] font-bold uppercase tracking-widest">
                  <span className="bg-card px-3 text-tx3">Don't have credentials?</span>
                </div>
              </div>
            )}

            {view === 'login' && (
              <button 
                onClick={() => {
                  setView('register');
                  setError(null);
                }}
                className="w-full h-[48px] border border-b hover:bg-b/50 rounded-[12px] text-[13px] font-bold transition-all mb-6"
              >
                Register New Account
              </button>
            )}

            <p className="text-center text-[11px] text-tx3 font-medium leading-relaxed">
              Your login session is temporary. No personal data is stored after you close this tab.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
