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

  const handleDownload = () => {
    if (!selectedVersion) return;
    // Build direct GCS public URL — no license key needed to download
    const fname = selectedVersion.file_name || `NetonPayrollPro_Setup_v${selectedVersion.version}.exe`;
    const link = document.createElement("a");
    link.href = `${API}/api/software/download-public/${selectedVersion.id}/`;
    link.download = fname;
    link.click();
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
          Select a version and download — activate with your license key inside the app
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
                <div style={{ fontSize: "0.78rem", color: "#888" }}>Select a version to download — no license key required here</div>
              </div>
            </div>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 110px", padding: "0.45rem 1.5rem", background: "#f8f9fc", borderBottom: "1px solid #e8ecf4" }}>
              {["File", "Size", "Date", ""].map(h => (
                <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
              ))}
            </div>
            {/* Rows — click anywhere to download */}
            {versions.map((v, i) => {
              const fname = v.file_name || `NetonPayrollPro_Setup_v${v.version}.exe`;
              const triggerDownload = () => {
                setSelectedVersion(v);
                const link = document.createElement("a");
                link.href = `/api/software/download-public/${v.id}/`;
                link.download = fname;
                link.click();
              };
              return (
                <div
                  key={v.id}
                  onClick={triggerDownload}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 80px 100px 110px",
                    alignItems: "center", padding: "0.8rem 1.5rem",
                    cursor: "pointer",
                    background: i % 2 === 0 ? "#fff" : "#fafbfd",
                    borderBottom: i < versions.length - 1 ? "1px solid #f0f2f8" : "none",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfd")}
                >
                  {/* Filename + LATEST badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
                    <span style={{ fontWeight: 600, color: "#0C1F5C", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fname}</span>
                    {v.is_latest && <span style={{ flexShrink: 0, background: "#F5C200", color: "#0C1F5C", borderRadius: 999, padding: "0.1rem 0.55rem", fontSize: "0.62rem", fontWeight: 800 }}>LATEST</span>}
                  </div>
                  {/* Size */}
                  <span style={{ fontSize: "0.82rem", color: "#555", fontWeight: 600 }}>{v.file_size_mb} MB</span>
                  {/* Date */}
                  <span style={{ fontSize: "0.8rem", color: "#888" }}>{v.uploaded_at}</span>
                  {/* Download button */}
                  <span style={{ display: "inline-block", padding: "0.28rem 0.8rem", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textAlign: "center", background: "#0C1F5C", color: "#F5C200" }}>
                    ⬇ Download
                  </span>
                </div>
              );
            })}
          </div>
        )}

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
