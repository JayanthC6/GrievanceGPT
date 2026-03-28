import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Megaphone, ShieldCheck, Zap, Clock, Lock, Send, PenTool, CheckCircle, MessageSquare, X, Bot, HelpCircle, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstitution } from '../context/InstitutionContext';
import { cn } from '../lib/utils';

export default function Landing() {
  const { setIsLoginModalOpen } = useInstitution();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStep, setChatStep] = useState<'initial' | 'answer'>('initial');
  const [currentAnswer, setCurrentAnswer] = useState('');

  const stats = [
    { val: '2.4d', label: 'Avg. resolution time' },
    { val: '94%', label: 'Complaints actioned' },
    { val: '100%', label: 'Anonymous by default' },
    { val: '48h', label: 'Auto-escalation window' },
  ];

  const helpOptions = [
    { 
      q: "How do I file a complaint?", 
      a: "Click 'File a complaint', log in with your student ID, and describe your issue. AI will handle the rest!" 
    },
    { 
      q: "Is it really anonymous?", 
      a: "Yes! We use zero-knowledge architecture. No personal data like IP or email is stored with your complaint." 
    },
    { 
      q: "Where can I track my complaint?", 
      a: "Once filed, go to 'Track My Complaints' in your student portal using your reference ID." 
    },
    { 
      q: "How to register my college?", 
      a: "Click 'Register your institution' on the home page to get started with a 3-month free trial." 
    }
  ];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-20 relative">
      {/* Hero */}
      <div className="text-center mb-24">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[1px] w-12 bg-b" />
          <span className="text-[10px] font-bold text-acc uppercase tracking-widest">AI-POWERED GRIEVANCE INFRASTRUCTURE</span>
          <div className="h-[1px] w-12 bg-b" />
        </div>
        
        <h1 className="text-[48px] font-extrabold leading-[1.1] tracking-[-2px] mb-6">
          Complaints that <br />
          <span className="text-acc2">actually get resolved.</span>
        </h1>
        
        <p className="text-tx2 text-base max-w-[480px] mx-auto mb-10 leading-relaxed">
          The first end-to-end anonymous grievance infrastructure for modern institutions. 
          Built to restore trust through AI-driven routing and auto-escalation.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary w-full sm:w-auto">
            Register your institution <ArrowRight className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="btn-ghost w-full sm:w-auto"
          >
            File a complaint
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 py-8 border-y border-b">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl font-bold mb-1">{s.val}</div>
            <div className="text-[11px] font-semibold text-tx3 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Entry Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-24">
        <Link to="/register" className="card-base group hover:border-grn transition-all hover:-translate-y-1">
          <div className="w-12 h-12 bg-grn/10 rounded-[12px] flex items-center justify-center text-grn mb-6">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">I'm a college / hostel</h3>
          <p className="text-[13px] text-tx2 mb-6 leading-relaxed">
            Set up a secure, NAAC-compliant grievance cell in minutes. 
            Automate routing and tracking without any technical team.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {['Free 3-month trial', 'No tech team needed', 'NAAC compliant'].map(t => (
              <span key={t} className="text-[10px] font-bold text-tx3 bg-b/30 px-2 py-1 rounded-full uppercase tracking-wider">
                {t}
              </span>
            ))}
          </div>
          <div className="text-grn font-bold text-sm flex items-center gap-2">
            Register institution <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className="card-base group hover:border-acc transition-all hover:-translate-y-1 text-left"
        >
          <div className="w-12 h-12 bg-acc/10 rounded-[12px] flex items-center justify-center text-acc mb-6">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">I'm a student</h3>
          <p className="text-[13px] text-tx2 mb-6 leading-relaxed">
            Log in with your institution-provided email and password. File your complaint anonymously in under 60 seconds — no personal data stored, no identity revealed.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {['Verified enrollment', 'Zero identity stored', 'Delivered in <10 sec'].map(t => (
              <span key={t} className="text-[10px] font-bold text-tx3 bg-b/30 px-2 py-1 rounded-full uppercase tracking-wider">
                {t}
              </span>
            ))}
          </div>
          <div className="text-acc font-bold text-sm flex items-center gap-2">
            File a complaint <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* How it works */}
      <div className="card-base">
        <h3 className="text-xl font-bold mb-12 text-center">How it works</h3>
        
        <div className="space-y-16">
          {/* Row 1: Left to Right */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            {[
              { icon: PenTool, label: 'Student Types', desc: 'Plain English input, zero identity collection', color: 'text-acc', bg: 'bg-acc/10' },
              { icon: Zap, label: 'AI Formats', desc: 'Converts to formal letter & routes automatically', color: 'text-acc', bg: 'bg-acc/10' },
              { icon: Send, label: 'Delivered', desc: 'Instant notification to the Grievance Cell', color: 'text-acc', bg: 'bg-acc/10' }
            ].map((node, i) => (
              <React.Fragment key={i}>
                <div className="flex-1 flex flex-col items-center text-center px-2">
                  <div className={cn("w-[44px] h-[44px] rounded-[12px] flex items-center justify-center mb-4", node.bg, node.color)}>
                    <node.icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm mb-1">{node.label}</div>
                  <div className="text-[11px] text-tx3 leading-relaxed max-w-[140px]">{node.desc}</div>
                </div>
                {i < 2 && (
                  <div className="hidden sm:flex items-center justify-center text-tx3 font-mono text-lg h-[44px]">
                    →
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Row 2: Right to Left */}
          <div className="flex flex-col sm:flex-row-reverse items-center justify-between gap-4 sm:gap-0">
            {[
              { icon: CheckCircle, label: 'Resolved', desc: 'Complaint closed & student notified via portal', color: 'text-grn', bg: 'bg-grn/10' },
              { icon: ShieldCheck, label: 'Auto-Escalates', desc: 'Forwarded to Principal if no action in 48h', color: 'text-red', bg: 'bg-red/10' },
              { icon: Clock, label: 'Cell Reviews', desc: 'Authorities take action within the portal', color: 'text-amb', bg: 'bg-amb/10' }
            ].map((node, i) => (
              <React.Fragment key={i}>
                <div className="flex-1 flex flex-col items-center text-center px-2">
                  <div className={cn("w-[44px] h-[44px] rounded-[12px] flex items-center justify-center mb-4", node.bg, node.color)}>
                    <node.icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm mb-1">{node.label}</div>
                  <div className="text-[11px] text-tx3 leading-relaxed max-w-[140px]">{node.desc}</div>
                </div>
                {i < 2 && (
                  <div className="hidden sm:flex items-center justify-center text-tx3 font-mono text-lg h-[44px]">
                    ←
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Bot */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-[350px] bg-surf border border-b rounded-[24px] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-acc p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold">GrievanceGPT Bot</div>
                    <div className="text-[10px] opacity-80 uppercase tracking-widest">Online to help</div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Content */}
              <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar bg-bg/50">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-acc/10 rounded-full flex items-center justify-center text-acc shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-surf border border-b p-4 rounded-[20px] rounded-tl-none text-sm leading-relaxed">
                      Hi! I'm your GrievanceGPT assistant. How can I help you navigate or resolve a doubt today?
                    </div>
                  </div>

                  {chatStep === 'initial' ? (
                    <div className="grid gap-2 pl-11">
                      {helpOptions.map((opt, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            setCurrentAnswer(opt.a);
                            setChatStep('answer');
                          }}
                          className="text-left p-3 rounded-xl border border-b bg-surf hover:border-acc/50 hover:bg-acc/5 transition-all text-[12px] font-medium flex items-center justify-between group"
                        >
                          {opt.q}
                          <ArrowRight className="w-3 h-3 text-tx3 group-hover:text-acc transition-colors" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-acc/10 rounded-full flex items-center justify-center text-acc shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-acc/10 border border-acc/20 p-4 rounded-[20px] rounded-tl-none text-sm leading-relaxed text-acc font-medium">
                          {currentAnswer}
                        </div>
                      </div>
                      <button 
                        onClick={() => setChatStep('initial')}
                        className="ml-11 text-[11px] font-bold text-acc uppercase tracking-widest flex items-center gap-1 hover:underline"
                      >
                        ← Back to questions
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-b bg-surf/50 text-center">
                <p className="text-[10px] text-tx3 font-medium">
                  Need more help? <Link to="/register" className="text-acc hover:underline">Contact Support</Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95",
            isChatOpen ? "bg-surf text-tx border border-b" : "bg-acc text-white"
          )}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
