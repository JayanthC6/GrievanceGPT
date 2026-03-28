import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  Send, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff,
  Clock,
  ArrowRight,
  Info,
  LogOut,
  Settings,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processComplaint, FormalComplaint } from '../services/aiService';
import { cn } from '../lib/utils';
import { useInstitution } from '../context/InstitutionContext';

export default function StudentPortal() {
  const navigate = useNavigate();
  const { 
    studentAuth, 
    setStudentAuth, 
    setIsLoginModalOpen, 
    studentAccounts, 
    setStudentAccounts, 
    complaints, 
    addComplaint,
    draftComplaint,
    setDraftComplaint,
    draftAnalysis,
    setDraftAnalysis
  } = useInstitution();
  
  const [category, setCategory] = useState('Other');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [activePortalTab, setActivePortalTab] = useState<'file' | 'track'>('file');
  const [selectedTrackedComplaint, setSelectedTrackedComplaint] = useState<any>(null);

  // Filter complaints for the current student
  const myComplaints = complaints.filter(c => c.studentEmail === studentAuth?.email);

  // Account & Password State
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwdData, setPwdData] = useState({ current: '', new: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [pwdStatus, setPwdStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  useEffect(() => {
    if (!studentAuth) {
      setIsLoginModalOpen(true);
      navigate('/');
    }
  }, [studentAuth, navigate, setIsLoginModalOpen]);

  const handleLogout = () => {
    setStudentAuth(null);
    navigate('/');
  };

  const getPwdStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Weak', color: 'bg-b' };
    let score = 0;
    if (pwd.length >= 8) score += 33;
    if (/[0-9]/.test(pwd)) score += 33;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 34;
    
    if (score <= 33) return { score, label: 'Weak', color: 'bg-red' };
    if (score <= 66) return { score, label: 'Medium', color: 'bg-amb' };
    return { score, label: 'Strong', color: 'bg-grn' };
  };

  const pwdStrength = getPwdStrength(pwdData.new);

  const handleUpdatePassword = async () => {
    if (!studentAuth) return;

    const student = studentAccounts.find(s => s.email === studentAuth.email);
    
    if (!student || student.password !== pwdData.current) {
      setPwdStatus({ type: 'error', message: 'Current password is incorrect' });
      return;
    }

    if (pwdData.new !== pwdData.confirm) {
      setPwdStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    // Update in context
    setStudentAccounts(prev => prev.map(s => 
      s.email === studentAuth.email 
        ? { ...s, password: pwdData.new, status: 'Password Changed' } 
        : s
    ));

    setPwdStatus({ type: 'success', message: 'Password updated successfully ✓' });
    setTimeout(() => {
      setShowChangePassword(false);
      setPwdStatus(null);
      setPwdData({ current: '', new: '', confirm: '' });
    }, 2500);
  };

  const categories = [
    'Academic', 'Hostel', 'Harassment', 'Facilities', 'Financial', 'Ragging', 'Other'
  ];

  const handleAnalyze = async () => {
    if (!draftComplaint.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await processComplaint(draftComplaint);
      setDraftAnalysis(result);
      // Update the category state with AI's suggestion
      if (result.category) {
        setCategory(result.category);
      }
    } catch (error) {
      console.error(error);
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze complaint. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Clear analysis when text changes significantly
    if (draftAnalysis && draftComplaint.length < 10) {
      setDraftAnalysis(null);
    }
    if (analysisError) {
      setAnalysisError(null);
    }

    // Debounced auto-analysis
    const timer = setTimeout(() => {
      if (draftComplaint.trim().length > 30 && !draftAnalysis && !isAnalyzing) {
        handleAnalyze();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [draftComplaint]);

  const handleSubmit = async () => {
    if (!draftAnalysis || !studentAuth) return;
    setIsSubmitting(true);
    try {
      // 1. First save locally to ensure UI state is updated and we have a reference ID
      const refId = await addComplaint({
        studentEmail: studentAuth.email,
        title: (draftAnalysis as any).subject || (draftAnalysis as any).title || 'Untitled Grievance',
        category: category, // Use the manually selected or AI-suggested category state
        status: 'Open',
        priority: draftAnalysis.priority as any,
        description: draftComplaint,
        authority: draftAnalysis.authority
      });

      // 2. Attempt to send to n8n webhook
      try {
        const response = await fetch("https://jayanthc18.app.n8n.cloud/webhook/grievance-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submittedId: refId,
            studentEmail: studentAuth.email,
            title: (draftAnalysis as any).subject || (draftAnalysis as any).title || 'Untitled Grievance',
            category: category, // Use the manually selected or AI-suggested category state
            priority: draftAnalysis.priority,
            description: draftComplaint,
            authority: draftAnalysis.authority
          })
        });

        if (!response.ok) {
          console.warn("Webhook responded with error status:", response.status);
        }
      } catch (webhookError) {
        // We log the webhook error but don't stop the success flow 
        // because the complaint was already saved locally.
        console.error("Webhook submission failed:", webhookError);
      }

      // 3. Set the submitted ID to show the success screen
      setSubmittedId(refId);

    } catch (error) {
      console.error("Local submission failed:", error);
      alert("Failed to file complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!studentAuth) return null;

  if (submittedId) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-base p-12"
        >
          <div className="w-20 h-20 bg-grn/10 rounded-full flex items-center justify-center text-grn mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Complaint Filed Successfully</h2>
          <p className="text-tx2 mb-8">
            Your grievance has been encrypted and routed anonymously. 
            Please save your reference ID to track progress.
          </p>
          
          <div className="bg-b/30 p-6 rounded-[16px] border border-b mb-10">
            <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-2">Your Reference ID</div>
            <div className="text-3xl font-mono font-bold text-acc tracking-wider">{submittedId}</div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => { setActivePortalTab('track'); setSubmittedId(null); setDraftAnalysis(null); setDraftComplaint(''); }} className="btn-primary w-full">Track status <ArrowRight className="w-4 h-4" /></button>
            <button onClick={() => { setSubmittedId(null); setDraftAnalysis(null); setDraftComplaint(''); }} className="btn-ghost w-full">File another complaint</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Institution Banner */}
      <div className="bg-surf border-b border-b px-6 py-3">
        <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-[13px] font-medium">
            <span className="text-tx3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Filing to:
            </span>
            <div className="bg-acc/10 border border-acc/20 text-acc px-2.5 py-0.5 rounded-full font-bold">
              {studentAuth.institution}
            </div>
            <span className="text-tx3">·</span>
            <span className="text-tx2">Grievance Cell</span>
            <span className="text-tx3">·</span>
            <span className="text-tx3">Logged in as:</span>
            <div className="bg-card border border-b text-tx2 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
              {studentAuth.email}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-1.5 text-tx3 hover:text-tx transition-colors ml-2"
              >
                <Settings className="w-3.5 h-3.5" /> Account
              </button>
              
              <AnimatePresence>
                {showAccountMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-card border border-b rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        setShowChangePassword(true);
                        setShowAccountMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-[13px] font-medium hover:bg-b/50 transition-colors flex items-center justify-between group"
                    >
                      Change Password <ArrowRight className="w-3.5 h-3.5 text-tx3 group-hover:text-acc transition-colors" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-red/80 hover:text-red transition-colors ml-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>

          <div className="bg-grn/10 border border-grn/20 text-grn px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified enrollment · Complaint filed anonymously
          </div>
        </div>
      </div>

      {/* Change Password Panel */}
      <AnimatePresence>
        {showChangePassword && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card border-b border-b overflow-hidden"
          >
            <div className="max-w-[1100px] mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Change your password</h3>
                <button onClick={() => setShowChangePassword(false)} className="text-tx3 hover:text-tx">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showPwd.current ? "text" : "password"}
                      className="input-base w-full pr-10"
                      value={pwdData.current}
                      onChange={e => setPwdData({...pwdData, current: e.target.value})}
                    />
                    <button onClick={() => setShowPwd({...showPwd, current: !showPwd.current})} className="absolute right-3 top-1/2 -translate-y-1/2 text-tx3">
                      {showPwd.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPwd.new ? "text" : "password"}
                      className="input-base w-full pr-10"
                      value={pwdData.new}
                      onChange={e => setPwdData({...pwdData, new: e.target.value})}
                    />
                    <button onClick={() => setShowPwd({...showPwd, new: !showPwd.new})} className="absolute right-3 top-1/2 -translate-y-1/2 text-tx3">
                      {showPwd.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-tx3 uppercase tracking-wider">Strength: {pwdStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-b rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pwdStrength.score}%` }}
                        className={cn("h-full transition-all duration-500", pwdStrength.color)}
                      />
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {[
                        { label: 'At least 8 characters', met: pwdData.new.length >= 8 },
                        { label: 'Contains a number', met: /[0-9]/.test(pwdData.new) },
                        { label: 'Contains a special character (!@#$...)', met: /[!@#$%^&*(),.?":{}|<>]/.test(pwdData.new) },
                      ].map((req, i) => (
                        <div key={i} className={cn("flex items-center gap-2 text-[10px] font-bold uppercase transition-colors", req.met ? "text-grn" : "text-tx3")}>
                          <div className={cn("w-3.5 h-3.5 rounded-full border flex items-center justify-center", req.met ? "bg-grn border-grn text-white" : "border-b")}>
                            {req.met && <Check className="w-2.5 h-2.5" />}
                          </div>
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showPwd.confirm ? "text" : "password"}
                      className="input-base w-full pr-10"
                      value={pwdData.confirm}
                      onChange={e => setPwdData({...pwdData, confirm: e.target.value})}
                    />
                    <button onClick={() => setShowPwd({...showPwd, confirm: !showPwd.confirm})} className="absolute right-3 top-1/2 -translate-y-1/2 text-tx3">
                      {showPwd.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div>
                  {pwdStatus && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn("text-[12px] font-bold uppercase tracking-wider", pwdStatus.type === 'error' ? "text-red" : "text-grn")}
                    >
                      {pwdStatus.message}
                    </motion.p>
                  )}
                </div>
                <button 
                  onClick={handleUpdatePassword}
                  disabled={!pwdData.current || !pwdData.new || !pwdData.confirm || pwdData.new !== pwdData.confirm || pwdStrength.score < 66}
                  className="btn-primary bg-grn hover:bg-grn/90 disabled:opacity-50"
                >
                  Update Password <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        {/* Portal Tabs */}
        <div className="flex items-center gap-8 border-b border-b mb-12">
          <button 
            onClick={() => setActivePortalTab('file')}
            className={cn(
              "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative",
              activePortalTab === 'file' ? "text-acc" : "text-tx3 hover:text-tx"
            )}
          >
            File a Grievance
            {activePortalTab === 'file' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-acc" />}
          </button>
          <button 
            onClick={() => setActivePortalTab('track')}
            className={cn(
              "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative",
              activePortalTab === 'track' ? "text-acc" : "text-tx3 hover:text-tx"
            )}
          >
            Track My Complaints
            <span className="ml-2 bg-b px-1.5 py-0.5 rounded text-[10px]">{myComplaints.length}</span>
            {activePortalTab === 'track' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-acc" />}
          </button>
        </div>

        {activePortalTab === 'file' ? (
          <div className="grid lg:grid-cols-[1fr_350px] gap-12">
            {/* Left: Form */}
            <div>
              <div className="mb-8">
                <span className="text-[10px] font-bold text-acc uppercase tracking-widest mb-2 block">STEP 1: DESCRIBE ISSUE</span>
                <h1 className="text-3xl font-bold mb-3">What's on your mind?</h1>
                <p className="text-tx2">Describe your grievance in plain English. AI will handle the rest.</p>
              </div>

              <div className="space-y-8">
                {/* Category Selector */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                        category === c 
                          ? "bg-acc text-white border-acc shadow-lg shadow-acc/20" 
                          : "bg-surf text-tx3 border-b hover:border-acc/50"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="card-base p-1 relative">
                  <textarea
                    value={draftComplaint}
                    onChange={(e) => setDraftComplaint(e.target.value)}
                    placeholder="Type your complaint here... (e.g. The hostel water supply has been irregular for 3 days...)"
                    className="w-full bg-transparent border-none focus:ring-0 p-6 min-h-[200px] text-tx resize-none"
                  />
                  <div className="p-4 border-t border-b/30 flex justify-between items-center bg-surf/30 rounded-b-[16px]">
                    <div className="flex items-center gap-2 text-tx3 text-[11px] font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      No personal data is collected
                    </div>
                    <button 
                      onClick={handleAnalyze}
                      disabled={!draftComplaint.trim() || isAnalyzing}
                      className="btn-primary py-2 px-6"
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {analysisError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red/10 border border-red/20 rounded-xl p-4 flex items-center gap-3 text-red text-xs font-bold uppercase tracking-wider"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {analysisError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* AI Analysis Box */}
                <AnimatePresence>
                  {draftAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="space-y-6"
                    >
                      <div className="bg-acc/5 border border-acc/20 rounded-[20px] p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Sparkles className="w-5 h-5 text-acc" />
                          <h3 className="text-lg font-bold">AI Analysis</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                          <div>
                            <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1">Detected Category</div>
                            <div className="text-sm font-bold text-white">{category}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1">Priority</div>
                            <div className={cn(
                              "text-sm font-bold",
                              draftAnalysis.priority === 'Critical' ? "text-red" : 
                              draftAnalysis.priority === 'High' ? "text-amb" : "text-grn"
                            )}>
                              {draftAnalysis.priority}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1">Target Authority</div>
                            <div className="text-sm font-bold text-white">{draftAnalysis.authority}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1">Sentiment</div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                              {draftAnalysis.sentimentEmoji} {draftAnalysis.sentiment}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="btn-primary flex-1"
                          >
                            {isSubmitting ? "Filing..." : "File Anonymous Complaint"}
                          </button>
                          <button 
                            onClick={() => navigate('/preview', { state: { analysis: draftAnalysis, raw: draftComplaint } })}
                            className="btn-ghost flex-1"
                          >
                            <Eye className="w-4 h-4" /> Preview formal letter
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              <div className="card-base p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-acc" /> How it works
                </h4>
                <ul className="space-y-4">
                  {[
                    { icon: Sparkles, text: "AI converts your input into a formal letter" },
                    { icon: Send, text: "Routed to the correct authority automatically" },
                    { icon: Clock, text: "Auto-escalated if no action in 48 hours" }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-[13px] text-tx2 leading-relaxed">
                      <item.icon className="w-4 h-4 text-acc shrink-0 mt-0.5" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-base p-6 border-grn/20 bg-grn/5">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-grn">
                  <ShieldCheck className="w-4 h-4" /> Your protection
                </h4>
                <p className="text-[12px] text-tx2 leading-relaxed mb-4">
                  GrievanceGPT is built on a "Zero-Knowledge" architecture. We do not store:
                </p>
                <ul className="space-y-2">
                  {['Your IP Address', 'Your Name or Email', 'Your Device ID'].map(t => (
                    <li key={t} className="flex items-center gap-2 text-[11px] font-bold text-tx3 uppercase tracking-wider">
                      <div className="w-1 h-1 bg-grn rounded-full" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-3">Track your grievances</h1>
              <p className="text-tx2">Monitor the status and updates of your filed complaints.</p>
            </div>

            <div className="grid gap-4">
              {myComplaints.length > 0 ? myComplaints.map((c) => (
                <motion.div 
                  key={c.id}
                  layoutId={c.id}
                  onClick={() => setSelectedTrackedComplaint(c)}
                  className="card-base p-6 hover:border-acc/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-[11px] font-bold text-acc uppercase tracking-widest">{c.id}</div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                        c.status === 'Open' && "bg-amb/10 border-amb/20 text-amb",
                        c.status === 'Under Review' && "bg-acc/10 border-acc/20 text-acc",
                        c.status === 'Resolved' && "bg-grn/10 border-grn/20 text-grn",
                        c.status === 'Escalated' && "bg-red/10 border-red/20 text-red",
                      )}>
                        {c.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-tx3 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Filed {c.filedAt}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-acc transition-colors">{c.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Category: {c.category}</div>
                      <div className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Authority: {c.authority}</div>
                    </div>
                    <div className="text-[11px] font-bold text-acc uppercase tracking-widest flex items-center gap-1">
                      View Details <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="card-base p-12 text-center">
                  <div className="w-16 h-16 bg-b rounded-full flex items-center justify-center text-tx3 mx-auto mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No complaints filed yet</h3>
                  <p className="text-tx3 text-sm mb-6">When you file a grievance, it will appear here for tracking.</p>
                  <button onClick={() => setActivePortalTab('file')} className="btn-primary px-8">File your first grievance</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tracked Complaint Detail Drawer */}
      <AnimatePresence>
        {selectedTrackedComplaint && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrackedComplaint(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-surf border-l border-b z-[70] p-8 shadow-2xl overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="text-[11px] font-bold text-acc uppercase tracking-widest">{selectedTrackedComplaint.id}</div>
                <button onClick={() => setSelectedTrackedComplaint(null)} className="text-tx3 hover:text-tx transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-3 leading-tight">{selectedTrackedComplaint.title}</h3>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                    selectedTrackedComplaint.status === 'Open' && "bg-amb/10 border-amb/20 text-amb",
                    selectedTrackedComplaint.status === 'Under Review' && "bg-acc/10 border-acc/20 text-acc",
                    selectedTrackedComplaint.status === 'Resolved' && "bg-grn/10 border-grn/20 text-grn",
                    selectedTrackedComplaint.status === 'Escalated' && "bg-red/10 border-red/20 text-red",
                  )}>
                    {selectedTrackedComplaint.status}
                  </span>
                  <span className="text-tx3 text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Filed {selectedTrackedComplaint.filedAt}
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-2 block">Description</label>
                  <p className="text-sm text-tx2 leading-relaxed bg-b/30 p-4 rounded-xl border border-b italic">
                    "{selectedTrackedComplaint.description}"
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-4 block">Official Updates & Actions</label>
                  <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-b">
                    {selectedTrackedComplaint.updates?.map((u: any) => (
                      <div key={u.id} className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-acc border-4 border-surf shadow-sm" />
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider">{u.author}</span>
                          <span className="text-[10px] font-medium text-tx3">{u.date}</span>
                        </div>
                        <p className="text-[13px] text-tx2 leading-relaxed">{u.message}</p>
                      </div>
                    ))}
                    {(!selectedTrackedComplaint.updates || selectedTrackedComplaint.updates.length === 0) && (
                      <div className="pl-8 text-[12px] text-tx3 italic">Waiting for initial review by the grievance cell...</div>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-b">
                  <div className="flex items-center gap-3 text-tx3">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-[11px] font-medium">
                      If no action is taken within 48 hours, this grievance will be automatically escalated to the Principal's office.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {pwdStatus?.type === 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-grn text-white px-4 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2 z-[100]"
          >
            <Check className="w-4 h-4" /> {pwdStatus.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
