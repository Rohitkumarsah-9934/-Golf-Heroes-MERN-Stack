import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Heart, Target, ChevronRight, Star, Users, Award, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i=0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } }) };

export default function Home() {
  const [charities, setCharities] = useState([]);
  const [draws, setDraws] = useState([]);

  useEffect(() => {
    api.get('/charities?featured=true').then(r => setCharities(r.data.data?.slice(0,3) || [])).catch(()=>{});
    api.get('/draws').then(r => setDraws(r.data.data?.slice(0,3) || [])).catch(()=>{});
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 font-body">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="font-display text-2xl font-bold gradient-text">Golf Heroes</Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <Link to="/charities" className="hover:text-white transition-colors">Charities</Link>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#prizes" className="hover:text-white transition-colors">Prizes</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2">Join Now</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/8 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'2s'}} />
          <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize:'40px 40px'}} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 text-brand-400 text-sm font-medium mb-8">
            <Heart size={14} /> Every subscription changes a life
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-display text-5xl md:text-7xl font-black leading-tight mb-6">
            Play Golf.{' '}
            <span className="gradient-text">Win Prizes.</span>
            <br />Change Lives.
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter your Stableford scores, compete in monthly draws, and support the charity closest to your heart — all in one platform built for golfers who care.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-gold text-lg px-8 py-4 flex items-center gap-2 group">
              Start Playing <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4">See How It Works</a>
          </motion.div>

          {/* Stats */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            {[
              { value: '£50K+', label: 'Prize Pool' },
              { value: '2,400+', label: 'Members' },
              { value: '£120K+', label: 'Raised for Charity' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-3xl font-bold gradient-text">{value}</div>
                <div className="text-sm text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-16">
            <h2 className="section-title mb-4">How It <span className="gradient-text">Works</span></h2>
            <p className="text-white/50 max-w-xl mx-auto">Four simple steps to play, win, and give back.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <Users size={28} />, step: '01', title: 'Subscribe', desc: 'Choose monthly or yearly. A portion goes straight to your chosen charity.' },
              { icon: <Target size={28} />, step: '02', title: 'Enter Scores', desc: 'Log your latest 5 Stableford scores from the course. One per date, 1–45.' },
              { icon: <Trophy size={28} />, step: '03', title: 'Monthly Draw', desc: '5 winning numbers are drawn. Match 3, 4, or all 5 to win your prize tier.' },
              { icon: <Heart size={28} />, step: '04', title: 'Give Back', desc: 'Every month, your charity receives your contribution automatically.' },
            ].map(({ icon, step, title, desc }, i) => (
              <motion.div key={step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="card text-center group hover:border-brand-500/30 transition-all duration-300">
                <div className="text-5xl font-display font-black text-white/5 mb-4">{step}</div>
                <div className="w-14 h-14 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center text-brand-400 mx-auto mb-4 group-hover:bg-brand-500/20 transition-colors">
                  {icon}
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Tiers */}
      <section id="prizes" className="py-24 px-6 bg-dark-800/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-16">
            <h2 className="section-title mb-4">Prize <span className="gradient-text">Tiers</span></h2>
            <p className="text-white/50 max-w-xl mx-auto">Match your Stableford scores to the winning numbers each month.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tier: 'Jackpot', match: '5 Numbers', pool: '40%', color: 'gold', desc: 'Rolls over if unclaimed!', icon: <Trophy size={32} /> },
              { tier: '4-Match', match: '4 Numbers', pool: '35%', color: 'brand', desc: 'Split equally among winners', icon: <Star size={32} /> },
              { tier: '3-Match', match: '3 Numbers', pool: '25%', color: 'brand', desc: 'Split equally among winners', icon: <Award size={32} /> },
            ].map(({ tier, match, pool, color, desc, icon }, i) => (
              <motion.div key={tier} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className={`card border-${color}-500/20 hover:border-${color}-500/40 transition-all duration-300 text-center ${tier === 'Jackpot' ? 'ring-1 ring-gold-500/20' : ''}`}>
                <div className={`w-16 h-16 bg-${color}-500/10 rounded-2xl flex items-center justify-center text-${color}-400 mx-auto mb-4`}>
                  {icon}
                </div>
                <div className={`text-${color}-400 font-display text-2xl font-bold mb-1`}>{tier}</div>
                <div className="text-white/60 text-sm mb-4">{match}</div>
                <div className={`text-4xl font-display font-black text-${color}-400 mb-2`}>{pool}</div>
                <div className="text-white/30 text-xs">of monthly prize pool</div>
                {tier === 'Jackpot' && (
                  <div className="mt-4 bg-gold-500/10 border border-gold-500/20 rounded-lg px-3 py-2 text-gold-400 text-xs font-medium">
                    🏆 Jackpot rolls over if unclaimed!
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      {charities.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="flex items-end justify-between mb-12">
              <div>
                <h2 className="section-title mb-2">Featured <span className="gradient-text">Charities</span></h2>
                <p className="text-white/50">Your game can fund causes that matter.</p>
              </div>
              <Link to="/charities" className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                View all <ChevronRight size={16} />
              </Link>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {charities.map((c, i) => (
                <motion.div key={c._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="card-hover">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 font-bold text-xl">
                      {c.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-brand-400">£{c.totalRaised?.toLocaleString()} raised</div>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{c.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="card border-brand-500/20 bg-gradient-to-b from-dark-700/60 to-dark-800/60">
            <div className="text-5xl mb-6">🏌️</div>
            <h2 className="font-display text-4xl font-bold mb-4">Ready to <span className="gradient-text">Tee Off?</span></h2>
            <p className="text-white/50 mb-8 leading-relaxed">Join thousands of golfers already playing, winning, and making a difference every month.</p>
            <Link to="/register" className="btn-gold text-lg px-10 py-4 inline-flex items-center gap-2 group">
              Subscribe Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-white/30 text-sm mt-4">Monthly or yearly plans. Cancel anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-xl font-bold gradient-text">Golf Heroes</div>
          <div className="flex gap-6 text-sm text-white/40">
            <Link to="/charities" className="hover:text-white/70 transition-colors">Charities</Link>
            <a href="#how-it-works" className="hover:text-white/70 transition-colors">How It Works</a>
            <Link to="/login" className="hover:text-white/70 transition-colors">Sign In</Link>
          </div>
          <div className="text-sm text-white/30">© 2025 Golf Heroes. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
