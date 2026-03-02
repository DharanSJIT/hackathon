import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, GraduationCap, Clock, ChevronRight, Loader2, SlidersHorizontal } from 'lucide-react';

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/api/scholarships')
      .then(res => setScholarships(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = scholarships.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((sch, i) => (
            <div
              key={sch._id}
              className="card group hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand-200 flex flex-col h-full animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 9) * 50}ms` }}
            >
              {/* Top tag row */}
              <div className="flex items-start justify-between mb-4">
                <span className="badge-blue text-xs">
                  ₹{(sch.amount || 0).toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-400 font-mono font-semibold">{sch.scheme_id}</span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors duration-150">
                {sch.name}
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-5">
                {sch.description}
              </p>

              {/* Meta */}
              <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500 font-medium gap-1.5">
                  <GraduationCap size={13} className="text-gray-400" />
                  Class {sch.eligibility_criteria?.min_class || 'Any'}
                  {sch.eligibility_criteria?.max_class ? ` – ${sch.eligibility_criteria.max_class}` : '+'}
                </div>
                <div className="flex items-center text-xs text-gray-500 font-medium gap-1.5">
                  <Clock size={13} className="text-gray-400" />
                  Deadline: {new Date(sch.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">
                  AI Score: <span className="text-brand-600">{sch.social_uplift_score}</span>
                </span>
                <Link
                  to="/eligible"
                  className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-800 gap-1 transition-colors duration-150"
                >
                  Match Profile <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Scholarships;
