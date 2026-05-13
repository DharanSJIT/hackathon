import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../App';
import { Award, Briefcase, GraduationCap, Clock, Navigation, ChevronRight, AlertCircle } from 'lucide-react';

/* Animated progress bar that expands on mount */
const ProgressBar = ({ value, color }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 120);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="progress-track">
      <div
        className={`progress-fill ${color}`}
        style={{ width: `${width}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </div>
  );
};

/* Score color helper */
const scoreColor = s => s >= 87 ? 'bg-emerald-500' : s >= 70 ? 'bg-amber-400' : 'bg-brand-500';
const scoreTextColor = s => s >= 87 ? 'text-emerald-600' : s >= 70 ? 'text-amber-500' : 'text-brand-600';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const getDaysUntilDeadline = (deadline) => {
  if (!deadline) return Number.POSITIVE_INFINITY;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  return Math.ceil((deadlineDate.getTime() - today.getTime()) / MS_PER_DAY);
};

const normalizeMatches = (parsed) =>
  parsed.map(m => {
    if (m?.scheme) {
      return {
        ...m,
        badge: m.badge || deriveBadge(m.scheme),
        finalRankScore: m.finalRankScore ?? m.eligibilityScore ?? 75,
      };
    }
    if (m?.scholarship) {
      return {
        scheme: m.scholarship,
        eligibilityScore: m.eligibility_score ?? 75,
        finalRankScore: m.eligibility_score ?? 75,
        badge: deriveBadge(m.scholarship),
      };
    }
    return {
      scheme: m,
      eligibilityScore: m?.eligibilityScore ?? 75,
      finalRankScore: m?.finalRankScore ?? m?.eligibilityScore ?? 75,
      badge: m?.badge ?? deriveBadge(m),
    };
  }).filter(m => m.scheme?._id);

const deriveBenefitLabel = (scheme) => {
  if (Number(scheme?.benefit_amount || scheme?.amount) > 0) {
    return formatCurrency(scheme.benefit_amount || scheme.amount);
  }

  if (scheme?.benefits) {
    return scheme.benefits;
  }

  return 'As per scheme norms';
};

const deriveBadge = (scheme) => {
  const caste = scheme?.eligibility_criteria?.caste_eligibility || [];
  const eligibleFor = (scheme?.eligibility_criteria?.eligible_for || []).join(' ').toLowerCase();
  const category = String(scheme?.category || '').toLowerCase();

  if (caste.some((item) => ['sc', 'st', 'adi dravidar'].includes(String(item).toLowerCase()))) return 'Green: SC/ST Focus';
  if (caste.some((item) => ['obc', 'mbc', 'bc', 'minority'].includes(String(item).toLowerCase()))) return 'Orange: Reserved Category';
  if (eligibleFor.includes('girls') || eligibleFor.includes('women')) return 'Blue: Women Focused';
  if (category.includes('state')) return 'Gray: State Scheme';
  return 'Gray: General';
};

const derivePriorityRibbon = (scheme, score) => {
  if (score >= 90) return 'Top Eligibility Match';
  if (Number(scheme?.social_uplift_score || 0) >= 90) return 'High Social Impact Priority';
  if (Number(scheme?.eligibility_criteria?.income_limit || 0) > 0) return 'Income-Sensitive Support';
  return 'Recommended Match';
};

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/profile'); return; }

    const loadMatches = async () => {
      setLoadingMatches(true);

      const matched = localStorage.getItem('eligible_schemes');
      if (matched) {
        try {
          const parsed = JSON.parse(matched);
          const normalized = normalizeMatches(parsed);
          const upcomingOnly = normalized
            .filter((match) => getDaysUntilDeadline(match.scheme?.deadline) >= 0)
            .sort((a, b) => getDaysUntilDeadline(a.scheme?.deadline) - getDaysUntilDeadline(b.scheme?.deadline));
          setSchemes(upcomingOnly);
        } catch (error) {
          console.error('Failed to parse cached eligible schemes:', error);
        }
      }

      if (user?.student_class !== undefined && user?.marks !== undefined && user?.father_occupation) {
        try {
          const res = await axios.post('http://localhost:5001/api/match', {
            student_class: user.student_class,
            father_occupation: user.father_occupation,
            marks: user.marks,
            familyIncome: user.familyIncome,
            casteCategory: user.casteCategory,
            educationLevel: user.educationLevel,
            minorityStatus: user.minorityStatus,
            firstGraduate: user.firstGraduate,
            singleGirlChild: user.singleGirlChild,
          });

          localStorage.setItem('eligible_schemes', JSON.stringify(res.data));
          const refreshed = normalizeMatches(res.data)
            .filter((match) => getDaysUntilDeadline(match.scheme?.deadline) >= 0)
            .sort((a, b) => getDaysUntilDeadline(a.scheme?.deadline) - getDaysUntilDeadline(b.scheme?.deadline));
          setSchemes(refreshed);
        } catch (error) {
          console.error('Failed to refresh eligible schemes:', error);
        }
      }

      setLoadingMatches(false);
    };

    loadMatches();

    // Trigger entrance animations shortly after mount
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="page-container py-10">
      {/* Page Header */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-1 h-8 rounded-full bg-brand-600 inline-block" />
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Your Eligible Schemes
            </h1>
          </div>
          <p className="text-sm text-gray-500 max-w-xl pl-4 ml-1">
            AI-ranked based on your academic, demographic, and financial profile.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/compare" className="btn-outline gap-2">
            <Award size={16} /> Compare Top Matches
          </Link>
          <Link to="/scholarships" className="btn-ghost">
            View All Scholarships
          </Link>
        </div>
      </div>

      {/* High-risk alert */}
      {user.dropout_risk_score > 60 && (
        <div className="alert-danger mb-8 flex gap-3 items-start animate-scale-in">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-bold text-red-800">Priority Candidate Profile Detected</p>
            <p className="text-sm text-red-700 mt-0.5">
              Your profile has been flagged for priority tracking due to high socioeconomic vulnerability indicators.
              Frequent reminders will be activated.
            </p>
          </div>
        </div>
      )}

      {loadingMatches ? (
        <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-2xl animate-scale-in">
          <p className="text-gray-500 font-medium">Refreshing your upcoming eligible schemes...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-2xl animate-scale-in">
          <GraduationCap size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium mb-4">No upcoming eligible schemes found right now. Complete or refresh your profile to run the AI engine again.</p>
          <Link to="/profile" className="btn-primary gap-2">
            Go to Profile Form <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {schemes.map((match, index) => {
            const { scheme, eligibilityScore, badge } = match;
            const isTop = index < 3;
            const badgeClass = badge?.includes('Green') ? 'badge-green' : badge?.includes('Orange') ? 'badge-orange' : badge?.includes('Blue') ? 'badge-blue' : 'badge-gray';
            const ribbon = derivePriorityRibbon(scheme, eligibilityScore);
            const daysLeft = getDaysUntilDeadline(scheme.deadline);

            return (
              <div
                key={scheme._id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover
                            transition-all duration-200 ease-smooth
                            ${isTop ? 'border-brand-200' : 'border-gray-200'}
                            animate-fade-in-up`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Top ribbon for top matches */}
                {isTop && (
                  <div className="bg-brand-50 border-b border-brand-100 px-6 py-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider">
                      <Award size={13} className="text-brand-500" />
                      {ribbon}
                    </span>
                    <span className="text-xs text-brand-500 font-semibold">Rank #{index + 1}</span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h2 className="text-lg font-bold text-gray-900 truncate">{scheme.name}</h2>
                        <span className={badgeClass}>{badge?.split(':')[1]?.trim() || badge}</span>
                      </div>

                      {/* AI Score + Progress */}
                      <div className="mb-5 max-w-sm">
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-gray-500">AI Eligibility Match</span>
                          <span className={`font-bold ${scoreTextColor(eligibilityScore)}`}>{Number(eligibilityScore).toFixed(1)}%</span>
                        </div>
                        <ProgressBar value={eligibilityScore} color={scoreColor(eligibilityScore)} />
                      </div>

                      {/* Detail tiles */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Annual Benefit', value: deriveBenefitLabel(scheme), icon: null },
                          { label: 'Tuition', value: scheme.tuition_coverage || String(scheme?.benefits || '').toLowerCase().includes('tuition') ? 'Covered' : 'Not Covered', icon: GraduationCap },
                          { label: 'Career Support', value: scheme.career_support ? 'Included' : 'None', icon: Briefcase },
                          { label: 'Renewable', value: scheme.renewable ? 'Yes (Yearly)' : 'One-Time', icon: Award },
                        ].map(({ label, value, icon: Icon }) => (
                          <div key={label} className="stat-tile py-3 px-4">
                            <p className="stat-label">{label}</p>
                            <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 lg:min-w-[180px] shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                          <Clock size={11} className="inline mr-1" />Deadline
                        </p>
                        <p className="text-sm font-bold text-red-600">
                          {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs font-semibold text-amber-600 mt-1">
                          {daysLeft === 0 ? 'Closes today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
                        </p>
                      </div>

                      <div className="flex lg:flex-col w-full gap-2">
                        <Link to={`/scheme/${scheme._id}`} className="btn-primary flex-1 lg:w-full justify-center">
                          View Details
                        </Link>
                        <Link to={`/roadmap/${scheme._id}`} className="btn-outline flex-1 lg:w-full justify-center gap-1.5">
                          <Navigation size={14} /> Roadmap
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
