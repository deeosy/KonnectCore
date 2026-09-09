import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Lenis from 'lenis'
import {
  FiUsers, FiPackage, FiCreditCard, FiTrendingUp, FiMapPin, FiBarChart2,
  FiCheckCircle, FiStar, FiArrowUpRight, FiMail, FiMessageCircle, FiZap,
} from 'react-icons/fi'
import { IoMenuOutline, IoCloseOutline, IoChevronDown, IoChevronForward } from 'react-icons/io5'
import { FaXTwitter, FaYoutube, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6'
import logo from '../assets/images/preferedlogo2.png'

const HERO_IMG = 'https://images.unsplash.com/photo-1654588843464-e2442895b5c3?w=1200&h=800&fit=crop&auto=format'
const FEATURE_IMG = 'https://images.unsplash.com/photo-1663919402792-2abaab9037e9?w=700&h=900&fit=crop&auto=format'

const SECTIONS = {
  Members: 'members',
  Collections: 'collections',
  Payments: 'payments',
  Reports: 'reports',
  'Why Us': 'why-us',
}

const FEATURES = [
  { icon: FiUsers, title: 'Members & farms', desc: 'Every farmer, plot and group in one registry — no more paper ledgers or duplicate records.' },
  { icon: FiPackage, title: 'Collection & grading', desc: 'Tonnage logged on site, quality graded, digital receipt issued before the truck leaves.' },
  { icon: FiCreditCard, title: 'Payments', desc: 'Mobile money and bank disbursements with a clean reconciliation trail after every season.' },
  { icon: FiTrendingUp, title: 'Loans & savings', desc: 'Input credit, repayment schedules and cooperative savings handled in one place.' },
  { icon: FiMapPin, title: 'Field traceability', desc: 'GPS-stamped visits and produce-origin records built for export compliance.' },
  { icon: FiBarChart2, title: 'Reports', desc: 'Board-ready summaries and audit exports generated in one click.' },
]

const STEPS = [
  { n: '01', t: 'Register the cooperative', d: 'Set up regions, districts, groups and your leadership hierarchy.' },
  { n: '02', t: 'Onboard members & farms', d: 'Add farmers, map plots and assign everyone to the right group.' },
  { n: '03', t: 'Collect, pay & report', d: 'Log harvests, disburse payments and close the season with clean reports.' },
]

const TESTIMONIALS = [
  { name: 'Abena Asante', role: 'CEO, Brong-Ahafo Cocoa Union', quote: 'Payment errors dropped to zero in our first season. The system we always needed, finally built.' },
  { name: 'Kweku Mensah', role: 'Field Officer, Northern Rice Co-op', quote: 'Reports that took three days now take twenty minutes. Always accurate, always exportable.' },
  { name: 'Adwoa Boateng', role: 'Finance Manager, Ashanti Maize Board', quote: 'Loan tracking alone saved us ₵180,000 in unreconciled credit balances.' },
]

const EASE = [0.22, 1, 0.36, 1]
const viewOnce = { once: true, margin: '-80px' }

function useCounter(target, inView) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let s = 0
    const step = target / 80
    const t = setInterval(() => {
      s += step
      if (s >= target) {
        setVal(target)
        clearInterval(t)
      } else {
        setVal(Math.floor(s))
      }
    }, 16)
    return () => clearInterval(t)
  }, [inView, target])
  return val
}

