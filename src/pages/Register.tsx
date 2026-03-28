import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Building2, Home, GraduationCap, School, Users, BookOpen, Utensils, ShieldAlert, Construction, Landmark, PartyPopper, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { institutions } from '../context/InstitutionContext';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    adminName: '',
    adminEmail: '',
    city: '',
    departments: [] as string[],
  });

  const [isDuplicateName, setIsDuplicateName] = useState(false);
  const [isDuplicateDomain, setIsDuplicateDomain] = useState(false);

  useEffect(() => {
    // Check for duplicate name
    const nameExists = institutions.some(inst => 
      (inst.name || '').toLowerCase() === (formData.name || '').trim().toLowerCase()
    );
    setIsDuplicateName(nameExists);

    // Check for duplicate domain
    if (formData.adminEmail.includes('@')) {
      const domain = formData.adminEmail.split('@')[1];
      const domainExists = institutions.some(inst => inst.domain === domain);
      setIsDuplicateDomain(domainExists);
    } else {
      setIsDuplicateDomain(false);
    }
  }, [formData.name, formData.adminEmail]);

  const types = [
    { id: 'college', label: 'College', icon: GraduationCap },
    { id: 'hostel', label: 'Hostel', icon: Home },
    { id: 'both', label: 'College + Hostel', icon: Building2 },
    { id: 'school', label: 'School', icon: School },
  ];

  const depts = [
    { id: 'hostel', label: 'Hostel', sub: 'Accommodation & Living', icon: Home },
    { id: 'academic', label: 'Academic', sub: 'Exams, Grades, Classes', icon: BookOpen },
    { id: 'canteen', label: 'Canteen/Mess', sub: 'Food & Hygiene', icon: Utensils },
    { id: 'harassment', label: 'Harassment', sub: 'Safety & Discipline', icon: ShieldAlert },
    { id: 'infra', label: 'Infrastructure', sub: 'Maintenance & Labs', icon: Construction },
    { id: 'finance', label: 'Finance', sub: 'Fees & Scholarships', icon: Landmark },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setIsSubmitting(true);
    try {
      // Attempt to send to n8n webhook
      const response = await fetch("https://jayanthc18.app.n8n.cloud/webhook/grievance-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "INSTITUTION_REGISTRATION",
          name: formData.name,
          institutionType: formData.type,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          city: formData.city,
          departments: formData.departments,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.warn("Webhook responded with error status:", response.status);
      }
    } catch (error) {
      console.error("Webhook submission failed:", error);
    } finally {
      setIsSubmitting(false);
      setStep(4);
    }
  };

  const toggleDept = (id: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(id) 
        ? prev.departments.filter(d => d !== id)
        : [...prev.departments, id]
    }));
  };

  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-b -translate-y-1/2 -z-10" />
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="relative">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
              step > s ? "bg-grn border-grn text-white" : 
              step === s ? "bg-acc border-acc text-white" : 
              "bg-card border-b text-tx3"
            )}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {step > s && s < 4 && (
              <div className="absolute top-1/2 left-8 w-[calc(100%+32px)] h-[2px] bg-grn -translate-y-1/2 -z-10" />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold mb-2">Tell us about your institution</h2>
              <p className="text-tx2 text-sm">We'll use this to set up your dedicated portal.</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Institution Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. Stanford University"
                    className={cn(
                      "input-base w-full pr-10",
                      isDuplicateName && "border-red focus:ring-red/20"
                    )}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  {isDuplicateName && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red" />
                  )}
                </div>
                {isDuplicateName && (
                  <div className="text-[10px] font-bold text-red uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> This institution is already registered
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {types.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFormData({...formData, type: t.id})}
                    className={cn(
                      "card-base p-4 flex flex-col items-center gap-3 text-center transition-all",
                      formData.type === t.id ? "border-acc bg-acc/5" : "hover:border-acc/50"
                    )}
                  >
                    <t.icon className={cn("w-6 h-6", formData.type === t.id ? "text-acc" : "text-tx3")} />
                    <span className="text-sm font-bold">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Admin Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="input-base"
                    value={formData.adminName}
                    onChange={e => setFormData({...formData, adminName: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-tx3 uppercase tracking-wider">Official Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="admin@edu.com"
                      className={cn(
                        "input-base w-full pr-10",
                        isDuplicateDomain && "border-red focus:ring-red/20",
                        !isDuplicateDomain && formData.adminEmail.includes('@') && "border-grn focus:ring-grn/20"
                      )}
                      value={formData.adminEmail}
                      onChange={e => setFormData({...formData, adminEmail: e.target.value})}
                    />
                    {isDuplicateDomain && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red" />
                    )}
                    {!isDuplicateDomain && formData.adminEmail.includes('@') && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grn" />
                    )}
                  </div>
                </div>
              </div>

              {isDuplicateDomain && (
                <div className="bg-red/10 border border-red/20 rounded-[14px] p-4 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red shrink-0" />
                    <p className="text-[12px] text-red leading-relaxed">
                      <span className="font-bold">⚠ This institution is already registered.</span> Your college domain is already linked to an active GrievanceGPT cell.
                    </p>
                  </div>
                  <button className="btn-ghost py-2 text-[11px] border-red/20 text-red hover:bg-red/10 w-fit">
                    Contact support to claim access
                  </button>
                </div>
              )}

              {!isDuplicateDomain && formData.adminEmail.includes('@') && (
                <div className="text-[10px] font-bold text-grn uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3" /> Domain available
                </div>
              )}

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.type || isDuplicateName || isDuplicateDomain || !formData.adminEmail.includes('@')}
                className="btn-primary w-full"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold mb-2">Which departments exist?</h2>
              <p className="text-tx2 text-sm">Select all that apply to your institution.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {depts.map(d => (
                <button
                  key={d.id}
                  onClick={() => toggleDept(d.id)}
                  className={cn(
                    "card-base p-4 flex items-start gap-4 text-left transition-all",
                    formData.departments.includes(d.id) ? "border-acc bg-acc/5" : "hover:border-acc/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0",
                    formData.departments.includes(d.id) ? "bg-acc/20 text-acc" : "bg-b/30 text-tx3"
                  )}>
                    <d.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{d.label}</div>
                    <div className="text-[10px] text-tx3 leading-tight mt-1">{d.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
              <button 
                onClick={() => setStep(3)}
                disabled={formData.departments.length === 0}
                className="btn-primary flex-1"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold mb-2">Map complaints to authorities</h2>
              <p className="text-tx2 text-sm">Enter the email for each department head.</p>
            </div>

            <div className="space-y-4">
              {formData.departments.map(dId => {
                const dept = depts.find(d => d.id === dId);
                return (
                  <div key={dId} className="flex items-center gap-4 card-base p-4">
                    <div className="w-10 h-10 bg-acc/10 rounded-[10px] flex items-center justify-center text-acc shrink-0">
                      {dept && <dept.icon className="w-5 h-5" />}
                    </div>
                    <div className="font-bold text-sm shrink-0 w-24">{dept?.label}</div>
                    <ArrowRight className="w-4 h-4 text-tx3" />
                    <input 
                      type="email" 
                      placeholder="head@edu.com"
                      className="input-base flex-1 py-2"
                    />
                  </div>
                );
              })}
            </div>

            <div className="bg-amb/10 border border-amb/20 rounded-[14px] p-4 flex gap-4">
              <ShieldAlert className="w-5 h-5 text-amb shrink-0" />
              <p className="text-[12px] text-amb leading-relaxed">
                <span className="font-bold">Auto-escalation:</span> If no action is taken within 48 hours, complaints will be automatically forwarded to the Principal's office.
              </p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="btn-ghost flex-1">Back</button>
              <button 
                onClick={handleRegister} 
                disabled={isSubmitting}
                className="btn-primary flex-1 bg-grn hover:bg-grn/90 disabled:opacity-50"
              >
                {isSubmitting ? "Linking..." : "Create my grievance cell"} <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="w-20 h-20 bg-grn/10 rounded-full flex items-center justify-center text-grn mx-auto">
              <PartyPopper className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight">You're all set!</h2>
              <p className="text-tx2">Your institution's grievance cell is now live.</p>
            </div>

            <div className="bg-acc/10 border border-acc/20 rounded-[14px] p-6">
              <div className="text-[11px] font-bold text-acc uppercase tracking-widest mb-2">Student Portal URL</div>
              <div className="text-xl font-bold text-tx">{(formData.name || '').toLowerCase().replace(/\s+/g, '')}.grievancegpt.in</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Admin login', val: formData.adminEmail },
                { label: 'Temp password', val: 'GRV-X92K-1' },
                { label: 'n8n status', val: 'Connected' },
                { label: 'Complaints', val: '0' },
              ].map((c, i) => (
                <div key={i} className="card-base p-4 text-left">
                  <div className="text-[10px] font-bold text-tx3 uppercase tracking-wider mb-1">{c.label}</div>
                  <div className="text-sm font-bold truncate">{c.val}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className="btn-primary w-full">Open Dashboard <ArrowRight className="w-4 h-4" /></Link>
              <button className="btn-ghost w-full">Share portal link</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
