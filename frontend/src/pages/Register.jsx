import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Check, Loader2, UploadCloud } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const steps = [
  'Personal',
  'Location',
  'Academic',
  'Financial',
  'Documents'
];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '', dob: '', gender: '', mobileNumber: '', aadhaar: '', email: '', password: '',
    state: '', district: '', fullAddress: '', pincode: '',
    educationLevel: '', lastExamMarks: '', institutionName: '',
    annualFamilyIncome: '', bankAccountNumber: '', ifscCode: ''
  });

  const [files, setFiles] = useState({
    aadhaarDoc: null,
    incomeCertificate: null,
    marksheet: null,
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (files.aadhaarDoc) data.append('aadhaarDoc', files.aadhaarDoc);
    if (files.incomeCertificate) data.append('incomeCertificate', files.incomeCertificate);
    if (files.marksheet) data.append('marksheet', files.marksheet);

    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      let studentClass = 10;
      if (formData.educationLevel === 'Undergraduate') studentClass = 13;
      if (formData.educationLevel === 'Postgraduate') studentClass = 16;

      const matchPayload = {
        student_class: studentClass,
        father_occupation: 'Any',
        marks: parseFloat(formData.lastExamMarks) || 50
      };

      try {
        const matchRes = await axios.post('http://localhost:5001/api/match', matchPayload);
        localStorage.setItem('eligible_schemes', JSON.stringify(matchRes.data));
      } catch (matchErr) {
        console.error('Matching failed after successful registration:', matchErr.response?.data || matchErr.message);
        localStorage.setItem('eligible_schemes', JSON.stringify([]));
      }

      window.location.href = '/eligible';
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, name, type = 'text', placeholder = '', required = true) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-all duration-200"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );

  const renderSelect = (label, name, options, required = true) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-all duration-200 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width=%2214%22%20height=%228%22%20viewBox=%220%200%2014%208%22%20fill=%22none%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d=%22M1%201L7%207L13%201%22%20stroke=%22%236B7280%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center]"
        required={required}
      >
        <option value="">Select option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderFileInput = (label, name) => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-colors group cursor-pointer relative">
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-brand-500 transition-colors" />
          <div className="flex text-sm text-gray-600 justify-center">
            <span className="relative rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500 cursor-pointer">
              <span>Upload a file</span>
              <input type="file" name={name} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".jpg,.jpeg,.png,.pdf" />
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            {files[name] ? <span className="text-green-600 font-medium tracking-wide">Selected: {files[name].name}</span> : 'PNG, JPG, PDF up to 10MB'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join VidyaGrant to discover endless opportunities."
    >
      {/* Progress tracking */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((label, idx) => (
             <div key={label} className="flex flex-col items-center flex-1">
               <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  idx < step ? 'bg-brand-600 text-white' : 
                  idx === step ? 'bg-brand-100 text-brand-600 border-2 border-brand-600' : 
                  'bg-gray-100 text-gray-400'
               }`}>
                 {idx < step ? <Check size={14} /> : idx + 1}
               </div>
             </div>
          ))}
        </div>
        <div className="flex justify-between px-2 text-xs font-medium text-gray-500 mt-2">
           {steps.map((label, idx) => (
             <span key={label} className={`flex-1 text-center ${idx === step ? 'text-brand-600 font-bold' : ''}`}>
               {label}
             </span>
           ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 mb-4 animate-pulse">
          {error}
        </div>
      )}

      {/* Form Steps */}
      <form onSubmit={step === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        
        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h3>
            {renderInput('Full Name', 'fullName')}
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Date of Birth', 'dob', 'date')}
              {renderSelect('Gender', 'gender', [{label:'Female', value:'Female'}, {label:'Male', value:'Male'}, {label:'Other', value:'Other'}])}
            </div>
            {renderInput('Mobile Number', 'mobileNumber')}
            {renderInput('Email Address', 'email', 'email')}
            {renderInput('Password', 'password', 'password')}
            {renderInput('Aadhaar Number (Optional Masked)', 'aadhaar', 'text', 'XXXX-XXXX-1234', false)}
          </div>
        )}

        {/* Step 1: Address Info */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Location Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('State', 'state', 'text', 'Eg. Tamil Nadu')}
              {renderInput('District', 'district', 'text', 'Eg. Chennai')}
            </div>
            {renderInput('Full Address', 'fullAddress', 'text', 'Door No, Street Name, Area')}
            {renderInput('Pincode', 'pincode', 'number', 'XXXXXX')}
          </div>
        )}

        {/* Step 2: Academic Info */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Academic Background</h3>
            {renderSelect('Education Level', 'educationLevel', [
              {label: 'High School', value: 'High School'},
              {label: 'Undergraduate', value: 'Undergraduate'},
              {label: 'Postgraduate', value: 'Postgraduate'},
            ])}
            {renderInput('Institution Name', 'institutionName', 'text', 'School/College Name')}
            {renderInput('Last Exam Marks (%)', 'lastExamMarks', 'number', 'e.g. 85')}
          </div>
        )}

        {/* Step 3: Financial Info */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Financial Details</h3>
            {renderInput('Annual Family Income (₹)', 'annualFamilyIncome', 'number', 'e.g. 150000')}
            {renderInput('Bank Account Number', 'bankAccountNumber', 'number', 'Account Number')}
            {renderInput('IFSC Code', 'ifscCode', 'text', 'XXXX0000000')}
          </div>
        )}

        {/* Step 4: Documents Upload */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <h3 className="text-xl font-semibold mb-4 text-gray-800">Upload Documents</h3>
             <p className="text-sm text-gray-500 mb-6">These documents will be securely uploaded and stored via Cloudinary.</p>
             {renderFileInput('Aadhaar Copy', 'aadhaarDoc')}
             {renderFileInput('Income Certificate', 'incomeCertificate')}
             {renderFileInput('Last Marksheet', 'marksheet')}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between gap-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 focus:outline-none transition-colors w-1/3 justify-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          ) : <div></div>}
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-white font-bold bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all group"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5 mx-auto" />
            ) : step === steps.length - 1 ? (
              <>Complete Setup <Check className="ml-2 w-5 h-5" /></>
            ) : (
              <>Next Step <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold text-sm hover:text-brand-800 transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
