import { useState, useEffect, useRef } from "react";
import logo from "./assets/calibrate-logo-teal.png";

// ─── Password Protection ───
const VALID_PASSWORD = "calibrate2026"; // Change this to your preferred password

function LoginPage({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    setTimeout(() => {
      if (password === VALID_PASSWORD) {
        localStorage.setItem("calibrate-pricing-auth", "true");
        onLogin();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1A4B84 0%, #2A8A94 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 20,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "48px 40px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src={logo}
            alt="Calibrate HCM"
            style={{ height: 40, marginBottom: 24 }}
          />
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1E3A5F",
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Services Pricing Calculator
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>
            Enter access code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Access code"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 8,
              border: error ? "2px solid #EF4444" : "1px solid #E2E8F0",
              fontSize: 16,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = "#3BB4C1";
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = "#E2E8F0";
            }}
          />
          {error && (
            <p style={{ color: "#EF4444", fontSize: 13, marginTop: 8, marginBottom: 0 }}>
              Invalid access code. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 8,
              border: "none",
              background: loading || !password ? "#94A3B8" : "linear-gradient(135deg, #1A4B84 0%, #2A8A94 100%)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading || !password ? "not-allowed" : "pointer",
              marginTop: 16,
              transition: "opacity 0.15s ease",
            }}
          >
            {loading ? "Verifying..." : "Access Calculator"}
          </button>
        </form>

        <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 24 }}>
          Contact your Calibrate representative for access
        </p>
      </div>
    </div>
  );
}

// ─── Main Calculator ───
const TIERS = [
  { label: "0–500", min: 0, max: 500, perItem: 1250, gpp: "42%" },
  { label: "500–1,500", min: 501, max: 1500, perItem: 1500, gpp: "53%" },
  { label: "1,500–5,000", min: 1501, max: 5000, perItem: 1750, gpp: "60%" },
  { label: "5,000–10,000", min: 5001, max: 10000, perItem: 2800, gpp: "75%" },
  { label: "10,000+", min: 10001, max: Infinity, perItem: 4200, gpp: "83%" },
];

const BASE_FEE = 1500;

const colors = {
  teal: "#3BB4C1",
  tealLight: "#E8F7F8",
  tealDark: "#2A8A94",
  deepBlue: "#1A4B84",
  deepBlueDark: "#133A68",
  text: "#1E3A5F",
  textMuted: "#64748B",
  border: "#E2E8F0",
  background: "#FFFFFF",
  backgroundAlt: "#F8FAFC",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
};

const fmt = (n) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const fmtNum = (n) => n.toLocaleString("en-US");

function getTier(ee) {
  return TIERS.find((t) => ee >= t.min && ee <= t.max) || TIERS[4];
}

function AnimNum({ value }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef(null);

  useEffect(() => {
    let start = display;
    const end = value;
    if (start === end) return;
    const duration = 400;
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * ease));
      if (t < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return <span>{fmtNum(display)}</span>;
}

function Section({ title, children, icon }) {
  return (
    <div
      style={{
        background: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: "24px",
        marginBottom: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {icon && (
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: colors.tealLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: colors.text,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, sub }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 8,
        border: value ? `2px solid ${colors.teal}` : `1px solid ${colors.border}`,
        background: value ? colors.tealLight : colors.background,
        color: value ? colors.tealDark : colors.textMuted,
        cursor: "pointer",
        fontSize: 14,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        transition: "all 0.15s ease",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: value ? `2px solid ${colors.teal}` : `2px solid ${colors.border}`,
          background: value ? colors.teal : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "#fff",
          fontWeight: 700,
          transition: "all 0.15s ease",
        }}
      >
        {value ? "✓" : ""}
      </span>
      <span style={{ color: value ? colors.text : colors.textMuted }}>{label}</span>
      {sub && (
        <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 400 }}>
          {sub}
        </span>
      )}
    </button>
  );
}

