import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";

const products = [
  {
    id: "payroll",
    name: "Neton Payroll Pro",
    tagline: "Zambia's smartest payroll software",
    description:
      "Full-featured payroll management for Zambian businesses. Handles PAYE, NAPSA, NHIMA automatically. Generate payslips, statutory reports, and email them to employees in one click.",
    price: "K 5,000",
    period: "/ year",
    badge: "Most Popular",
    badgeColor: "#F5C200",
    features: [
      "Automatic PAYE, NAPSA & NHIMA calculations",
      "PDF payslip generation & email delivery",
      "WhatsApp payslip sharing",
      "Multi-department & multi-employee support",
      "Statutory returns reports",
      "Audit trail & user access control",
      "Offline — works without internet",
      "Windows desktop app (.exe)",
    ],
    buyUrl: "/payroll/buy",
    downloadUrl: null,
    category: "Business",
    icon: "💼",
    color: "#0C1F5C",
  },
];

const categories = ["All", "Business", "Finance", "HR"];

export default function Products() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Header onMenuClick={() => setMenuOpen(true)} onSectionClick={scrollToSection} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onSectionClick={scrollToSection} />

      {/* Hero banner */}
      <div style={{
        background: "linear-gradient(135deg, #0C1F5C 0%, #1a3a8f 60%, #0C1F5C 100%)",
        padding: "5rem 1.5rem 4rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(245,194,0,0.08)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(245,194,0,0.06)" }} />

        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <span style={{
            display: "inline-block", background: "rgba(245,194,0,0.15)", color: "#F5C200",
            border: "1px solid rgba(245,194,0,0.3)", borderRadius: 999,
            padding: "0.3rem 1rem", fontSize: "0.78rem", fontWeight: 700,
            letterSpacing: "1px", marginBottom: "1.2rem", textTransform: "uppercase",
          }}>
            Neton Software Store
          </span>
          <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, margin: "0 0 1rem", lineHeight: 1.15 }}>
            Professional Software<br />
            <span style={{ color: "#F5C200" }}>Built for Zambia</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: 500, margin: "0 auto 2rem", lineHeight: 1.7 }}>
            Reliable, affordable desktop software for Zambian businesses. Buy online, get your license instantly, download and run.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={statPill}>🏢 Trusted by businesses across Zambia</div>
            <div style={statPill}>🔒 Offline · No subscription lock-in</div>
            <div style={statPill}>⚡ Instant license delivery</div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontWeight: 700, color: "#0C1F5C", fontSize: "0.8rem", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "1.8rem" }}>
            How it works
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem", textAlign: "center" }}>
            {[
              { step: "1", icon: "🛒", title: "Choose a product", desc: "Pick the software you need" },
              { step: "2", icon: "💳", title: "Pay securely", desc: "Mobile money or card — K 5,000/yr" },
              { step: "3", icon: "📧", title: "Get your key", desc: "License key sent to your email instantly" },
              { step: "4", icon: "💻", title: "Download & activate", desc: "Install and enter your key" },
            ].map((s) => (
              <div key={s.step}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#0C1F5C", color: "#F5C200", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.1rem", margin: "0 auto 0.75rem" }}>
                  {s.step}
                </div>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{s.icon}</div>
                <div style={{ fontWeight: 700, color: "#0C1F5C", fontSize: "0.9rem", marginBottom: "0.3rem" }}>{s.title}</div>
                <div style={{ color: "#777", fontSize: "0.82rem" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Category filter */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              style={{
                padding: "0.45rem 1.2rem", borderRadius: 999, border: "2px solid",
                borderColor: activeCategory === c ? "#0C1F5C" : "#ddd",
                background: activeCategory === c ? "#0C1F5C" : "#fff",
                color: activeCategory === c ? "#F5C200" : "#666",
                fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                transition: "all 0.15s",
              }}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", color: "#aaa" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚧</div>
            <p>More products coming soon!</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "2rem" }}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Coming soon teaser */}
        <div style={{ marginTop: "3rem", background: "linear-gradient(135deg, #0C1F5C, #1a3a8f)", borderRadius: 16, padding: "2.5rem", textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🚀</div>
          <h3 style={{ margin: "0 0 0.5rem", fontWeight: 800, fontSize: "1.3rem" }}>More Software Coming Soon</h3>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 1.5rem", fontSize: "0.95rem" }}>
            HR Management · Inventory · Accounting · School Management
          </p>
          <a href="mailto:chileshe720@gmail.com" style={{
            display: "inline-block", background: "#F5C200", color: "#0C1F5C",
            borderRadius: 8, padding: "0.7rem 2rem", fontWeight: 800,
            textDecoration: "none", fontSize: "0.9rem",
          }}>
            Request a Product
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: "#fff", padding: "3rem 1.5rem", borderTop: "1px solid #eee" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", color: "#0C1F5C", fontWeight: 800, marginBottom: "2rem", fontSize: "1.6rem" }}>
            Frequently Asked Questions
          </h2>
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ProductCard({ product }: { product: typeof products[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `2px solid ${hovered ? "#0C1F5C" : "#e8ecf4"}`,
        overflow: "hidden",
        transition: "all 0.2s",
        boxShadow: hovered ? "0 12px 40px rgba(12,31,92,0.15)" : "0 2px 12px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}>
      {/* Top accent */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${product.color}, #F5C200)` }} />

      <div style={{ padding: "1.75rem", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Badge + icon */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <span style={{ fontSize: "2.5rem" }}>{product.icon}</span>
          {product.badge && (
            <span style={{
              background: product.badgeColor, color: "#0C1F5C",
              borderRadius: 999, padding: "0.25rem 0.85rem",
              fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.5px",
            }}>
              {product.badge}
            </span>
          )}
        </div>

        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0C1F5C", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.3rem", opacity: 0.6 }}>
          {product.category}
        </div>
        <h3 style={{ margin: "0 0 0.4rem", color: "#0C1F5C", fontWeight: 900, fontSize: "1.25rem" }}>{product.name}</h3>
        <p style={{ margin: "0 0 0.25rem", color: "#F5C200", fontWeight: 700, fontSize: "0.85rem" }}>{product.tagline}</p>
        <p style={{ margin: "0 0 1.25rem", color: "#666", fontSize: "0.88rem", lineHeight: 1.6 }}>{product.description}</p>

        {/* Features */}
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", flex: 1 }}>
          {product.features.map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.45rem", fontSize: "0.84rem", color: "#444" }}>
              <span style={{ color: "#F5C200", fontWeight: 900, marginTop: 1, flexShrink: 0 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "2rem", fontWeight: 900, color: "#0C1F5C" }}>{product.price}</span>
          <span style={{ color: "#999", fontSize: "0.9rem" }}>{product.period}</span>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}>
          <Link
            to={product.buyUrl}
            style={{
              display: "block", textAlign: "center",
              background: "#F5C200", color: "#0C1F5C",
              borderRadius: 8, padding: "0.8rem",
              fontWeight: 800, fontSize: "0.95rem",
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}>
            Buy Now — {product.price}
          </Link>
          <Link
            to="/download"
            style={{
              display: "block", textAlign: "center",
              background: "#fff", color: "#0C1F5C",
              border: "2px solid #0C1F5C",
              borderRadius: 8, padding: "0.7rem",
              fontWeight: 700, fontSize: "0.9rem",
              textDecoration: "none",
            }}>
            ⬇ Download (have a license?)
          </Link>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #eee", marginBottom: "0.5rem" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", textAlign: "left", padding: "1rem 0", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, color: "#0C1F5C", fontSize: "0.95rem" }}>{q}</span>
        <span style={{ color: "#F5C200", fontWeight: 900, fontSize: "1.2rem", flexShrink: 0, marginLeft: "1rem" }}>{open ? "−" : "+"}</span>
      </button>
      {open && <p style={{ margin: "0 0 1rem", color: "#555", fontSize: "0.9rem", lineHeight: 1.7 }}>{a}</p>}
    </div>
  );
}

const statPill: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 999, padding: "0.35rem 1rem", color: "rgba(255,255,255,0.8)",
  fontSize: "0.8rem", fontWeight: 600,
};

const faqs = [
  { q: "How do I get my license after paying?", a: "Your license key is generated instantly and sent to your email address as soon as payment is confirmed. You can also copy it directly from the confirmation screen." },
  { q: "Is the software tied to one computer?", a: "Yes — each license is locked to the Machine ID of the computer you register with. If you change computers, contact us at chileshe720@gmail.com to transfer your license." },
  { q: "What payment methods are accepted?", a: "We accept Airtel Money, MTN Mobile Money, and debit/credit cards." },
  { q: "Does the software work without internet?", a: "Yes. Neton Payroll is a Windows desktop application that runs fully offline once installed and activated." },
  { q: "What happens when my license expires?", a: "The software will prompt you to renew. All your data is kept safe — just purchase a new license and enter the key to continue." },
  { q: "Can I try before I buy?", a: "Contact us at chileshe720@gmail.com or WhatsApp +260 967 789 837 to request a demo." },
];
