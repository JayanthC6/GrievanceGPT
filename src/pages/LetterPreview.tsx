import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  ShieldCheck, 
  FileText, 
  CheckCircle2,
  Clock,
  User,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function LetterPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis, raw } = location.state || {};

  if (!analysis) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No analysis found</h2>
        <button onClick={() => navigate('/portal')} className="btn-primary">Go back to portal</button>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to edit
        </button>
        <div className="flex gap-3">
          <button className="btn-ghost p-3 rounded-xl"><Download className="w-5 h-5" /></button>
          <button className="btn-ghost p-3 rounded-xl"><Printer className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="card-base p-12 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <ShieldCheck className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-12 pb-8 border-b border-b/30">
            <div>
              <h1 className="text-2xl font-bold mb-1">GrievanceGPT</h1>
              <p className="text-[10px] font-bold text-acc uppercase tracking-widest">Formal Complaint Document</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1">Date Generated</div>
              <div className="text-sm font-bold">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
            <div>
              <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Category
              </div>
              <div className="text-xs font-bold text-white">{analysis.category}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Priority
              </div>
              <div className={cn(
                "text-xs font-bold",
                analysis.priority === 'Critical' ? "text-red" : 
                analysis.priority === 'High' ? "text-amb" : "text-grn"
              )}>
                {analysis.priority}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> To
              </div>
              <div className="text-xs font-bold text-white">{analysis.authority}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verification
              </div>
              <div className="text-xs font-bold text-grn">AI Validated</div>
            </div>
          </div>

          {/* Letter Body */}
          <div className="space-y-8">
            <div>
              <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-2">Subject</div>
              <h3 className="text-xl font-bold text-white leading-tight">{analysis.subject}</h3>
            </div>

            <div className="text-tx2 leading-relaxed font-serif text-lg whitespace-pre-wrap min-h-[300px]">
              {analysis.formalLetter}
            </div>

            <div className="pt-8 border-t border-b/30">
              <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest mb-4">Sign-off</div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-b/50 rounded-full flex items-center justify-center text-tx3">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-white italic">Anonymous Student</div>
                  <div className="text-[10px] font-bold text-tx3 uppercase tracking-widest">GrievanceGPT Verified User</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Timestamp Badge */}
        <div className="mt-12 flex justify-center">
          <div className="bg-b/30 border border-b px-6 py-3 rounded-full flex items-center gap-3">
            <div className="w-2 h-2 bg-grn rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-tx3 uppercase tracking-widest">Digital Signature Hash: </span>
            <span className="text-[10px] font-mono font-bold text-acc">SHA-256: {Math.random().toString(36).substring(2, 15)}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('/portal')}
          className="btn-primary flex-1"
        >
          File this complaint
        </button>
        <button 
          onClick={() => navigate(-1)}
          className="btn-ghost flex-1"
        >
          Edit details
        </button>
      </div>
    </div>
  );
}
