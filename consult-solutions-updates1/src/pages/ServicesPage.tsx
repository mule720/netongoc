import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import { Building2, Laptop, DollarSign, ShoppingCart, Briefcase, CheckCircle } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  serviceAreas: string[];
}

const iconMap: Record<string, any> = {
  building2: Building2, laptop: Laptop, dollarsign: DollarSign,
  shoppingcart: ShoppingCart, briefcase: Briefcase,
};

const normalizeAreas = (v: any): string[] => {
  if (Array.isArray(v)) return v.filter(Boolean);
  try { const p = JSON.parse(v); return Array.isArray(p) ? p.filter(Boolean) : []; } catch { return []; }
};

export default function ServicesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    fetch('/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `query { services { id title description iconKey serviceAreas } }` }),
    })
      .then(r => r.json())
      .then(d => setServices((d?.data?.services || []).map((s: any) => ({ ...s, serviceAreas: normalizeAreas(s.serviceAreas) }))))
      .catch(() => {});
  }, []);

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
            What We Offer
          </span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.15 }}>
            Our <span style={{ color: '#F5C200' }}>Services</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
            Comprehensive business solutions tailored to your unique needs — from strategy to execution.
          </p>
        </div>
      </div>

      {/* Services grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {services.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading services…</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {services.map((service) => {
            const Icon = iconMap[(service.iconKey || '').toLowerCase().replace(/[^a-z0-9]/g, '')] || Briefcase;
            const isHovered = hovered === service.id;
            return (
              <div
                key={service.id}
                onMouseEnter={() => setHovered(service.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: '#fff', borderRadius: 16,
                  border: `2px solid ${isHovered ? '#0C1F5C' : '#e8ecf4'}`,
                  padding: '1.75rem', transition: 'all 0.2s',
                  boxShadow: isHovered ? '0 12px 40px rgba(12,31,92,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                  display: 'flex', flexDirection: 'column' as const,
                }}>
                <div style={{ height: 4, background: 'linear-gradient(90deg, #0C1F5C, #F5C200)', borderRadius: 4, marginBottom: '1.25rem' }} />
                <div style={{ width: 48, height: 48, background: '#0C1F5C', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={22} color="#F5C200" />
                </div>
                <h3 style={{ color: '#0C1F5C', fontWeight: 800, fontSize: '1.15rem', margin: '0 0 0.5rem' }}>{service.title}</h3>
                <p style={{ color: '#666', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 1rem', flex: 1 }}>{service.description}</p>
                {service.serviceAreas.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {service.serviceAreas.map((area, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.83rem', color: '#444' }}>
                        <CheckCircle size={13} color="#F5C200" style={{ flexShrink: 0 }} />
                        {area}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '3rem', background: 'linear-gradient(135deg, #0C1F5C, #1a3a8f)', borderRadius: 16, padding: '2.5rem', textAlign: 'center', color: '#fff' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.4rem' }}>Need a Custom Solution?</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 1.5rem' }}>Talk to our team and we'll build a plan specifically for your business.</p>
          <Link to="/contact" style={{ background: '#F5C200', color: '#0C1F5C', borderRadius: 8, padding: '0.8rem 2.5rem', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem' }}>
            Get a Free Consultation
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
