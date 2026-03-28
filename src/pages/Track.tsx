import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight,
  MessageSquare,
  History,
  TrendingUp,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useInstitution } from '../context/InstitutionContext';

export default function Track() {
  const { complaints } = useInstitution();
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [complaint, setComplaint] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchId.trim() || isSearching) return;
    setIsSearching(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const found = complaints.find(c => c.id.toLowerCase() === searchId.toLowerCase().trim());
      
      if (found) {
        // Calculate a mock escalation timer for the demo
        // In a real app, this would come from the backend
        const filedDate = new Date(found.filedAt === 'Just now' ? Date.now() : found.filedAt);
        const now = new Date();
        const diff = now.getTime() - filedDate.getTime();
        const fortyEightHours = 48 * 3600 * 1000;
        const remaining = Math.max(0, Math.floor((fortyEightHours - diff) / 1000));

        setComplaint({
          ...found,
          escalationIn: remaining,
          timeline: found.updates.map(u => ({
            status: u.author === 'System' ? 'Update' : 'Action',
            date: u.date,
            desc: u.message
          }))
        });
      } else {
        setError("No grievance found with this reference ID. Please check and try again.");
        setComplaint(null);
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Track your grievance</h1>
        <p className="text-tx2 max-w-[480px] mx-auto">
          Enter your anonymous reference ID to see the current status and 
          escalation timeline of your complaint.
        </p>
      </div>

      {/* Search Bar */}
      <div className="space-y-4 mb-12">
        <div className="card-base p-2 flex gap-2 relative group focus-within:border-acc transition-all">
          <div className="flex-grow flex items-center px-4">
            <Search className="w-5 h-5 text-tx3 mr-3" />
            <input 
              type="text" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Reference ID (e.g. GRV-2026-ABCD)"
              className="w-full bg-transparent border-none focus:ring-0 text-tx font-mono uppercase tracking-widest placeholder:text-tx3 placeholder:normal-case placeholder:tracking-normal"
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={!searchId.trim() || isSearching}
            className="btn-primary py-3 px-8"
          >
            {isSearching ? "Searching..." : "Track"}
          </button>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-red text-xs font-bold uppercase tracking-wider px-4"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {!complaint ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="card-base p-6 border-b/30 bg-surf/30">
              <div className="w-10 h-10 bg-acc/10 rounded-[10px] flex items-center justify-center text-acc mb-4">
                <History className="w-5 h-5" />
              </div>
              <h4 className="font-bold mb-2">Recent activity</h4>
              <p className="text-[12px] text-tx2 leading-relaxed">
                Most complaints are actioned within 24 hours. 
                Keep your ID safe to check for updates.
              </p>
            </div>
            <div className="card-base p-6 border-b/30 bg-surf/30">
              <div className="w-10 h-10 bg-grn/10 rounded-[10px] flex items-center justify-center text-grn mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold mb-2">Resolution rates</h4>
              <p className="text-[12px] text-tx2 leading-relaxed">
                94% of complaints are resolved without escalation. 
                Your anonymity is guaranteed.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className="card-base p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1">REFERENCE ID</div>
                  <h2 className="text-2xl font-mono font-bold text-acc mb-2">{complaint.id}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-tx3 uppercase tracking-widest bg-b px-2 py-0.5 rounded">
                      {complaint.category}
                    </span>
                    <span className="text-[10px] font-bold text-tx3 uppercase tracking-widest bg-b px-2 py-0.5 rounded">
                      {complaint.authority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1">Current Status</div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        complaint.status === 'Resolved' ? "bg-grn" : "bg-amb"
                      )} />
                      <span className={cn(
                        "text-sm font-bold uppercase tracking-widest",
                        complaint.status === 'Resolved' ? "text-grn" : "text-amb"
                      )}>{complaint.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8 p-4 bg-b/30 rounded-xl border border-b">
                <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1">Grievance Title</div>
                <div className="text-lg font-bold">{complaint.title}</div>
              </div>

              {/* Countdown */}
              <div className="bg-red/5 border border-red/20 rounded-[16px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center text-red">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red">Auto-escalation Timer</h4>
                    <p className="text-[11px] text-tx2">Forwarding to Principal if no action taken</p>
                  </div>
                </div>
                <div className="text-3xl font-mono font-bold text-red">
                  {Math.floor(complaint.escalationIn / 3600)}h : {Math.floor((complaint.escalationIn % 3600) / 60)}m : {complaint.escalationIn % 60}s
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card-base p-8">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                <History className="w-5 h-5 text-acc" /> Activity Timeline
              </h3>
              <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-b">
                {complaint.timeline.map((item: any, i: number) => (
                  <div key={i} className="flex gap-6 relative z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-bg",
                      i === complaint.timeline.length - 1 ? "bg-acc text-white" : "bg-surf text-tx3"
                    )}>
                      {i === complaint.timeline.length - 1 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-current rounded-full" />}
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-sm">{item.status}</span>
                        <span className="text-[10px] font-bold text-tx3 uppercase tracking-widest">
                          {new Date(item.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[13px] text-tx2 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => setComplaint(null)}
                className="btn-ghost"
              >
                Track another complaint
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
