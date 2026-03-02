import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white max-w-5xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-brand-200/50">
        
        {/* Left Side: Brand branding */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-brand-600 to-brand-800 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-500 opacity-20 filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-400 opacity-20 filter blur-3xl"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner shadow-white/10">
              <BookOpen size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">VidyaGrant</h1>
          </div>
          
          <div className="relative z-10 mt-12 mb-auto">
            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              Empowering Women Through Education
            </h2>
            <p className="text-brand-100 text-lg leading-relaxed mb-8">
              Join thousands of eligible candidates discovering scholarships and financial aid programs designed to fuel your career and academic journey.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-brand-700 bg-brand-${300 + i * 100} flex items-center justify-center text-xs font-medium`}>
                    👩‍🎓
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-brand-50">Joined by 10k+ students</p>
            </div>
          </div>
          
          <div className="relative z-10 text-sm text-brand-200 flex justify-between items-center mt-12 border-t border-brand-500/30 pt-6">
            <p>© {new Date().getFullYear()} VidyaGrant</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors duration-200">Help</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Terms</a>
            </div>
          </div>
        </div>
        
        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-14 lg:p-16 flex flex-col justify-center bg-white relative">
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          
          {children}
          
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
