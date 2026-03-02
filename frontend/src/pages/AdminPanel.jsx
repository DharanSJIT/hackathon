import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Trash, Edit, Plus, Loader2 } from 'lucide-react';

const AdminPanel = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Minimal state for creating new
  const [formData, setFormData] = useState({
    scheme_id: '',
    name: '',
    description: '',
    amount: '',
    deadline: '',
    min_class: '',
    max_class: '',
    father_occupation_allowed: '',
    min_marks_percentage: '',
    social_uplift_score: 0,
    application_link: ''
  });

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/scholarships');
      setScholarships(res.data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        scheme_id: formData.scheme_id,
        name: formData.name,
        description: formData.description,
        amount: Number(formData.amount),
        deadline: formData.deadline,
        social_uplift_score: Number(formData.social_uplift_score),
        application_link: formData.application_link,
        eligibility_criteria: {
           min_class: Number(formData.min_class),
           max_class: formData.max_class ? Number(formData.max_class) : undefined,
           min_marks_percentage: Number(formData.min_marks_percentage),
           father_occupation_allowed: formData.father_occupation_allowed.split(',').map(s=>s.trim())
        }
      };
      await axios.post('http://localhost:5001/api/scholarship', payload);
      alert('Created Successfully');
      fetchScholarships(); // refresh
      // Reset Form (simple clear)
    } catch(err) {
      alert("Error creating: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this scheme permanently?")) return;
    try {
       await axios.delete(`http://localhost:5001/api/scholarship/${id}`);
       fetchScholarships();
    } catch(err) {
       alert("Error deleting");
    }
  };

  const handleUploadJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // We expect either an array of objects, or a single object.
      const arr = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      let count = 0;
      for (const item of arr) {
         try {
            await axios.post('http://localhost:5001/api/scholarship', item);
            count++;
         } catch (err) {
            console.error("Failed to insert item:", item.scheme_id, err);
         }
      }

      alert(`Successfully uploaded ${count} scholarships out of ${arr.length}`);
      fetchScholarships(); // Refresh
      e.target.value = null; // Clear input
    } catch(err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <div className="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">Manage active scholarships, rules, and AI parameters.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <label className="btn-primary cursor-pointer flex items-center bg-brand-600">
               Upload JSON
               <input type="file" accept=".json" onChange={handleUploadJSON} className="hidden" />
            </label>
            <button onClick={fetchScholarships} className="btn-outline flex items-center">
               <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin':''}`} /> Refresh
            </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="lg:col-span-1 border border-[#E0E0E0] rounded-xl p-6 bg-white overflow-y-auto max-h-[80vh]">
             <h3 className="text-lg font-bold border-b border-gray-100 pb-2 mb-4 flex items-center">
               <Plus size={18} className="mr-2 text-brand-600"/> Add New Scheme
             </h3>
             <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Scheme ID *</label>
                  <input type="text" name="scheme_id" onChange={handleChange} required className="input-field text-sm p-2"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                  <input type="text" name="name" onChange={handleChange} required className="input-field text-sm p-2"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
                  <textarea name="description" onChange={handleChange} required className="input-field text-sm p-2" rows="3"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₹) *</label>
                    <input type="number" name="amount" onChange={handleChange} required className="input-field text-sm p-2"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Deadline Date *</label>
                    <input type="date" name="deadline" onChange={handleChange} required className="input-field text-sm p-2"/>
                  </div>
                </div>

                <div className="bg-brand-50 p-3 rounded mt-4">
                   <h4 className="text-xs font-bold text-brand-700 uppercase mb-2">AI Eligibility Rules</h4>
                   <div className="grid grid-cols-2 gap-2 mb-2">
                     <div>
                       <label className="block text-xs font-medium text-gray-600">Min Class</label>
                       <input type="number" name="min_class" onChange={handleChange} className="input-field text-sm p-1.5"/>
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-600">Max Class</label>
                       <input type="number" name="max_class" onChange={handleChange} className="input-field text-sm p-1.5"/>
                     </div>
                   </div>
                   <div className="mb-2">
                     <label className="block text-xs font-medium text-gray-600">Occupations (comma separated)</label>
                     <input type="text" name="father_occupation_allowed" onChange={handleChange} placeholder="Farmer, Any" className="input-field text-sm p-1.5"/>
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-gray-600">Min Marks %</label>
                     <input type="number" name="min_marks_percentage" onChange={handleChange} className="input-field text-sm p-1.5"/>
                   </div>
                </div>

                <div className="pt-4 mt-2">
                  <button type="submit" className="btn-primary w-full shadow pointer">Publish Scholarship</button>
                </div>
             </form>
          </div>

          {/* List View */}
          <div className="lg:col-span-2">
             {loading ? <div className="text-center p-12 text-gray-400"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div> : (
               <div className="space-y-4">
                  {scholarships.length === 0 ? <p className="text-center bg-white p-8 border rounded-lg">No scholarships found in DB.</p> : null}
                  {scholarships.map(sch => (
                     <div key={sch._id} className="bg-white border rounded-xl overflow-hidden hover:border-brand-500 focus-within:ring shadow-sm">
                        <div className="p-4 flex flex-col md:flex-row justify-between">
                           <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-1">
                                {sch.name} <span className="text-xs font-normal text-gray-500 ml-2">({sch.scheme_id})</span>
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-1 mb-2">{sch.description}</p>
                              
                              <div className="flex flex-wrap gap-2 text-xs">
                                 <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                                   ₹{sch.amount}
                                 </span>
                                 <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                                   Class: {sch.eligibility_criteria?.min_class || 'Any'} - {sch.eligibility_criteria?.max_class || 'Any'}
                                 </span>
                                 <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                                   Exp: {new Date(sch.deadline).toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                           
                           <div className="mt-4 md:mt-0 md:ml-4 flex items-center justify-end">
                              <button onClick={() => handleDelete(sch._id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                                 <Trash size={18} />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default AdminPanel;
