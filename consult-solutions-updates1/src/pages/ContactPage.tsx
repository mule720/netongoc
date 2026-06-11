import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileMenu from '@/components/MobileMenu';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MessageSquare, Building2 } from 'lucide-react';

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useToast();
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // Quick contact form
  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);

  // Consultancy form
  const [consult, setConsult] = useState({ name: '', email: '', company: '', phone: '', service: '', message: '' });
  const [consultLoading, setConsultLoading] = useState(false);
  const [services, setServices] = useState<string[]>([]);

  useEffect(() => {
    fetch('/graphql/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `query { services { id title isActive } }` }),
    })
      .then(r => r.json())
      .then(d => setServices((d?.data?.services || []).filter((s: any) => s.isActive !== false).map((s: any) => s.title)))
      .catch(() => {});
  }, []);

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const res = await fetch('/graphql/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation($name:String!,$email:String!,$phone:String,$message:String!){ createContactRequest(name:$name,email:$email,phone:$phone,message:$message){ contact { id } } }`,
          variables: contact,
        }),
      });
      const d = await res.json();
      if (d?.data?.createContactRequest?.contact) {
        toast({ title: 'Message Sent!', description: "We'll get back to you within 24 hours." });
        setContact({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error('Failed');
      }
    } catch { toast({ title: 'Error', description: 'Could not send message. Please try again.', variant: 'destructive' }); }
    setContactLoading(false);
  };

  const submitConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsultLoading(true);
    try {
      const res = await fetch('/graphql/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation($name:String!,$email:String!,$company:String,$phone:String,$service:String!,$message:String){ createConsultancyRequest(name:$name,email:$email,company:$company,phone:$phone,service:$service,message:$message){ success message } }`,
          variables: consult,
        }),
      });
      const d = await res.json();
      if (d?.data?.createConsultancyRequest?.success) {
        toast({ title: 'Request Submitted!', description: 'Our team will contact you shortly.' });
        setConsult({ name: '', email: '', company: '', phone: '', service: '', message: '' });
      } else {
        throw new Error('Failed');
      }
    } catch { toast({ title: 'Error', description: 'Could not submit request. Please try again.', variant: 'destructive' }); }
    setConsultLoading(false);
  };

  const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.9rem', border: '2px solid #e8ecf4', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#333', marginBottom: '0.3rem' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header onMenuClick={() => setMenuOpen(true)} onSectionClick={scrollToSection} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onSectionClick={scrollToSection} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0C1F5C 0%, #1a3a8f 60%, #0C1F5C 100%)', padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(245,194,0,0.08)' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', background: 'rgba(245,194,0,0.15)', color: '#F5C200', border: '1px solid rgba(245,194,0,0.3)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '1.2rem', textTransform: 'uppercase' as const }}>
            Get In Touch
          </span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.15 }}>
            Contact <span style={{ color: '#F5C200' }}>NETON</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
            Have a question or ready to start? Reach out and we'll respond within 24 hours.
          </p>
        </div>
      </div>

      {/* Contact cards */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: Mail, label: 'Email', value: 'netongoc@hotmail.com', href: 'mailto:netongoc@hotmail.com' },
            { icon: Phone, label: 'Phone', value: '+260 967 789 837', href: 'tel:+260967789837' },
            { icon: MessageSquare, label: 'WhatsApp', value: '+260 967 789 837', href: 'https://wa.me/260967789837' },
          ].map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: 12, border: '2px solid #e8ecf4', textDecoration: 'none', background: '#fff', transition: 'border-color 0.15s' }}>
              <div style={{ width: 40, height: 40, background: '#0C1F5C', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="#F5C200" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '0.88rem', color: '#0C1F5C', fontWeight: 700 }}>{value}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* Quick contact */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf4', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #0C1F5C, #F5C200)', borderRadius: 4, marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, background: '#0C1F5C', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} color="#F5C200" />
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#0C1F5C', fontWeight: 800, fontSize: '1.15rem' }}>Send a Message</h2>
              <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>Quick questions or general enquiries</p>
            </div>
          </div>
          <form onSubmit={submitContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={lbl}>Your Name *</label><input style={inp} required value={contact.name} onChange={e => setContact(p => ({ ...p, name: e.target.value }))} placeholder="Full name" /></div>
            <div><label style={lbl}>Email *</label><input type="email" style={inp} required value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" /></div>
            <div><label style={lbl}>Phone</label><input style={inp} value={contact.phone} onChange={e => setContact(p => ({ ...p, phone: e.target.value }))} placeholder="+260 9XX XXX XXX" /></div>
            <div><label style={lbl}>Message *</label><textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} required value={contact.message} onChange={e => setContact(p => ({ ...p, message: e.target.value }))} placeholder="How can we help?" /></div>
            <button type="submit" disabled={contactLoading} style={{ padding: '0.8rem', background: '#F5C200', color: '#0C1F5C', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: '0.95rem', cursor: contactLoading ? 'wait' : 'pointer' }}>
              {contactLoading ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Consultancy request */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf4', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #F5C200, #0C1F5C)', borderRadius: 4, marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, background: '#0C1F5C', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="#F5C200" />
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#0C1F5C', fontWeight: 800, fontSize: '1.15rem' }}>Request a Consultation</h2>
              <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>Tell us about your business needs</p>
            </div>
          </div>
          <form onSubmit={submitConsult} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Name *</label><input style={inp} required value={consult.name} onChange={e => setConsult(p => ({ ...p, name: e.target.value }))} placeholder="Full name" /></div>
              <div><label style={lbl}>Email *</label><input type="email" style={inp} required value={consult.email} onChange={e => setConsult(p => ({ ...p, email: e.target.value }))} placeholder="email@company.com" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Company</label><input style={inp} value={consult.company} onChange={e => setConsult(p => ({ ...p, company: e.target.value }))} placeholder="Company name" /></div>
              <div><label style={lbl}>Phone</label><input style={inp} value={consult.phone} onChange={e => setConsult(p => ({ ...p, phone: e.target.value }))} placeholder="+260 9XX XXX XXX" /></div>
            </div>
            <div>
              <label style={lbl}>Service Required *</label>
              <select style={{ ...inp, background: '#fff' }} required value={consult.service} onChange={e => setConsult(p => ({ ...p, service: e.target.value }))}>
                <option value="">Select a service…</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Tell Us More</label><textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} value={consult.message} onChange={e => setConsult(p => ({ ...p, message: e.target.value }))} placeholder="Describe your challenge or goal…" /></div>
            <button type="submit" disabled={consultLoading} style={{ padding: '0.8rem', background: '#0C1F5C', color: '#F5C200', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: '0.95rem', cursor: consultLoading ? 'wait' : 'pointer' }}>
              {consultLoading ? 'Submitting…' : 'Submit Consultation Request'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
