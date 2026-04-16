import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Volume2, ArrowLeft, ExternalLink } from 'lucide-react';

const SchemeDetail = () => {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState({ lang: 'ta', slow: false });
  const [playing, setPlaying] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        let foundScheme = null;

        // 🔹 Try localStorage first
        const stored = localStorage.getItem('eligible_schemes');
        if (stored) {
          const data = JSON.parse(stored).map(m => {
            if (m?.scheme) return m;
            if (m?.scholarship) return { scheme: m.scholarship };
            return { scheme: m };
          });

          const matched = data.find(s => s.scheme?._id === id);
          if (matched) {
            foundScheme = matched.scheme;
            setScheme(foundScheme);
          }
        }

        // 🔹 Fallback to API only if not found locally
        if (!foundScheme) {
          const res = await axios.get(`http://localhost:5001/api/scheme/${id}`);
          setScheme(res.data);
        }

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [id]);

  const handleVoiceExplain = async () => {
    if (!scheme) return;

    setPlaying(true);
    try {
      const res = await axios.post('http://localhost:5001/api/bhashini/explain', {
        text: `You are eligible for ${scheme?.name}. It provides ${scheme?.benefit_amount || 0} rupees. Please apply before ${scheme?.deadline ? new Date(scheme.deadline).toLocaleDateString() : ''}.`,
        targetLanguage: voiceSettings.lang
      });

      setTranslatedText(res.data.translated_text);

      setTimeout(() => setPlaying(false), 4000);
    } catch (err) {
      console.error(err);
      setPlaying(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading official details...</div>;
  }

  if (!scheme) {
    return <div className="p-8 text-center text-red-500 font-bold">Scheme not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link to="/dashboard" className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center mb-6">
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </Link>

      <div className="card">
        <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4 mb-6">
          {scheme?.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            
            <h2 className="text-xl font-bold mb-2">Description</h2>
            <p className="text-gray-700 mb-6">{scheme?.description}</p>

            <h2 className="text-xl font-bold mb-2">Eligibility Rules</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              {scheme?.eligibility_rules?.income_limit && (
                <li>
                  Family income must be below ₹
                  {Number(scheme.eligibility_rules.income_limit).toLocaleString('en-IN')}
                </li>
              )}

              {scheme?.eligibility_rules?.percentage_required > 0 && (
                <li>
                  Minimum {scheme.eligibility_rules.percentage_required}% marks
                </li>
              )}

              {scheme?.eligibility_rules?.education_level && (
                <li>
                  Education: {scheme.eligibility_rules.education_level}
                </li>
              )}

              {scheme?.eligibility_rules?.single_girl_child_only && (
                <li>Single Girl Child only</li>
              )}

              {scheme?.eligibility_rules?.first_graduate_only && (
                <li>First Graduate only</li>
              )}
            </ul>

            <h2 className="text-xl font-bold mb-2">Required Documents</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              {scheme?.required_documents?.length ? (
                scheme.required_documents.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))
              ) : (
                <li>Basic identity and academic records</li>
              )}
            </ul>
          </div>

          {/* Right panel */}
          <div className="bg-brand-50 p-6 rounded-lg border flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2">Scheme Details</h3>

              <div className="mb-4">
                <span className="block text-xl font-bold text-brand-700">
                  ₹{Number(scheme?.benefit_amount || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-500">Annual Benefit</span>
              </div>

              <div className="mb-4">
                <span className="block text-md font-bold text-red-600">
                  {scheme?.deadline
                    ? new Date(scheme.deadline).toLocaleDateString()
                    : 'N/A'}
                </span>
                <span className="text-xs text-gray-500">Deadline</span>
              </div>
            </div>

            <a
              href={scheme?.apply_link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex justify-center items-center mt-6"
            >
              Official Portal <ExternalLink size={16} className="ml-2" />
            </a>
          </div>
        </div>

        {/* Voice Section */}
        {/* <div className="border-2 border-brand-500 rounded-lg p-6">
          <h2 className="text-xl font-bold text-brand-600 mb-2 flex items-center">
            <Volume2 className="mr-2" /> Voice Explainer
          </h2>

          <div className="flex gap-4 items-center">
            <select
              value={voiceSettings.lang}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, lang: e.target.value })}
              className="input-field"
            >
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
            </select>

            <button
              onClick={handleVoiceExplain}
              disabled={playing}
              className="btn-outline"
            >
              {playing ? 'Playing...' : 'Play Audio'}
            </button>
          </div>

          {translatedText && (
            <div className="mt-4 bg-yellow-50 p-3">
              <p>{translatedText}</p>
            </div>
          )}
        </div> */}

      </div>
    </div>
  );
};

export default SchemeDetail;