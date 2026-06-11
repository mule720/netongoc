import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import { Newspaper, Calendar, TrendingUp } from 'lucide-react';

interface Update { id: string; title: string; content: string; imageUrl?: string; createdAt: string; }

export default function UpdatesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    fetch('/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `query { companyUpdates(published: true) { id title content imageUrl createdAt } }` }),
    })
      .then(r => r.json())
      .then(d => { setUpdates(d?.data?.companyUpdates || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (s: string) => {
    try { return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return s; }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header onMenuClick={() => setMenuOpen(true)} onSectionClick={scrollToSection} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onSectionClick={scrollToSection} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0C1F5C 0%, #1a3a8f 60%, #0C1F5C 100%)', padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(245,194,0,0.08)' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', background: 'rgba(245,194,0,0.15)', color: '#F5C200', border: '1px solid rgba(245,194,0,0.3)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '1.2rem', textTransform: 'uppercase' as const }}>
            Latest News
          </span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.15 }}>
            Company <span style={{ color: '#F5C200' }}>Updates</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
            Stay informed about our latest news, announcements, and industry insights.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {loading && <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa' }}>Loading updates…</div>}

        {!loading && updates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Newspaper size={48} color="#ddd" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#aaa', fontSize: '1rem' }}>No updates published yet. Check back soon!</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {updates.map((update, i) => (
            <div key={update.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf4', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: i === 0 ? 'column' : 'row' as any }}>
              {/* Top accent */}
              {i === 0 && <div style={{ height: 5, background: 'linear-gradient(90deg, #0C1F5C, #F5C200)' }} />}
              {i !== 0 && <div style={{ width: 5, background: 'linear-gradient(180deg, #0C1F5C, #F5C200)', flexShrink: 0 }} />}

              {update.imageUrl && (
                <img src={update.imageUrl} alt={update.title} style={{ width: i === 0 ? '100%' : 200, height: i === 0 ? 280 : 'auto', objectFit: 'cover', flexShrink: 0 }} />
              )}

              <div style={{ padding: i === 0 ? '2rem' : '1.5rem', flex: 1 }}>
                {i === 0 && (
                  <span style={{ display: 'inline-block', background: '#F5C200', color: '#0C1F5C', borderRadius: 999, padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    Latest
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#aaa', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <Calendar size={13} />
                  {formatDate(update.createdAt)}
                </div>
                <h3 style={{ color: '#0C1F5C', fontWeight: 800, fontSize: i === 0 ? '1.4rem' : '1.05rem', margin: '0 0 0.75rem', lineHeight: 1.3 }}>{update.title}</h3>
                <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.75, margin: 0, display: i !== 0 ? '-webkit-box' : 'block', WebkitLineClamp: i !== 0 ? 3 : undefined, WebkitBoxOrient: i !== 0 ? 'vertical' as any : undefined, overflow: i !== 0 ? 'hidden' : 'visible' }}>
                  {update.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
