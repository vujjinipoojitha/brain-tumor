
export enum Role {
  PATIENT = 'PATIENT',
  HOSPITAL = 'HOSPITAL',
  GUEST = 'GUEST'
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  hospitalId?: string;
}

export interface Scan {
  id: string;
  caseId: string; // New: Standardized clinical ID
  patientId: string;
  mriUrl: string;
  prediction: 'Tumor' | 'No Tumor';
  confidence: number;
  date: string;
  explanation: string;
  roi: { x: number; y: number; width: number; height: number } | null;
  notes?: DoctorNote[];
  treatmentPlan?: string;
  isEmergency?: boolean;
}

export interface DoctorNote {
  id: string;
  doctorName: string;
  content: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  hospitalName?: string;
}
