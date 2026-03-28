import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Institution {
  name: string;
  city: string;
  domain: string;
  idPattern: string;
}

export interface StudentAuth {
  email: string;
  institution: string;
}

export type StudentStatus = 'First Login Pending' | 'Active' | 'Password Changed' | 'Revoked';

export interface StudentAccount {
  email: string;
  department: string;
  password: string;
  status: StudentStatus;
  lastLogin: string;
  note?: string;
}

export interface ComplaintUpdate {
  id: string;
  date: string;
  message: string;
  author: string;
}

export interface Complaint {
  id: string;
  studentEmail: string;
  title: string;
  category: string;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  filedAt: string;
  description: string;
  updates: ComplaintUpdate[];
  authority: string;
}

interface InstitutionContextType {
  studentAuth: StudentAuth | null;
  setStudentAuth: (auth: StudentAuth | null) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  studentAccounts: StudentAccount[];
  setStudentAccounts: React.Dispatch<React.SetStateAction<StudentAccount[]>>;
  institutionName: string;
  setInstitutionName: (name: string) => void;
  registerStudent: (email: string, department: string, password: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'filedAt' | 'updates'>) => Promise<string>;
  draftComplaint: string;
  setDraftComplaint: (complaint: string) => void;
  draftAnalysis: any | null;
  setDraftAnalysis: (analysis: any | null) => void;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export const institutions: Institution[] = [
  { name: 'Dayananda Sagar College of Engineering', city: 'Bengaluru', domain: 'dsce.edu.in', idPattern: '^1DS.{7}$' },
  { name: 'Bangalore Institute of Technology', city: 'Bengaluru', domain: 'bit-bangalore.edu.in', idPattern: '^BIT.{7}$' },
  { name: 'BMS Institute of Technology', city: 'Bengaluru', domain: 'bmsit.in', idPattern: '^1BM.{7}$' },
  { name: 'RNSIT', city: 'Bengaluru', domain: 'rnsit.ac.in', idPattern: '^1RN.{7}$' },
  { name: 'PES University', city: 'Bengaluru', domain: 'pes.edu', idPattern: '^PES.{7}$' },
  { name: 'BMS College of Engineering', city: 'Bengaluru', domain: 'bmsce.ac.in', idPattern: '^1BM.{7}$' },
  { name: 'KSIT', city: 'Bengaluru', domain: 'ksit.ac.in', idPattern: '^1KS.{7}$' },
  { name: 'RV College of Engineering', city: 'Bengaluru', domain: 'rvce.edu.in', idPattern: '^1RV.{7}$' },
  { name: 'MS Ramaiah Institute of Technology', city: 'Bengaluru', domain: 'msrit.edu', idPattern: '^MS.{8}$' },
  { name: 'Nitte Meenakshi Institute of Technology', city: 'Bengaluru', domain: 'nmit.ac.in', idPattern: '^1NM.{7}$' },
  { name: 'New Horizon College of Engineering', city: 'Bengaluru', domain: 'newhorizonindia.edu', idPattern: '^NH.{8}$' },
  { name: 'Presidency University', city: 'Bengaluru', domain: 'presidencyuniversity.in', idPattern: '^PU.{8}$' },
  { name: 'Jain University', city: 'Bengaluru', domain: 'jainuniversity.ac.in', idPattern: '^JU.{8}$' },
  { name: 'Christ University', city: 'Bengaluru', domain: 'christuniversity.in', idPattern: '^CU.{8}$' },
  { name: 'Mount Carmel College', city: 'Bengaluru', domain: 'mountcarmel.edu.in', idPattern: '^MC.{8}$' },
  { name: 'St. Joseph\'s College of Engineering', city: 'Bengaluru', domain: 'stjosephs.ac.in', idPattern: '^SJ.{8}$' },
  { name: 'Sri Jayachamarajendra College of Engineering', city: 'Mysuru', domain: 'sjce.ac.in', idPattern: '^SJ.{8}$' },
  { name: 'Vidyavardhaka College of Engineering', city: 'Mysuru', domain: 'vvce.ac.in', idPattern: '^VV.{8}$' },
  { name: 'NIE Institute of Technology', city: 'Mysuru', domain: 'nie.ac.in', idPattern: '^NI.{8}$' },
  { name: 'IIT Bombay', city: 'Mumbai', domain: 'iitb.ac.in', idPattern: '^IIT.{7}$' },
  { name: 'NIT Trichy', city: 'Trichy', domain: 'nitt.edu', idPattern: '^NIT.{7}$' },
];

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [studentAuth, setStudentAuth] = useState<StudentAuth | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>([
    { email: 'student.arun@dsce.edu.in', department: 'CSE 3rd Year', password: 'Temp@84921', status: 'Active', lastLogin: '2h ago' },
    { email: 'student.meera@dsce.edu.in', department: 'ECE 2nd Year', password: 'Temp@33012', status: 'First Login Pending', lastLogin: 'Never' },
    { email: 'student.rajan@dsce.edu.in', department: 'MBA 1st Year', password: 'Temp@67845', status: 'Password Changed', lastLogin: 'Yesterday' },
    { email: 'student.priya@dsce.edu.in', department: 'Civil 4th Year', password: 'Temp@91023', status: 'Revoked', lastLogin: '3d ago' },
  ]);
  const [institutionName, setInstitutionName] = useState('Dayananda Sagar College of Engineering');
  const [draftComplaint, setDraftComplaint] = useState('');
  const [draftAnalysis, setDraftAnalysis] = useState<any | null>(null);
  
