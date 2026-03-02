import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

const Tracker = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Generate mock applications based on stored matched schemes for demonstration
    const stored = localStorage.getItem('eligible_schemes');
    if (stored) {
      const schemes = JSON.parse(stored).slice(0, 3).map((match, idx) => {
        let status = 'Pending';
        if (idx === 0) status = 'Given Reminder';
        if (idx === 1) status = 'In Progress';
        if (idx === 2) status = 'Submitted';
        
        let daysLeft = idx === 0 ? 3 : idx === 1 ? 15 : 45; // Mock days

        return {
          id: match.scheme._id,
          schemeName: match.scheme.name,
          benefit: match.scheme.benefit_amount,
          deadline: new Date(match.scheme.deadline).toLocaleDateString(),
          status: status,
          daysLeft: daysLeft,
          reminderSent: idx === 0
        };
      });
      setApplications(schemes);
    }
  }, []);

  const getStatusColor = (status, daysLeft) => {
    if (status === 'Submitted') return 'bg-green-100 border-green-500 text-green-800';
    if (status === 'In Progress') return 'bg-blue-100 border-blue-500 text-blue-800';
    if (daysLeft <= 7) return 'bg-red-100 border-red-500 text-red-800';
    return 'bg-gray-100 border-gray-400 text-gray-800';
  };
  
  const getStatusIcon = (status, daysLeft) => {
    if (status === 'Submitted') return <CheckCircle2 size={18} className="text-green-600 mr-2" />;
    if (status === 'In Progress') return <Clock size={18} className="text-blue-600 mr-2" />;
    if (daysLeft <= 7) return <AlertCircle size={18} className="text-red-600 mr-2" />;
    return <Calendar size={18} className="text-gray-600 mr-2" />;
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link to="/dashboard" className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center mb-6">
         <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
       </Link>

      <div className="mb-8 p-6 bg-white border border-[#E0E0E0] rounded-lg border-t-4 border-t-brand-600">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Application Tracker
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Monitor your active applications and upcoming deadlines to ensure you never miss out on eligible funding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {applications.map(app => {
            const isRed = app.daysLeft <= 7 && app.status !== 'Submitted';
            return (
              <div key={app.id} className={`card border-l-4 ${getStatusColor(app.status, app.daysLeft).split(' ')[1]} transition-shadow hover:shadow-md cursor-default flex flex-col justify-between`}>
                 <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900 pr-4">{app.schemeName}</h3>
                      <div className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(app.status, app.daysLeft)} border-0`}>
                        {app.status === 'Given Reminder' && isRed ? 'Deadline Near' : app.status}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Annual Benefit</span>
                        <span className="text-gray-900 font-bold">₹{app.benefit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Deadline</span>
                        <span className="text-gray-900 font-bold">{app.deadline}</span>
                      </div>
                      {app.status !== 'Submitted' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">Countdown</span>
                          <span className={`font-bold ${isRed ? 'text-red-600' : 'text-orange-600'}`}>{app.daysLeft} days left</span>
                        </div>
                      )}
                    </div>
                 </div>
                 
                 <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm font-bold">
                       {getStatusIcon(app.status, app.daysLeft)}
                       <span className="hidden sm:inline-block">Status Indicator</span>
                    </div>
                    {app.reminderSent && (
                       <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-sm font-medium">
                         AI Reminder Active
                       </span>
                    )}
                 </div>
              </div>
            );
         })}
      </div>
    </div>
  );
};

export default Tracker;
