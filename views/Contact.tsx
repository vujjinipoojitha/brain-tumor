
import React from 'react';

interface Props {
  onNavigate: (view: string) => void;
}

const Contact: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <nav className="mb-12 flex items-center border-b border-gray-100 pb-6">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-burgundy transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          BACK
        </button>
      </nav>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        <div className="md:w-1/2 bg-burgundy p-12 text-white">
          <h2 className="text-3xl font-black mb-6 tracking-tight">Facility Support</h2>
          <p className="text-burgundy-100 mb-10 opacity-80 font-medium">Our technical team is available 24/7 for hospital integration support and AI model maintenance.</p>
          
          <div className="space-y-8">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002-2z" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-burgundy-200 tracking-widest">Email Inquiry</p>
                <span className="text-sm font-bold">support@tumornot.ai</span>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-burgundy-200 tracking-widest">Physical Lab</p>
                <span className="text-sm font-bold">121 Neurological Way, Medical Dist.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 p-12 bg-white">
          <h3 className="text-xl font-bold mb-6 text-gray-800 tracking-tight">Institutional Inquiry</h3>
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Inquiry sent. Our clinical team will contact your facility shortly."); }}>
            <div>
              <input type="text" placeholder="Full Name" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm" />
            </div>
            <div>
              <input type="email" placeholder="Institutional Email" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm" />
            </div>
            <div>
              <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-500">
                <option>Technical Support</option>
                <option>Facility Integration</option>
                <option>Data Security Inquiry</option>
              </select>
            </div>
            <div>
              <textarea placeholder="How can we assist your facility?" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm h-32"></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-burgundy text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition active:scale-95">Submit Request</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
