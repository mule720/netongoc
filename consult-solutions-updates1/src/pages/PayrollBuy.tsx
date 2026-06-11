import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "";

interface Plan {
  id: string;
  name: string;
  months: number;
  price_zmw: string;
}

type Step = "form" | "paying" | "polling" | "done" | "error";

export default function PayrollBuy() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("payroll_1yr");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [pollRef, setPollRef] = useState("");

  const [form, setForm] = useState({
    machine_id: "",
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetch(`${API}/api/licenses/plans/`)
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []))
      .catch(() => {});
  }, []);

  // Poll for license after redirecting back from payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const sandbox = params.get("sandbox");
    if (!ref) return;

    if (sandbox) {
      // Auto-confirm sandbox payment
      fetch(`${API}/api/licenses/sandbox-confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) {
            setLicenseKey(d.license_key);
            setExpiresAt(d.expires_at);
            setStep("done");
          } else {
            setErrorMsg(d.error || "Payment confirmation failed.");
            setStep("error");
          }
        });
      return;
    }

    // Poll real payment status
    setPollRef(ref);
    setStep("polling");
  }, []);

  useEffect(() => {
    if (step !== "polling" || !pollRef) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/licenses/status/${pollRef}/`);
        const d = await r.json();
        if (d.status === "active") {
          setLicenseKey(d.license_key);
          setExpiresAt(d.expires_at);
          setStep("done");
          clearInterval(interval);
        } else if (d.status === "cancelled") {
          setErrorMsg("Payment was cancelled or failed.");
          setStep("error");
          clearInterval(interval);
        }
      } catch {/* keep polling */}
    }, 3000);
    return () => clearInterval(interval);
  }, [step, pollRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("paying");
    setErrorMsg("");
    try {
      const res = await fetch(`${API}/api/licenses/initiate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan_id: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to initiate payment.");
        setStep("error");
        return;
      }
      // Redirect to payment checkout (or sandbox confirmation page)
      window.location.href = data.checkout_url;
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStep("error");
    }
  };

  const plan = plans.find((p) => p.id === selectedPlan);

  return (
    <div style={{ minHeight: "100vh", background: "#0C1F5C", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ background: "#fff", borderRadius: "12px", maxWidth: "520px", width: "100%", padding: "2.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link to="/" style={{ display: "inline-block", marginBottom: "0.75rem", fontSize: "0.8rem", color: "#0C1F5C", textDecoration: "none", fontWeight: 600 }}>
            ← Back to Home
          </Link>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0C1F5C", letterSpacing: "1px" }}>NETON</div>
          <div style={{ fontSize: "1rem", color: "#666" }}>Payroll — License Purchase</div>
        </div>

        {/* Done */}
        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <h2 style={{ color: "#0C1F5C" }}>Payment Successful!</h2>
            <p style={{ color: "#555", marginBottom: "1.5rem" }}>Your license key has been sent to your email.</p>
            <div style={{ background: "#f5f5f5", borderRadius: "8px", padding: "1.2rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "4px" }}>LICENSE KEY</div>
              <div style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: 700, color: "#0C1F5C", letterSpacing: "2px" }}>{licenseKey}</div>
              <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "6px" }}>Valid until {expiresAt}</div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#555" }}>
              Open Neton Payroll → Activation dialog → Activate tab → paste this key.
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(licenseKey)}
              style={{ marginTop: "1rem", background: "#F5C200", border: "none", borderRadius: "8px", padding: "0.7rem 2rem", fontWeight: 700, cursor: "pointer", color: "#0C1F5C" }}>
              Copy Key
            </button>
          </div>
        )}

        {/* Polling */}
        {step === "polling" && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <h3 style={{ color: "#0C1F5C" }}>Waiting for payment confirmation…</h3>
            <p style={{ color: "#777", fontSize: "0.9rem" }}>This page will update automatically.</p>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
            <h3 style={{ color: "#c0392b" }}>Something went wrong</h3>
            <p style={{ color: "#555", marginBottom: "1.5rem" }}>{errorMsg}</p>
            <button onClick={() => setStep("form")} style={{ background: "#0C1F5C", color: "#F5C200", border: "none", borderRadius: "8px", padding: "0.7rem 2rem", fontWeight: 700, cursor: "pointer" }}>
              Try Again
            </button>
          </div>
        )}

        {/* Paying */}
        {step === "paying" && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>💳</div>
            <h3 style={{ color: "#0C1F5C" }}>Redirecting to payment…</h3>
          </div>
        )}

        {/* Form */}
        {step === "form" && (
          <form onSubmit={handleSubmit}>
            {/* Plan selector */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Choose Plan</label>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    style={{
                      flex: 1,
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: selectedPlan === p.id ? "2px solid #0C1F5C" : "2px solid #ddd",
                      background: selectedPlan === p.id ? "#0C1F5C" : "#fff",
                      color: selectedPlan === p.id ? "#F5C200" : "#333",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}>
                    {p.name.replace("Neton Payroll — ", "")}
                    <div style={{ fontSize: "1rem", marginTop: "4px" }}>K {p.price_zmw}</div>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Machine ID *" help="Open Neton Payroll → Activation dialog to find your Machine ID">
              <input style={inputStyle} required value={form.machine_id} onChange={(e) => setForm({ ...form, machine_id: e.target.value.toUpperCase() })} placeholder="e.g. A3F2B8C1D4E5F6A7" maxLength={32} />
            </Field>
            <Field label="Company Name *">
              <input style={inputStyle} required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Your company name" />
            </Field>
            <Field label="Contact Name *">
              <input style={inputStyle} required value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Full name" />
            </Field>
            <Field label="Email *" help="License key will be sent here">
              <input style={inputStyle} required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" />
            </Field>
            <Field label="Phone (optional)">
              <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+260 97X XXX XXX" />
            </Field>

            <button type="submit" style={{ width: "100%", padding: "0.9rem", background: "#F5C200", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "1rem", color: "#0C1F5C", cursor: "pointer", marginTop: "0.5rem" }}>
              Pay K {plan?.price_zmw || "—"} →
            </button>

            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#aaa", marginTop: "1rem" }}>
              Secure payment · Mobile Money & Card accepted · netongoc.com
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#444", marginBottom: "4px" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #ddd", borderRadius: "6px", fontSize: "0.9rem", boxSizing: "border-box" };

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {help && <div style={{ fontSize: "0.72rem", color: "#888", marginTop: "3px" }}>{help}</div>}
    </div>
  );
}
