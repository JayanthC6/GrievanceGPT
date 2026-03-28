import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Zap, 
  CheckCircle2, 
  BarChart3, 
  GitBranch, 
  Settings,
  Search,
  ExternalLink,
  ChevronRight,
  X,
  TrendingUp,
  AlertTriangle,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Download,
  ShieldCheck,
  UserPlus,
  Trash2,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstitution, StudentAccount, StudentStatus } from '../context/InstitutionContext';

export default function Dashboard() {
  const { studentAccounts, setStudentAccounts, institutionName, setInstitutionName, complaints, setComplaints } = useInstitution();
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [settings, setSettings] = useState({
    autoEscalate: true,
    emailNotifications: true,
    sheetsLogging: false,
    adminEmail: 'admin@dsce.edu.in'
  });

  const [newStudent, setNewStudent] = useState({ 
    email: '', 
    department: '', 
    password: `Temp@${Math.floor(10000 + Math.random() * 90000)}`,
    note: '',
    sendInstructions: true
  });
  const [showWelcomeCard, setShowWelcomeCard] = useState<{ email: string; pwd: string } | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const generatePwd = () => {
    const pwd = `Temp@${Math.floor(10000 + Math.random() * 90000)}`;
    setNewStudent({ ...newStudent, password: pwd });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.email || !newStudent.email.includes('@')) {
      // Validation handled by HTML5 but adding manual check
      return;
    }

    if (studentAccounts.some(s => s.email === newStudent.email)) {
      alert("An account with this email already exists");
      return;
    }

    const account: StudentAccount = {
      email: newStudent.email,
      department: newStudent.department,
      password: newStudent.password,
      status: 'First Login Pending',
      lastLogin: 'Never',
      note: newStudent.note
    };

    setStudentAccounts([account, ...studentAccounts]);
    
    if (newStudent.sendInstructions) {
      setShowWelcomeCard({ email: newStudent.email, pwd: newStudent.password });
    }

    setShowToast({ message: `Account created for ${newStudent.email} ✓`, type: 'success' });
    setTimeout(() => setShowToast(null), 2500);

    setNewStudent({ 
      email: '', 
      department: '', 
      password: `Temp@${Math.floor(10000 + Math.random() * 90000)}`,
      note: '',
      sendInstructions: true
    });
  };

  const copyCredentials = (email: string, pwd: string) => {
    const text = `━━━━━━━━━━━━━━━━━━━━━━━━━━━\nGrievanceGPT — Student Login\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nInstitution : ${settings.institutionName}\nPortal Link : grievancegpt.in/portal\nEmail       : ${email}\nPassword    : ${pwd}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚠ Please change your password after first login.\nYour complaints are 100% anonymous after login.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    navigator.clipboard.writeText(text);
    setShowToast({ message: "Copied ✓", type: 'success' });
    setTimeout(() => setShowToast(null), 1500);
  };

  const copyAllActiveCredentials = () => {
    const activeAccounts = studentAccounts.filter(s => s.status !== 'Revoked');
    const text = `GrievanceGPT Student Credentials\nInstitution: ${settings.institutionName}\nPortal: grievancegpt.in/portal\nGenerated: ${new Date().toLocaleDateString()}\n─────────────────────────────\n${activeAccounts.map(s => `${s.email} : ${s.status === 'Password Changed' ? '[Password Changed by student]' : s.password}`).join('\n')}\n─────────────────────────────\nShare this privately. Credentials expire if revoked.`;
    navigator.clipboard.writeText(text);
    setShowToast({ message: "All credentials copied ✓", type: 'success' });
    setTimeout(() => setShowToast(null), 2500);
  };

  const handleResetPassword = (email: string) => {
    const newPwd = `Temp@${Math.floor(10000 + Math.random() * 90000)}`;
    setStudentAccounts(prev => prev.map(s => s.email === email ? { ...s, password: newPwd, status: 'First Login Pending' } : s));
    setShowToast({ message: `Password reset for ${email} ✓`, type: 'success' });
    setTimeout(() => setShowToast(null), 2500);
  };

  const handleRevoke = (email: string) => {
    setStudentAccounts(prev => prev.map(s => s.email === email ? { ...s, status: 'Revoked' } : s));
  };

  const handleRestore = (email: string) => {
    setStudentAccounts(prev => prev.map(s => s.email === email ? { ...s, status: 'Active' } : s));
  };

  const handleBulkRevoke = () => {
    setStudentAccounts(prev => prev.map(s => selectedStudents.includes(s.email) ? { ...s, status: 'Revoked' } : s));
    setSelectedStudents([]);
  };

  const handleBulkReset = () => {
    setStudentAccounts(prev => prev.map(s => {
      if (selectedStudents.includes(s.email)) {
        return { ...s, password: `Temp@${Math.floor(10000 + Math.random() * 90000)}`, status: 'First Login Pending' };
      }
      return s;
    }));
    setSelectedStudents([]);
    setShowToast({ message: "Selected passwords reset ✓", type: 'success' });
    setTimeout(() => setShowToast(null), 2500);
  };

  const [authorityMap, setAuthorityMap] = useState([
    { dept: 'Hostel', email: 'deanofhostels@institution.edu', emoji: '🏠', editing: false },
    { dept: 'Academic', email: 'hod@institution.edu', emoji: '📚', editing: false },
    { dept: 'Canteen', email: 'canteen.sup@institution.edu', emoji: '🍱', editing: false },
    { dept: 'Harassment', email: 'principal@institution.edu', emoji: '⚖️', editing: false },
    { dept: 'Infrastructure', email: 'facilities@institution.edu', emoji: '🏗️', editing: false },
    { dept: 'Finance', email: 'finance@institution.edu', emoji: '💰', editing: false },
  ]);
  const [hasVisitedMap, setHasVisitedMap] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview' },
    { icon: ClipboardList, label: 'All Complaints', badge: complaints.filter(c => c.status === 'Open' || c.status === 'Under Review').length },
    { icon: Zap, label: 'Escalated', badge: complaints.filter(c => c.status === 'Escalated').length, color: 'text-red' },
    { icon: CheckCircle2, label: 'Resolved' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: GitBranch, label: 'Authority Map', badge: !hasVisitedMap ? '!' : null, badgeColor: 'bg-amb' },
    { icon: Settings, label: 'Settings' },
  ];

  const kpis = [
    { label: 'This month total', val: complaints.length.toString(), delta: '+12%', up: true },
    { label: 'Pending', val: complaints.filter(c => c.status === 'Open' || c.status === 'Under Review').length.toString(), delta: '+2', up: true, color: 'text-red' },
    { label: 'Resolved', val: complaints.filter(c => c.status === 'Resolved').length.toString(), delta: '84%', up: false, color: 'text-grn' },
    { label: 'Escalation window', val: '48h', delta: 'Strict', up: false },
  ];

  const filteredComplaints = complaints.filter(c => {
    const matchesFilter = filter === 'All' || c.category === filter || (filter === 'Escalated' && c.status === 'Escalated');
    const matchesSearch = (c.title || '').toLowerCase().includes((search || '').toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = (id: string, newStatus: any) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedComplaint?.id === id) {
      setSelectedComplaint({ ...selectedComplaint, status: newStatus });
    }
  };

  const [newUpdate, setNewUpdate] = useState('');
  const handleAddUpdate = (id: string) => {
    if (!newUpdate.trim()) return;
    const update = {
      id: Math.random().toString(36).substr(2, 9),
      date: 'Just now',
      message: newUpdate,
      author: 'Grievance Cell'
    };
    setComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, updates: [...c.updates, update] } : c
    ));
    if (selectedComplaint?.id === id) {
      setSelectedComplaint({ ...selectedComplaint, updates: [...selectedComplaint.updates, update] });
    }
    setNewUpdate('');
  };

  const handleSaveSettings = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="card-base p-6">
                <h4 className="text-sm font-bold mb-6 text-tx3 uppercase tracking-widest">Complaints by Category</h4>
                <div className="space-y-4">
                  {['Hostel', 'Academic', 'Canteen', 'Infrastructure', 'Finance', 'Harassment'].map(cat => {
                    const count = complaints.filter(c => c.category === cat).length;
                    const percent = (count / complaints.length) * 100;
                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>{cat}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-1.5 bg-b rounded-full overflow-hidden">
                          <div className="h-full bg-acc rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="card-base p-6 flex flex-col items-center justify-center text-center">
                <h4 className="text-sm font-bold mb-6 text-tx3 uppercase tracking-widest">Resolution Rate</h4>
                {(() => {
                  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
                  const rate = complaints.length > 0 ? Math.round((resolvedCount / complaints.length) * 100) : 0;
                  const circumference = 2 * Math.PI * 58;
                  const offset = circumference - (rate / 100) * circumference;
                  return (
                    <>
                      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-b" />
                          <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} className="text-acc" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold">{rate}%</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-tx3 font-medium">of complaints resolved this month</p>
                    </>
                  );
                })()}
              </div>
              <div className="card-base p-6 flex flex-col items-center justify-center text-center">
                <h4 className="text-sm font-bold mb-6 text-tx3 uppercase tracking-widest">Avg Resolution Time</h4>
                {(() => {
                  // Mocking resolution time based on status
                  const resolved = complaints.filter(c => c.status === 'Resolved');
                  const avgTime = resolved.length > 0 ? (2.4 - (resolved.length * 0.1)).toFixed(1) : "N/A";
                  return (
                    <>
                      <div className="text-5xl font-bold text-acc mb-2 tracking-tighter">{avgTime}{avgTime !== "N/A" ? "d" : ""}</div>
                      <p className="text-[11px] text-tx3 font-medium">average across resolved complaints</p>
                    </>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        );
      case 'Authority Map':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-base p-0 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-b text-[10px] font-bold text-tx3 uppercase tracking-widest">
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Authority Email</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {authorityMap.map((item, i) => (
                  <tr key={i} className="border-b border-b/50">
                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                      <span>{item.emoji}</span> {item.dept}
                    </td>
                    <td className="px-6 py-4">
                      {item.editing ? (
                        <input 
                          type="email" 
                          defaultValue={item.email}
                          className="input-base py-1 px-2 text-xs w-full max-w-xs"
                          onBlur={(e) => {
                            const newMap = [...authorityMap];
                            newMap[i].email = e.target.value;
                            newMap[i].editing = false;
                            setAuthorityMap(newMap);
                          }}
                        />
                      ) : (
                        <span className="text-tx2">{item.email}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.editing ? (
                        <button 
                          onClick={() => {
                            const newMap = [...authorityMap];
                            newMap[i].editing = false;
                            setAuthorityMap(newMap);
                          }}
                          className="text-grn font-bold text-xs hover:underline"
                        >
                          Save
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            const newMap = [...authorityMap];
                            newMap[i].editing = true;
                            setAuthorityMap(newMap);
                          }}
                          className="btn-ghost py-1 px-3 text-xs"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        );
      case 'Settings':
        const activeCount = studentAccounts.filter(s => s.status !== 'Revoked').length;
        const filteredStudents = studentAccounts.filter(s => (s.email || '').toLowerCase().includes((studentSearch || '').toLowerCase()));

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl pb-20">
            <div className="card-base p-8 space-y-12">
              {/* Institution Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Institution Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-tx3 uppercase tracking-widest">Institution Name</label>
                    <input 
                      type="text" 
                      value={institutionName} 
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="input-base w-full" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-tx3 uppercase tracking-widest">Admin Email</label>
                    <input 
                      type="email" 
                      value={settings.adminEmail} 
                      onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                      className="input-base w-full" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'autoEscalate', label: 'Auto-escalation after 48h', desc: 'Forward to Principal if no action taken' },
                    { id: 'emailNotifications', label: 'Email notifications', desc: 'Send alerts to authorities on new complaints' },
                    { id: 'sheetsLogging', label: 'Google Sheets logging', desc: 'Sync all grievances to institutional sheet' },
                  ].map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-b/10 rounded-[12px]">
                      <div>
                        <div className="text-sm font-bold">{s.label}</div>
                        <div className="text-[11px] text-tx3">{s.desc}</div>
                      </div>
                      <div 
                        onClick={() => setSettings({...settings, [s.id]: !settings[s.id as keyof typeof settings]})}
                        className={cn(
                          "w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300",
                          settings[s.id as keyof typeof settings] ? "bg-grn" : "bg-b"
                        )}
                      >
                        <motion.div 
                          animate={{ x: settings[s.id as keyof typeof settings] ? 22 : 4 }}
                          className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveSettings} className="btn-primary w-full py-4">Save Institution Settings</button>
              </div>

              {/* Student Account Management */}
              <div className="pt-12 border-t border-b/30 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[18px] font-bold">Student Account Management</h3>
                    <p className="text-[13px] text-tx3">Create and manage login credentials for your students. Only students with an account here can access your grievance portal.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-grn/10 border border-grn/20 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-grn animate-pulse" />
                    <span className="text-[11px] font-bold text-grn uppercase tracking-wider">{activeCount} Active Accounts</span>
                  </div>
                </div>

                {/* Create New Account Form */}
                <div className="card-base p-6 border-l-4 border-l-acc">
                  <h4 className="text-[14px] font-bold mb-6">Create New Student Account</h4>
                  <form onSubmit={handleAddStudent} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-tx3 uppercase tracking-widest">Student Email</label>
                        <input 
                          type="email" 
                          placeholder="firstname.lastname@dsce.edu.in"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                          className="input-base w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-tx3 uppercase tracking-widest">Department / Class</label>
                        <input 
                          type="text" 
                          placeholder="CSE - 3rd Year"
                          value={newStudent.department}
                          onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                          className="input-base w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-tx3 uppercase tracking-widest">Temporary Password</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                            className="input-base flex-1 font-mono"
                            required
                          />
                          <button 
                            type="button"
                            onClick={generatePwd}
                            className="btn-ghost px-3 flex items-center justify-center"
                            title="Auto-generate"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-tx3 uppercase tracking-widest">Account Note</label>
                        <input 
                          type="text" 
                          placeholder="Shared via WhatsApp on 27 Mar"
                          value={newStudent.note}
                          onChange={(e) => setNewStudent({...newStudent, note: e.target.value})}
                          className="input-base w-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={newStudent.sendInstructions}
                            onChange={(e) => setNewStudent({...newStudent, sendInstructions: e.target.checked})}
                            className="peer hidden"
                          />
                          <div className="w-5 h-5 border-2 border-b rounded transition-all peer-checked:bg-acc peer-checked:border-acc" />
                          <CheckCircle2 className="w-3.5 h-3.5 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-[13px] font-medium text-tx2 group-hover:text-tx transition-colors">Send welcome instructions</span>
                      </label>
                      <p className="text-[11px] text-tx3 italic">Show setup instructions after creating account</p>
                    </div>

                    <button type="submit" className="btn-primary w-full py-4 text-base font-bold">
                      Create Account <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                {/* Welcome Instructions Card */}
                <AnimatePresence>
                  {showWelcomeCard && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="card-base p-6 border-t-4 border-t-grn bg-grn/5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[14px] font-bold text-grn">Share these credentials with the student</h4>
                        <button onClick={() => setShowWelcomeCard(null)} className="text-tx3 hover:text-tx">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-surf border border-b rounded-lg p-6 font-mono text-[13px] leading-relaxed mb-6 shadow-inner">
                        <div className="text-center mb-4 text-tx3">━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                        <div className="text-center font-bold mb-4">GrievanceGPT — Student Login</div>
                        <div className="text-center mb-4 text-tx3">━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                        <div className="grid grid-cols-[100px_1fr] gap-y-1">
                          <span className="text-tx3">Institution :</span> <span>{institutionName}</span>
                          <span className="text-tx3">Portal Link :</span> <span>grievancegpt.in/portal</span>
                          <span className="text-tx3">Email       :</span> <span className="font-bold">{showWelcomeCard.email}</span>
                          <span className="text-tx3">Password    :</span> <span className="font-bold">{showWelcomeCard.pwd}</span>
                        </div>
                        <div className="text-center mt-4 text-tx3">━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                        <div className="text-center text-[11px] mt-2 text-amb font-bold">⚠ Please change your password after first login.</div>
                        <div className="text-center text-[11px] text-tx3">Your complaints are 100% anonymous after login.</div>
                        <div className="text-center mt-2 text-tx3">━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => copyCredentials(showWelcomeCard.email, showWelcomeCard.pwd)}
                          className="btn-ghost text-acc border-acc/20 hover:bg-acc/5"
                        >
                          <Copy className="w-4 h-4" /> Copy credentials →
                        </button>
                        <button 
                          onClick={() => setShowWelcomeCard(null)}
                          className="text-[13px] font-medium text-tx3 hover:text-tx transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Student Accounts Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[14px] font-bold">All Student Accounts</h4>
                    <div className="relative">
                      <Search className="w-4 h-4 text-tx3 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search by email..." 
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="input-base py-2 pl-9 text-xs w-64" 
                      />
                    </div>
                  </div>

                  {/* Bulk Actions Bar */}
                  <div className="flex items-center justify-between bg-b/10 p-3 rounded-lg border border-b/30">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents(filteredStudents.map(s => s.email));
                              } else {
                                setSelectedStudents([]);
                              }
                            }}
                            className="peer hidden"
                          />
                          <div className="w-4 h-4 border-2 border-b rounded transition-all peer-checked:bg-acc peer-checked:border-acc" />
                          <CheckCircle2 className="w-3 h-3 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-[12px] font-bold text-tx3 uppercase tracking-wider group-hover:text-tx transition-colors">Select All</span>
                      </label>
                      
                      {selectedStudents.length > 0 && (
                        <div className="flex items-center gap-3 pl-4 border-l border-b/50">
                          <span className="text-[12px] font-bold text-acc">{selectedStudents.length} selected</span>
                          <button onClick={handleBulkReset} className="btn-ghost py-1 px-3 text-[10px] border-acc/20 text-acc">
                            Reset Selected Passwords
                          </button>
                          <button onClick={handleBulkRevoke} className="btn-ghost py-1 px-3 text-[10px] border-red/20 text-red">
                            Revoke Selected
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => {
                        setShowToast({ message: "CSV exported ✓", type: 'success' });
                        setTimeout(() => setShowToast(null), 2500);
                      }}
                      className="btn-ghost py-1.5 px-3 text-[10px] flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV →
                    </button>
                  </div>

                  <div className="card-base p-0 overflow-hidden border border-b/30">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-b/20 text-[10px] font-bold text-tx3 uppercase tracking-widest">
                          <th className="px-6 py-4 w-10"></th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Department</th>
                          <th className="px-6 py-4">Temp Password</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Last Login</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-[13px]">
                        <AnimatePresence initial={false}>
                          {filteredStudents.map((s, i) => (
                            <motion.tr 
                              key={s.email}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: s.status === 'Revoked' ? 0.4 : 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={cn(
                                "border-t border-b/30 hover:bg-b/5 transition-all",
                                s.status === 'Revoked' && "bg-b/10"
                              )}
                            >
                              <td className="px-6 py-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                  <div className="relative flex items-center">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedStudents.includes(s.email)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedStudents([...selectedStudents, s.email]);
                                        } else {
                                          setSelectedStudents(selectedStudents.filter(email => email !== s.email));
                                        }
                                      }}
                                      className="peer hidden"
                                    />
                                    <div className="w-4 h-4 border-2 border-b rounded transition-all peer-checked:bg-acc peer-checked:border-acc" />
                                    <CheckCircle2 className="w-3 h-3 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-all" />
                                  </div>
                                </label>
                              </td>
                              <td className="px-6 py-4 font-semibold">{s.email}</td>
                              <td className="px-6 py-4 text-tx3 text-[12px]">{s.department}</td>
                              <td className="px-6 py-4 font-mono text-[12px] text-tx3">
                                <div className="flex items-center gap-2">
                                  <span>{showPasswords[s.email] ? s.password : '••••••••'}</span>
                                  <button 
                                    onClick={() => setShowPasswords(prev => ({ ...prev, [s.email]: !prev[s.email] }))}
                                    className="p-1 hover:bg-b/50 rounded transition-colors text-acc"
                                  >
                                    {showPasswords[s.email] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                  s.status === 'First Login Pending' && "bg-amb/10 text-amb",
                                  s.status === 'Active' && "bg-grn/10 text-grn",
                                  s.status === 'Password Changed' && "bg-acc/10 text-acc",
                                  s.status === 'Revoked' && "bg-red/10 text-red",
                                )}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-tx3 text-[12px]">{s.lastLogin}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {s.status === 'Revoked' ? (
                                    <button 
                                      onClick={() => handleRestore(s.email)}
                                      className="btn-ghost py-1 px-3 text-[10px] border-grn/20 text-grn"
                                    >
                                      <RotateCcw className="w-3 h-3" /> Restore
                                    </button>
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => handleResetPassword(s.email)}
                                        className="btn-ghost py-1 px-3 text-[10px] border-b/30 text-tx3"
                                      >
                                        Reset Password
                                      </button>
                                      <button 
                                        onClick={() => handleRevoke(s.email)}
                                        className="btn-ghost py-1 px-3 text-[10px] border-red/20 text-red hover:bg-red/5"
                                      >
                                        Revoke
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={copyAllActiveCredentials}
                      className="btn-ghost text-acc border-acc/20 hover:bg-acc/5 py-3 px-8 text-sm font-bold"
                    >
                      Copy all active credentials →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default: // Overview, All Complaints, Escalated, Resolved
        const showKPIs = activeTab === 'Overview';
        const showPatterns = activeTab === 'Overview';
        const displayComplaints = activeTab === 'Escalated' 
          ? complaints.filter(c => c.status === 'Escalated')
          : activeTab === 'Resolved'
            ? complaints.filter(c => c.status === 'Resolved')
            : filteredComplaints;

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {showKPIs && (
              <div className="grid grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                  <div key={i} className="card-base p-5">
                    <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-2">{k.label}</div>
                    <div className={cn("text-3xl font-bold mb-1", k.color)}>{k.val}</div>
                    <div className={cn("text-[10px] font-bold", k.up ? "text-red" : "text-grn")}>
                      {k.delta} <span className="text-tx3 font-medium">from last week</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {['All', 'Hostel', 'Academic', 'Canteen', 'Escalated'].map(f => (
                  <button 
                    key={f} 
                    onClick={() => {
                      setFilter(f);
                      setSearch('');
                    }}
                    className={cn(
                      "pill", 
                      filter === f ? "bg-acc text-white border-acc" : "hover:border-acc/50"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-tx3 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search complaints..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-base py-2 pl-9 text-xs w-64" 
                />
              </div>
            </div>

            <div className="card-base p-0 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-b text-[10px] font-bold text-tx3 uppercase tracking-widest">
                    <th className="px-6 py-4">Ref ID</th>
                    <th className="px-6 py-4">Complaint Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Filed</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {displayComplaints.length > 0 ? displayComplaints.map((c, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedComplaint(c)}
                      className="border-b border-b/50 hover:bg-b/10 transition-all cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-bold text-acc text-[11px]">{c.id}</td>
                      <td className="px-6 py-4 text-tx max-w-[240px] truncate">{c.title}</td>
                      <td className="px-6 py-4 text-tx2">{c.category}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                          c.status === 'Open' && "bg-amb/10 border-amb/20 text-amb",
                          c.status === 'Under Review' && "bg-acc/10 border-acc/20 text-acc",
                          c.status === 'Resolved' && "bg-grn/10 border-grn/20 text-grn",
                          c.status === 'Escalated' && "bg-red/10 border-red/20 text-red",
                        )}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-tx3">{c.filed}</td>
                      <td className="px-6 py-4">
                        <button className="btn-ghost py-1 px-3 text-[10px] opacity-0 group-hover:opacity-100 transition-all">View</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-tx3 italic">
                        {search ? "No complaints match your search" : activeTab === 'Escalated' ? "No escalated complaints right now ✓" : "No complaints found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {showPatterns && (
              <div className="grid grid-cols-3 gap-4">
                <div className="card-base p-5 border-l-4 border-l-red">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-red" />
                    <span className="text-xs font-bold uppercase tracking-wider">Trending Issue</span>
                  </div>
                  <div className="font-bold text-sm mb-1">Hostel Water Supply</div>
                  <div className="text-[11px] text-tx3">4 similar complaints in last 12 hours from Block B.</div>
                </div>
                <div className="card-base p-5 border-l-4 border-l-amb">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amb" />
                    <span className="text-xs font-bold uppercase tracking-wider">Recurring Pattern</span>
                  </div>
                  <div className="font-bold text-sm mb-1">Canteen Hygiene</div>
                  <div className="text-[11px] text-tx3">Spikes every Wednesday during lunch hours.</div>
                </div>
                <div className="card-base p-5 border-l-4 border-l-grn">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-grn" />
                    <span className="text-xs font-bold uppercase tracking-wider">Resolved Fast</span>
                  </div>
                  <div className="font-bold text-sm mb-1">Library Wi-Fi</div>
                  <div className="text-[11px] text-tx3">Infrastructure issues are being resolved in avg 4h.</div>
                </div>
              </div>
            )}
          </motion.div>
        );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-surf border-r border-b shrink-0 py-6 flex flex-col">
        <div className="px-6 mb-8">
          <div className="font-bold text-sm">Stanford University</div>
          <div className="text-[10px] text-tx3 font-semibold uppercase tracking-wider">Grievance Cell · Admin</div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveTab(item.label);
                if (item.label === 'Authority Map') setHasVisitedMap(true);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-2.5 text-[13px] font-medium transition-all relative",
                activeTab === item.label 
                  ? "text-acc bg-acc/5 border-l-2 border-acc" 
                  : "text-tx2 hover:text-tx hover:bg-b/20"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span className={cn(
                  "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  item.badgeColor || "bg-red text-white"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 custom-scrollbar overflow-y-auto bg-bg/50">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1 tracking-tight">
              {activeTab === 'Overview' ? 'Good morning, Grievance Cell 👋' : activeTab}
            </h2>
            <p className="text-tx2 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {complaints.filter(c => c.status !== 'Resolved').length} pending actions
            </p>
          </div>
          <Link to="/portal" className="btn-ghost text-xs py-2">
            View student portal <ExternalLink className="w-3 h-3" />
          </Link>
        </header>

        <AnimatePresence mode="wait">
          <div key={activeTab}>
            {renderContent()}
          </div>
        </AnimatePresence>
      </main>

      {/* Side Drawer */}
      <AnimatePresence>
        {selectedComplaint && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[380px] bg-surf border-l border-b z-[70] p-8 shadow-2xl overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="text-[11px] font-bold text-acc uppercase tracking-widest">{selectedComplaint.id}</div>
                <button onClick={() => setSelectedComplaint(null)} className="text-tx3 hover:text-tx transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 leading-tight">{selectedComplaint.title}</h3>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                    selectedComplaint.status === 'Open' && "bg-amb/10 border-amb/20 text-amb",
                    selectedComplaint.status === 'Under Review' && "bg-acc/10 border-acc/20 text-acc",
                    selectedComplaint.status === 'Resolved' && "bg-grn/10 border-grn/20 text-grn",
                    selectedComplaint.status === 'Escalated' && "bg-red/10 border-red/20 text-red",
                  )}>
                    {selectedComplaint.status}
                  </span>
                  <span className="text-tx3 text-[11px] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {selectedComplaint.filed}
                  </span>
                </div>
              </div>

              {/* Formal Letter Preview */}
              <div className="card-base bg-bg border-acc/20 p-5 mb-8">
                <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-4 border-b border-b pb-2">Formal Letter Preview</div>
                <div className="space-y-4 text-[12px] leading-relaxed">
                  <div className="flex justify-between">
                    <span className="font-bold">To:</span>
                    <span className="text-tx2">The Dean of {selectedComplaint.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Date:</span>
                    <span className="text-tx2">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="border-l-2 border-acc pl-3 py-1 font-bold text-tx">
                    Subject: Formal Grievance regarding {selectedComplaint.category}
                  </div>
                  <p className="text-tx2 italic">
                    "{selectedComplaint.description}"
                  </p>
                  <div className="pt-4 border-t border-b/30 text-tx3 font-bold uppercase tracking-widest text-[10px]">
                    Yours faithfully, Anonymous Student
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Timeline & Updates</label>
                  <div className="space-y-4 mb-4">
                    {selectedComplaint.updates?.map((u: any) => (
                      <div key={u.id} className="relative pl-4 border-l border-acc/30 py-1">
                        <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-acc" />
                        <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest flex justify-between">
                          <span>{u.author}</span>
                          <span>{u.date}</span>
                        </div>
                        <p className="text-[12px] text-tx2 mt-1">{u.message}</p>
                      </div>
                    ))}
                    {(!selectedComplaint.updates || selectedComplaint.updates.length === 0) && (
                      <p className="text-[11px] text-tx3 italic">No updates yet.</p>
                    )}
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      placeholder="Add an update or action taken..."
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                      className="input-base min-h-[80px] text-sm resize-none pr-12"
                    />
                    <button 
                      onClick={() => handleAddUpdate(selectedComplaint.id)}
                      disabled={!newUpdate.trim()}
                      className="absolute right-2 bottom-2 p-2 bg-acc text-white rounded-lg disabled:opacity-50 hover:bg-acc/90 transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Update Status</label>
                  <select 
                    value={selectedComplaint.status}
                    onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                    className="input-base py-2 text-sm"
                  >
                    <option>Open</option>
                    <option>Under Review</option>
                    <option>Resolved</option>
                    <option>Escalated</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    handleStatusChange(selectedComplaint.id, 'Resolved');
                    handleAddUpdate(selectedComplaint.id); // Add a final resolution update if needed
                    setSelectedComplaint(null);
                  }}
                  className="btn-primary w-full bg-grn hover:bg-grn/90"
                >
                  Mark as Resolved <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-8 right-8 px-6 py-3 rounded-full font-bold text-sm shadow-xl z-[100] flex items-center gap-2",
              showToast.type === 'success' ? "bg-grn text-white" : "bg-red text-white"
            )}
          >
            {showToast.message} <CheckCircle2 className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
