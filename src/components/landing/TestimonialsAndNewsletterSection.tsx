'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';

import api from '@/lib/api';

import { getAdjacentIndex, validateEmail } from './testimonialsUtils';

type Testimonial = {
  name: string;
  campaign: string;
  quote: string;
  amountRaised: string;
  initials: string;
  accent: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Maya Chen',
    campaign: 'Clean Water for Nairobi',
    quote:
      'The transparent milestones made it easy for our supporters to trust the project. We raised our goal faster than expected.',
    amountRaised: '$24.8K raised',
    initials: 'MC',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Daniel Ortiz',
    campaign: 'Open Source Learning Lab',
    quote:
      'Every contribution is visible on-chain, which gave donors confidence and helped us build momentum throughout the campaign.',
    amountRaised: '$18.2K raised',
    initials: 'DO',
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    name: 'Aisha Brooks',
    campaign: 'Community Food Recovery',
    quote:
      'The simple flow from launch to release made it feel professional and trustworthy from the very first donation.',
    amountRaised: '$12.6K raised',
    initials: 'AB',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Chris Bennett',
    campaign: 'Youth Arts Residency',
    quote:
      'We loved being able to showcase impact in real time. The newsletter updates keep our community engaged after launch.',
    amountRaised: '$9.4K raised',
    initials: 'CB',
    accent: 'from-amber-500 to-orange-500',
  },
];

export default function TestimonialsAndNewsletterSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => getAdjacentIndex(currentIndex, testimonials.length, 1));
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  const handlePrevious = () => {
    setActiveIndex((currentIndex) => getAdjacentIndex(currentIndex, testimonials.length, -1));
  };

  const handleNext = () => {
    setActiveIndex((currentIndex) => getAdjacentIndex(currentIndex, testimonials.length, 1));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrevious();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('idle');
    setMessage('');

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');

    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      setStatus('success');
      setMessage('You are subscribed. Expect launch updates and campaign highlights soon.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('We could not subscribe you right now. Please try again in a moment.');
    }
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/70 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base font-semibold uppercase tracking-[0.3em] text-blue-600">Community stories</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by creators and supporters alike
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            See how campaign teams are using Lumora to create momentum, build confidence, and keep their communities informed.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Testimonials</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">Success stories in motion</h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="rounded-full border border-slate-300 p-2 text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
                  aria-label="Show previous testimonial"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full border border-slate-300 p-2 text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
                  aria-label="Show next testimonial"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              className="mt-8 outline-none"
              role="region"
              aria-roledescription="carousel"
              aria-label="Featured testimonials"
              tabIndex={0}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              onKeyDown={handleKeyDown}
            >
              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300/60">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${activeTestimonial.accent}`}>
                    <span className="text-sm font-semibold">{activeTestimonial.initials}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{activeTestimonial.name}</p>
                    <p className="text-sm text-slate-300">{activeTestimonial.campaign}</p>
                  </div>
                </div>

                <p className="mt-6 text-lg leading-8 text-slate-200">“{activeTestimonial.quote}”</p>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-sm text-slate-400">Amount raised</p>
                  <p className="text-lg font-semibold text-cyan-300">{activeTestimonial.amountRaised}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Choose testimonial">
              {testimonials.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition ${index === activeIndex ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300'}`}
                  aria-label={`Show testimonial ${index + 1}`}
                  aria-selected={index === activeIndex}
                  role="tab"
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Newsletter</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">Stay in the loop</h3>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Get updates on new campaigns, platform launches, and impact stories delivered straight to your inbox.
            </p>

            <label htmlFor="newsletter-email" className="mt-8 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status !== 'idle') {
                  setStatus('idle');
                  setMessage('');
                }
              }}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              autoComplete="email"
              required
            />

            <button
              type="submit"
              disabled={status === 'loading'}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>

            <p className="mt-4 text-sm text-slate-500">No spam. Just occasional updates and campaign highlights.</p>

            {message ? (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-sm ${status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
                aria-live="polite"
              >
                {message}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
