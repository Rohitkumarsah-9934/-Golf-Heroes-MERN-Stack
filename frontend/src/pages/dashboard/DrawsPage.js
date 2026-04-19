import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Hash } from 'lucide-react';
import api from '../../utils/api';

export default function DrawsPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myEntries, setMyEntries] = useState({});

  useEffect(() => {
    api.get('/draws').then(async r => {
      const d = r.data.data || [];
      setDraws(d);
      const entries = {};
      await Promise.all(d.map(async draw => {
        try {
          const e = await api.get(`/draws/${draw._id}/my-entry`);
          if (e.data.data) entries[draw._id] = e.data.data;
        } catch {}
      }));
      setMyEntries(entries);
    }).finally(() => setLoading(false));
  }, []);

  const tierColor = t => t === 'jackpot' ? 'gold' : 'brand';
  const tierLabel = t => t === 'jackpot' ? '🏆 Jackpot' : t === 'match4' ? '⭐ 4-Match' : '✨ 3-Match';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Monthly Draws</h1>
        <p className="text-white/40 text-sm mt-1">Results from published draws. Match your scores to win!</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 card animate-pulse" />)}</div>
      ) : draws.length === 0 ? (
        <div className="card text-center py-16 text-white/30">
          <Trophy className="mx-auto mb-3 opacity-30" size={40} />
          No draws published yet. Check back soon!
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((d, i) => {
            const entry = myEntries[d._id];
            return (
              <motion.div key={d._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg">{d.title}</h3>
                    <div className="flex items-center gap-2 text-white/40 text-xs mt-1">
                      <Calendar size={12} />
                      {new Date(d.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      <span>·</span>
                      <span>{d.subscriberCount} players</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-gold-400">£{d.totalPool?.toFixed(2)}</div>
                    <div className="text-xs text-white/30">prize pool</div>
                  </div>
                </div>

                {/* Winning numbers */}
                <div className="mb-4">
                  <div className="text-xs text-white/40 mb-2 flex items-center gap-1"><Hash size={11} /> Winning Numbers</div>
                  <div className="flex gap-2 flex-wrap">
                    {d.winningNumbers.map(n => (
                      <div key={n} className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm ${entry?.scores?.includes(n) ? 'bg-brand-500 text-white' : 'bg-dark-700/60 text-white/60'}`}>
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                {/* My entry result */}
                {entry ? (
                  <div className={`flex items-center justify-between bg-${tierColor(entry.prizeTier)}-500/10 border border-${tierColor(entry.prizeTier)}-500/20 rounded-xl px-4 py-3`}>
                    <div>
                      <div className="text-sm font-medium">Your Entry</div>
                      <div className="text-xs text-white/40">Scores: {entry.scores.join(', ')} · {entry.matchCount} match{entry.matchCount !== 1 ? 'es' : ''}</div>
                    </div>
                    {entry.isWinner ? (
                      <div className={`text-${tierColor(entry.prizeTier)}-400 font-bold text-sm`}>
                        {tierLabel(entry.prizeTier)} — £{entry.prizeAmount?.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-white/30 text-sm">No win this time</div>
                    )}
                  </div>
                ) : (
                  <div className="bg-dark-700/30 rounded-xl px-4 py-3 text-white/30 text-sm">
                    You were not entered in this draw (no subscription / no scores at draw time).
                  </div>
                )}

                {/* Pool breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Jackpot (5)', value: d.jackpotPool, rolled: d.jackpotRolledOver },
                    { label: '4-Match', value: d.match4Pool },
                    { label: '3-Match', value: d.match3Pool },
                  ].map(({ label, value, rolled }) => (
                    <div key={label} className="bg-dark-700/30 rounded-lg px-3 py-2 text-center">
                      <div className="text-xs text-white/30">{label}</div>
                      <div className="font-bold text-sm">£{value?.toFixed(2)}</div>
                      {rolled && <div className="text-gold-400 text-xs">↗ Rolled over</div>}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
