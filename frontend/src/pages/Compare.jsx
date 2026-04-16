import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';

const Compare = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [sortBy, setSortBy] = useState('finalRankScore');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    const matched = localStorage.getItem('eligible_schemes');
    if (!matched) {
      navigate('/profile');
      return;
    }
    const parsed = JSON.parse(matched);
    const normalized = parsed
      .map(m => {
        if (m?.scheme) return m;
        if (m?.scholarship) return { scheme: m.scholarship, eligibilityScore: m.eligibility_score ?? 75, finalRankScore: m.eligibility_score ?? 75 };
        return { scheme: m, eligibilityScore: m?.eligibilityScore ?? 75, finalRankScore: m?.finalRankScore ?? 75 };
      })
      .filter(m => m.scheme?._id);
    setSchemes(normalized);
  }, [navigate]);

  const sortedSchemes = [...schemes].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Deep access for nested scheme properties
    if (sortBy === 'benefit_amount') {
       aVal = a.scheme.benefit_amount;
       bVal = b.scheme.benefit_amount;
    }
    if (sortBy === 'scheme_name') {
       aVal = a.scheme.name;
       bVal = b.scheme.name;
    }

    if (aVal < bVal) return sortOrder === 'desc' ? 1 : -1;
    if (aVal > bVal) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  if (schemes.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
       <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-brand-600 mb-2">Scheme Comparison</h1>
          <p className="text-gray-500">Cross-reference eligible schemes to make the best decision for your education.</p>
       </div>

       <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-brand-50">
               <tr>
                 <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-brand-100 transition-colors" onClick={() => toggleSort('scheme_name')}>
                   <div className="flex items-center">
                     Scheme Name <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                   </div>
                 </th>
                 <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-brand-100 transition-colors" onClick={() => toggleSort('benefit_amount')}>
                   <div className="flex items-center">
                     ₹ Benefit <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                   </div>
                 </th>
                 <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                   Tuition Covered
                 </th>
                 <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                   Mentorship
                 </th>
                 <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                   Renewable
                 </th>
                 <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-brand-600 uppercase tracking-wider cursor-pointer hover:bg-brand-100 transition-colors" onClick={() => toggleSort('finalRankScore')}>
                   <div className="flex items-center justify-end">
                     AI Score <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                   </div>
                 </th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {sortedSchemes.map((item, idx) => (
                 <tr key={item.scheme._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                   <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">
                     {item.scheme.name}
                   </td>
                   <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-medium">
                     ₹{(item.scheme.benefit_amount || item.scheme.amount || 0).toLocaleString()}
                   </td>
                   <td className="px-6 py-5 whitespace-nowrap text-sm text-center border-r border-gray-100">
                     {item.scheme.tuition_coverage ? (
                       <span className="text-green-600 font-bold">Yes</span>
                     ) : (
                       <span className="text-gray-400">No</span>
                     )}
                   </td>
                   <td className="px-6 py-5 whitespace-nowrap text-sm text-center border-r border-gray-100">
                     {item.scheme.career_support ? (
                       <span className="text-green-600 font-bold">Yes</span>
                     ) : (
                       <span className="text-gray-400">No</span>
                     )}
                   </td>
                   <td className="px-6 py-5 whitespace-nowrap text-sm text-center border-r border-gray-100">
                     {item.scheme.renewable ? (
                       <span className="text-brand-600 font-bold">Yearly</span>
                     ) : (
                       <span className="text-gray-400">One-time</span>
                     )}
                   </td>
                   <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-brand-600 text-right">
                     {Math.round(item.finalRankScore)} / 100
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
};

export default Compare;