  const registerStudent = async (email: string, department: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (studentAccounts.some(s => s.email === email)) {
      return { success: false, message: "An account with this email already exists" };
    }
    
    const newAccount: StudentAccount = {
      email,
      department,
      password,
      status: 'Active',
      lastLogin: 'Just now',
      note: 'Self-registered'
    };
    
    setStudentAccounts(prev => [newAccount, ...prev]);
    return { success: true, message: "Account created successfully" };
  };

  const resetPassword = async (email: string, newPassword: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const studentIndex = studentAccounts.findIndex(s => s.email === email);
    if (studentIndex === -1) {
      return { success: false, message: "No account found with this email" };
    }
    
    if (studentAccounts[studentIndex].status === 'Revoked') {
      return { success: false, message: "This account has been revoked" };
    }
    
    const updatedAccounts = [...studentAccounts];
    updatedAccounts[studentIndex] = {
      ...updatedAccounts[studentIndex],
      password: newPassword,
      status: 'Password Changed'
    };
    
    setStudentAccounts(updatedAccounts);
    return { success: true, message: "Password reset successfully" };
  };

  const [complaints, setComplaints] = useState<Complaint[]>([
    { 
      id: 'GRV-2025-X92K1', 
      studentEmail: 'student.arun@dsce.edu.in',
      title: 'No water in Block B hostel since Tuesday', 
      category: 'Hostel', 
      status: 'Escalated', 
      priority: 'High',
      filedAt: '2h ago', 
      description: 'The water supply in Block B has been completely cut off since Tuesday morning. Students are unable to maintain basic hygiene.',
      authority: 'Dean of Hostels',
      updates: [
        { id: '1', date: '1h ago', message: 'Complaint received and assigned to maintenance team.', author: 'System' },
        { id: '2', date: '30m ago', message: 'Maintenance team is inspecting the main pump.', author: 'Dean of Hostels' }
      ]
    },
    { 
      id: 'GRV-2025-M44PQ', 
      studentEmail: 'student.meera@dsce.edu.in',
      title: 'Canteen food has been stale for 3 days', 
      category: 'Canteen', 
      status: 'Under Review', 
      priority: 'Medium',
      filedAt: '5h ago', 
      description: 'The quality of food in the main canteen has deteriorated significantly. Multiple students have reported stomach issues.',
      authority: 'Canteen Supervisor',
      updates: [
        { id: '1', date: '4h ago', message: 'Food safety inspection scheduled.', author: 'Canteen Supervisor' }
      ]
    },
    { 
      id: 'GRV-2025-B78RT', 
      studentEmail: 'student.rajan@dsce.edu.in',
      title: 'Professor not uploading marks on portal', 
      category: 'Academic', 
      status: 'Open', 
      priority: 'Low',
      filedAt: '1d ago', 
      description: 'The Internal Assessment marks for the Computer Networks course have not been uploaded yet, despite the deadline passing.',
      authority: 'HOD CSE',
      updates: []
    },
  ]);

  const addComplaint = async (complaintData: Omit<Complaint, 'id' | 'filedAt' | 'updates'>) => {
    const id = 'GRV-' + new Date().getFullYear() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    const newComplaint: Complaint = {
      ...complaintData,
      id,
      filedAt: 'Just now',
      updates: [
        { id: '1', date: 'Just now', message: 'Grievance filed successfully and encrypted.', author: 'System' }
      ]
    };
    setComplaints(prev => [newComplaint, ...prev]);
    return id;
  };

  return (
    <InstitutionContext.Provider value={{ 
      studentAuth, 
      setStudentAuth, 
      isLoginModalOpen, 
      setIsLoginModalOpen,
      studentAccounts,
      setStudentAccounts,
      institutionName,
      setInstitutionName,
      registerStudent,
      resetPassword,
      complaints,
      setComplaints,
      addComplaint,
      draftComplaint,
      setDraftComplaint,
      draftAnalysis,
      setDraftAnalysis
    }}>
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (context === undefined) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
}
