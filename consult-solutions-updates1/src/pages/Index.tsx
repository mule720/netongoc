import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import { ArrowRight, Building2, Star, Award, Target, Users, Lightbulb, CheckCircle, Newspaper, Monitor } from 'lucide-react';

// ─── types ────────────────────────────────────────────────────────────────────
interface HeroContent { tagline: string; heading: string; description: string; ctaText: string; backgroundImageUrl: string; overlayColor: string; overlayOpacity: number; }
interface Service { id: string; title: string; description: string; iconKey: string; serviceAreas: string[]; }
interface Client { id: string; name: string; logo: string; industry: string; }
interface Update { id: string; title: string; content: string; imageUrl?: string; createdAt: string; }
interface Stats { clientSatisfaction: string; yearsExperience: string; }

const GQL = (query: string) =>
  fetch('/graphql/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) }).then(r => r.json());

// ─── helpers ──────────────────────────────────────────────────────────────────
const parseAreas = (v: any): string[] => {
  if (Array.isArray(v)) return v.filter(Boolean);
  try { const p = JSON.parse(v); return Array.isArray(p) ? p.filter(Boolean) : []; } catch { return []; }
};

const fmtDate = (s: string) => { try { return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return s; } };

// ─── card styles ──────────────────────────────────────────────────────────────
const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e8ecf4', padding: '1.75rem', boxShadow: '0 2px 16px rgba(12,31,92,0.07)' };
const goldBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#F5C200', color: '#0C1F5C', border: 'none', borderRadius: 8, padding: '0.65rem 1.4rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' };
const navyBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#0C1F5C', color: '#F5C200', border: 'none', borderRadius: 8, padding: '0.65rem 1.4rem', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' };
const outlineBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', color: '#F5C200', border: '2px solid rgba(245,194,0,0.5)', borderRadius: 8, padding: '0.6rem 1.35rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' };
const sectionLabel: React.CSSProperties = { display: 'inline-block', background: 'rgba(245,194,0,0.15)', color: '#F5C200', border: '1px solid rgba(245,194,0,0.3)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '0.9rem', textTransform: 'uppercase' };
const iconBox: React.CSSProperties = { width: 44, height: 44, background: '#0C1F5C', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // data
  const [hero, setHero] = useState<HeroContent>({ tagline: '', heading: '', description: '', ctaText: 'Get Started', backgroundImageUrl: '', overlayColor: '#0C1F5C', overlayOpacity: 0.75 });
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [stats, setStats] = useState<Stats>({ clientSatisfaction: '98%', yearsExperience: '15+' });
  const [companiesServed, setCompaniesServed] = useState(0);
  const [clientIdx, setClientIdx] = useState(0);

  useEffect(() => {
    GQL(`query { activeHeroContent { tagline heading description ctaText backgroundImageUrl overlayColor overlayOpacity } }`)
      .then(d => { const h = d?.data?.activeHeroContent; if (h) setHero({ ...h, overlayOpacity: typeof h.overlayOpacity === 'number' ? Math.max(0, Math.min(1, h.overlayOpacity)) : 0.75 }); })
      .catch(() => {});

    GQL(`query { services { id title description iconKey serviceAreas } }`)
      .then(d => setServices((d?.data?.services || []).map((s: any) => ({ ...s, serviceAreas: parseAreas(s.serviceAreas) }))))
      .catch(() => {});

    GQL(`query { clients(featured: true) { id name logo industry } companyStats { clientSatisfaction yearsExperience } companiesServed }`)
      .then(d => {
        setClients(d?.data?.clients || []);
        setCompaniesServed(Number(d?.data?.companiesServed || 0));
        if (d?.data?.companyStats) setStats(d.data.companyStats);
      })
      .catch(() => {});

    GQL(`query { companyUpdates(published: true) { id title content imageUrl createdAt } }`)
      .then(d => setUpdates(d?.data?.companyUpdates || []))
      .catch(() => {});
  }, []);

  // client carousel
  useEffect(() => {
    if (clients.length < 2) return;
    const t = setInterval(() => setClientIdx(i => (i + 1) % Math.max(1, Math.ceil(clients.length / 4))), 3000);
    return () => clearInterval(t);
  }, [clients.length]);

  const visibleClients = clients.length > 0
    ? Array.from({ length: Math.min(4, clients.length) }, (_, i) => clients[(clientIdx * 4 + i) % clients.length])
    : [];

  const latestUpdate = updates[0] || null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header onMenuClick={() => setMenuOpen(true)} onSectionClick={scrollToSection} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onSectionClick={scrollToSection} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundImage: hero.backgroundImageUrl ? `url(${hero.backgroundImageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* overlay */}
        <div style={{ position: 'absolute', inset: 0, background: hero.backgroundImageUrl ? undefined : 'linear-gradient(135deg, #0C1F5C 0%, #1a3a8f 55%, #0C1F5C 100%)', backgroundColor: hero.backgroundImageUrl ? hero.overlayColor : undefined, opacity: hero.backgroundImageUrl ? hero.overlayOpacity : 1 }} />
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 340, height: 340, borderRadius: '50%', background: 'rgba(245,194,0,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(245,194,0,0.06)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '5rem 1.5rem', maxWidth: 760, margin: '0 auto' }}>
          {hero.tagline && (
            <span style={{ display: 'inline-block', background: 'rgba(245,194,0,0.15)', color: '#F5C200', border: '1px solid rgba(245,194,0,0.35)', borderRadius: 999, padding: '0.35rem 1.1rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              {hero.tagline}
            </span>
          )}
          <h1 style={{ color: '#fff', fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', fontWeight: 900, margin: '0 0 1.2rem', lineHeight: 1.12, textShadow: '0 2px 24px rgba(0,0,0,0.3)' }}>
            {hero.heading || <><span style={{ color: '#F5C200' }}>Expert</span> Business Solutions<br />for Zambia &amp; Beyond</>}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.1rem', maxWidth: 580, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            {hero.description || 'Accounting, consultancy, technology & wealth management — NETON Limited empowers businesses to reach their full potential.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" style={goldBtn}>
              {hero.ctaText || 'Get Started'} <ArrowRight size={16} />
            </Link>
            <Link to="/services" style={outlineBtn}>
              Our Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#0C1F5C', padding: '1.5rem', borderBottom: '3px solid #F5C200' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          {[
            { icon: Building2, value: `${companiesServed || '50'}+`, label: 'Companies Served' },
            { icon: Star, value: stats.clientSatisfaction, label: 'Client Satisfaction' },
            { icon: Award, value: stats.yearsExperience, label: 'Years Experience' },
            { icon: CheckCircle, value: '6', label: 'Service Areas' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <Icon size={22} color="#F5C200" />
              <div style={{ color: '#F5C200', fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>{value}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES TEASER ──────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={sectionLabel}>What We Do</span>
            <h2 style={{ color: '#0C1F5C', fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 900, margin: '0 0 0.75rem' }}>
              Comprehensive Business <span style={{ color: '#F5C200' }}>Solutions</span>
            </h2>
            <p style={{ color: '#666', maxWidth: 520, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
              From accounting to technology — we deliver tailored strategies that drive real results.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {(services.length > 0 ? services.slice(0, 3) : [
              { id: '1', title: 'Business Consultancy', description: 'Strategic guidance to help your organisation achieve its goals.', serviceAreas: ['Business Planning', 'Strategic Growth', 'Process Optimisation'] },
              { id: '2', title: 'Accounting Services', description: 'Professional financial management and statutory compliance.', serviceAreas: ['Bookkeeping', 'Tax Filing', 'Financial Reporting'] },
              { id: '3', title: 'Technology Solutions', description: 'Custom software and digital tools for modern businesses.', serviceAreas: ['Payroll Software', 'ERP Systems', 'Web Solutions'] },
            ]).map(s => (
              <div key={s.id} style={{ ...card, borderTop: '4px solid #F5C200', transition: 'box-shadow 0.2s' }}>
                <div style={{ ...iconBox, marginBottom: '1rem' }}>
                  <CheckCircle size={20} color="#F5C200" />
                </div>
                <h3 style={{ color: '#0C1F5C', fontWeight: 800, fontSize: '1.05rem', margin: '0 0 0.5rem' }}>{s.title}</h3>
                <p style={{ color: '#666', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 1rem' }}>{s.description}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {s.serviceAreas.slice(0, 3).map(a => (
                    <li key={a} style={{ fontSize: '0.82rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5C200', flexShrink: 0 }} />{a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/services" style={navyBtn}>View All Services <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>

      {/* ── WHY NETON ────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0C1F5C 0%, #1a3a8f 60%, #0C1F5C 100%)', padding: '4.5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,194,0,0.07)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={sectionLabel}>Why Choose Us</span>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 900, margin: '0 0 0.75rem' }}>
              Built on <span style={{ color: '#F5C200' }}>Trust</span> &amp; Results
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 500, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
              Our client-centric philosophy means we're invested in your success at every step.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: Award, title: 'Deep Expertise', desc: 'Our team brings sector-spanning knowledge — from finance and compliance to technology and procurement.' },
              { icon: Lightbulb, title: 'Innovation First', desc: 'We leverage data analytics and modern technology to help you make smarter, faster business decisions.' },
              { icon: Users, title: 'True Partnership', desc: 'We work alongside you, sharing knowledge and building long-term relationships that outlast any single project.' },
              { icon: Target, title: 'Measurable Impact', desc: 'Every engagement is tied to outcomes. We track progress and adjust strategy to ensure your goals are met.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', padding: '1.75rem' }}>
                <div style={{ width: 44, height: 44, background: '#F5C200', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={22} color="#0C1F5C" />
                </div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', margin: '0 0 0.5rem' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/about" style={goldBtn}>Learn About NETON <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>

      {/* ── CLIENTS TEASER ───────────────────────────────────────────────────── */}
      {clients.length > 0 && (
        <div style={{ background: '#f8f9fc', padding: '4.5rem 1.5rem', borderTop: '1px solid #e8ecf4' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ ...sectionLabel, background: 'rgba(12,31,92,0.08)', color: '#0C1F5C', border: '1px solid rgba(12,31,92,0.15)' }}>Trusted By</span>
              <h2 style={{ color: '#0C1F5C', fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 900, margin: '0 0 0.75rem' }}>
                Companies That <span style={{ color: '#F5C200' }}>Trust Us</span>
              </h2>
              <p style={{ color: '#666', maxWidth: 460, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
                Partnering with leading organisations across Zambia and the region.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {visibleClients.map((c, i) => (
                <div key={`${c.id}-${i}`} style={{ ...card, textAlign: 'center', padding: '1.5rem 1rem' }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>{c.logo}</div>
                  <div style={{ color: '#0C1F5C', fontWeight: 700, fontSize: '0.92rem' }}>{c.name}</div>
                  <div style={{ color: '#aaa', fontSize: '0.77rem', marginTop: '0.2rem' }}>{c.industry}</div>
                </div>
              ))}
            </div>

            {/* dots */}
            {clients.length > 4 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {Array.from({ length: Math.ceil(clients.length / 4) }).map((_, i) => (
                  <button key={i} onClick={() => setClientIdx(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', background: clientIdx === i ? '#F5C200' : '#ddd' }} />
                ))}
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <Link to="/clients" style={navyBtn}>See All Clients <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      )}

      {/* ── SOFTWARE SPOTLIGHT ───────────────────────────────────────────────── */}
      <div style={{ background: '#fff', padding: '4.5rem 1.5rem', borderTop: '1px solid #e8ecf4' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={sectionLabel}>Our Software</span>
            <h2 style={{ color: '#0C1F5C', fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.2 }}>
              Neton Payroll <span style={{ color: '#F5C200' }}>Pro</span>
            </h2>
            <p style={{ color: '#555', fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.25rem' }}>
              A fully featured payroll management system built for Zambian businesses. Handle employee records, monthly payslips, NAPSA &amp; NHIMA contributions, and income tax — all in one desktop app.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem' }}>
              {['Automated PAYE, NAPSA & NHIMA', 'Print & email payslips instantly', 'Offline-first — works without internet', 'Machine-locked licensing for security'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#444' }}>
                  <CheckCircle size={16} color="#F5C200" style={{ flexShrink: 0 }} />{f}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/products" style={goldBtn}>View Pricing <ArrowRight size={15} /></Link>
              <Link to="/download" style={navyBtn}>Download <ArrowRight size={15} /></Link>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #0C1F5C, #1a3a8f)', borderRadius: 20, padding: '2.5rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(245,194,0,0.1)', pointerEvents: 'none' }} />
            <div style={{ width: 56, height: 56, background: '#F5C200', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Monitor size={28} color="#0C1F5C" />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Annual Licence</div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#F5C200', lineHeight: 1, marginBottom: '0.3rem' }}>K5,000</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginBottom: '1.5rem' }}>per company / per year</div>
            {['Unlimited employees', 'Free version upgrades', 'Email & WhatsApp support', 'Setup assistance included'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                <CheckCircle size={14} color="#F5C200" />{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LATEST UPDATE ────────────────────────────────────────────────────── */}
      {latestUpdate && (
        <div style={{ background: '#f8f9fc', padding: '4.5rem 1.5rem', borderTop: '1px solid #e8ecf4' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ ...sectionLabel, background: 'rgba(12,31,92,0.08)', color: '#0C1F5C', border: '1px solid rgba(12,31,92,0.15)' }}>News &amp; Updates</span>
              <h2 style={{ color: '#0C1F5C', fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 900, margin: 0 }}>
                Latest from <span style={{ color: '#F5C200' }}>NETON</span>
              </h2>
            </div>

            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', padding: 0 }}>
              <div style={{ height: 5, background: 'linear-gradient(90deg, #0C1F5C, #F5C200)' }} />
              {latestUpdate.imageUrl && (
                <img src={latestUpdate.imageUrl} alt={latestUpdate.title} style={{ width: '100%', height: 240, objectFit: 'cover' }} />
              )}
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ background: '#F5C200', color: '#0C1F5C', borderRadius: 999, padding: '0.15rem 0.65rem', fontSize: '0.7rem', fontWeight: 800 }}>Latest</span>
                  <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{fmtDate(latestUpdate.createdAt)}</span>
                </div>
                <h3 style={{ color: '#0C1F5C', fontWeight: 900, fontSize: '1.3rem', margin: '0 0 0.75rem' }}>{latestUpdate.title}</h3>
                <p style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.75, margin: '0 0 1.5rem', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {latestUpdate.content}
                </p>
                <Link to="/updates" style={navyBtn}><Newspaper size={15} /> View All Updates</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA BAND ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0C1F5C 0%, #1a3a8f 50%, #0C1F5C 100%)', padding: '5rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -70, left: -70, width: 260, height: 260, borderRadius: '50%', background: 'rgba(245,194,0,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(245,194,0,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <span style={sectionLabel}>Let's Work Together</span>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.2 }}>
            Ready to Grow Your <span style={{ color: '#F5C200' }}>Business?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.05rem', margin: '0 0 2rem', lineHeight: 1.7 }}>
            Talk to our team today. We'll listen, understand your challenges, and propose a solution tailored to you — with no obligation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" style={goldBtn}>Contact Us Today <ArrowRight size={16} /></Link>
            <Link to="/services" style={outlineBtn}>Explore Services <ArrowRight size={16} /></Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
