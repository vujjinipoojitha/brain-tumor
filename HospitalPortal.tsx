import React, { useState, useEffect } from 'react';
import { User, Patient, Scan } from '../types';

interface Props {
  user: User;
}

// ── Validation helpers ────────────────────────────────────────────────────────
const isValidPhone = (v: string) => /^[0-9\-\+\s]{7,15}$/.test(v.trim());
const isValidAge   = (v: string) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 120; };
const isValidName  = (v: string) => v.trim().length >= 2;
const isValidUser  = (v: string) => v.trim().length >= 3;
const isValidPass  = (v: string) => v.length >= 6;

// ── Error message component ───────────────────────────────────────────────────
const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs font-bold mt-1 ml-1">⚠ {msg}</p> : null;

// ── Success toast ─────────────────────────────────────────────────────────────
const Toast: React.FC<{ msg: string; type: 'success' | 'error' }> = ({ msg, type }) => (
  <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm flex items-center gap-3 animate-in slide-in-from-top-4 ${type === 'success' ? 'bg-green-600' : 'bg-red-700'}`}>
    <span>{type === 'success' ? '✅' : '❌'}</span>
    <span>{msg}</span>
  </div>
);

const API = 'http://localhost:8000';

const HospitalPortal: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register-hospital' | 'register-patient' | 'intake' | 'workspace'>('login');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hospital_token'));
  const [hospitalName, setHospitalName] = useState<string>(localStorage.getItem('hospital_name') || '');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scans, setScans] = useState<any[]>([]);

  // ── Login state ─────────────────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<{ username?: string; password?: string }>({});
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Register Hospital state ──────────────────────────────────────────────────
  const [regHospForm, setRegHospForm] = useState({ username: '', password: '', confirmPassword: '', name: '' });
  const [regHospErrors, setRegHospErrors] = useState<{ username?: string; password?: string; confirmPassword?: string; name?: string }>({});
  const [regHospLoading, setRegHospLoading] = useState(false);

  // ── Register Patient state ───────────────────────────────────────────────────
  const [regPatForm, setRegPatForm] = useState({ name: '', age: '', gender: 'Female', contact: '' });
  const [regPatErrors, setRegPatErrors] = useState<{ name?: string; age?: string; contact?: string }>({});
  const [regPatLoading, setRegPatLoading] = useState(false);

  // ── Intake state ─────────────────────────────────────────────────────────────
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState('resnet50');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intakeResult, setIntakeResult] = useState<any>(null);
  const [intakeErrors, setIntakeErrors] = useState<{ patient?: string; image?: string }>({});
  const [showHeatmap, setShowHeatmap] = useState(true);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load patients if token exists
  useEffect(() => {
    if (token) {
      fetchPatients();
      fetchScans();
      setActiveTab('intake');
    }
  }, [token]);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API}/api/patients/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch {}
  };

  const fetchScans = async () => {
    try {
      const res = await fetch(`${API}/api/scans/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setScans(data);
      }
    } catch {}
  };

  // ── LOGIN VALIDATION & SUBMIT ─────────────────────────────────────────────
  const validateLogin = () => {
    const errs: typeof loginErrors = {};
    if (!isValidUser(loginForm.username)) errs.username = 'Username must be at least 3 characters';
    if (!isValidPass(loginForm.password)) errs.password = 'Password must be at least 6 characters';
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setLoginLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/hospital/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginForm.username, password: loginForm.password })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginErrors({ password: data.detail || 'Invalid username or password' });
        showToast('Login failed. Check your credentials.', 'error');
      } else {
        localStorage.setItem('hospital_token', data.access_token);
        localStorage.setItem('hospital_name', data.hospital_name || loginForm.username);
        setToken(data.access_token);
        setHospitalName(data.hospital_name || loginForm.username);
        showToast('Login successful! Welcome back.', 'success');
        setActiveTab('intake');
      }
    } catch {
      showToast('Cannot connect to backend. Make sure server is running.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── REGISTER HOSPITAL VALIDATION & SUBMIT ────────────────────────────────
  const validateRegHosp = () => {
    const errs: typeof regHospErrors = {};
    if (!isValidName(regHospForm.name)) errs.name = 'Hospital name must be at least 2 characters';
    if (!isValidUser(regHospForm.username)) errs.username = 'Username must be at least 3 characters';
    if (!isValidPass(regHospForm.password)) errs.password = 'Password must be at least 6 characters';
    if (regHospForm.password !== regHospForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setRegHospErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterHospital = async () => {
    if (!validateRegHosp()) return;
    setRegHospLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/hospital/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regHospForm.username,
          password: regHospForm.password,
          name: regHospForm.name
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setRegHospErrors({ username: data.detail || 'Registration failed' });
        showToast('Registration failed. Username may already exist.', 'error');
      } else {
        showToast('Hospital registered successfully! Please login.', 'success');
        setRegHospForm({ username: '', password: '', confirmPassword: '', name: '' });
        setActiveTab('login');
      }
    } catch {
      showToast('Cannot connect to backend. Make sure server is running.', 'error');
    } finally {
      setRegHospLoading(false);
    }
  };

  // ── REGISTER PATIENT VALIDATION & SUBMIT ─────────────────────────────────
  const validateRegPat = () => {
    const errs: typeof regPatErrors = {};
    if (!isValidName(regPatForm.name)) errs.name = 'Patient name must be at least 2 characters';
    if (!isValidAge(regPatForm.age)) errs.age = 'Please enter a valid age between 1 and 120';
    if (!isValidPhone(regPatForm.contact)) errs.contact = 'Enter a valid phone number (7-15 digits)';
    setRegPatErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterPatient = async () => {
    if (!validateRegPat()) return;
    setRegPatLoading(true);
    try {
      const res = await fetch(`${API}/api/patients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: regPatForm.name,
          age: parseInt(regPatForm.age),
          gender: regPatForm.gender,
          contact: regPatForm.contact
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.detail || 'Failed to register patient.', 'error');
      } else {
        showToast(`Patient ${regPatForm.name} registered successfully!`, 'success');
        setRegPatForm({ name: '', age: '', gender: 'Female', contact: '' });
        setRegPatErrors({});
        await fetchPatients();
        setActiveTab('intake');
      }
    } catch {
      showToast('Cannot connect to backend. Make sure server is running.', 'error');
    } finally {
      setRegPatLoading(false);
    }
  };

  // ── INTAKE VALIDATION & SUBMIT ────────────────────────────────────────────
  const validateIntake = () => {
    const errs: typeof intakeErrors = {};
    if (!selectedPatientId) errs.patient = 'Please select a patient before proceeding';
    if (!selectedFile) errs.image = 'Please upload an MRI scan image (JPG or PNG)';
    setIntakeErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleIntakeSubmit = async () => {
    if (!validateIntake()) return;
    setIsAnalyzing(true);
    setIntakeResult(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile!);
      formData.append('patient_id', selectedPatientId);
      formData.append('model_name', modelName);
      formData.append('is_emergency', String(isEmergency));

      const res = await fetch(`${API}/api/predict/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.detail || 'Prediction failed. Try again.', 'error');
        return;
      }

      const data = await res.json();
      setIntakeResult(data);
      await fetchScans();
      showToast('Analysis complete!', 'success');
    } catch {
      showToast('Analysis failed. Ensure backend is running at localhost:8000.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_name');
    setToken(null);
    setHospitalName('');
    setActiveTab('login');
    setPatients([]);
    setScans([]);
    setIntakeResult(null);
    showToast('Logged out successfully.', 'success');
  };

  // ── INPUT STYLE HELPER ────────────────────────────────────────────────────
  const inputClass = (hasError?: string) =>
    `w-full px-4 py-3 rounded-xl border-2 font-medium text-sm outline-none transition ${
      hasError ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 bg-white focus:border-burgundy'
    }`;

  // ── TAB BUTTON ────────────────────────────────────────────────────────────
  const tabBtn = (label: string, tab: typeof activeTab) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-5 py-2.5 rounded-xl font-black text-sm transition ${
        activeTab === tab ? 'bg-burgundy text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  const riskColor = (r?: string) => {
    if (r === 'HIGH') return 'bg-red-100 text-red-700 border border-red-300';
    if (r === 'MODERATE') return 'bg-orange-100 text-orange-700 border border-orange-300';
    if (r === 'LOW') return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    return 'bg-gray-100 text-gray-600 border border-gray-300';
  };

  return (
    <div className="space-y-8 pb-20">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── HEADER ── */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-burgundy rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-800">
              {token ? hospitalName || 'Hospital Dashboard' : 'Hospital Portal'}
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {token ? 'AUTHORIZED FACILITY DASHBOARD' : 'SECURE ACCESS REQUIRED'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
          {!token ? (
            <>
              {tabBtn('Login', 'login')}
              {tabBtn('Register', 'register-hospital')}
            </>
          ) : (
            <>
              {tabBtn('New Intake', 'intake')}
              {tabBtn('Register Patient', 'register-patient')}
              {tabBtn('Workspace', 'workspace')}
              <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl font-black text-sm text-red-500 hover:bg-red-50 transition">
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: LOGIN
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'login' && (
        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 max-w-md mx-auto">
          <h2 className="text-2xl font-black mb-2 text-gray-800">Hospital Login</h2>
          <p className="text-sm text-gray-400 mb-8">Sign in to access the diagnostic dashboard</p>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Username</label>
              <input
                className={inputClass(loginErrors.username)}
                placeholder="Enter your username"
                value={loginForm.username}
                onChange={e => { setLoginForm(p => ({ ...p, username: e.target.value })); setLoginErrors(p => ({ ...p, username: undefined })); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <FieldError msg={loginErrors.username} />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Password</label>
              <input
                type="password"
                className={inputClass(loginErrors.password)}
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={e => { setLoginForm(p => ({ ...p, password: e.target.value })); setLoginErrors(p => ({ ...p, password: undefined })); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <FieldError msg={loginErrors.password} />
            </div>

            <button
              onClick={handleLogin}
              disabled={loginLoading}
              className="w-full py-4 bg-burgundy text-white font-black rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-60 mt-2"
            >
              {loginLoading ? 'SIGNING IN...' : 'SECURE LOGIN →'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button onClick={() => setActiveTab('register-hospital')} className="text-burgundy font-bold hover:underline">
                Register your hospital
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: REGISTER HOSPITAL
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'register-hospital' && (
        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 max-w-md mx-auto">
          <h2 className="text-2xl font-black mb-2 text-gray-800">Register Hospital</h2>
          <p className="text-sm text-gray-400 mb-8">Create a new hospital account</p>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Hospital Name *</label>
              <input
                className={inputClass(regHospErrors.name)}
                placeholder="e.g. North Memorial Hospital"
                value={regHospForm.name}
                onChange={e => { setRegHospForm(p => ({ ...p, name: e.target.value })); setRegHospErrors(p => ({ ...p, name: undefined })); }}
              />
              <FieldError msg={regHospErrors.name} />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Username *</label>
              <input
                className={inputClass(regHospErrors.username)}
                placeholder="Choose a username (min 3 chars)"
                value={regHospForm.username}
                onChange={e => { setRegHospForm(p => ({ ...p, username: e.target.value })); setRegHospErrors(p => ({ ...p, username: undefined })); }}
              />
              <FieldError msg={regHospErrors.username} />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Password *</label>
              <input
                type="password"
                className={inputClass(regHospErrors.password)}
                placeholder="Min 6 characters"
                value={regHospForm.password}
                onChange={e => { setRegHospForm(p => ({ ...p, password: e.target.value })); setRegHospErrors(p => ({ ...p, password: undefined })); }}
              />
              <FieldError msg={regHospErrors.password} />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Confirm Password *</label>
              <input
                type="password"
                className={inputClass(regHospErrors.confirmPassword)}
                placeholder="Re-enter your password"
                value={regHospForm.confirmPassword}
                onChange={e => { setRegHospForm(p => ({ ...p, confirmPassword: e.target.value })); setRegHospErrors(p => ({ ...p, confirmPassword: undefined })); }}
              />
              <FieldError msg={regHospErrors.confirmPassword} />
            </div>

            <button
              onClick={handleRegisterHospital}
              disabled={regHospLoading}
              className="w-full py-4 bg-burgundy text-white font-black rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-60 mt-2"
            >
              {regHospLoading ? 'REGISTERING...' : 'CREATE ACCOUNT →'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <button onClick={() => setActiveTab('login')} className="text-burgundy font-bold hover:underline">
                Login here
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: REGISTER PATIENT
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'register-patient' && token && (
        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 max-w-lg mx-auto">
          <button onClick={() => setActiveTab('intake')} className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 hover:text-burgundy transition">
            ← Back to Intake
          </button>
          <h2 className="text-2xl font-black mb-2 text-gray-800">New Patient Registration</h2>
          <p className="text-sm text-gray-400 mb-8">Add a new patient to your hospital's records</p>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Full Name *</label>
              <input
                className={inputClass(regPatErrors.name)}
                placeholder="Patient's legal name"
                value={regPatForm.name}
                onChange={e => { setRegPatForm(p => ({ ...p, name: e.target.value })); setRegPatErrors(p => ({ ...p, name: undefined })); }}
              />
              <FieldError msg={regPatErrors.name} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Age *</label>
                <input
                  type="number"
                  className={inputClass(regPatErrors.age)}
                  placeholder="Years"
                  min="1" max="120"
                  value={regPatForm.age}
                  onChange={e => { setRegPatForm(p => ({ ...p, age: e.target.value })); setRegPatErrors(p => ({ ...p, age: undefined })); }}
                />
                <FieldError msg={regPatErrors.age} />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Gender *</label>
                <select
                  className={inputClass()}
                  value={regPatForm.gender}
                  onChange={e => setRegPatForm(p => ({ ...p, gender: e.target.value }))}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">Contact / Mobile *</label>
              <input
                className={inputClass(regPatErrors.contact)}
                placeholder="e.g. 9876543210"
                value={regPatForm.contact}
                onChange={e => { setRegPatForm(p => ({ ...p, contact: e.target.value })); setRegPatErrors(p => ({ ...p, contact: undefined })); }}
              />
              <FieldError msg={regPatErrors.contact} />
            </div>

            <button
              onClick={handleRegisterPatient}
              disabled={regPatLoading}
              className="w-full py-4 bg-burgundy text-white font-black rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-60"
            >
              {regPatLoading ? 'REGISTERING...' : 'CREATE PATIENT RECORD →'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: NEW INTAKE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'intake' && token && (
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-8 text-gray-800">Imaging Acquisition</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* LEFT — Controls */}
              <div className="space-y-6">

                {/* Patient selector */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">
                    Select Registered Patient *
                  </label>
                  <select
                    className={inputClass(intakeErrors.patient)}
                    value={selectedPatientId}
                    onChange={e => { setSelectedPatientId(e.target.value); setIntakeErrors(p => ({ ...p, patient: undefined })); }}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — ID: {p.id}</option>
                    ))}
                  </select>
                  <FieldError msg={intakeErrors.patient} />
                  {patients.length === 0 && (
                    <p className="text-xs text-orange-500 font-bold mt-1">
                      No patients found.{' '}
                      <button onClick={() => setActiveTab('register-patient')} className="underline">Register a patient first</button>
                    </p>
                  )}
                </div>

                {/* Model selector */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">AI Model</label>
                  <select className={inputClass()} value={modelName} onChange={e => setModelName(e.target.value)}>
                    <option value="resnet50">ResNet50 — Best Accuracy (91.4%)</option>
                    <option value="densenet121">DenseNet121 — Best Recall (97.5%)</option>
                    <option value="vgg16">VGG16 — Baseline</option>
                  </select>
                </div>

                {/* Emergency toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="emergency"
                    checked={isEmergency}
                    onChange={e => setIsEmergency(e.target.checked)}
                    className="w-5 h-5 accent-red-600"
                  />
                  <label htmlFor="emergency" className="text-sm font-black text-red-600 uppercase tracking-widest">
                    Mark as Emergency Case
                  </label>
                </div>

                {/* Upload area */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">
                    MRI Scan Image *
                  </label>
                  <div
                    className={`border-4 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer transition hover:bg-gray-50 ${intakeErrors.image ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    onClick={() => document.getElementById('intake-upload')?.click()}
                  >
                    <input
                      type="file"
                      id="intake-upload"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (!['image/jpeg', 'image/png'].includes(file.type)) {
                            setIntakeErrors(p => ({ ...p, image: 'Only JPG and PNG files are accepted' }));
                            return;
                          }
                          setSelectedFile(file);
                          setIntakeErrors(p => ({ ...p, image: undefined }));
                          const reader = new FileReader();
                          reader.onload = ev => setSelectedImage(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="bg-burgundy/10 p-5 rounded-full mb-4">
                      <svg className="w-8 h-8 text-burgundy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    {selectedFile ? (
                      <p className="font-black text-green-600 text-sm">✅ {selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="font-black text-gray-700">Click to upload MRI scan</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG supported</p>
                      </>
                    )}
                  </div>
                  <FieldError msg={intakeErrors.image} />
                </div>

                {/* Submit button */}
                <button
                  onClick={handleIntakeSubmit}
                  disabled={isAnalyzing}
                  className="w-full py-5 bg-burgundy text-white font-black rounded-[1.5rem] shadow-xl hover:shadow-2xl transition disabled:opacity-50 text-sm uppercase tracking-widest"
                >
                  {isAnalyzing ? '⏳ AI ANALYZING SCAN...' : '🧠 PROCESS FOR DIAGNOSTICS'}
                </button>
              </div>

              {/* RIGHT — MRI Preview */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-square w-full flex items-center justify-center border-8 border-white shadow-2xl">
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} className="max-w-full max-h-full object-contain" alt="MRI Preview" />
                      {intakeResult?.gradcam_url && showHeatmap && (
                        <img
                          src={intakeResult.gradcam_url}
                          className="absolute inset-0 w-full h-full object-contain opacity-70"
                          alt="Grad-CAM"
                        />
                      )}
                      {intakeResult?.gradcam_url && (
                        <button
                          onClick={() => setShowHeatmap(!showHeatmap)}
                          className="absolute top-4 right-4 bg-white/95 px-4 py-2 rounded-full text-xs font-black text-burgundy shadow-xl z-10"
                        >
                          {showHeatmap ? 'HIDE GRAD-CAM' : 'SHOW GRAD-CAM'}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Awaiting Imaging Data</p>
                    </div>
                  )}
                </div>

                {intakeResult?.case_id && (
                  <div className="px-6 py-2 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Case Reference: {intakeResult.case_id}
                  </div>
                )}
              </div>
            </div>

            {/* Result display */}
            {intakeResult && (
              <div className="mt-10 space-y-6">
                {intakeResult.prediction === 'Tumor' && intakeResult.confidence >= 0.85 && (
                  <div className="bg-red-700 text-white p-6 rounded-[1.5rem] flex items-center gap-4">
                    <span className="text-3xl">🚨</span>
                    <div>
                      <h3 className="font-black text-lg uppercase">High-Confidence Tumour Detected</h3>
                      <p className="text-sm opacity-90">Immediate clinical review is strongly recommended.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-[1.5rem] p-6 text-center border border-gray-100">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Model Prediction</p>
                    <p className={`text-3xl font-black ${intakeResult.prediction === 'Tumor' ? 'text-red-600' : 'text-green-600'}`}>
                      {intakeResult.prediction?.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-[1.5rem] p-6 text-center border border-gray-100">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Confidence</p>
                    <p className="text-3xl font-black text-gray-800">
                      {Math.round((intakeResult.confidence || 0) * 100)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-[1.5rem] p-6 text-center border border-gray-100">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Risk Level</p>
                    <span className={`px-4 py-2 rounded-full text-sm font-black uppercase ${riskColor(intakeResult.risk_level)}`}>
                      {intakeResult.risk_level || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100">
                  <p className="text-xs font-black uppercase tracking-widest text-burgundy mb-3">AI Clinical Rationale</p>
                  <p className="text-gray-700 italic font-medium">"{intakeResult.explanation}"</p>
                </div>

                <p className="text-xs text-center text-gray-400 font-medium">
                  ⚠ FINAL DIAGNOSIS MUST ALWAYS BE CONFIRMED BY A QUALIFIED MEDICAL PROFESSIONAL.
                </p>
              </div>
            )}
          </div>

          {/* Real-time scan stream */}
          {scans.length > 0 && (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black mb-6 text-gray-800">Recent Scans</h3>
              <div className="space-y-3">
                {scans.slice(0, 5).map((scan: any) => (
                  <div key={scan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-black text-sm text-gray-800">{scan.case_id}</p>
                      <p className="text-xs text-gray-400">Patient: {scan.patient_id} • {new Date(scan.date).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${scan.prediction === 'Tumor' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {scan.prediction}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: WORKSPACE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'workspace' && token && (
        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black mb-8 text-gray-800">Patient Records</h2>
          {patients.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-bold">No patients registered yet.</p>
              <button onClick={() => setActiveTab('register-patient')} className="mt-4 px-6 py-3 bg-burgundy text-white rounded-xl font-black text-sm">
                Register First Patient
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((p: any) => (
                <div key={p.id} className="border border-gray-100 rounded-[1.5rem] p-6 hover:shadow-lg transition bg-gray-50/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center">
                      <span className="text-burgundy font-black text-lg">{p.name?.[0]}</span>
                    </div>
                    <div>
                      <p className="font-black text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.age} yrs • {p.gender}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">ID: {p.id}</p>
                  <p className="text-xs text-gray-500 mt-1">📞 {p.contact}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Not logged in fallback */}
      {!token && activeTab !== 'login' && activeTab !== 'register-hospital' && (
        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 font-bold mb-4">Please login to access this section.</p>
          <button onClick={() => setActiveTab('login')} className="px-8 py-3 bg-burgundy text-white rounded-xl font-black">
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default HospitalPortal;
