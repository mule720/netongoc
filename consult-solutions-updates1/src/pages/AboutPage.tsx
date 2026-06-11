import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import { Target, Users, Award, Lightbulb, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header onMenuClick={() => setMenuOpen(true)} onSectionClick={scrollToSection} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onSectionClick={scrollToSection} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0C1F5C 0%, #1a3a8f 60%, #0C1F5C 100%)', padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(245,194,0,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(245,194,0,0.06)' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', background: 'rgba(245,194,0,0.15)', color: '#F5C200', border: '1px solid rgba(245,194,0,0.3)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '1.2rem', textTransform: 'uppercase' }}>
            Who We Are
          </span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.15 }}>
            About <span style={{ color: '#F5C200' }}>NETON Limited</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
            A dynamic business support and consultancy firm committed to delivering exceptional solutions across Zambia and beyond.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          {[['98%', 'Client Satisfaction'], ['15+', 'Years Experience'], ['200+', 'Companies Served'], ['6', 'Service Areas']].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0C1F5C' }}>{val}</div>
              <div style={{ fontSize: '0.82rem', color: '#888', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Mission & Approach */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { icon: Target, title: 'Our Mission', color: '#0C1F5C', text: 'NETON Limited is a dynamic Business support and consultancy firm committed to delivering exceptional business, project, accounting, business technology solutions, financing, procurement and wealth planning and management services. Our mission is to empower businesses to achieve their full potential through innovative strategies and cutting-edge technology with exceptional financing.' },
            { icon: Users, title: 'Our Approach', color: '#0C1F5C', text: 'We believe in a client-centric approach. We work closely with our clients to understand their unique challenges and goals, developing tailored solutions that deliver measurable results. Our collaborative methodology ensures that our clients are involved at every step, fostering trust, transparency and knowledge sharing.' },
          ].map(({ icon: Icon, title, color, text }) => (
            <div key={title} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf4', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 48, height: 48, background: color, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={22} color="#F5C200" />
              </div>
              <h3 style={{ color: '#0C1F5C', fontWeight: 800, fontSize: '1.2rem', margin: '0 0 0.75rem' }}>{title}</h3>
              <p style={{ color: '#555', lineHeight: 1.75, fontSize: '0.9rem', margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {[
            { icon: Award, title: 'Expertise', desc: 'Our team brings a wealth of knowledge across various sectors, ensuring we address the unique needs of each client.' },
            { icon: Lightbulb, title: 'Innovation', desc: 'Leveraging advanced data analytics and technology to help businesses make informed, strategic decisions.' },
            { icon: Target, title: 'Partnership', desc: 'Dedicated to fostering long-term client relationships, guiding them through every step of their journey.' },
            { icon: CheckCircle, title: 'Integrity', desc: 'We operate with full transparency and accountability, building trust with every client engagement.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ background: '#fff', borderRadius: 16, border: '2px solid #e8ecf4', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, background: '#0C1F5C', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Icon size={20} color="#F5C200" />
              </div>
              <h4 style={{ color: '#0C1F5C', fontWeight: 800, margin: '0 0 0.5rem', fontSize: '1rem' }}>{title}</h4>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Commitment */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf4', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #0C1F5C, #F5C200)', borderRadius: 4, marginBottom: '1.5rem' }} />
          <h3 style={{ color: '#0C1F5C', fontWeight: 800, fontSize: '1.3rem', margin: '0 0 1rem' }}>Our Commitment</h3>
          <p style={{ color: '#555', lineHeight: 1.8, margin: 0, fontSize: '0.95rem' }}>
            Our team of experienced professionals brings a wealth of knowledge across various sectors, ensuring that we address the unique needs and challenges of each client. By leveraging advanced data analytics and technology, we help businesses make informed decisions, optimize operations, and enhance their competitive edge. At NETON Limited, we are dedicated to fostering long-term partnerships with our clients, guiding them through every step of their journey towards success.
          </p>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #0C1F5C, #1a3a8f)', borderRadius: 16, padding: '2.5rem', textAlign: 'center', color: '#fff' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.4rem' }}>Ready to Work With Us?</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 1.5rem' }}>Let's discuss how NETON can help your business grow.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ background: '#F5C200', color: '#0C1F5C', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 800, textDecoration: 'none' }}>Contact Us</Link>
            <Link to="/services" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 700, textDecoration: 'none' }}>Our Services</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
