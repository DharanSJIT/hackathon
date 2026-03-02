import React, { useState } from 'react';
import axios from 'axios';
import { Bot, User, ArrowRight, Loader2, PlayCircle, Briefcase, GraduationCap } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Namaste! Please answer 3 quick questions to help me find the best scholarships for you.' },
    { type: 'bot', text: 'What class are you currently studying in? (e.g. 10, 11, 12, 13 for UG1)' }
  ]);
  const [inputVal, setInputVal] = useState('');
  
  const [answers, setAnswers] = useState({
    student_class: null,
    father_occupation: null,
    marks: null
  });
  const [step, setStep] = useState(0);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [applyState, setApplyState] = useState({});

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    // Add user msg
    setMessages(prev => [...prev, { type: 'user', text: inputVal }]);
    const val = inputVal;
    setInputVal('');

    let nextStep = step;
    let newAnswers = { ...answers };

    if (step === 0) {
      newAnswers.student_class = val;
      nextStep = 1;
      setMessages(prev => [...prev, { type: 'bot', text: 'Great. What is your father\'s occupation? (e.g. Farmer, Teacher, specify "Any" if you skip)' }]);
    } else if (step === 1) {
      newAnswers.father_occupation = val;
      nextStep = 2;
      setMessages(prev => [...prev, { type: 'bot', text: 'Finally, what were your previous exam marks percentage? (e.g. 85)' }]);
    } else if (step === 2) {
      newAnswers.marks = val;
      nextStep = 3;
      setMessages(prev => [...prev, { type: 'bot', text: 'Processing your top matches using AI...' }]);
      await fetchMatches(newAnswers);
      return;
    }

    setAnswers(newAnswers);
    setStep(nextStep);
  };

  const fetchMatches = async (payload) => {
    setLoading(true);
    try {
       const res = await axios.post('http://localhost:5001/api/match', payload);
       setMatches(res.data);
       setMessages(prev => [...prev, { type: 'bot', text: `I found ${res.data.length} amazing opportunities for you!` }]);
    } catch(e) {
       console.error(e);
       setMessages(prev => [...prev, { type: 'bot', text: "There was an error communicating with the Match Engine." }]);
    } finally {
       setLoading(false);
    }
  };

  const handleListen = async (sch_id, description) => {
    setPlayingId(sch_id);
    try {
      // Mock Bhashini API
      const res = await axios.post('http://localhost:5001/api/voice', { text: description });
      // Mute simulate audio delay
      setTimeout(() => {
        alert("Audio Voice Proxy: " + res.data.translated_text);
        setPlayingId(null);
      }, 2000);
    } catch (e) {
      setPlayingId(null);
    }
  };

  const handleApply = async (sch_id) => {
    setApplyState({...applyState, [sch_id]: 'loading'});
    try {
      const res = await axios.post('http://localhost:5001/api/apply', { scholarship_id: sch_id, email: 'test@example.com' });
      setApplyState({...applyState, [sch_id]: 'success'});
      alert(res.data.message);
    } catch (e) {
      setApplyState({...applyState, [sch_id]: 'error'});
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 h-screen flex flex-col">
       <div className="bg-brand-600 text-white rounded-t-xl p-4 shadow flex items-center justify-between">
          <div className="flex items-center">
            <Bot size={28} className="mr-3 text-brand-100" />
            <div>
              <h2 className="font-bold text-lg leading-tight">SakhiScholar AI</h2>
              <p className="text-brand-200 text-xs">Always proactive. Try Web or WhatsApp Mode.</p>
            </div>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto bg-gray-50 border-x border-gray-200 p-4 space-y-4 shadow-inner">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'bot' ? 'justify-start' : 'justify-end'}`}>
               {msg.type === 'bot' && <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center mr-2 mt-1"><Bot size={16} className="text-brand-600"/></div>}
               
               <div className={`p-3 max-w-[80%] rounded-2xl ${msg.type === 'bot' ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none' : 'bg-brand-600 text-white rounded-tr-none'}`}>
                 {msg.text}
               </div>
               
               {msg.type === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 mt-1"><User size={16} className="text-gray-500"/></div>}
            </div>
          ))}

          {loading && (
             <div className="flex justify-start">
               <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none flex items-center text-gray-500">
                  <span className="animate-pulse mr-1">.</span><span className="animate-pulse mr-1 delay-75">.</span><span className="animate-pulse delay-150">.</span>
               </div>
             </div>
          )}

          {matches.length > 0 && (
             <div className="pt-4 space-y-4 pb-12">
               {matches.map((item, index) => (
                  <div key={index} className="bg-white border top-border border-brand-200 shadow-sm p-4 rounded-xl border-l-4 border-l-brand-600">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">{item.scholarship.name}</h4>
                       <span className="ml-2 bg-green-100 text-green-800 font-bold text-xs px-2 py-1 flex-shrink-0 rounded-full">{Math.round(item.eligibility_score)}% AI Match</span>
                     </div>
                     
                     <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.scholarship.description}</p>
                     
                     <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500 mb-4">
                        <span className="bg-gray-100 px-2 py-1 rounded">₹{item.scholarship.amount} Base</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Class: {item.scholarship.eligibility_criteria.min_class}+</span>
                     </div>

                     <div className="flex items-center gap-2 border-t pt-3 border-gray-100 mt-2">
                       <button onClick={() => handleListen(item.scholarship._id, item.scholarship.description)} disabled={playingId === item.scholarship._id} className="flex-1 py-2 px-3 flex items-center justify-center text-brand-600 border border-brand-500 hover:bg-brand-50 rounded-lg text-sm font-bold transition-colors">
                          {playingId === item.scholarship._id ? <Loader2 size={16} className="animate-spin mr-1"/> : <PlayCircle size={16} className="mr-1"/>}
                          Listen In Hindi
                       </button>
                       <button 
                          onClick={() => handleApply(item.scholarship._id)} 
                          disabled={applyState[item.scholarship._id] === 'success'}
                          className={`flex-1 py-2 px-3 text-center text-white rounded-lg text-sm font-bold transition-colors shadow-sm ${applyState[item.scholarship._id] === 'success' ? 'bg-green-500' : 'bg-brand-600 hover:bg-brand-700'}`}>
                          {applyState[item.scholarship._id] === 'loading' ? 'Applying...' : applyState[item.scholarship._id] === 'success' ? 'Applied! ✓' : 'One-Click Apply'}
                       </button>
                     </div>
                  </div>
               ))}
               
               <button onClick={() => { setStep(0); setMatches([]); setMessages([{type: 'bot', text: 'Let\'s start over. What class are you in?'}]) }} className="w-full py-3 text-gray-500 font-bold text-sm hover:underline">
                 Start Over
               </button>
             </div>
          )}
       </div>

       <form onSubmit={handleSend} className="bg-white border border-t-0 p-4 border-gray-200 rounded-b-xl flex gap-2">
          <input 
             type="text" 
             disabled={step >= 3}
             value={inputVal} 
             onChange={e => setInputVal(e.target.value)}
             placeholder={step >= 3 ? "Process finished..." : "Type your answer..."} 
             className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button disabled={step >= 3 || !inputVal.trim()} type="submit" className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 transition-colors shrink-0">
             <ArrowRight size={18} />
          </button>
       </form>
    </div>
  );
};

export default ChatInterface;
