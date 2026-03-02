import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Volume2, Volume1, FileText, ArrowLeft, ExternalLink } from 'lucide-react';

const SchemeDetail = () => {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState({ lang: 'ta', slow: false });
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [translatedText, setTranslatedText] = useState('');

  useEffect(() => {
    // In a real app we fetch by ID using API, here we might pull from local storage for mock
    const fetchScheme = async () => {
      try {
        const stored = localStorage.getItem('eligible_schemes');
        if (stored) {
          const matched = JSON.parse(stored).find(s => s.scheme._id === id);
          if (matched) setScheme(matched.scheme);
        }
        // Fallback to API
        if (!scheme) {
          const res = await axios.get(`http://localhost:5001/api/scheme/${id}`);
          setScheme(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
  }, [id, scheme]);

  const handleVoiceExplain = async () => {
    setPlaying(true);
    try {
      const res = await axios.post('http://localhost:5001/api/bhashini/explain', {
        text: `You are eligible for ${scheme.name}. It provides ${scheme.benefit_amount} rupees. Please apply before ${new Date(scheme.deadline).toLocaleDateString()}.`,
        targetLanguage: voiceSettings.lang
      });
      setTranslatedText(res.data.translated_text);
      setAudioUrl(res.data.audio_url);
      
      // Mock playing audio timeout
      setTimeout(() => setPlaying(false), 4000);
    } catch (err) {
      console.error(err);
      setPlaying(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading official details...</div>;
  if (!scheme) return <div className="p-8 text-center text-red-500 font-bold">Scheme not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
       <Link to="/dashboard" className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center mb-6">
         <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
       </Link>

       <div className="card">
         <h1 className="text-3xl font-extrabold text-gray-900 border-b border-gray-200 pb-4 mb-6">
           {scheme.name}
         </h1>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
           <div className="md:col-span-2">
             <h2 className="text-xl font-bold text-gray-800 mb-2">Description</h2>
             <p className="text-gray-700 leading-relaxed mb-6">{scheme.description}</p>
             
             <h2 className="text-xl font-bold text-gray-800 mb-2">Eligibility Rules</h2>
             <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
               {scheme.eligibility_rules.income_limit && scheme.eligibility_rules.income_limit < Infinity && <li>Family income must be below ₹{scheme.eligibility_rules.income_limit.toLocaleString()}</li>}
               {scheme.eligibility_rules.percentage_required > 0 && <li>Minimum {scheme.eligibility_rules.percentage_required}% marks in previous exam</li>}
               {scheme.eligibility_rules.education_level && <li>Current Education: {scheme.eligibility_rules.education_level}</li>}
               {scheme.eligibility_rules.single_girl_child_only && <li>Applicable for Single Girl Child only</li>}
               {scheme.eligibility_rules.first_graduate_only && <li>Applicable for First Generation Graduates only</li>}
             </ul>

             <h2 className="text-xl font-bold text-gray-800 mb-2">Required Documents</h2>
             <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
               {scheme.required_documents?.map((doc, idx) => (
                 <li key={idx}>Aadhaar Number ({doc})</li>
               ))}
               {!scheme.required_documents?.length && <li>Basic identity and academic records</li>}
             </ul>
           </div>

           <div className="bg-brand-50 rounded-lg p-6 border border-brand-200 flex flex-col justify-between h-full">
             <div>
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Scheme Details</h3>
               <div className="mb-4">
                 <span className="block text-xl font-extrabold text-brand-700">₹{scheme.benefit_amount.toLocaleString()}</span>
                 <span className="text-xs text-gray-500">Maximum Annual Benefit</span>
               </div>
               <div className="mb-4">
                 <span className="block text-md font-bold text-red-600">{new Date(scheme.deadline).toLocaleDateString()}</span>
                 <span className="text-xs text-gray-500">Application Deadline</span>
               </div>
             </div>
             
             <a href={scheme.apply_link || '#'} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center flex items-center justify-center mt-6">
                Official Portal <ExternalLink size={16} className="ml-2" />
             </a>
           </div>
         </div>

         <div className="section-divider"></div>

         {/* Voice Engine Mock */}
         <div className="bg-white border-2 border-brand-500 rounded-lg p-6 relative overflow-hidden">
            <h2 className="text-xl font-bold text-brand-600 mb-2 flex items-center">
              <Volume2 className="mr-2" /> Bhashini Voice Explainer
            </h2>
            <p className="text-sm text-gray-600 mb-6">Listen to scheme details in your mother tongue for better comprehension.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <select 
                className="input-field max-w-[200px]" 
                value={voiceSettings.lang} 
                onChange={e => setVoiceSettings({...voiceSettings, lang: e.target.value})}
              >
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिंदी)</option>
              </select>
              
              <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                <input type="checkbox" checked={voiceSettings.slow} onChange={e => setVoiceSettings({...voiceSettings, slow: e.target.checked})} className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
                <span>Slow Mode</span>
              </label>

              <button 
                onClick={handleVoiceExplain} 
                disabled={playing}
                className={`btn-outline ${playing ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-500' : ''}`}
              >
                 {playing ? 'Playing Audio...' : 'Generate Voice Excerpt'}
              </button>
            </div>

            {translatedText && (
              <div className="mt-6 bg-yellow-50 p-4 border-l-4 border-yellow-400">
                 <h4 className="text-sm font-bold text-gray-800 mb-1">Translated Subtitles:</h4>
                 <p className="text-lg text-gray-900 font-medium">{translatedText}</p>
                 <div className="mt-2 text-xs text-gray-500">Powered by Bhashini AI</div>
              </div>
            )}
         </div>

       </div>
    </div>
  );
};

export default SchemeDetail;
