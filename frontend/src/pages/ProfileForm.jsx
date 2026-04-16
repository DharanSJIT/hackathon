import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../App';
import { Loader2, ArrowRight } from 'lucide-react';

const ProfileForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: 'dummy_for_hackathon', phone: '', age: '',
    state: '', district: '', locationType: 'Urban',
    educationLevel: 'Undergraduate', percentage: '',
    casteCategory: 'General', familyIncome: '',
    minorityStatus: false, firstGraduate: false, singleGirlChild: false, disabilityStatus: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = {
        ...formData,
        marks: parseFloat(formData.percentage),
        student_class: formData.educationLevel === 'High School' ? 10 : formData.educationLevel === 'Undergraduate' ? 13 : 16,
        father_occupation: 'farmer', // default for matching
      };

      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      const matchRes = await axios.post('http://localhost:5001/api/match', user);
      localStorage.setItem('eligible_schemes', JSON.stringify(matchRes.data));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze profile.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white border top-border shadow-sm rounded-lg p-8 border-brand-600/20 border-t-4 border-t-brand-600">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 border-b pb-4 border-gray-100">
          Personal Eligibility Form
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Asterisk <span className="text-red-500">*</span> indicates a mandatory field. Ensure data is accurate.
        </p>

        {error && <div className="bg-red-50 text-red-700 p-4 border border-red-200 rounded mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-brand-50 px-3 py-2 border-l-4 border-brand-500">1. Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="input-field" placeholder="As per official documents" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                   <input type="number" name="age" value={formData.age} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                   <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" />
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* Section 2: Location Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-brand-50 px-3 py-2 border-l-4 border-brand-500">2. Domicile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Type *</label>
                <select name="locationType" value={formData.locationType} onChange={handleChange} required className="input-field">
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* Section 3: Academic Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-brand-50 px-3 py-2 border-l-4 border-brand-500">3. Academic Profile</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Current Education Level *</label>
                 <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} required className="input-field">
                   <option value="High School">High School Details (10th/12th)</option>
                   <option value="Undergraduate">Undergraduate Degree</option>
                   <option value="Postgraduate">Postgraduate Degree</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Previous Year Percentage (%) *</label>
                 <input type="number" name="percentage" value={formData.percentage} onChange={handleChange} required className="input-field" placeholder="e.g. 85" max="100" />
              </div>
           </div>
          </div>

          <div className="section-divider"></div>

          {/* Section 4: Demographic Info */}
          <div>
             <h3 className="text-lg font-semibold text-gray-800 mb-4 bg-brand-50 px-3 py-2 border-l-4 border-brand-500">4. Socio-Economic Criteria</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="casteCategory" value={formData.casteCategory} onChange={handleChange} required className="input-field">
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Family Income (₹) *</label>
                  <input type="number" name="familyIncome" value={formData.familyIncome} onChange={handleChange} required className="input-field" placeholder="e.g. 150000" />
                </div>
             </div>

             <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-md hover:bg-brand-50 cursor-pointer">
                  <input type="checkbox" name="minorityStatus" checked={formData.minorityStatus} onChange={handleChange} className="h-5 w-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                  <span className="text-sm font-medium text-gray-800">Minority Community Member</span>
                </label>
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-md hover:bg-brand-50 cursor-pointer">
                  <input type="checkbox" name="firstGraduate" checked={formData.firstGraduate} onChange={handleChange} className="h-5 w-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                  <span className="text-sm font-medium text-gray-800">First Generation Graduate</span>
                </label>
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-md hover:bg-brand-50 cursor-pointer">
                  <input type="checkbox" name="singleGirlChild" checked={formData.singleGirlChild} onChange={handleChange} className="h-5 w-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                  <span className="text-sm font-medium text-gray-800">Single Girl Child Status</span>
                </label>
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-md hover:bg-brand-50 cursor-pointer">
                  <input type="checkbox" name="disabilityStatus" checked={formData.disabilityStatus} onChange={handleChange} className="h-5 w-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                  <span className="text-sm font-medium text-gray-800">Differently Abled (PwD)</span>
                </label>
             </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center font-bold px-8 py-3"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
              {loading ? 'Analyzing Profile...' : 'Submit Profile & Find Matches'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;