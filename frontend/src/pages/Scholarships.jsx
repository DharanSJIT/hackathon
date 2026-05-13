import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, GraduationCap, Clock, ChevronRight, Loader2, SlidersHorizontal } from 'lucide-react';

const getBenefitDisplay = (scholarship) => {
  if (Number(scholarship?.amount) > 0) {
    return {
      short: `₹${Number(scholarship.amount).toLocaleString('en-IN')}`,
      full: `Annual amount: ₹${Number(scholarship.amount).toLocaleString('en-IN')}`,
    };
  }

  if (scholarship?.benefits) {
    return {
      short: 'Benefit Details',
      full: scholarship.benefits,
    };
  }

  return {
    short: 'See Benefits',
    full: 'Amount varies by official scheme notification',
  };
};

const getStoredMatchScores = () => {
  try {
    const raw = localStorage.getItem('eligible_schemes');
    if (!raw) return {};

    return JSON.parse(raw).reduce((acc, item) => {
      const scheme = item?.scheme || item?.scholarship || item;
      const score = item?.eligibilityScore ?? item?.eligibility_score ?? item?.finalRankScore;

      if (scheme?._id && typeof score === 'number') {
        acc[scheme._id] = score;
      }

      return acc;
    }, {});
  } catch {
    return {};
  }
};

const getScoreDisplay = (scholarship, matchedScores) => {
  const matchedScore = matchedScores[scholarship?._id];
  if (typeof matchedScore === 'number') {
    return {
      label: 'AI Match',
      value: `${Number(matchedScore).toFixed(1)}%`,
    };
  }

  const impactScore = Number(scholarship?.social_uplift_score || 0);
  return {
    label: 'Impact Score',
    value: `${(impactScore / 10).toFixed(1)}/10`,
  };
};

const getDaysUntilDeadline = (deadline) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  return Math.ceil((deadlineDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
};

const getDeadlineLabel = (deadline) => {
  const daysLeft = getDaysUntilDeadline(deadline);
  if (daysLeft < 0) return `Closed ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago`;
  if (daysLeft === 0) return 'Closes today';
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
};

const getSchemeStatus = (deadline) => {
  const daysLeft = getDaysUntilDeadline(deadline);
  if (daysLeft < 0) {
    return {
      label: 'Closed',
      className: 'bg-gray-100 text-gray-600 border border-gray-200',
    };
  }

  if (daysLeft <= 7) {
    return {
      label: 'Open Now',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    };
  }

  return {
    label: 'Accepting Applications',
    className: 'bg-sky-50 text-sky-700 border border-sky-200',
  };
};

const ScholarshipCard = ({ sch, index, matchedScores, compact = false }) => {
  const benefitDisplay = getBenefitDisplay(sch);
  const scoreDisplay = getScoreDisplay(sch, matchedScores);
  const status = getSchemeStatus(sch.deadline);

  return (
    <div
      className="card group hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand-200 flex flex-col h-full animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 9) * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-blue text-xs">
            {benefitDisplay.short}
          </span>
          <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 font-mono font-semibold">{sch.scheme_id}</span>
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors duration-150">
        {sch.name}
      </h3>

      <p className={`text-sm text-gray-500 leading-relaxed ${compact ? 'line-clamp-2' : 'line-clamp-3'} mb-3`}>
        {sch.description}
      </p>

      <p className="text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2 mb-5">
        {benefitDisplay.full}
      </p>

      <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
        {/* <div className="flex items-center text-xs text-gray-500 font-medium gap-1.5">
          <GraduationCap size={13} className="text-gray-400" />
          Class {sch.eligibility_criteria?.min_class || 'Any'}
          {sch.eligibility_criteria?.max_class ? ` – ${sch.eligibility_criteria.max_class}` : '+'}
        </div> */}
        <div className="flex items-center justify-between gap-3 text-xs font-medium">
          <div className="flex items-center text-gray-500 gap-1.5">
            <Clock size={13} className="text-gray-400" />
            Deadline: {new Date(sch.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <span className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
            {getDeadlineLabel(sch.deadline)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400">
          {scoreDisplay.label}: <span className="text-brand-600">{scoreDisplay.value}</span>
        </span>
        <Link
          to="/eligible"
          className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-800 gap-1 transition-colors duration-150"
        >
          Match Profile <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [matchedScores, setMatchedScores] = useState({});

  useEffect(() => {
    axios.get('http://localhost:5001/api/scholarships')
      .then(res => setScholarships(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    setMatchedScores(getStoredMatchScores());
  }, []);

  const filtered = scholarships.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );
  const upcoming = [...scholarships]
    .filter((sch) => sch.deadline && getDaysUntilDeadline(sch.deadline) >= 0)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);
  const openNow = [...scholarships]
    .filter((sch) => sch.deadline && getDaysUntilDeadline(sch.deadline) >= 0)
    .sort((a, b) => getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline))
    .slice(0, 6);

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-gray-100 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Scholarships Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse {scholarships.length} verified government and foundation scholarships.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search scholarships…"
            className="input-field pl-9 h-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-gray-400 font-semibold mb-4">
          Showing {filtered.length} of {scholarships.length} results
        </p>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="animate-spin h-8 w-8 text-brand-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <GraduationCap size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No scholarships match your search.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {search.trim() === '' && openNow.length > 0 ? (
            <section className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Open Scholarship Schemes</h2>
                  <p className="text-sm text-gray-500">Applications currently open and accepting submissions.</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  {openNow.length} active
                </span>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {openNow.map((sch, i) => (
                  <ScholarshipCard
                    key={`open-${sch._id}`}
                    sch={sch}
                    index={i}
                    matchedScores={matchedScores}
                    compact
                  />
                ))}
              </div>
            </section>
          ) : null}

          {search.trim() === '' && upcoming.length > 0 ? (
            <section className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Upcoming Deadlines</h2>
                  <p className="text-sm text-gray-500">A quick look at scholarships closing soon.</p>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                  {upcoming.length} highlighted
                </span>
              </div>
              <div className="grid lg:grid-cols-3 gap-5">
                {upcoming.map((sch, i) => (
                  <ScholarshipCard
                    key={`upcoming-${sch._id}`}
                    sch={sch}
                    index={i}
                    matchedScores={matchedScores}
                    compact
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">All Scholarships</h2>
                <p className="text-sm text-gray-500">Search and compare the full directory.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((sch, i) => (
                <ScholarshipCard
                  key={sch._id}
                  sch={sch}
                  index={i}
                  matchedScores={matchedScores}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Scholarships;
