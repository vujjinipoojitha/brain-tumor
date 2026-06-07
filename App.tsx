import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Role, User } from './types';

import Home from './views/Home';
import HospitalPortal from './views/HospitalPortal';
import PatientPortal from './views/PatientPortal';
import About from './views/About';
import FAQ from './views/FAQ';
import HospitalSignup from './views/HospitalSignup';
import Privacy from './views/Privacy';
import Terms from './views/Terms';
import Contact from './views/Contact';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('hospital_token');
    const name = localStorage.getItem('hospital_name');
    if (token && name) {
      setUser({ id: 'hospital', name, role: Role.HOSPITAL, hospitalName: name });
    }
  }, []);

  const handleNavigate = (view: string) => {
    if (view === 'patient-login' && !user) {
      setUser({ id: 'P101', name: 'Anusha', role: Role.PATIENT });
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_name');
    setUser(null);
    setCurrentView('home');
  };

  const handleHospitalLogin = (name: string) => {
    setUser({ id: 'hospital', name, role: Role.HOSPITAL, hospitalName: name });
  };

  return (
    <Layout
      userRole={user?.role || Role.GUEST}
      userName={user?.name || ''}
      currentView={currentView}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {currentView === 'home' && <Home onNavigate={handleNavigate} />}

      {currentView === 'hospital-login' && (
        <HospitalPortal user={user} onLogin={handleHospitalLogin} />
      )}

      {currentView === 'patient-login' && user && (
        <PatientPortal user={user} />
      )}

      {currentView === 'about' && <About onNavigate={handleNavigate} />}
      {currentView === 'faq' && <FAQ onNavigate={handleNavigate} />}
      {currentView === 'hospital-signup' && <HospitalSignup onNavigate={handleNavigate} />}
      {currentView === 'privacy' && <Privacy onNavigate={handleNavigate} />}
      {currentView === 'terms' && <Terms onNavigate={handleNavigate} />}
      {currentView === 'contact' && <Contact onNavigate={handleNavigate} />}
    </Layout>
  );
}

export default App;