function NumInput({ label, value, onChange, min = 0, max = 99999, suffix = "" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: colors.textMuted,
          fontFamily: "'Inter', sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) =>
            onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))
          }
          style={{
            width: 100,
            padding: "10px 14px",
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: colors.background,
            color: colors.text,
            fontSize: 16,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            outline: "none",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = colors.teal)}
          onBlur={(e) => (e.target.style.borderColor = colors.border)}
        />
        {suffix && (
          <span style={{ fontSize: 13, color: colors.textMuted }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function LineItem({ label, amount, note, sub }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div>
        <div style={{ fontSize: 14, color: colors.text, fontWeight: 500 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 15,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            color: colors.text,
          }}
        >
          {amount}
        </div>
        {note && (
          <div style={{ fontSize: 11, color: colors.teal, marginTop: 2 }}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomFlag({ text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 8,
        background: colors.warningLight,
        border: `1px solid ${colors.warning}33`,
        marginTop: 8,
      }}
    >
      <span style={{ fontSize: 14, marginTop: 1 }}>⚠️</span>
      <span
        style={{
          fontSize: 13,
          color: "#92400E",
          fontWeight: 500,
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
}

function Calculator({ onLogout }) {
  const [employees, setEmployees] = useState(250);
  const [migrationItems, setMigrationItems] = useState(3);
  const [downloadOnly, setDownloadOnly] = useState(false);
  const [includePayrollExport, setIncludePayrollExport] = useState(false);
  const [sftpCount, setSftpCount] = useState(0);
  const [apiCount, setApiCount] = useState(0);
  const [customDevHours, setCustomDevHours] = useState(0);
  const [newIntegration, setNewIntegration] = useState(false);
  const [includeStorage, setIncludeStorage] = useState(false);
  const [includeAI, setIncludeAI] = useState(false);
  const [techHours, setTechHours] = useState(0);
  const [techImpact, setTechImpact] = useState(false);
  const [hrHours, setHrHours] = useState(0);
  const [hrImpact, setHrImpact] = useState(false);
  const [includeHandbook, setIncludeHandbook] = useState(false);
  const [hrPayroll, setHrPayroll] = useState(false);

  const tier = getTier(employees);
  const itemCost = downloadOnly ? tier.perItem * 0.5 : tier.perItem;
  const migrationTotal = migrationItems > 0 ? BASE_FEE + migrationItems * itemCost : 0;

  const totalIntegrations = sftpCount + apiCount;
  const sftpCost = sftpCount * 7500;
  const apiCost = apiCount * 10000;
  const devCost = customDevHours * 175;
  const maintenanceCost = totalIntegrations * 3000;
  const integrationTotal = sftpCost + apiCost + devCost;

  const storageCost = includeStorage ? 2400 : 0;
  const aiOnboarding = includeAI ? 2500 : 0;
  const aiAnnual = includeAI ? 3600 : 0;

  const techRate = techImpact ? 150 : 185;
  const techMonthlyMin = techImpact ? 20 : 0;
  const techCost = techImpact
    ? Math.max(techHours, techMonthlyMin) * techRate
    : techHours * techRate;

  const hrRate = hrImpact ? 100 : 125;
  const hrMonthlyMin = hrImpact ? 20 : 0;
  const hrCost = hrImpact
    ? Math.max(hrHours, hrMonthlyMin) * hrRate
    : hrHours * hrRate;

  const handbookCost = includeHandbook ? 5000 : 0;

  const oneTimeTotal =
    migrationTotal + integrationTotal + aiOnboarding + handbookCost + techCost + hrCost;
  const annualRecurring = maintenanceCost + storageCost + aiAnnual;
  const grandTotal = oneTimeTotal + annualRecurring;

  const customFlags = [];
  if (includePayrollExport)
    customFlags.push("Payroll registers / tax report exports require custom scoping — not included in total.");
  if (newIntegration)
    customFlags.push("New/uncommon integration system — may require additional pricing above standard rates.");
  if (customDevHours > 0 && newIntegration)
    customFlags.push("Custom dev hours for a new integration type should be reviewed for adjusted rates.");
  if (hrPayroll)
    customFlags.push("HR Payroll services (IMPACT) — requires custom scoping based on specific payroll needs.");
  if (includeHandbook)
    customFlags.push("Handbook pricing ($5,000) is a standard estimate — complex situations may vary.");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.backgroundAlt,
        color: colors.text,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.deepBlue} 0%, ${colors.tealDark} 100%)`,
          padding: "32px 40px",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <img
              src={logo}
              alt="Calibrate HCM"
              style={{ height: 36, marginBottom: 16 }}
            />
            <h1
              style={{
                fontSize: 28,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Services Pricing Calculator
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                marginTop: 10,
                maxWidth: 480,
                lineHeight: 1.5,
              }}
            >
              Configure the services below to generate a pricing estimate.
            </p>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: 32,
          padding: "0 40px 60px",
          maxWidth: 1200,
          margin: "0 auto",
          alignItems: "start",
        }}
      >
        {/* LEFT: Inputs */}
        <div>
          <Section title="Data Migration" icon="📁">
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
              <NumInput label="Employees" value={employees} onChange={setEmployees} suffix="EEs" />
              <NumInput label="Migration Items" value={migrationItems} onChange={setMigrationItems} max={100} suffix="items" />
            </div>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 8,
                background: colors.tealLight,
                border: `1px solid ${colors.teal}22`,
                fontSize: 13,
                color: colors.text,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: colors.tealDark }}>Tier: {tier.label} EEs</strong>
              <span style={{ color: colors.textMuted }}> — {fmt(tier.perItem)}/item — {tier.gpp} GPP</span>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Toggle label="Download only" sub="(50%)" value={downloadOnly} onChange={setDownloadOnly} />
              <Toggle label="Payroll/tax export" sub="(custom)" value={includePayrollExport} onChange={setIncludePayrollExport} />
            </div>
          </Section>

          <Section title="Integrations" icon="🔗">
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
              <NumInput label="SFTP Connections" value={sftpCount} onChange={setSftpCount} max={20} suffix="× $7,500" />
              <NumInput label="API Connections" value={apiCount} onChange={setApiCount} max={20} suffix="× $10,000" />
              <NumInput label="Custom Dev Hours" value={customDevHours} onChange={setCustomDevHours} max={500} suffix="× $175/hr" />
            </div>
            <Toggle label="New / uncommon system" sub="(adjusted pricing)" value={newIntegration} onChange={setNewIntegration} />
            {totalIntegrations > 0 && (
              <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 14 }}>
                📌 Maintenance: {totalIntegrations} × $250/mo = <strong>{fmt(maintenanceCost)}/yr</strong>
              </div>
            )}
          </Section>

          <Section title="Platform Services" icon="☁️">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Toggle label="Data Storage" sub="$200/mo" value={includeStorage} onChange={setIncludeStorage} />
              <Toggle label="AI Agent" sub="$2,500 + $300/mo" value={includeAI} onChange={setIncludeAI} />
            </div>
          </Section>

          <Section title="Technology Consulting" icon="💻">
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
              <NumInput label="Hours (per month)" value={techHours} onChange={setTechHours} max={500} suffix={`× ${fmt(techRate)}/hr`} />
            </div>
            <Toggle label="IMPACT Contract" sub="($150/hr, 6-mo, 20 hrs/mo min)" value={techImpact} onChange={setTechImpact} />
            {techImpact && techHours < 20 && techHours > 0 && (
              <div style={{ fontSize: 13, color: colors.warning, marginTop: 10 }}>⚠️ IMPACT min 20 hrs/mo</div>
            )}
          </Section>

          <Section title="HR Services" icon="👥">
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
              <NumInput label="Hours (per month)" value={hrHours} onChange={setHrHours} max={500} suffix={`× ${fmt(hrRate)}/hr`} />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Toggle label="IMPACT Contract" sub="($100/hr, 20 hrs/mo min)" value={hrImpact} onChange={setHrImpact} />
              <Toggle label="Handbook" sub="(~$5,000)" value={includeHandbook} onChange={setIncludeHandbook} />
              <Toggle label="Payroll Services" sub="(custom)" value={hrPayroll} onChange={setHrPayroll} />
            </div>
            {hrImpact && hrHours < 20 && hrHours > 0 && (
              <div style={{ fontSize: 13, color: colors.warning, marginTop: 10 }}>⚠️ IMPACT min 20 hrs/mo</div>
            )}
          </Section>
        </div>

        {/* RIGHT: Summary */}
        <div
          style={{
            position: "sticky",
            top: 24,
            background: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            padding: "28px 24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textMuted, marginBottom: 20 }}>
            Pricing Summary
          </div>

          {migrationTotal > 0 && (
            <LineItem label="Data Migration" amount={fmt(migrationTotal)} sub={`${fmt(BASE_FEE)} base + ${migrationItems} × ${fmt(itemCost)}`} />
          )}
          {sftpCost > 0 && <LineItem label={`SFTP (${sftpCount})`} amount={fmt(sftpCost)} />}
          {apiCost > 0 && <LineItem label={`API (${apiCount})`} amount={fmt(apiCost)} />}
          {devCost > 0 && <LineItem label={`Custom Dev (${customDevHours} hrs)`} amount={fmt(devCost)} />}
          {aiOnboarding > 0 && <LineItem label="AI Agent Onboarding" amount={fmt(aiOnboarding)} />}
          {techCost > 0 && (
            <LineItem label={`Tech Consulting${techImpact ? " (IMPACT)" : ""}`} amount={fmt(techCost)} sub={`${techImpact ? Math.max(techHours, 20) : techHours} hrs × ${fmt(techRate)}/hr`} />
          )}
          {hrCost > 0 && (
            <LineItem label={`HR Consulting${hrImpact ? " (IMPACT)" : ""}`} amount={fmt(hrCost)} sub={`${hrImpact ? Math.max(hrHours, 20) : hrHours} hrs × ${fmt(hrRate)}/hr`} />
          )}
          {handbookCost > 0 && <LineItem label="HR Handbook" amount={fmt(handbookCost)} />}

          {oneTimeTotal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 10px", borderTop: `2px solid ${colors.border}`, marginTop: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase" }}>One-Time</span>
              <span style={{ fontSize: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: colors.text }}>
                $<AnimNum value={oneTimeTotal} />
              </span>
            </div>
          )}

          {annualRecurring > 0 && (
            <>
              <div style={{ height: 16 }} />
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textMuted, marginBottom: 10 }}>Annual Recurring</div>
              {maintenanceCost > 0 && <LineItem label={`Integration Maint. (${totalIntegrations})`} amount={fmt(maintenanceCost)} sub="$250/mo each" note="/yr" />}
              {storageCost > 0 && <LineItem label="Data Storage" amount={fmt(storageCost)} sub="$200/mo" note="/yr" />}
              {aiAnnual > 0 && <LineItem label="AI Agent" amount={fmt(aiAnnual)} sub="$300/mo" note="/yr" />}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 10px", borderTop: `2px solid ${colors.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase" }}>Annual</span>
                <span style={{ fontSize: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: colors.teal }}>
                  $<AnimNum value={annualRecurring} /><span style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500 }}>/yr</span>
                </span>
              </div>
            </>
          )}

          <div style={{ marginTop: 16, padding: "20px", borderRadius: 12, background: `linear-gradient(135deg, ${colors.deepBlue} 0%, ${colors.tealDark} 100%)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>Total (Year 1)</span>
              <span style={{ fontSize: 32, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: "#fff" }}>
                $<AnimNum value={grandTotal} />
              </span>
            </div>
            {annualRecurring > 0 && oneTimeTotal > 0 && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: "right", marginTop: 6 }}>
                {fmt(oneTimeTotal)} one-time + {fmt(annualRecurring)}/yr
              </div>
            )}
          </div>

          {customFlags.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.warning, marginBottom: 8 }}>
                Requires Custom Scoping
              </div>
              {customFlags.map((f, i) => <CustomFlag key={i} text={f} />)}
            </div>
          )}

          {grandTotal === 0 && customFlags.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted, fontSize: 14 }}>
              Configure services to see pricing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── App with Auth ───
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("calibrate-pricing-auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("calibrate-pricing-auth");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Calculator onLogout={handleLogout} />;
}
