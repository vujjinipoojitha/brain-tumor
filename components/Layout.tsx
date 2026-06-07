import React from 'react';
import { Role } from '../types';
import Footer from './Footer'; // STEP 1: ADD THIS IMPORT

interface Props {
  children: React.ReactNode;
  userRole: Role;
  userName?: string;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

const Layout: React.FC<Props> = ({ children, userRole, userName, onLogout, onNavigate, currentView }) => {
  const isDark = false; 

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-[#F5F5F0] text-gray-800'}`}>
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="bg-burgundy p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2-2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-burgundy tracking-tight">TumORnot</h1>
            <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-widest">AI Brain Diagnostics</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => onNavigate('home')} className={`text-sm font-bold transition ${currentView === 'home' ? 'text-burgundy' : 'text-gray-600 hover:text-burgundy'}`}>HOME</button>
          
          {userRole === Role.GUEST ? (
            <>
              <button onClick={() => onNavigate('patient-login')} className="text-sm font-medium text-gray-600 hover:text-burgundy transition">Patient Portal</button>
              <button onClick={() => onNavigate('hospital-login')} className="text-sm font-medium text-gray-600 hover:text-burgundy transition">Hospital Portal</button>
            </>
          ) : (
            <div className="flex items-center gap-4 border-l pl-6 border-gray-100">
              <span className="text-sm font-medium text-gray-500">Welcome, <span className="text-burgundy font-bold">{userName}</span></span>
              <button onClick={onLogout} className="text-xs font-black px-4 py-2 border border-burgundy text-burgundy rounded-full hover:bg-burgundy hover:text-white transition uppercase tracking-widest">Sign Out</button>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        {children}
      </main>

      {/* STEP 2: ADD THE FOOTER HERE */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default Layout;