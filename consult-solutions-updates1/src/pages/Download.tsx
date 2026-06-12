import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";

const API = "";

interface Version {
  id: string;
  version: string;
  release_notes: string;
  file_name: string;
  file_size_mb: number;
  is_latest: boolean;
  uploaded_at: string;
}

export default function Download() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [licenseKey, setLicenseKey] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [step, setStep] = useState<"enter" | "loading" | "ready" | "error">("enter");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadInfo, setDownloadInfo] = useState<{ url: string; file_name: string; company: string } | null>(null);

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    fetch(`${API}/api/software/versions/?product=neton_payroll`)
      .then((r) => r.json())
      .then((d) => {
        const v: Version[] = d.versions || [];
        setVersions(v);
        setSelectedVersion(v.find((x) => x.is_latest) || v[0] || null);
      })
      .catch(() => {});
  }, []);

  const handleDownload = async () => {
    if (!licenseKey.trim() || !selectedVersion) return;
    setStep("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API}/api/software/download/${selectedVersion.id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: licenseKey.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Download failed. Please check your license key.");
        setStep("error");
        return;
      }
      setDownloadInfo({ url: data.url, file_name: data.file_name, company: data.company });
      setStep("ready");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStep("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Header onMenuClick={() => setMenuOpen(true)} onSectionClick={scrollToSection} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onSectionClick={scrollToSection} />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0C1F5C, #1a3a8f)", padding: "4rem 1.5rem 3rem", textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>💾</div>
        <h1 style={{ margin: "0 0 0.5rem", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>Download Neton Payroll Pro</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "1rem" }}>
          Enter your license key to access your download
        </p>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Versions table */}
        {versions.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8ecf4", marginBottom: "1.5rem", overflow: "hidden" }}>
            {/* Software title */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e8ecf4", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.5rem" }}>💾</span>
              <div>
                <div style={{ fontWeight: 900, color: "#0C1F5C", fontSize: "1.05rem" }}>Neton Payroll Pro</div>
                <div style={{ fontSize: "0.78rem", color: "#888" }}>Select a version below, then enter your license key to download</div>
              </div>
            </div>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 110px", padding: "0.5rem 1.5rem", background: "#f8f9fc", borderBottom: "1px solid #e8ecf4" }}>
              {["Version", "Size", "Date", "Status"].map(h => (
                <span key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
              ))}
            </div>
            {/* Rows */}
            {versions.map((v, i) => {
              const selected = selectedVersion?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => { setSelectedVersion(v); setStep("enter"); setDownloadInfo(null); }}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 80px 90px 110px",
                    alignItems: "center", padding: "0.85rem 1.5rem",
                    cursor: "pointer",
                    background: selected ? "#f0f4ff" : i % 2 === 0 ? "#fff" : "#fafbfd",
                    borderLeft: `3px solid ${selected ? "#0C1F5C" : "transparent"}`,
                    borderBottom: i < versions.length - 1 ? "1px solid #f0f2f8" : "none",
                    transition: "background 0.12s",
                  }}>
                  {/* Version + badge */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "#0C1F5C", fontSize: "0.88rem" }}>
                        v{v.version}
                      </span>
                      {v.is_latest
                        ? <span style={{ background: "#F5C200", color: "#0C1F5C", borderRadius: 999, padding: "0.1rem 0.55rem", fontSize: "0.62rem", fontWeight: 800 }}>LATEST</span>
                        : <span style={{ background: "#f0f2f8", color: "#888", borderRadius: 999, padding: "0.1rem 0.55rem", fontSize: "0.62rem", fontWeight: 700 }}>OLDER</span>
                      }
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#999", marginTop: "0.15rem" }}>
                      {v.file_name || `NetonPayrollPro_Setup_v${v.version}.exe`}
                    </div>
                  </div>
                  {/* Size */}
                  <span style={{ fontSize: "0.82rem", color: "#555", fontWeight: 600 }}>{v.file_size_mb} MB</span>
                  {/* Date */}
                  <span style={{ fontSize: "0.8rem", color: "#888" }}>{v.uploaded_at}</span>
                  {/* Select button */}
                  <span style={{
                    display: "inline-block", padding: "0.3rem 0.8rem", borderRadius: 6,
                    fontSize: "0.75rem", fontWeight: 700, textAlign: "center",
                    background: selected ? "#0C1F5C" : "#f0f4ff",
                    color: selected ? "#F5C200" : "#0C1F5C",
                  }}>
                    {selected ? "✓ Selected" : "Select"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* License key + download */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8ecf4", padding: "2rem" }}>
          {step !== "ready" && (
            <>
              <h3 style={{ margin: "0 0 0.5rem", color: "#0C1F5C", fontWeight: 800 }}>Enter Your License Key</h3>
              <p style={{ margin: "0 0 1.25rem", color: "#666", fontSize: "0.9rem" }}>
                Your license key was emailed to you after purchase. Format: XXXX-XXXX-XXXX-XXXX-XXXX
              </p>
              <input
                value={licenseKey}
                onChange={(e) => { setLicenseKey(e.target.value.toUpperCase()); setStep("enter"); setErrorMsg(""); }}
                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                maxLength={29}
                style={{
                  width: "100%", padding: "0.8rem 1rem", borderRadius: 8,
                  border: "2px solid #e8ecf4", fontSize: "1rem", fontFamily: "monospace",
                  letterSpacing: "2px", boxSizing: "border-box", marginBottom: "1rem",
                  outline: "none", color: "#1a1a1a", background: "#fff",
                }}
              />
              {step === "error" && (
                <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "0.75rem 1rem", color: "#c0392b", fontSize: "0.88rem", marginBottom: "1rem" }}>
                  {errorMsg}
                </div>
              )}
              <button
                onClick={handleDownload}
                disabled={step === "loading" || !licenseKey.trim() || !selectedVersion}
                style={{
                  width: "100%", padding: "0.9rem", background: "#F5C200", border: "none",
                  borderRadius: 8, fontWeight: 800, fontSize: "1rem", color: "#0C1F5C",
                  cursor: step === "loading" ? "wait" : "pointer", opacity: !licenseKey.trim() ? 0.6 : 1,
                }}>
                {step === "loading" ? "Verifying…" : "Verify & Get Download Link"}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#aaa", marginTop: "1rem" }}>
                Don't have a license?{" "}
                <Link to="/products" style={{ color: "#0C1F5C", fontWeight: 700 }}>Buy one here →</Link>
              </p>
            </>
          )}

          {step === "ready" && downloadInfo && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
              <h3 style={{ color: "#0C1F5C", fontWeight: 900, margin: "0 0 0.4rem" }}>License Verified!</h3>
              <p style={{ color: "#666", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
                Welcome, <strong>{downloadInfo.company}</strong>. Your download is ready.
              </p>
              <a
                href={downloadInfo.url}
                download={downloadInfo.file_name}
                style={{
                  display: "inline-block", background: "#0C1F5C", color: "#F5C200",
                  borderRadius: 8, padding: "0.9rem 2.5rem", fontWeight: 800,
                  fontSize: "1rem", textDecoration: "none", marginBottom: "1rem",
                }}>
                ⬇ Download {downloadInfo.file_name}
              </a>
              <div style={{ marginTop: "1rem" }}>
                <button
                  onClick={() => { setStep("enter"); setLicenseKey(""); setDownloadInfo(null); }}
                  style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "0.85rem" }}>
                  Download a different version
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Install instructions */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8ecf4", padding: "1.5rem", marginTop: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem", color: "#0C1F5C", fontWeight: 800, fontSize: "1rem" }}>Installation Instructions</h3>
          {[
            ["1. Download", "Click the download button above to save the installer (.exe) to your computer."],
            ["2. Run installer", "Double-click the downloaded file and follow the setup wizard."],
            ["3. Launch app", "Open Neton Payroll from your Start Menu or Desktop shortcut."],
            ["4. Activate", "On first launch, go to the Activation dialog → Activate tab and paste your license key."],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: "1rem", marginBottom: "0.85rem" }}>
              <span style={{ fontWeight: 800, color: "#F5C200", flexShrink: 0, width: 100, fontSize: "0.85rem" }}>{title}</span>
              <span style={{ color: "#555", fontSize: "0.88rem", lineHeight: 1.5 }}>{desc}</span>
            </div>
          ))}
          <p style={{ margin: "1rem 0 0", fontSize: "0.8rem", color: "#aaa" }}>
            Need help? Email <a href="mailto:chileshe720@gmail.com" style={{ color: "#0C1F5C" }}>chileshe720@gmail.com</a> or WhatsApp <a href="https://wa.me/260967789837" style={{ color: "#0C1F5C" }}>+260 967 789 837</a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
