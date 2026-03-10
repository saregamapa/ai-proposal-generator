'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, FileText, Users, BarChart3, CheckCircle, Star } from 'lucide-react';

const features = [
  { icon: Zap, title: 'AI-Powered Generation', desc: 'Generate a full proposal in under 60 seconds with GPT-4o.' },
  { icon: FileText, title: 'Professional Templates', desc: '5 built-in templates for marketing, SEO, web dev, consulting, and AI automation.' },
  { icon: Users, title: 'Client Management', desc: 'Store client details and track proposal history in one place.' },
  { icon: BarChart3, title: 'Proposal Analytics', desc: 'See when clients view your proposal and how long they spend on each section.' },
];

const plans = [
  { name: 'Free', price: 0, features: ['3 proposals/month', 'AI generation', 'Basic templates', 'PDF export'], cta: 'Get Started Free', href: '/signup' },
  { name: 'Pro', price: 29, popular: true, features: ['Unlimited proposals', 'All templates', 'Proposal analytics', 'Custom branding', 'Priority support'], cta: 'Start Pro Trial', href: '/signup?plan=pro' },
  { name: 'Agency', price: 79, features: ['Everything in Pro', '5 team members', 'Advanced analytics', 'White-label option', 'Dedicated support'], cta: 'Start Agency Trial', href: '/signup?plan=agency' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div><span className="font-bold text-gray-900 text-lg">ProposalAI</span></div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Log in</Link>
            <Link href="/signup" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium">Start Free →</Link>
          </div>
        </div>
      </nav>
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">Win more clients with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI proposals</span></h1>
            <p className="text-xl text-gray-500 mb-10">Generate a complete, professional business proposal in under 60 seconds.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 shadow-lg">
              Create your first proposal free <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-400 mt-6">No credit card required · 3 free proposals/month</p>
          </motion.div>
        </div>
      </section>
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Everything you need to close deals faster</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} viewport={{ once: true }} className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-indigo-600" /></div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-gray-500 text-center mb-16">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.name} className={`relative rounded-2xl border p-8 flex flex-col ${plan.popular?'border-indigo-500 shadow-xl scale-105':'border-gray-200'}`}>
                {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm font-semibold px-4 py-1 rounded-full">Most Popular</span>}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6"><span className="text-4xl font-extrabold">${plan.price}</span>{plan.price>0&&<span className="text-gray-500">/month</span>}</div>
                <ul className="space-y-3 mb-8 flex-1">{plan.features.map(f => <li key={f} className="flex items-center gap-3 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500" />{f}</li>)}</ul>
                <Link href={plan.href} className={`block text-center py-3 rounded-xl font-semibold ${plan.popular?'bg-indigo-600 text-white hover:bg-indigo-700':'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to write your next winning proposal?</h2>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-10 py-4 rounded-xl text-lg font-bold hover:bg-indigo-50">Start for free <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-indigo-400" /><span className="text-white font-bold">ProposalAI</span></div>
          <p className="text-sm">© {new Date().getFullYear()} AI Proposal Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
