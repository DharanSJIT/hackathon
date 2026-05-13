import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, Calendar, CheckCircle2, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getDaysLeft = (deadline) => {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  return Math.ceil((deadlineDate.getTime() - today.getTime()) / MS_PER_DAY);
};

const normalizeStoredSchemes = () => {
  const stored = localStorage.getItem('eligible_schemes');
  if (!stored) return [];

  try {
    return JSON.parse(stored)
      .map((match) => {
        if (match?.scheme) return match;
        if (match?.scholarship) {
          return {
            scheme: match.scholarship,
            eligibilityScore: match.eligibility_score ?? 75,
          };
        }

        return {
          scheme: match,
          eligibilityScore: match?.eligibilityScore ?? 75,
        };
      })
      .filter((match) => match?.scheme?._id);
  } catch {
    return [];
  }
};

const predictStatus = (daysLeft, hasApplication) => {
  if (hasApplication) return 'Pending';
  if (daysLeft !== null && daysLeft <= 7) return 'In Progress';
  return 'Pending';
};

const predictPriority = (daysLeft, score, status) => {
  if (status === 'Submitted') return 'Completed';
  if (daysLeft !== null && daysLeft < 0) return 'Expired';
  if (daysLeft !== null && daysLeft <= 3) return 'Critical';
  if (daysLeft !== null && daysLeft <= 10) return 'High';
  if (score >= 85) return 'High Potential';
  return 'On Track';
};

