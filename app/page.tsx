'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowRight,
  Sun,
  Moon,
  Check,
  ChevronDown,
  Sparkles,
  Lightbulb,
  FileText,
  Layers,
  BarChart3,
  Archive,
  Calendar,
  BookOpen,
  Zap,
  Star,
} from 'lucide-react'

/* ─── FAQ Item ─── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`
        bg-surface border border-border rounded-xl overflow-hidden transition-all duration-300
        ${open ? 'ring-1 ring-text-muted shadow-lg bg-surface-2/50' : 'hover:border-text-muted'}
      `}
    >
      <button
        className="w-full flex items-center justify-between p-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-text-primary text-sm">{question}</span>
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out px-5 ${open ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-text-muted leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Feature Tab Content ─── */
const featureTabData = [
  {
    id: 'ideas',
    label: 'AI Ideas',
    sidebar: [
      { icon: Lightbulb, label: 'Generate Ideas' },
      { icon: FileText, label: 'My Scripts' },
      { icon: Archive, label: 'Content Vault' },
      { icon: BarChart3, label: 'Performance' },
      { icon: Calendar, label: 'Schedule' },
      { icon: BookOpen, label: 'Frameworks' },
      { icon: Layers, label: 'Series Builder' },
    ],
    mainTitle: 'Generate Ideas',
    mainDesc: 'Pick your platform and goal, and get 10 content ideas with hooks, angles, and CTAs — tailored to your niche.',
    badge: 'AI-Powered',
  },
  {
    id: 'scripts',
    label: 'Script Builder',
    sidebar: [
      { icon: Lightbulb, label: 'Generate Ideas' },
      { icon: FileText, label: 'My Scripts' },
      { icon: Archive, label: 'Content Vault' },
      { icon: BarChart3, label: 'Performance' },
      { icon: Calendar, label: 'Schedule' },
      { icon: BookOpen, label: 'Frameworks' },
      { icon: Layers, label: 'Series Builder' },
    ],
    mainTitle: 'Script Builder',
    mainDesc: 'Turn any idea into a structured video script or post — complete with hook, body, and call-to-action.',
    badge: 'Templates',
  },
  {
    id: 'streaks',
    label: 'Streaks',
    sidebar: [
      { icon: Lightbulb, label: 'Generate Ideas' },
      { icon: FileText, label: 'My Scripts' },
      { icon: Archive, label: 'Content Vault' },
      { icon: BarChart3, label: 'Performance' },
      { icon: Calendar, label: 'Schedule' },
      { icon: BookOpen, label: 'Frameworks' },
      { icon: Layers, label: 'Series Builder' },
    ],
    mainTitle: 'Consistency Tracker',
    mainDesc: 'Visual heatmap of your posting history. Streak tracking keeps you accountable — freeze your streak when life gets busy.',
    badge: 'Accountability',
  },
  {
    id: 'frameworks',
    label: 'Frameworks',
    sidebar: [
      { icon: Lightbulb, label: 'Generate Ideas' },
      { icon: FileText, label: 'My Scripts' },
      { icon: Archive, label: 'Content Vault' },
      { icon: BarChart3, label: 'Performance' },
      { icon: Calendar, label: 'Schedule' },
      { icon: BookOpen, label: 'Frameworks' },
      { icon: Layers, label: 'Series Builder' },
    ],
    mainTitle: 'Framework Library',
    mainDesc: 'Proven content structures used by top coaches and founders. Apply them instantly — no guesswork.',
    badge: 'Library',
  },
  {
    id: 'repurpose',
    label: 'Repurpose',
    sidebar: [
      { icon: Lightbulb, label: 'Generate Ideas' },
      { icon: FileText, label: 'My Scripts' },
      { icon: Archive, label: 'Content Vault' },
      { icon: BarChart3, label: 'Performance' },
      { icon: Calendar, label: 'Schedule' },
      { icon: BookOpen, label: 'Frameworks' },
      { icon: Layers, label: 'Series Builder' },
    ],
    mainTitle: 'Repurpose Engine',
    mainDesc: 'Take one piece of content and adapt it across platforms. LinkedIn post to Twitter thread to Reel script — automatically.',
    badge: 'Multi-Platform',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [activeFeatureTab, setActiveFeatureTab] = useState('ideas')

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.replace('/dashboard')
    }
    checkAuth()

    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initial = saved || 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [router])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  const activeTab = featureTabData.find(t => t.id === activeFeatureTab) || featureTabData[0]

  return (
    <div className="min-h-screen bg-background dot-grid-bg">
      {/* ═══════ NAV ═══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-text-primary tracking-tight">FounderOS.</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest hidden sm:inline-block">Beta</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-overline text-text-muted hover:text-text-secondary transition-colors">Features</a>
            <a href="#pricing" className="text-overline text-text-muted hover:text-text-secondary transition-colors">Pricing</a>
            <a href="#testimonials" className="text-overline text-text-muted hover:text-text-secondary transition-colors">Testimonials</a>
            <a href="#faq" className="text-overline text-text-muted hover:text-text-secondary transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="btn-icon">
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <Link href="/login" className="btn-primary text-xs py-2 px-4 rounded-full uppercase tracking-wider font-semibold">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="hero-glow" />
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-enter">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge-gradient mb-8 px-4 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity">
            <Sparkles size={12} className="text-purple-400" />
            <span className="text-xs font-medium text-purple-300">The OS for founder-led content</span>
            <ArrowRight size={10} className="text-purple-400" />
          </div>

          {/* Headline */}
          <h1 className="text-display text-text-primary mb-6 leading-[1.08]">
            Build your content pipeline
            <br />
            with AI that thinks like a{' '}
            <span className="gradient-text">Coach</span>
          </h1>

          {/* Sub */}
          <p className="text-lg text-text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            FounderOS gives coaches and founder-led brands the structure to generate ideas, write scripts, and post consistently — without the chaos.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="btn-gradient">
              Get Started <ArrowRight size={14} />
            </Link>
            <a href="#features" className="btn-outline">
              Learn More ::
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES — Tab + Browser Mockup ═══════ */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <p className="text-overline gradient-text-overline mb-3 font-semibold">Powerful Tools</p>
            <h2 className="text-display text-text-primary">
              Loaded with <span className="gradient-text">tools</span> to grow your brand
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
            {featureTabData.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id)}
                className={`feature-tab ${activeFeatureTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Browser Mockup */}
          <div className="browser-mockup max-w-4xl mx-auto">
            <div className="browser-mockup-bar">
              <div className="browser-dot red" />
              <div className="browser-dot yellow" />
              <div className="browser-dot green" />
              <span className="browser-url">founderos.app/{activeTab.id}</span>
            </div>
            <div className="flex min-h-[360px]">
              {/* Sidebar Preview */}
              <div className="w-48 bg-[#0D0D10] border-r border-[#1E1E22] p-3 hidden sm:block">
                <div className="space-y-0.5">
                  {activeTab.sidebar.map((item, i) => {
                    const Icon = item.icon
                    const isActive = i === 0 && activeFeatureTab === 'ideas' ||
                      i === 1 && activeFeatureTab === 'scripts' ||
                      i === 5 && activeFeatureTab === 'frameworks' ||
                      i === 6 && activeFeatureTab === 'repurpose' ||
                      i === 4 && activeFeatureTab === 'streaks'
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12px] ${isActive
                          ? 'bg-[#1E1E22] text-white font-medium'
                          : 'text-[#71717A]'
                          }`}
                      >
                        <Icon size={14} strokeWidth={1.5} />
                        <span>{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Main Content Preview */}
              <div className="flex-1 p-8 bg-[#0D0D10]">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{activeTab.mainTitle}</h3>
                    <span className="badge-gradient text-[10px] px-2 py-0.5 rounded-full">{activeTab.badge}</span>
                  </div>
                  <p className="text-sm text-[#71717A] max-w-md leading-relaxed">{activeTab.mainDesc}</p>
                </div>

                {/* Placeholder content blocks */}
                <div className="space-y-3">
                  <div className="h-10 bg-[#18181B] rounded-lg border border-[#27272A]" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 bg-[#18181B] rounded-lg border border-[#27272A]" />
                    <div className="h-24 bg-[#18181B] rounded-lg border border-[#27272A]" />
                  </div>
                  <div className="h-10 bg-[#18181B] rounded-lg border border-[#27272A]" />
                </div>
              </div>
            </div>

            {/* Bottom info bar */}
            <div className="bg-[#111113] border-t border-[#1E1E22] px-5 py-3 flex items-start gap-3">
              <Sparkles size={14} className="text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-white mb-0.5">{activeTab.mainTitle}</p>
                <p className="text-[11px] text-[#71717A] leading-relaxed">{activeTab.mainDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section id="pricing" className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles size={10} /> Public Beta
            </div>
            <h2 className="text-h1 text-text-primary max-w-md mx-auto">
              Simple pricing for <span className="gradient-text">serious founders</span>.
            </h2>
            <p className="text-body mt-4 max-w-md mx-auto">
              Join the beta and lock in these early-bird rates forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="card p-8 border hover:border-text-muted transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-bold text-text-primary">Starter</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-2 text-text-muted uppercase tracking-wider">Free Forever</span>
              </div>
              <p className="text-caption mb-6">Perfect for exploring the OS.</p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-text-primary">$0</span>
                <span className="text-caption ml-1">/mo</span>
                <p className="text-[10px] text-text-muted mt-1">No credit card required</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  '5 AI idea generations / day',
                  'Basic streak tracking',
                  '3 core frameworks',
                  'Twitter & LinkedIn support',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                      <Check size={10} className="text-text-primary" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/login" className="btn-secondary w-full text-center rounded-xl py-3 font-semibold">
                Start Building
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="card p-8 border-accent/50 ring-1 ring-accent/20 bg-accent/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={100} className="text-accent rotate-12 -translate-y-8 translate-x-8" />
              </div>

              <div className="flex items-center justify-between mb-2 relative z-10">
                <p className="text-lg font-bold text-text-primary">Pro Beta</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent text-white uppercase tracking-wider flex items-center gap-1">
                  <Star size={8} fill="currentColor" /> Most Popular
                </span>
              </div>
              <p className="text-caption mb-6 relative z-10">For founders ready to scale.</p>

              <div className="mb-8 relative z-10">
                <span className="text-4xl font-bold text-text-primary">$29</span>
                <span className="text-caption ml-1">/mo</span>
                <p className="text-[10px] text-accent mt-1 font-medium">7-day free trial included</p>
              </div>

              <ul className="space-y-4 mb-8 relative z-10">
                {[
                  'Unlimited AI generations',
                  'Advanced Hook Optimizer',
                  'Full Framework Library',
                  'All platforms (IG, TikTok, YT)',
                  'Series & Repurpose Engine',
                  'Priority Beta Support',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-text-primary font-medium">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Check size={10} className="text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/login" className="btn-primary w-full text-center rounded-xl py-3 shadow-lg shadow-accent/25 relative z-10">
                Start Free Trial
              </Link>
              <p className="text-[10px] text-text-muted text-center mt-3 relative z-10">No credit card required for trial.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section id="faq" className="py-24 px-6 relative z-10 bg-surface-2/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-h2 text-text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-body max-w-md mx-auto">
              Everything you need to know about the beta.
            </p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="What does 'Beta Mode' mean for me?"
              answer="It means you get early access to features before anyone else, at a locked-in lower price. We update the app weekly based on your feedback."
            />
            <FAQItem
              question="Is my data safe?"
              answer="Dimensions apart. We use enterprise-grade encryption for all your scripts, ideas, and strategies. You own your content 100%."
            />
            <FAQItem
              question="How is this different from ChatGPT?"
              answer="ChatGPT is a generalist. FounderOS is a specialist trained on millions of viral posts. It understands hooks, formatting, and platform psychology out of the box."
            />
            <FAQItem
              question="Can I upgrade or downgrade anytime?"
              answer="Yes. You can switch plans instantly in your dashboard. If you cancel, you keep access until the end of your billing period."
            />
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-text-muted">Still have questions?</p>
            <a href="mailto:beta@founderos.app" className="text-sm font-bold text-text-primary border-b border-text-primary hover:text-accent hover:border-accent transition-colors pb-0.5">Contact the Beta Team</a>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="pt-20 pb-10 px-6 border-t border-border relative z-10 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center">
                  <span className="text-surface font-bold text-lg italic">F</span>
                </div>
                <span className="text-lg font-bold text-text-primary tracking-tight">FounderOS.</span>
              </div>
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded border border-border bg-surface-2 text-[10px] font-mono text-text-muted mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                v0.9.0 (Beta)
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6">Platform</p>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a></li>
                <li><Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6">Resources</p>
              <ul className="space-y-3">
                <li><Link href="/frameworks" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Frameworks</Link></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Methodology</a></li>
                <li><a href="#faq" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Beta FAQ</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6">Legal</p>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-text-muted uppercase tracking-wider">
              &copy; {new Date().getFullYear()} FounderOS. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
