import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import { Building2, Star, Award } from 'lucide-react';

interface Client { id: string; name: string; logo: string; industry: string; isFeatured: boolean; }
interface Stats { clientSatisfaction: string; yearsExperience: string; }

export default function ClientsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [companiesServed, setCompaniesServed] = useState(0);
  const [stats, setStats] = useState<Stats>({ clientSatisfaction: '98%', yearsExperience: '15+' });
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    fetch('/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `query { clients(featured: true) { id name logo industry isFeatured } companyStats { clientSatisfaction yearsExperience } companiesServed }` }),
    })
      .then(r => r.json())
      .then(d => {
        setClients(d?.data?.clients || []);
        setCompaniesServed(Number(d?.data?.companiesServed || 0));
        if (d?.data?.companyStats) setStats(d.data.companyStats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      const iv = setInterval(() => setCurrentIndex(p => (p + 1) % Math.max(1, Math.ceil(clients.length / 4))), 3000);
      return () => clearInterval(iv);
    }
  }, [clients.length]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header onMenuClick={() => setMenuOpen(true)} onSectionClick={scrollToSection} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onSectionClick={scrollToSection} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0C1F5C 0%, #1a3a8f 60%, #0C1F5C 100%)', padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(245,194,0,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(245,194,0,0.06)' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', background: 'rgba(245,194,0,0.15)', color: '#F5C200', border: '1px solid rgba(245,194,0,0.3)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '1.2rem', textTransform: 'uppercase' as const }}>
            Trusted Partners
          </span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.15 }}>
            Companies We've <span style={{ color: '#F5C200' }}>Worked With</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
            Partnering with leading organizations across diverse industries to deliver exceptional results.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[[`${companiesServed}+`, 'Companies Served', Building2], [stats.clientSatisfaction, 'Client Satisfaction', Star], [stats.yearsExperience, 'Years Experience', Award]].map(([val, label, Icon]: any) => (
            <div key={label as string}>
              <div style={{ width: 44, height: 44, background: '#0C1F5C', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                <Icon size={20} color="#F5C200" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0C1F5C' }}>{val as string}</div>
              <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>{label as string}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Clients */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>Loading clients…</div>
        ) : (
          <>
            {/* Carousel */}
            <div style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', transition: 'transform 1s ease', transform: `translateX(-${currentIndex * 25}%)` }}>
                {clients.concat(clients.slice(0, 4)).map((client, i) => (
                  <div key={`${client.id}-${i}`} style={{ flexShrink: 0, width: '25%', padding: '0 0.75rem', boxSizing: 'border-box' }}>
                    <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #e8ecf4', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{client.logo}</div>
                      <div style={{ fontWeight: 800, color: '#0C1F5C', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{client.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#888' }}>{client.industry}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
              {Array.from({ length: Math.ceil(clients.length / 4) }).map((_, i) => (
                <button key={i} onClick={() => setCurrentIndex(i)} style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer', background: currentIndex === i ? '#0C1F5C' : '#ddd', transition: 'background 0.2s' }} />
              ))}
            </div>

            {/* All clients grid */}
            <h2 style={{ color: '#0C1F5C', fontWeight: 800, fontSize: '1.4rem', marginBottom: '1.5rem' }}>All Our Clients</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {clients.map(client => (
                <div key={client.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8ecf4', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{client.logo}</div>
                  <div style={{ fontWeight: 700, color: '#0C1F5C', fontSize: '0.85rem' }}>{client.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.2rem' }}>{client.industry}</div>
                  {client.isFeatured && <span style={{ display: 'inline-block', marginTop: '0.5rem', background: '#F5C200', color: '#0C1F5C', borderRadius: 999, padding: '0.1rem 0.6rem', fontSize: '0.68rem', fontWeight: 800 }}>Featured</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #0C1F5C, #1a3a8f)', borderRadius: 16, padding: '2.5rem', textAlign: 'center', color: '#fff' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.4rem' }}>Join Our Growing Client Base</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 1.5rem' }}>Let NETON help your business achieve its full potential.</p>
          <Link to="/contact" style={{ background: '#F5C200', color: '#0C1F5C', borderRadius: 8, padding: '0.8rem 2.5rem', fontWeight: 800, textDecoration: 'none' }}>
            Work With Us
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
