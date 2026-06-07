
import React, { useState, useEffect } from 'react';
import { User, Scan, Patient, DoctorNote } from '../types';
import { getScans, getPatients, addNoteToScan } from '../services/storage';

interface Props {
  user: User;
}

const DoctorDashboard: React.FC<Props> = ({ user }) => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    setScans(getScans());
    setPatients(getPatients());
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNote = () => {
    if (!selectedScan || !noteText.trim()) return;
    // Fix: Removed 'doctorId' as it is not present in the 'DoctorNote' interface defined in types.ts
    const newNote: DoctorNote = {
      id: Math.random().toString(36).substr(2, 9),
      doctorName: user.name,
      content: noteText,
      timestamp: new Date().toISOString()
    };
    addNoteToScan(selectedScan.id, newNote);
    
    // Refresh UI
    const updatedScans = getScans();
    setScans(updatedScans);
    setSelectedScan(updatedScans.find(s => s.id === selectedScan.id) || null);
    setNoteText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Patient Search */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Patient Registry</h2>
          <div className="relative mb-6">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-burgundy/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {filteredPatients.map(patient => (
              <div 
                key={patient.id} 
                className="p-4 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer transition"
                onClick={() => {
                  const pScans = scans.filter(s => s.patientId === patient.id);
                  if (pScans.length > 0) setSelectedScan(pScans[0]);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-burgundy/5 rounded-full flex items-center justify-center text-burgundy font-bold text-xs">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{patient.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {patient.id} • {patient.age}y/o • {patient.gender}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredPatients.length === 0 && <p className="text-gray-400 text-xs text-center py-4 italic">No matching records found.</p>}
          </div>
        </div>
      </div>

      {/* Main: Scan Details */}
      <div className="lg:col-span-8">
        {selectedScan ? (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="p-6 bg-burgundy/5 border-b border-burgundy/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-burgundy">Case Analysis: {selectedScan.id}</h3>
                <p className="text-xs text-gray-500 font-medium">Scanned on {new Date(selectedScan.date).toLocaleString()}</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${selectedScan.prediction === 'Tumor' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                AI: {selectedScan.prediction} ({selectedScan.confidence}%)
              </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-250px)]">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400">MRI Original</h4>
                  <div className="bg-black aspect-square rounded-2xl overflow-hidden border border-gray-200">
                    <img src={selectedScan.mriUrl} className="w-full h-full object-contain" alt="MRI Original" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400">Grad-CAM Visualization</h4>
                  <div className="bg-black aspect-square rounded-2xl overflow-hidden border border-gray-200 relative">
                     <img src={selectedScan.mriUrl} className="w-full h-full object-contain opacity-60" alt="MRI Grad-CAM" />
                     {/* Simulated ROI from explanation or hardcoded for mock */}
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1/3 h-1/3 bg-red-500/40 rounded-full blur-2xl animate-pulse"></div>
                     </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  AI Clinical Insights
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  {selectedScan.explanation || "No explanation provided for this scan."}
                </p>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold border-b pb-2">Diagnostic Notes & History</h4>
                
                <div className="space-y-4">
                  {selectedScan.notes?.map(note => (
                    <div key={note.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-burgundy">{note.doctorName}</span>
                        <span className="text-[10px] text-gray-400">{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{note.content}</p>
                    </div>
                  ))}
                  {(!selectedScan.notes || selectedScan.notes.length === 0) && (
                    <p className="text-gray-400 text-xs italic">No notes added to this case yet.</p>
                  )}
                </div>

                <div className="pt-4">
                  <textarea 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 h-24"
                    placeholder="Enter clinical observations, differential diagnosis, or notes..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <div className="mt-2 flex justify-end">
                    <button 
                      onClick={handleAddNote}
                      className="px-6 py-2 bg-burgundy text-white font-bold rounded-lg text-sm hover:bg-opacity-90 transition"
                    >
                      Save Clinical Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-400">Select a patient to view scan details</h3>
            <p className="text-sm text-gray-400 mt-2">Clinical verification required for all AI predictions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
