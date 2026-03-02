import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Circle, PlayCircle, Loader2, ArrowLeft } from 'lucide-react';

const Roadmap = () => {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Simple local state to track checkboxes
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/roadmap/${id}`);
        setRoadmap(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [id]);

  useEffect(() => {
    if (roadmap) {
       const total = roadmap.steps.reduce((acc, step) => acc + step.checklist.length, 0);
       const checked = Object.values(checkedItems).filter(Boolean).length;
       setProgress(total > 0 ? Math.round((checked / total) * 100) : 0);
    }
  }, [checkedItems, roadmap]);

  const toggleCheck = (stepId, index) => {
    setCheckedItems(prev => ({
       ...prev,
       [`${stepId}-${index}`]: !prev[`${stepId}-${index}`]
    }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium flex justify-center"><Loader2 className="animate-spin mr-2" /> Generating Roadmap...</div>;
  if (!roadmap) return <div className="p-8 text-center text-red-500 font-bold">Failed to load roadmap.</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
       <Link to="/dashboard" className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center mb-6">
         <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
       </Link>

       <div className="card mb-8">
         <h1 className="text-3xl font-extrabold text-gray-900 mb-2 border-l-4 border-brand-600 pl-4 py-1">
           {roadmap.title}
         </h1>
         <p className="text-gray-500 pl-5 mb-8">Follow these auto-generated steps to successfully complete your application.</p>
         
         <div className="mb-8 pl-5 max-w-md">
            <div className="flex justify-between text-xs mb-1 font-bold">
               <span className="text-gray-600 uppercase tracking-widest">Completion</span>
               <span className="text-brand-600 border px-2 py-0.5 rounded-full">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
         </div>
       </div>

       <div className="space-y-6">
          {roadmap.steps.map((step) => (
             <div key={step.id} className="bg-white border-2 border-gray-100 rounded-lg p-6 shadow-sm hover:border-brand-100 transition-colors">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mr-3">
                      {step.id}
                    </span>
                    {step.text}
                  </h3>
                  <button className="text-brand-500 hover:text-brand-700 p-2 rounded-full hover:bg-brand-50 border border-transparent transition-colors flex items-center text-sm font-bold" title="Listen to narration">
                    <PlayCircle size={18} className="mr-1" /> Voice Narration
                  </button>
                </div>
                
                <ul className="space-y-3 pl-11">
                  {step.checklist.map((item, idx) => {
                     const isChecked = checkedItems[`${step.id}-${idx}`] || false;
                     return (
                       <li key={idx} className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded -ml-2" onClick={() => toggleCheck(step.id, idx)}>
                         <div className="flex-shrink-0 mt-0.5 text-brand-600">
                           {isChecked ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-300" />}
                         </div>
                         <span className={`ml-3 text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                           {item}
                         </span>
                       </li>
                     );
                  })}
                </ul>
             </div>
          ))}
       </div>
    </div>
  );
};

export default Roadmap;