function Reveal({ children, delay = 0, y = 26, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewOnce}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

function Kicker({ children, light = false }) {
  return (
    <div className={`mb-6 flex items-center gap-3 ${light ? 'text-primary-400' : 'text-primary'}`}>
      <span className={`h-px w-10 ${light ? 'bg-primary-400/70' : 'bg-primary/60'}`} />
      <span className={`font-mono text-xs uppercase tracking-[0.22em] ${light ? 'text-primary-300' : 'text-primary'}`}>
        {children}
      </span>
    </div>
  )
}

function Navbar({ scrollTo }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = Object.values(SECTIONS)
    const onScroll = () => {
      let current = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 140) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (label) => {
    scrollTo(SECTIONS[label])
    setMenuOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'border-b border-border bg-white/90 shadow-lg shadow-dark/5 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-350 items-center justify-between px-5 py-3.5 sm:px-8">
        <a href="#top" onClick={(e) => { e.preventDefault(); scrollTo('top') }} className="flex items-center gap-3">
          <img src={logo} alt="KonnectCore" className="h-9 w-auto object-contain sm:h-10" />
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {Object.entries(SECTIONS).map(([label, id]) => (
            <button
              key={id}
              onClick={() => go(label)}
              className={`group relative font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
                active === id ? 'text-primary' : 'text-muted hover:text-dark'
              }`}
            >
              {label}
              <span className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                active === id ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="group hidden items-center gap-2 rounded-full border border-primary/60 px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white md:inline-flex"
          >
            Sign in
            <FiArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-dark lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <IoCloseOutline className="h-5 w-5" /> : <IoMenuOutline className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-border bg-white px-5 py-6 shadow-xl lg:hidden"
        >
          <div className="space-y-1">
            {Object.entries(SECTIONS).map(([label, id], i) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
                onClick={() => go(label)}
                className="block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-dark hover:bg-primary-50 hover:text-primary"
              >
                {label}
              </motion.button>
            ))}
          </div>
          <a href="/login" className="mt-5 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
            Sign in to KonnectCore <FiArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>
      )}
    </motion.header>
  )
}

function Hero({ scrollTo }) {
  const { scrollY } = useScroll()
  const yBg = useTransform(scrollY, [0, 900], [0, 140])
  const yCard = useTransform(scrollY, [0, 900], [0, -60])

  return (
    <section id="top" className="relative min-h-screen overflow-hidden pt-24 sm:pt-28">
      <div className="absolute inset-0">
        <motion.img
          src={HERO_IMG}
          alt=""
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: 'easeOut' }}
          style={{ y: yBg }}
          className="h-[115%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/45" />
 <div className="absolute inset-0 bg-linear-to-t from-background/10 via-background/10 to-background" />
        <div className="absolute -left-40 top-1/4 h-112 w-md rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary-400/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-350 flex-col justify-center px-5 sm:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal y={-10} delay={0.15}>
             
            </Reveal>

            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden"
              animate="show"
            >
              {['Connect', 'farmers,', 'harvests', '& capital.'].map((w, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
                    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } },
                  }}
                  className={`mb-3 block text-5xl leading-[0.98] font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-[5.4rem] ${
                    w === '& capital.' ? 'text-primary' : 'text-dark'
                  }`}
                >
                  {w}
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
              className="mt-8 max-w-xl text-lg leading-relaxed text-black"
            >
              The one platform that brings your members, harvests, payments and compliance together — built around how Ghanian field teams actually work.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.8, ease: EASE }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="/login"
                className="group inline-flex items-center gap-2.5 rounded-full bg-dark px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-primary"
              >
                Get started
                <FiArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <button
                onClick={() => scrollTo('platform')}
                className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-white px-8 py-4 text-sm font-bold text-black backdrop-blur transition-all hover:border-primary/50 hover:text-primary"
              >
                See the platform
                <IoChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </button>
            </motion.div>
          </div>

          <motion.div
            style={{ y: yCard }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: EASE }}
            className="relative hidden lg:col-span-5 lg:block"
          >
            <div className="relative h-[540px] overflow-hidden rounded-[4em] bg-border shadow-2xl shadow-dark/20 xl:h-[580px]">
              <motion.img
                src={FEATURE_IMG}
                alt=""
                initial={{ scale: 1.7 }}
                whileInView={{ scale: 1.15 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: EASE }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent" />
            </div>

            <Reveal delay={0.3} className="absolute -bottom-8 -left-10">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-xl shadow-dark/10">
                <div className="mb-1.5 flex items-center gap-2">
                  <FiZap className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Season total</span>
                </div>
                <div className="mb-1 text-3xl font-extrabold text-dark">8,940 t</div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-success">
                  <FiTrendingUp className="h-3 w-3" /> +22% vs last season
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.45} className="absolute -top-7 -right-7">
              <div className="rounded-2xl bg-primary p-5 shadow-xl shadow-primary/30">
                <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">Members</div>
                <div className="text-3xl font-extrabold text-white">12,480</div>
              </div>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Impact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const members = useCounter(12480, inView)
  const groups = useCounter(236, inView)
  const tonnes = useCounter(8940, inView)
  const loans = useCounter(4.6, inView)

  const rows = [
    { val: members, suffix: '', label: 'Active members' },
    { val: groups, suffix: '', label: 'Groups organised' },
    { val: tonnes, suffix: ' t', label: 'Collected this season' },
    { val: loans, prefix: '₵', suffix: 'M', label: 'Loan book' },
  ]

  return (
    <section id="payments" className="scroll-mt-24 bg-background py-24 sm:py-32">
      <div ref={ref} className="mx-auto grid max-w-350 gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal>
            <Kicker>By the numbers</Kicker>
            <h2 className="text-4xl leading-tight font-extrabold tracking-tight text-dark sm:text-5xl">
              Numbers that add up.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-xs text-muted">
              Real aggregates from cooperatives running on KonnectCore across the country.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 border-border sm:grid-cols-2 sm:border-t">
            {rows.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewOnce}
                transition={{ delay: i * 0.12, duration: 0.8, ease: EASE }}
                className={`border-b border-border py-8 sm:px-8 ${i % 2 === 1 ? 'sm:border-l' : ''}`}
              >
                <div className="text-5xl font-extrabold tracking-tight text-dark sm:text-6xl">
                  {s.prefix}{s.val.toLocaleString()}{s.suffix}
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-light">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Opportunity() {
  return (
    <section id="why-us" className="relative scroll-mt-24 overflow-hidden bg-background py-24 sm:py-32">
      
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewOnce}
        transition={{ duration: 1, ease: EASE }}
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"
      />

      <div className="relative mx-auto grid max-w-350 items-center gap-16 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <Kicker>The opportunity</Kicker>
            <h2 className="text-4xl leading-tight font-extrabold tracking-tight text-dark sm:text-5xl">
              The paper gap is costing cooperatives <span className="text-primary">real money.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              Every season, hours vanish re-typing names, lost receipts go unclaimed, and payments wait on paper trails.
              KonnectCore puts membership, collection, finance and compliance in one system — built for Ghanaian
              field teams, tested with officers, priced for cooperatives.
            </p>
          </Reveal>

          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={viewOnce}
            className="mt-10 grid gap-4 sm:grid-cols-2"
          >
            {[
              'Paper-free records, end to end',
              'Mobile-first, made for the field',
              'Offline-capable in low-signal areas',
              'Audit-ready compliance exports',
            ].map((t, i) => (
              <motion.div
                key={t}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
                }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-sm font-bold text-primary">
                  0{i + 1}
                </span>
                <span className="text-sm font-medium text-dark">{t}</span>
              </motion.div>
            ))}
          </motion.div>

          <Reveal delay={0.25}>
            <button
              onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
              className="group mt-12 inline-flex items-center gap-3 rounded-full bg-dark py-2 pr-7 pl-2 text-sm font-medium text-white transition-all hover:bg-primary"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark transition-colors group-hover:bg-white/20 group-hover:text-white">
                <IoChevronForward className="h-4 w-4" />
              </span>
              See it in action
            </button>
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <Reveal delay={0.2} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewOnce}
              transition={{ duration: 0.9, ease: EASE }}
              className="relative h-105 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary/20 sm:h-135"
            >
              <motion.img
                initial={{ scale: 1.15 }}
                whileInView={{ scale: 1.02 }}
                viewport={viewOnce}
                transition={{ duration: 2, ease: EASE }}
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&h=1150&q=80"
                alt="Green crop rows on a cooperative farm in the field"
                className="h-full w-full object-cover"
              />            
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const gridY = useTransform(scrollYProgress, [0, 1], [36, -36])

  return (
    <section ref={sectionRef} id="members" className="relative scroll-mt-24 overflow-hidden bg-background py-24 sm:py-32">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewOnce}
        transition={{ duration: 1, ease: EASE }}
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"
      />
      <div aria-hidden className="absolute -right-20 top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto grid max-w-350 gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4 lg:pr-10">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <Kicker>What we provide</Kicker>
              <h2 className="text-4xl leading-tight font-extrabold tracking-tight text-dark sm:text-5xl">
                Everything, <span className="text-primary">in one field.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-md text-muted">
                Six modules that share one registry, one ledger, one truth. You never re-enter a farmer's name twice.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <a
                href="/login"
                className="group mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-dark transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white"
              >
                Explore the modules
                <FiArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-8">
          <motion.div
            style={{ y: gridY }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } }}
            initial="hidden"
            whileInView="show"
            viewport={viewOnce}
            className="grid gap-5 sm:grid-cols-2"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
                }}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
                className="group relative flex cursor-default flex-col overflow-hidden rounded-4xl border border-border bg-surface p-6 shadow-card transition-colors duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:p-7"
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-6 h-0.5 w-8 bg-primary transition-all duration-500 group-hover:w-20"
                />
                <span
                  aria-hidden
                  className="absolute right-2 bottom-0 font-mono text-7xl leading-none font-bold text-dark/5 transition-colors duration-300 group-hover:text-primary/10"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <FiArrowUpRight className="h-5 w-5 text-muted-light transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-dark transition-colors group-hover:text-primary">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="collections" className="scroll-mt-24 border-y border-border bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-350 px-5 sm:px-8">
        <Reveal className="mb-20 max-w-2xl">
          <Kicker>How it works</Kicker>
          <h2 className="text-4xl leading-tight font-extrabold tracking-tight text-dark sm:text-5xl">
            From first register to final report.
          </h2>
        </Reveal>

        <div className="relative grid gap-12 lg:grid-cols-3 lg:gap-8">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewOnce}
            transition={{ duration: 1.2, ease: EASE }}
            className="absolute top-12 right-16 left-16 hidden h-px bg-border lg:block"
          />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.18, duration: 0.8, ease: EASE }}
              className="group relative"
            >
              <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-surface font-mono text-2xl font-bold text-primary transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                {s.n}
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-surface bg-primary-400 transition-transform group-hover:scale-125" />
              </div>
              <h3 className="mb-3 flex items-center gap-2 text-xl font-bold text-dark">
                {s.t}
              </h3>
              <p className="max-w-sm leading-relaxed text-muted">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Platform() {
  const bars = [65, 78, 55, 90, 82, 95, 88]
  const stats = [
    { v: '12,480', l: 'Members', g: 'from-primary-400 to-primary-600', d: '+340' },
    { v: '₵4.6M', l: 'Loan book', g: 'from-secondary-400 to-secondary-600', d: '+₵0.2M' },
    { v: '8,940 t', l: 'Collected', g: 'from-primary-500 to-primary-700', d: '+410 t' },
    { v: '99.2%', l: 'Payment rate', g: 'from-success-200 to-success-600', d: '+0.4%' },
  ]

  return (
    <section id="platform" className="relative scroll-mt-24 overflow-hidden bg-background py-24 sm:py-32">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewOnce}
        transition={{ duration: 1, ease: EASE }}
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"
      />
      <div aria-hidden className="absolute -top-40 left-1/3 h-104 w-104 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative mx-auto max-w-350 px-5 sm:px-8">
        <div className="mb-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Kicker>The platform</Kicker>
              <h2 className="text-4xl leading-tight font-extrabold tracking-tight text-dark sm:text-5xl">
                Made for the field, trusted in the boardroom.
              </h2>
            </Reveal>
          </div>
          <div className="flex items-end lg:col-span-7">
            <Reveal delay={0.15}>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                A responsive interface that runs on a field officer's phone and a CEO's desktop. Same data, same moment,
                every report one tap away.
              </p>
            </Reveal>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, ease: EASE }}
          className="relative rounded-[2.5rem] border border-border bg-white p-4 shadow-2xl shadow-primary/10 sm:p-7"
        >
          <div className="mb-5 flex items-center gap-2 px-2">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="ml-4 font-mono text-xs text-muted-light">konnectcore.app/dashboard</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <div className={`bg-linear-to-r ${s.g} bg-clip-text text-2xl font-extrabold text-transparent`}>
                    {s.v}
                  </div>
                  <span className="rounded-full bg-success-50 px-2 py-0.5 font-mono text-[10px] font-bold text-success-700">
                    ▲ {s.d}
                  </span>
                </div>
                <div className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-muted">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <div className="flex h-96 flex-col rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
              <div className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-muted">Weekly collection trend</div>
              <div className="flex flex-1 items-end gap-1.5">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: '4%' }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: EASE }}
                    className="flex-1 rounded-t bg-linear-to-t from-primary to-primary-light opacity-90 transition-opacity hover:opacity-100"
                  />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-muted">Group performance</div>
              {[['Brong-Ahafo', 91], ['Ashanti', 78], ['Northern', 65]].map(([n, p]) => (
                <div key={n} className="mb-4 last:mb-0">
                  <div className="mb-1.5 flex justify-between font-mono text-xs text-muted">
                    <span>{n}</span>
                    <span className="font-bold text-primary">{p}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-primary-100">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, duration: 0.9, ease: EASE }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6, ease: EASE }}
            className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-white p-4 shadow-xl shadow-primary/10 md:block"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle className="h-4 w-4 text-success" />
              <span className="font-mono text-xs font-semibold text-dark">Audit export ready</span>
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted-light">All season 2026 statements reconciled</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function Testimonials() {
  const [featured, ...rest] = TESTIMONIALS
  const initials = (name) => name.split(' ').map((w) => w[0]).join('')
  return (
    <section id="reports" className="relative scroll-mt-24 overflow-hidden bg-background py-24 sm:py-32">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewOnce}
        transition={{ duration: 1, ease: EASE }}
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"
      />
      <div aria-hidden className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-warning/5 blur-3xl" />

      <div className="relative mx-auto max-w-350 px-5 sm:px-8">
        <div className="mb-16 grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <Kicker>From the field</Kicker>
              <h2 className="mt-4 text-4xl leading-tight font-extrabold tracking-tight text-dark sm:text-5xl">
                Cooperatives that switched, <span className="text-primary">stayed.</span>
              </h2>
            </Reveal>
          </div>
          <div className="flex items-end lg:col-span-5">
            <Reveal delay={0.15}>
              <p className="max-w-md text-muted">
                Field officers, treasurers and CEOs share one experience — the season just ends differently with KonnectCore.
              </p>
            </Reveal>
          </div>
        </div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } } }}
          initial="hidden"
          whileInView="show"
          viewport={viewOnce}
          className="grid items-stretch gap-5 lg:grid-cols-12"
        >
          <motion.article
            variants={{
              hidden: { opacity: 0, y: 28 },
              show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
            }}
            whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            className="group relative flex flex-col overflow-hidden rounded-4xl border border-border bg-surface p-7 shadow-card transition-colors duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:p-9 lg:col-span-6"
          >
            <span aria-hidden className="absolute -top-6 right-4 font-inter text-[8rem] leading-none text-primary/10 select-none">
              "
            </span>
            <span className="flex items-center gap-1">
              {[...Array(5)].map((_, j) => (
                <FiStar key={j} className="h-4 w-4 fill-warning text-warning" />
              ))}
            </span>
            <p className="mt-6 text-2xl leading-snug font-medium text-dark sm:text-[1.7rem]">"{featured.quote}"</p>
            <div className="mt-auto flex items-center gap-4 pt-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white">
                {initials(featured.name)}
              </span>
              <div>
                <div className="font-bold text-dark">{featured.name}</div>
                <div className="font-mono text-xs text-muted-light">{featured.role}</div>
              </div>
            </div>
            <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
              <span className="font-mono text-[11px] tracking-widest text-muted uppercase">First season</span>
              <span className="rounded-full bg-success-50 px-3 py-1 font-mono text-[11px] font-bold text-success-700">
                0 payment errors
              </span>
            </div>
          </motion.article>

          {rest.map((t) => (
            <motion.article
              key={t.name}
              variants={{
                hidden: { opacity: 0, y: 28 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
              }}
              whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="group relative flex flex-col overflow-hidden rounded-4xl border border-border bg-surface p-7 shadow-card transition-colors duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 lg:col-span-3"
            >
              <span aria-hidden className="absolute top-3 right-5 font-inter text-5xl leading-none text-primary/10 select-none">
                "
              </span>
              <p className="text-base leading-relaxed text-muted">"{t.quote}"</p>
              <div className="mt-auto flex items-center gap-3 pt-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary">
                  {initials(t.name)}
                </span>
                <div>
                  <div className="text-sm font-bold text-dark">{t.name}</div>
                  <div className="font-mono text-[11px] text-muted-light">{t.role}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function CtaBand() {
  return (
    <section className="px-5 pb-24 sm:px-8 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative mx-auto max-w-300 overflow-hidden bg-primary px-7 py-20 text-white sm:px-14 sm:py-24"
      >
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary-light/40 blur-3xl" />
        <div className="absolute -right-20 -bottom-28 h-96 w-96 rounded-full bg-dark/25 blur-3xl" />
        <div className="absolute top-0 right-0 h-32 w-32 border-t border-r border-white/15" />
        <div className="absolute bottom-0 left-0 h-32 w-32 border-b border-l border-white/15" />
        <motion.div
          animate={{ x: ['0%', '8%', '0%'] }}
          transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
          className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/70 to-transparent"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
              Ready to put your cooperative on one platform?
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <a
              href="/login"
              className="group inline-flex items-center gap-2.5 rounded-full bg-dark px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-dark-lighter"
            >
              Sign in to KonnectCore
              <FiArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="mailto:hello@konnectcore.com"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/40 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              <FiMessageCircle className="h-4 w-4" />
              Talk to us
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  const cols = [
    { title: 'Product', links: ['Members', 'Collections', 'Payments', 'Loans', 'Reports'] },
    { title: 'Company', links: ['About us', 'Our story', 'Careers', 'Contact'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Data Processing'] },
  ]
  const socials = [
    [FaXTwitter, 'X'],
    [FaYoutube, 'YouTube'],
    [FaLinkedinIn, 'LinkedIn'],
  ]
  const colVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  }

  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewOnce}
        transition={{ duration: 1, ease: EASE }}
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
      />
      <div aria-hidden className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="relative mx-auto grid max-w-350 gap-12 px-5 pt-20 pb-16 sm:px-8 lg:grid-cols-12"
      >
        <motion.div variants={colVariants} className="lg:col-span-4">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mb-6 inline-flex">
            <img src={logo} alt="KonnectCore" className="h-10 w-auto object-contain" />
          </button>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Built for Ghana's agricultural cooperatives — members, harvests, payments and capital in one trusted platform.
          </p>
          <div className="mt-7 space-y-3">
            <a
              href="mailto:hello@konnectcore.com"
              className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 font-mono text-sm text-muted transition-all duration-300 hover:border-primary hover:text-primary"
            >
              <FiMail className="h-4 w-4 text-primary" /> hello@konnectcore.com
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 font-mono text-sm text-muted transition-all duration-300 hover:border-primary hover:text-primary"
            >
              <FaWhatsapp className="h-4 w-4 text-primary" /> +233 30 000 0000
            </a>
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-xs text-muted-light">
            <FiMapPin className="h-4 w-4 text-primary" /> Accra, Ghana · Serving all regions
          </div>
        </motion.div>

        {cols.map((col) => (
          <motion.div key={col.title} variants={colVariants} className="lg:col-span-2">
            <h4 className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-light">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary">
                    {l}
                    <FiArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        <motion.div variants={colVariants} className="lg:col-span-2">
          <h4 className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-light">Follow</h4>
          <div className="flex gap-3">
            {socials.map(([Icon, label]) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative mx-auto flex max-w-350 flex-col items-center justify-between gap-4 border-t border-border px-5 py-8 sm:px-8 md:flex-row"
      >
        <p className="font-mono text-xs text-muted-light">
          © {new Date().getFullYear()} KonnectCore. All rights reserved.
        </p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Cookies'].map((l) => (
            <a key={l} href="#" className="font-mono text-xs text-muted transition-colors hover:text-primary">{l}</a>
          ))}
        </div>
      </motion.div>
    </footer>
  )
}

export default function Landing() {
  const lenisRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    if (reduceMotion) return
    const lenis = new Lenis({ lerp: 0.1, duration: 2.5, smoothTouch: false })
    lenisRef.current = lenis
    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduceMotion])

  const scrollTo = (id) => {
    const target = id ? document.getElementById(id) : null
    if (!target) return
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -76, duration: 1.4 })
    } else {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="overflow-x-hidden bg-background font-sans text-dark antialiased">
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed inset-x-0 top-0 z-60 h-0.5 origin-left bg-primary"
      />
      <Navbar scrollTo={scrollTo} />
      <main>
        <Hero scrollTo={scrollTo} />
        <Impact />
        <Opportunity />
        <Features />
        <HowItWorks />
        <Platform />
        <Testimonials />
        <CtaBand />
      </main>
      <Footer />
    </div>
  )
}