const formatApplications = (items = []) =>
  items.map((item) => {
    const scheme = item.scheme_id || item.scheme;
    const daysLeft = getDaysLeft(scheme?.deadline);

    return {
      id: item._id || scheme?._id,
      applicationId: item._id || null,
      schemeId: scheme?._id,
      schemeName: scheme?.name || 'Untitled scheme',
      benefit: scheme?.benefit_amount || scheme?.amount || 0,
      deadline: scheme?.deadline,
      deadlineLabel: scheme?.deadline
        ? new Date(scheme.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'TBD',
      status: item.status || predictStatus(daysLeft, Boolean(item._id)),
      daysLeft,
      reminderSent: item.reminder_sent ?? (daysLeft !== null && daysLeft <= 7),
      eligibilityScore: item.eligibilityScore ?? item.eligibility_score ?? 0,
      priority: predictPriority(daysLeft, item.eligibilityScore ?? item.eligibility_score ?? 0, item.status),
      source: item._id ? 'saved' : 'predicted',
    };
  });

const Tracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      setError('');

      const predicted = formatApplications(
        normalizeStoredSchemes().map((match) => ({
          scheme: match.scheme,
          eligibilityScore: match.eligibilityScore,
        }))
      );

      if (!currentUser?.email) {
        setApplications(predicted);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5001/api/applications', {
          params: { email: currentUser.email },
        });

        const saved = formatApplications(res.data);
        const savedSchemeIds = new Set(saved.map((item) => item.schemeId));
        const merged = [
          ...saved,
          ...predicted.filter((item) => !savedSchemeIds.has(item.schemeId)),
        ].sort((a, b) => {
          if (a.status === 'Submitted' && b.status !== 'Submitted') return 1;
          if (a.status !== 'Submitted' && b.status === 'Submitted') return -1;
          return (a.daysLeft ?? Number.MAX_SAFE_INTEGER) - (b.daysLeft ?? Number.MAX_SAFE_INTEGER);
        });

        setApplications(merged);
      } catch (err) {
        console.error(err);
        setError('Could not load saved applications. Showing predicted tracker cards instead.');
        setApplications(predicted);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [currentUser?.email]);

  const updateStatus = async (applicationId, status) => {
    if (!applicationId) return;

    setSavingId(applicationId);
    try {
      const res = await axios.patch(`http://localhost:5001/api/application/${applicationId}`, { status });
      const updated = formatApplications([res.data])[0];

      setApplications((prev) =>
        prev
          .map((app) => (app.applicationId === applicationId ? updated : app))
          .sort((a, b) => {
            if (a.status === 'Submitted' && b.status !== 'Submitted') return 1;
            if (a.status !== 'Submitted' && b.status === 'Submitted') return -1;
            return (a.daysLeft ?? Number.MAX_SAFE_INTEGER) - (b.daysLeft ?? Number.MAX_SAFE_INTEGER);
          })
      );
    } catch (err) {
      console.error(err);
      setError('Unable to update application status right now.');
    } finally {
      setSavingId('');
    }
  };

  const getStatusColor = (status, daysLeft) => {
    if (status === 'Submitted') return 'bg-green-100 border-green-500 text-green-800';
    if (status === 'In Progress') return 'bg-blue-100 border-blue-500 text-blue-800';
    if (daysLeft !== null && daysLeft < 0) return 'bg-gray-100 border-gray-400 text-gray-700';
    if (daysLeft <= 7) return 'bg-red-100 border-red-500 text-red-800';
    return 'bg-gray-100 border-gray-400 text-gray-800';
  };
  
  const getStatusIcon = (status, daysLeft) => {
    if (status === 'Submitted') return <CheckCircle2 size={18} className="text-green-600 mr-2" />;
    if (status === 'In Progress') return <Clock size={18} className="text-blue-600 mr-2" />;
    if (daysLeft !== null && daysLeft < 0) return <Calendar size={18} className="text-gray-600 mr-2" />;
    if (daysLeft <= 7) return <AlertCircle size={18} className="text-red-600 mr-2" />;
    return <Calendar size={18} className="text-gray-600 mr-2" />;
  };

  const getCountdownLabel = (daysLeft, status) => {
    if (status === 'Submitted') return 'Application completed';
    if (daysLeft === null) return 'Deadline unavailable';
    if (daysLeft < 0) return `Closed ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago`;
    if (daysLeft === 0) return 'Last day to apply';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
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
          Monitor your real applications and AI-predicted priority opportunities so deadlines, reminders, and next actions stay up to date.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          Loading your tracker...
        </div>
      ) : null}

      {!loading && applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-gray-600 font-medium">No tracked applications yet.</p>
          <p className="text-sm text-gray-500 mt-2">Apply to a scholarship from chat or generate eligible schemes from your profile to see dynamic tracker cards here.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {applications.map(app => {
            const isRed = app.daysLeft !== null && app.daysLeft <= 7 && app.daysLeft >= 0 && app.status !== 'Submitted';
            return (
              <div key={app.id} className={`card border-l-4 ${getStatusColor(app.status, app.daysLeft).split(' ')[1]} transition-shadow hover:shadow-md cursor-default flex flex-col justify-between`}>
                 <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900 pr-4">{app.schemeName}</h3>
                      <div className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(app.status, app.daysLeft)} border-0`}>
                        {app.status}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium flex items-center">
                          <Sparkles size={14} className="mr-1 text-brand-500" />
                          {app.source === 'saved' ? 'Tracker Type' : 'AI Prediction'}
                        </span>
                        <span className="text-gray-900 font-bold">{app.source === 'saved' ? 'Applied Scheme' : app.priority}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Annual Benefit</span>
                        <span className="text-gray-900 font-bold">
                          ₹{app.benefit ? app.benefit.toLocaleString('en-IN') : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Deadline</span>
                        <span className="text-gray-900 font-bold">{app.deadlineLabel}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Countdown</span>
                        <span className={`font-bold ${isRed ? 'text-red-600' : app.status === 'Submitted' ? 'text-green-600' : 'text-orange-600'}`}>
                          {getCountdownLabel(app.daysLeft, app.status)}
                        </span>
                      </div>
                    </div>
                 </div>
                 
                 <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
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

                    {app.applicationId ? (
                      <div className="grid grid-cols-3 gap-2">
                        {['Pending', 'In Progress', 'Submitted'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={savingId === app.applicationId || app.status === status}
                            onClick={() => updateStatus(app.applicationId, status)}
                            className={`rounded-md px-2 py-2 text-xs font-semibold transition-colors ${
                              app.status === status
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } disabled:opacity-60`}
                          >
                            {savingId === app.applicationId && app.status !== status ? 'Saving...' : status}
                          </button>
                        ))}
                      </div>
                    ) : null}
                 </div>
              </div>
            );
         })}
      </div>
    </div>
  );
};

export default Tracker;
