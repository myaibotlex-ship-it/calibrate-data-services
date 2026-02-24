import { useState, useEffect, useRef } from "react";
import logo from "./assets/calibrate-full-logo.png";

// ─── Password Protection ───
const VALID_PASSWORD = "calibrate2026";

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1A4B84 0%, #2A8A94 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ background: "#fff", borderRadius: 16, padding: "48px 40px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={logo} alt="Calibrate HCM" style={{ height: 48, marginBottom: 24 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Services Pricing Calculator</h1>
          <p style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>Enter access code to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access code" style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: error ? "2px solid #EF4444" : "1px solid #E2E8F0", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
          {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 8, marginBottom: 0 }}>Invalid access code. Please try again.</p>}
          <button type="submit" disabled={loading || !password} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "none", background: loading || !password ? "#94A3B8" : "linear-gradient(135deg, #1A4B84 0%, #2A8A94 100%)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading || !password ? "not-allowed" : "pointer", marginTop: 16 }}>{loading ? "Verifying..." : "Access Calculator"}</button>
        </form>
        <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 24 }}>Contact your Calibrate representative for access</p>
      </div>
    </div>
  );
}

// ─── Constants ───
const TIERS = [
  { label: "0–500", min: 0, max: 500, perItem: 1250 },
  { label: "500–1,500", min: 501, max: 1500, perItem: 1500 },
  { label: "1,500–5,000", min: 1501, max: 5000, perItem: 1750 },
  { label: "5,000–10,000", min: 5001, max: 10000, perItem: 2800 },
  { label: "10,000+", min: 10001, max: Infinity, perItem: 4200 },
];
const BASE_FEE = 1500;

const colors = {
  teal: "#3BB4C1", tealLight: "#E8F7F8", tealDark: "#2A8A94",
  deepBlue: "#1A4B84", deepBlueDark: "#133A68",
  text: "#1E3A5F", textMuted: "#64748B",
  border: "#E2E8F0", background: "#FFFFFF", backgroundAlt: "#F8FAFC",
  warning: "#F59E0B", warningLight: "#FEF3C7",
};

const fmt = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtNum = (n) => n.toLocaleString("en-US");
const getTier = (ee) => TIERS.find((t) => ee >= t.min && ee <= t.max) || TIERS[4];

// Default scenario template
const createDefaultScenario = (name = "Scenario 1") => ({
  name,
  // Section enables (master toggles)
  enableMigration: false,
  enableIntegrations: false,
  enableDataServices: false,
  enableTech: false,
  enableHr: false,
  // Data Migration
  employees: 250,
  migrationItems: 3,
  yearsOfData: 5,
  downloadOnly: false,
  includePayrollExport: false,
  payrollExportPrice: 1000,
  customDataItems: [],
  // Integrations
  sftpCount: 0,
  apiCount: 0,
  customDevHours: 0,
  newIntegration: false,
  maintenanceOverride: null, // null = auto-calculate, number = manual override
  // Data Services
  includeStorage: false,
  includeAI: false,
  // Tech Consulting
  techHours: 0,
  techRate: 185,
  // HR Services
  hrHours: 0,
  hrRate: 125,
  includeHandbook: false,
  hrPayroll: false,
  // Other
  discountPercent: 0,
  // IMPACT
  impactEnabled: false,
  impactTech: false,
  impactHr: false,
  impactTechRate: 150,
  impactTechMinHours: 20,
  impactTechAddlHours: 0,
  impactTechAddlRate: 150,
  impactHrRate: 100,
  impactHrMinHours: 20,
  impactHrAddlHours: 0,
  impactHrAddlRate: 100,
  // Track which items are included in calculation (all checked by default)
  includedItems: {},
});

// Calculate totals for a scenario
function calculateTotals(s) {
  const tier = getTier(s.employees);
  let itemCost = s.downloadOnly ? tier.perItem * 0.75 : tier.perItem;
  if (s.yearsOfData <= 3) itemCost *= 0.70; // 30% discount for 3 or fewer years
  else if (s.yearsOfData >= 10) itemCost *= 1.30;
  
  // Only calculate if section is enabled
  const migrationTotal = s.enableMigration && s.migrationItems > 0 ? BASE_FEE + s.migrationItems * itemCost : 0;
  const payrollExportCost = s.enableMigration && s.includePayrollExport ? s.payrollExportPrice : 0;
  const customDataItemsTotal = s.enableMigration ? s.customDataItems.reduce((sum, item) => sum + (item.price || 0), 0) : 0;
  
  // Integrations (only if enabled) with volume discounts
  // 1st = full price, 2nd = 20% off, 3rd+ = 40% off
  const calcIntegrationCost = (count, basePrice) => {
    if (count === 0) return 0;
    let total = basePrice; // 1st at full price
    if (count >= 2) total += basePrice * 0.8; // 2nd at 20% off
    if (count >= 3) total += (count - 2) * basePrice * 0.6; // 3rd+ at 40% off
    return total;
  };
  const totalIntegrations = s.enableIntegrations ? s.sftpCount + s.apiCount : 0;
  const sftpCost = s.enableIntegrations ? calcIntegrationCost(s.sftpCount, 7500) : 0;
  const apiCost = s.enableIntegrations ? calcIntegrationCost(s.apiCount, 10000) : 0;
  const devCost = s.enableIntegrations ? s.customDevHours * 175 : 0;
  // Maintenance with volume discount: 1st full ($3000), 2nd 20% off ($2400), 3rd+ 40% off ($1800)
  const calcMaintenanceCost = (count) => {
    if (count === 0) return 0;
    let total = 3000; // 1st at full price
    if (count >= 2) total += 3000 * 0.8; // 2nd at 20% off
    if (count >= 3) total += (count - 2) * 3000 * 0.6; // 3rd+ at 40% off
    return total;
  };
  const autoMaintenanceCost = s.enableIntegrations ? calcMaintenanceCost(totalIntegrations) : 0;
  const maintenanceCost = s.maintenanceOverride !== null ? s.maintenanceOverride : autoMaintenanceCost;
  const integrationTotal = sftpCost + apiCost + devCost;
  
  // Data Services (only if enabled)
  const storageCost = s.enableDataServices && s.includeStorage ? 2400 : 0;
  const aiOnboarding = s.enableDataServices && s.includeAI ? 2500 : 0;
  const aiAnnual = s.enableDataServices && s.includeAI ? 3600 : 0;
  
  // Tech Consulting (only if enabled)
  const techCost = s.enableTech ? s.techHours * s.techRate : 0;
  
  // HR Services (only if enabled)
  const hrCost = s.enableHr ? s.hrHours * s.hrRate : 0;
  const handbookCost = s.enableHr && s.includeHandbook ? 5000 : 0;
  
  // IMPACT: just the minimum commitment (additional hours billed at addl rate as used)
  const impactTechCost = s.impactEnabled && s.impactTech ? s.impactTechMinHours * s.impactTechRate : 0;
  const impactHrCost = s.impactEnabled && s.impactHr ? s.impactHrMinHours * s.impactHrRate : 0;
  
  const oneTimeTotal = migrationTotal + payrollExportCost + customDataItemsTotal + integrationTotal + aiOnboarding + handbookCost + techCost + hrCost + impactTechCost + impactHrCost;
  const annualRecurring = maintenanceCost + storageCost + aiAnnual;
  const subtotal = oneTimeTotal + annualRecurring;
  const discountAmount = Math.round(subtotal * (s.discountPercent / 100));
  const grandTotal = subtotal - discountAmount;
  
  return { tier, itemCost, migrationTotal, payrollExportCost, customDataItemsTotal, totalIntegrations, sftpCost, apiCost, devCost, maintenanceCost, integrationTotal, storageCost, aiOnboarding, aiAnnual, techCost, hrCost, handbookCost, impactTechCost, impactHrCost, oneTimeTotal, annualRecurring, subtotal, discountAmount, grandTotal };
}

// ─── Components ───
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

function Section({ title, children, icon, enabled, onToggle }) {
  const hasToggle = typeof enabled === 'boolean' && onToggle;
  return (
    <div style={{ background: colors.background, border: hasToggle && enabled ? `2px solid ${colors.teal}` : `1px solid ${colors.border}`, borderRadius: 12, padding: "24px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.15s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        {hasToggle && (
          <button 
            onClick={onToggle}
            style={{ 
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              border: enabled ? `2px solid ${colors.teal}` : `2px solid ${colors.border}`, 
              background: enabled ? colors.teal : "transparent", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 13, color: "#fff", fontWeight: 700, cursor: "pointer"
            }}
          >
            {enabled ? "✓" : ""}
          </button>
        )}
        {icon && <span style={{ width: 32, height: 32, borderRadius: 8, background: hasToggle && enabled ? colors.tealLight : colors.backgroundAlt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</span>}
        <span style={{ fontSize: 15, fontWeight: 600, color: colors.text, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", cursor: hasToggle ? "pointer" : "default" }} onClick={hasToggle ? onToggle : undefined}>{title}</span>
        {hasToggle && !enabled && <span style={{ fontSize: 12, color: colors.textMuted, fontStyle: "italic" }}>(not included in total)</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, sub }) {
  return (
    <button onClick={() => onChange(!value)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 8, border: value ? `2px solid ${colors.teal}` : `1px solid ${colors.border}`, background: value ? colors.tealLight : colors.background, color: value ? colors.tealDark : colors.textMuted, cursor: "pointer", fontSize: 14, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
      <span style={{ width: 18, height: 18, borderRadius: 4, border: value ? `2px solid ${colors.teal}` : `2px solid ${colors.border}`, background: value ? colors.teal : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700 }}>{value ? "✓" : ""}</span>
      <span style={{ color: value ? colors.text : colors.textMuted }}>{label}</span>
      {sub && <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 400 }}>{sub}</span>}
    </button>
  );
}

function NumInput({ label, value, onChange, min = 0, max = 99999, suffix = "" }) {
  const displayValue = value === 0 ? "0" : String(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="text" inputMode="numeric" value={displayValue} onChange={(e) => { const val = e.target.value.replace(/^0+(?=\d)/, ''); const num = parseInt(val) || 0; onChange(Math.max(min, Math.min(max, num))); }} style={{ width: 100, padding: "10px 14px", borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.background, color: colors.text, fontSize: 16, fontFamily: "'Inter', sans-serif", fontWeight: 600, outline: "none" }} />
        {suffix && <span style={{ fontSize: 13, color: colors.textMuted }}>{suffix}</span>}
      </div>
    </div>
  );
}

function RateInput({ label, value, onChange, min = 0, max = 999 }) {
  const displayValue = value === 0 ? "0" : String(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 14, color: colors.textMuted }}>$</span>
        <input type="text" inputMode="numeric" value={displayValue} onChange={(e) => { const val = e.target.value.replace(/^0+(?=\d)/, ''); const num = parseInt(val) || 0; onChange(Math.max(min, Math.min(max, num))); }} style={{ width: 70, padding: "8px 10px", borderRadius: 6, border: `1px solid ${colors.border}`, background: colors.background, color: colors.text, fontSize: 14, fontFamily: "'Inter', sans-serif", fontWeight: 600, outline: "none" }} />
        <span style={{ fontSize: 13, color: colors.textMuted }}>/hr</span>
      </div>
    </div>
  );
}

function LineItem({ label, amount, note, sub, itemKey, checked, onToggle }) {
  const hasCheckbox = itemKey && onToggle;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${colors.border}`, opacity: hasCheckbox && !checked ? 0.5 : 1, transition: "opacity 0.15s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {hasCheckbox && (
          <button 
            onClick={() => onToggle(itemKey)} 
            style={{ 
              width: 18, height: 18, borderRadius: 4, marginTop: 2,
              border: checked ? `2px solid ${colors.teal}` : `2px solid ${colors.border}`, 
              background: checked ? colors.teal : "transparent", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 11, color: "#fff", fontWeight: 700, cursor: "pointer",
              flexShrink: 0
            }}
          >
            {checked ? "✓" : ""}
          </button>
        )}
        <div>
          <div style={{ fontSize: 14, color: colors.text, fontWeight: 500 }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 15, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: hasCheckbox && !checked ? colors.textMuted : colors.text, textDecoration: hasCheckbox && !checked ? "line-through" : "none" }}>{amount}</div>
        {note && <div style={{ fontSize: 11, color: colors.teal, marginTop: 2 }}>{note}</div>}
      </div>
    </div>
  );
}

function CustomFlag({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 8, background: colors.warningLight, border: `1px solid ${colors.warning}33`, marginTop: 8 }}>
      <span style={{ fontSize: 14, marginTop: 1 }}>⚠️</span>
      <span style={{ fontSize: 13, color: "#92400E", fontWeight: 500, fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}

// ─── Main Calculator ───
function Calculator({ onLogout }) {
  const [scenarios, setScenarios] = useState([createDefaultScenario("Scenario 1")]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingName, setEditingName] = useState(null);

  const s = scenarios[activeIndex];
  const totals = calculateTotals(s);

  const updateScenario = (field, value) => {
    const updated = [...scenarios];
    updated[activeIndex] = { ...updated[activeIndex], [field]: value };
    setScenarios(updated);
  };

  // Check if an item is included (default to true if not specified)
  const isItemIncluded = (key) => s.includedItems[key] !== false;

  // Toggle an item's inclusion
  const toggleItem = (key) => {
    const updated = [...scenarios];
    const current = updated[activeIndex].includedItems[key] !== false;
    updated[activeIndex] = { 
      ...updated[activeIndex], 
      includedItems: { ...updated[activeIndex].includedItems, [key]: !current } 
    };
    setScenarios(updated);
  };

  // Calculate adjusted totals based on what's checked
  const getAdjustedTotals = () => {
    let oneTimeTotal = 0;
    let annualRecurring = 0;
    
    if (totals.migrationTotal > 0 && isItemIncluded('migration')) oneTimeTotal += totals.migrationTotal;
    if (totals.payrollExportCost > 0 && isItemIncluded('payrollExport')) oneTimeTotal += totals.payrollExportCost;
    
    // Custom data items
    s.customDataItems.forEach((item, idx) => {
      if (item.price > 0 && isItemIncluded(`custom_${idx}`)) oneTimeTotal += item.price;
    });
    
    if (totals.sftpCost > 0 && isItemIncluded('sftp')) oneTimeTotal += totals.sftpCost;
    if (totals.apiCost > 0 && isItemIncluded('api')) oneTimeTotal += totals.apiCost;
    if (totals.devCost > 0 && isItemIncluded('customDev')) oneTimeTotal += totals.devCost;
    if (totals.aiOnboarding > 0 && isItemIncluded('aiOnboarding')) oneTimeTotal += totals.aiOnboarding;
    if (totals.techCost > 0 && isItemIncluded('techConsulting')) oneTimeTotal += totals.techCost;
    if (totals.hrCost > 0 && isItemIncluded('hrConsulting')) oneTimeTotal += totals.hrCost;
    if (totals.handbookCost > 0 && isItemIncluded('handbook')) oneTimeTotal += totals.handbookCost;
    if (totals.impactTechCost > 0 && isItemIncluded('impactTech')) oneTimeTotal += totals.impactTechCost;
    if (totals.impactHrCost > 0 && isItemIncluded('impactHr')) oneTimeTotal += totals.impactHrCost;
    
    // Annual recurring
    if (totals.maintenanceCost > 0 && isItemIncluded('maintenance')) annualRecurring += totals.maintenanceCost;
    if (totals.storageCost > 0 && isItemIncluded('storage')) annualRecurring += totals.storageCost;
    if (totals.aiAnnual > 0 && isItemIncluded('aiAnnual')) annualRecurring += totals.aiAnnual;
    
    const subtotal = oneTimeTotal + annualRecurring;
    const discountAmount = Math.round(subtotal * (s.discountPercent / 100));
    const grandTotal = subtotal - discountAmount;
    
    return { oneTimeTotal, annualRecurring, subtotal, discountAmount, grandTotal };
  };

  const adjustedTotals = getAdjustedTotals();

  const addScenario = () => {
    const newScenario = createDefaultScenario(`Scenario ${scenarios.length + 1}`);
    setScenarios([...scenarios, newScenario]);
    setActiveIndex(scenarios.length);
  };

  const duplicateScenario = () => {
    const copy = { ...s, name: `${s.name} (copy)`, customDataItems: [...s.customDataItems], includedItems: { ...s.includedItems } };
    setScenarios([...scenarios, copy]);
    setActiveIndex(scenarios.length);
  };

  const deleteScenario = (idx) => {
    if (scenarios.length === 1) return;
    const updated = scenarios.filter((_, i) => i !== idx);
    setScenarios(updated);
    if (activeIndex >= updated.length) setActiveIndex(updated.length - 1);
    else if (activeIndex > idx) setActiveIndex(activeIndex - 1);
  };

  const customFlags = [];
  if (s.newIntegration) customFlags.push("New/uncommon integration system — may require additional pricing above standard rates.");
  if (s.customDevHours > 0 && s.newIntegration) customFlags.push("Custom dev hours for a new integration type should be reviewed for adjusted rates.");
  if (s.hrPayroll) customFlags.push("HR Payroll services — requires custom scoping based on specific payroll needs.");
  if (s.includeHandbook) customFlags.push("Handbook pricing ($5,000) is a standard estimate — complex situations may vary.");

  return (
    <div style={{ minHeight: "100vh", background: colors.backgroundAlt, color: colors.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${colors.deepBlue} 0%, ${colors.tealDark} 100%)`, padding: "32px 40px", marginBottom: 0 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <img src={logo} alt="Calibrate HCM" style={{ height: 44, marginBottom: 16, filter: "brightness(0) invert(1)" }} />
            <h1 style={{ fontSize: 28, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, margin: 0, lineHeight: 1.2, color: "#fff" }}>Services Pricing Calculator</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 10, maxWidth: 480, lineHeight: 1.5 }}>Configure the services below to generate a pricing estimate.</p>
          </div>
          <button onClick={onLogout} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div style={{ background: colors.deepBlueDark, padding: "0 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
          {scenarios.map((scenario, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", background: activeIndex === idx ? colors.backgroundAlt : "transparent", borderRadius: "8px 8px 0 0", marginTop: 8 }}>
              {editingName === idx ? (
                <input
                  autoFocus
                  value={scenario.name}
                  onChange={(e) => { const updated = [...scenarios]; updated[idx].name = e.target.value; setScenarios(updated); }}
                  onBlur={() => setEditingName(null)}
                  onKeyDown={(e) => { if (e.key === "Enter") setEditingName(null); }}
                  style={{ padding: "10px 14px", border: "none", background: "transparent", color: colors.text, fontSize: 13, fontWeight: 600, outline: "none", width: 120 }}
                />
              ) : (
                <button
                  onClick={() => setActiveIndex(idx)}
                  onDoubleClick={() => setEditingName(idx)}
                  style={{ padding: "10px 14px", border: "none", background: "transparent", color: activeIndex === idx ? colors.text : "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: activeIndex === idx ? 600 : 500, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {scenario.name}
                </button>
              )}
              {scenarios.length > 1 && activeIndex === idx && (
                <button onClick={() => deleteScenario(idx)} style={{ padding: "4px 8px", border: "none", background: "transparent", color: colors.textMuted, fontSize: 14, cursor: "pointer", marginRight: 4 }}>×</button>
              )}
            </div>
          ))}
          <button onClick={addScenario} style={{ padding: "10px 14px", border: "none", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>+ New</button>
          <button onClick={duplicateScenario} style={{ padding: "10px 14px", border: "none", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>⧉ Duplicate</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, padding: "32px 40px 60px", maxWidth: 1200, margin: "0 auto", alignItems: "start" }}>
        {/* LEFT: Inputs */}
        <div>
          <Section title="Data Migration" icon="📁" enabled={s.enableMigration} onToggle={() => updateScenario("enableMigration", !s.enableMigration)}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
              <NumInput label="Employees" value={s.employees} onChange={(v) => updateScenario("employees", v)} suffix="EEs" />
              <NumInput label="Migration Items" value={s.migrationItems} onChange={(v) => updateScenario("migrationItems", v)} max={100} suffix="items" />
              <NumInput label="Years of Data" value={s.yearsOfData} onChange={(v) => updateScenario("yearsOfData", v)} max={50} suffix="years" />
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 8, background: colors.tealLight, border: `1px solid ${colors.teal}22`, fontSize: 13, color: colors.text, marginBottom: 16, lineHeight: 1.5 }}>
              <strong style={{ color: colors.tealDark }}>Tier: {totals.tier.label} EEs</strong>
              <span style={{ color: colors.textMuted }}> — {fmt(totals.tier.perItem)}/item</span>
              {s.yearsOfData <= 3 && <span style={{ color: colors.teal, marginLeft: 8 }}>-30% (≤3 years)</span>}
              {s.yearsOfData >= 10 && <span style={{ color: colors.warning, marginLeft: 8 }}>+30% (10+ years)</span>}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <Toggle label="Download only" sub="(25% off items)" value={s.downloadOnly} onChange={(v) => updateScenario("downloadOnly", v)} />
              <Toggle label="Payroll/tax export" value={s.includePayrollExport} onChange={(v) => updateScenario("includePayrollExport", v)} />
              {s.includePayrollExport && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, color: colors.textMuted }}>$</span>
                  <input type="text" inputMode="numeric" value={s.payrollExportPrice} onChange={(e) => { const val = e.target.value.replace(/^0+(?=\d)/, ''); const num = parseInt(val) || 0; updateScenario("payrollExportPrice", Math.max(0, Math.min(99999, num))); }} style={{ width: 70, padding: "8px 10px", borderRadius: 6, border: `1px solid ${colors.border}`, background: colors.background, color: colors.text, fontSize: 14, fontFamily: "'Inter', sans-serif", fontWeight: 600, outline: "none" }} />
                </div>
              )}
            </div>
            <div style={{ marginTop: 16, borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>Other Custom Items</span>
                <button onClick={() => updateScenario("customDataItems", [...s.customDataItems, { name: "", price: 0 }])} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${colors.teal}`, background: colors.tealLight, color: colors.tealDark, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Item</button>
              </div>
              {s.customDataItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <input type="text" placeholder="Item name" value={item.name} onChange={(e) => { const updated = [...s.customDataItems]; updated[idx].name = e.target.value; updateScenario("customDataItems", updated); }} style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" }} />
                  <span style={{ fontSize: 13, color: colors.textMuted }}>$</span>
                  <input type="text" inputMode="numeric" value={item.price || ""} placeholder="0" onChange={(e) => { const val = e.target.value.replace(/^0+(?=\d)/, ''); const num = parseInt(val) || 0; const updated = [...s.customDataItems]; updated[idx].price = Math.max(0, Math.min(99999, num)); updateScenario("customDataItems", updated); }} style={{ width: 80, padding: "8px 10px", borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 14, fontFamily: "'Inter', sans-serif", fontWeight: 600, outline: "none" }} />
                  <button onClick={() => { const updated = s.customDataItems.filter((_, i) => i !== idx); updateScenario("customDataItems", updated); }} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#FEE2E2", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✕</button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Integrations" icon="🔗" enabled={s.enableIntegrations} onToggle={() => updateScenario("enableIntegrations", !s.enableIntegrations)}>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: colors.backgroundAlt, border: `1px solid ${colors.border}`, fontSize: 12, color: colors.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
              <strong style={{ color: colors.text }}>Volume discounts:</strong> 1st @ full price, 2nd @ 20% off, 3rd+ @ 40% off
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
              <NumInput label="SFTP Connections" value={s.sftpCount} onChange={(v) => updateScenario("sftpCount", v)} max={20} suffix="@ $7,500" />
              <NumInput label="API Connections" value={s.apiCount} onChange={(v) => updateScenario("apiCount", v)} max={20} suffix="@ $10,000" />
              <NumInput label="Custom Dev Hours" value={s.customDevHours} onChange={(v) => updateScenario("customDevHours", v)} max={500} suffix="× $175/hr" />
            </div>
            <Toggle label="New / uncommon system" sub="(adjusted pricing)" value={s.newIntegration} onChange={(v) => updateScenario("newIntegration", v)} />
            {totals.totalIntegrations > 0 && (
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 8, background: colors.backgroundAlt, border: `1px solid ${colors.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ fontSize: 13, color: colors.textMuted }}>
                    📌 Annual Maintenance: {totals.totalIntegrations} integration{totals.totalIntegrations > 1 ? 's' : ''} 
                    {totals.totalIntegrations > 1 && <span style={{ color: colors.teal }}> (volume discount applied)</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {s.maintenanceOverride === null ? (
                      <>
                        <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{fmt(totals.maintenanceCost)}/yr</span>
                        <button 
                          onClick={() => updateScenario("maintenanceOverride", totals.maintenanceCost)}
                          style={{ padding: "4px 8px", borderRadius: 4, border: `1px solid ${colors.border}`, background: colors.background, color: colors.textMuted, fontSize: 11, cursor: "pointer" }}
                        >
                          Override
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 12, color: colors.textMuted }}>$</span>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          value={s.maintenanceOverride} 
                          onChange={(e) => { const num = parseInt(e.target.value.replace(/^0+(?=\d)/, '')) || 0; updateScenario("maintenanceOverride", Math.max(0, num)); }}
                          style={{ width: 80, padding: "6px 8px", borderRadius: 6, border: `1px solid ${colors.teal}`, background: colors.tealLight, color: colors.text, fontSize: 14, fontWeight: 600, outline: "none" }}
                        />
                        <span style={{ fontSize: 12, color: colors.textMuted }}>/yr</span>
                        <button 
                          onClick={() => updateScenario("maintenanceOverride", null)}
                          style={{ padding: "4px 8px", borderRadius: 4, border: `1px solid ${colors.border}`, background: colors.background, color: colors.textMuted, fontSize: 11, cursor: "pointer" }}
                        >
                          Auto
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Section>

          <Section title="Additional Data Services" icon="☁️" enabled={s.enableDataServices} onToggle={() => updateScenario("enableDataServices", !s.enableDataServices)}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Toggle label="Data Storage" sub="$200/mo" value={s.includeStorage} onChange={(v) => updateScenario("includeStorage", v)} />
              <Toggle label="AI Agent" sub="$2,500 + $300/mo" value={s.includeAI} onChange={(v) => updateScenario("includeAI", v)} />
            </div>
          </Section>

          <Section title="Technology Consulting" icon="💻" enabled={s.enableTech} onToggle={() => updateScenario("enableTech", !s.enableTech)}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 8 }}>
              <NumInput label="Hours (per month)" value={s.techHours} onChange={(v) => updateScenario("techHours", v)} max={500} suffix="hrs" />
              <RateInput label="Rate" value={s.techRate} onChange={(v) => updateScenario("techRate", v)} />
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>Book rate: $185/hr (adjust as needed)</div>
          </Section>

          <Section title="HR Services" icon="👥" enabled={s.enableHr} onToggle={() => updateScenario("enableHr", !s.enableHr)}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
              <NumInput label="Hours (per month)" value={s.hrHours} onChange={(v) => updateScenario("hrHours", v)} max={500} suffix="hrs" />
              <RateInput label="Rate" value={s.hrRate} onChange={(v) => updateScenario("hrRate", v)} />
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>Book rate: $125/hr (adjust as needed)</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Toggle label="Handbook" sub="(~$5,000)" value={s.includeHandbook} onChange={(v) => updateScenario("includeHandbook", v)} />
              <Toggle label="Payroll Services" sub="(custom)" value={s.hrPayroll} onChange={(v) => updateScenario("hrPayroll", v)} />
            </div>
          </Section>

          <Section title="IMPACT Contract" icon="⚡">
            <div style={{ marginBottom: 16 }}>
              <Toggle label="IMPACT Contract" sub="(6-month commitment)" value={s.impactEnabled} onChange={(v) => updateScenario("impactEnabled", v)} />
            </div>
            {s.impactEnabled && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ padding: 16, borderRadius: 8, background: s.impactTech ? colors.tealLight : colors.backgroundAlt, border: `1px solid ${s.impactTech ? colors.teal : colors.border}` }}>
                  <Toggle label="Technology Consulting" value={s.impactTech} onChange={(v) => { updateScenario("impactTech", v); if (v && s.impactTechAddlRate === 150) updateScenario("impactTechAddlRate", s.impactTechRate); }} />
                  {s.impactTech && (
                    <>
                      <div style={{ marginTop: 16, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <RateInput label="Hourly Rate" value={s.impactTechRate} onChange={(v) => { updateScenario("impactTechRate", v); if (s.impactTechAddlRate === s.impactTechRate || s.impactTechAddlRate === 150) updateScenario("impactTechAddlRate", v); }} />
                        <NumInput label="Min Hours/Mo" value={s.impactTechMinHours} onChange={(v) => updateScenario("impactTechMinHours", v)} max={100} suffix="hrs" />
                      </div>
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${colors.border}`, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 13, color: colors.textMuted, alignSelf: "center" }}>Additional hours over minimum:</span>
                        <RateInput label="Rate" value={s.impactTechAddlRate} onChange={(v) => updateScenario("impactTechAddlRate", v)} />
                      </div>
                    </>
                  )}
                </div>
                <div style={{ padding: 16, borderRadius: 8, background: s.impactHr ? colors.tealLight : colors.backgroundAlt, border: `1px solid ${s.impactHr ? colors.teal : colors.border}` }}>
                  <Toggle label="HR Services" value={s.impactHr} onChange={(v) => { updateScenario("impactHr", v); if (v && s.impactHrAddlRate === 100) updateScenario("impactHrAddlRate", s.impactHrRate); }} />
                  {s.impactHr && (
                    <>
                      <div style={{ marginTop: 16, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <RateInput label="Hourly Rate" value={s.impactHrRate} onChange={(v) => { updateScenario("impactHrRate", v); if (s.impactHrAddlRate === s.impactHrRate || s.impactHrAddlRate === 100) updateScenario("impactHrAddlRate", v); }} />
                        <NumInput label="Min Hours/Mo" value={s.impactHrMinHours} onChange={(v) => updateScenario("impactHrMinHours", v)} max={100} suffix="hrs" />
                      </div>
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${colors.border}`, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 13, color: colors.textMuted, alignSelf: "center" }}>Additional hours over minimum:</span>
                        <RateInput label="Rate" value={s.impactHrAddlRate} onChange={(v) => updateScenario("impactHrAddlRate", v)} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* RIGHT: Summary */}
        <div style={{ position: "sticky", top: 24, background: colors.background, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "28px 24px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textMuted, marginBottom: 20 }}>
            Pricing Summary — {s.name}
          </div>

          {totals.migrationTotal > 0 && <LineItem label="Data Migration" amount={fmt(totals.migrationTotal)} sub={`${fmt(BASE_FEE)} base + ${s.migrationItems} × ${fmt(Math.round(totals.itemCost))}${s.yearsOfData <= 3 ? ' (incl. ≤3 yr discount)' : ''}${s.yearsOfData >= 10 ? ' (incl. 10+ yr surcharge)' : ''}`} itemKey="migration" checked={isItemIncluded('migration')} onToggle={toggleItem} />}
          {totals.payrollExportCost > 0 && <LineItem label="Payroll/Tax Export" amount={fmt(totals.payrollExportCost)} itemKey="payrollExport" checked={isItemIncluded('payrollExport')} onToggle={toggleItem} />}
          {s.customDataItems.map((item, idx) => item.price > 0 && <LineItem key={idx} label={item.name || `Custom Item ${idx + 1}`} amount={fmt(item.price)} itemKey={`custom_${idx}`} checked={isItemIncluded(`custom_${idx}`)} onToggle={toggleItem} />)}
          {totals.sftpCost > 0 && <LineItem label={`SFTP (${s.sftpCount})`} amount={fmt(totals.sftpCost)} sub={s.sftpCount > 1 ? `incl. volume discount` : '$7,500 each'} itemKey="sftp" checked={isItemIncluded('sftp')} onToggle={toggleItem} />}
          {totals.apiCost > 0 && <LineItem label={`API (${s.apiCount})`} amount={fmt(totals.apiCost)} sub={s.apiCount > 1 ? `incl. volume discount` : '$10,000 each'} itemKey="api" checked={isItemIncluded('api')} onToggle={toggleItem} />}
          {totals.devCost > 0 && <LineItem label={`Custom Dev (${s.customDevHours} hrs)`} amount={fmt(totals.devCost)} itemKey="customDev" checked={isItemIncluded('customDev')} onToggle={toggleItem} />}
          {totals.aiOnboarding > 0 && <LineItem label="AI Agent Onboarding" amount={fmt(totals.aiOnboarding)} itemKey="aiOnboarding" checked={isItemIncluded('aiOnboarding')} onToggle={toggleItem} />}
          {totals.techCost > 0 && <LineItem label="Tech Consulting" amount={fmt(totals.techCost)} sub={`${s.techHours} hrs × ${fmt(s.techRate)}/hr`} itemKey="techConsulting" checked={isItemIncluded('techConsulting')} onToggle={toggleItem} />}
          {totals.hrCost > 0 && <LineItem label="HR Consulting" amount={fmt(totals.hrCost)} sub={`${s.hrHours} hrs × ${fmt(s.hrRate)}/hr`} itemKey="hrConsulting" checked={isItemIncluded('hrConsulting')} onToggle={toggleItem} />}
          {totals.handbookCost > 0 && <LineItem label="HR Handbook" amount={fmt(totals.handbookCost)} itemKey="handbook" checked={isItemIncluded('handbook')} onToggle={toggleItem} />}
          {totals.impactTechCost > 0 && <LineItem label="IMPACT Tech Consulting" amount={fmt(totals.impactTechCost)} sub={`${s.impactTechMinHours} hrs/mo × ${fmt(s.impactTechRate)} (addl @ ${fmt(s.impactTechAddlRate)}/hr)`} itemKey="impactTech" checked={isItemIncluded('impactTech')} onToggle={toggleItem} />}
          {totals.impactHrCost > 0 && <LineItem label="IMPACT HR Services" amount={fmt(totals.impactHrCost)} sub={`${s.impactHrMinHours} hrs/mo × ${fmt(s.impactHrRate)} (addl @ ${fmt(s.impactHrAddlRate)}/hr)`} itemKey="impactHr" checked={isItemIncluded('impactHr')} onToggle={toggleItem} />}

          {adjustedTotals.oneTimeTotal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 10px", borderTop: `2px solid ${colors.border}`, marginTop: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase" }}>One-Time</span>
              <span style={{ fontSize: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: colors.text }}>$<AnimNum value={adjustedTotals.oneTimeTotal} /></span>
            </div>
          )}

          {totals.annualRecurring > 0 && (
            <>
              <div style={{ height: 16 }} />
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.textMuted, marginBottom: 10 }}>Annual Recurring</div>
              {totals.maintenanceCost > 0 && <LineItem label={`Integration Maint. (${totals.totalIntegrations})`} amount={fmt(totals.maintenanceCost)} sub={s.maintenanceOverride !== null ? 'custom override' : (totals.totalIntegrations > 1 ? 'volume discount' : '$250/mo')} note="/yr" itemKey="maintenance" checked={isItemIncluded('maintenance')} onToggle={toggleItem} />}
              {totals.storageCost > 0 && <LineItem label="Data Storage" amount={fmt(totals.storageCost)} sub="$200/mo" note="/yr" itemKey="storage" checked={isItemIncluded('storage')} onToggle={toggleItem} />}
              {totals.aiAnnual > 0 && <LineItem label="AI Agent" amount={fmt(totals.aiAnnual)} sub="$300/mo" note="/yr" itemKey="aiAnnual" checked={isItemIncluded('aiAnnual')} onToggle={toggleItem} />}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 10px", borderTop: `2px solid ${colors.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase" }}>Annual</span>
                <span style={{ fontSize: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: colors.teal }}>$<AnimNum value={adjustedTotals.annualRecurring} /><span style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500 }}>/yr</span></span>
              </div>
            </>
          )}

          <div style={{ marginTop: 16, padding: "16px", borderRadius: 8, background: colors.backgroundAlt, border: `1px solid ${colors.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>Discount</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="text" inputMode="numeric" value={s.discountPercent || ""} placeholder="0" onChange={(e) => { const val = e.target.value.replace(/^0+(?=\d)/, ''); const num = parseInt(val) || 0; updateScenario("discountPercent", Math.max(0, Math.min(100, num))); }} style={{ width: 50, padding: "6px 8px", borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 14, fontFamily: "'Inter', sans-serif", fontWeight: 600, textAlign: "center", outline: "none" }} />
                <span style={{ fontSize: 13, color: colors.textMuted }}>%</span>
              </div>
            </div>
            {adjustedTotals.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.border}` }}>
                <span style={{ fontSize: 13, color: colors.textMuted }}>Discount ({s.discountPercent}%)</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#22C55E" }}>-{fmt(adjustedTotals.discountAmount)}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, padding: "20px", borderRadius: 12, background: `linear-gradient(135deg, ${colors.deepBlue} 0%, ${colors.tealDark} 100%)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>Total (Year 1)</span>
              <span style={{ fontSize: 32, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: "#fff" }}>$<AnimNum value={adjustedTotals.grandTotal} /></span>
            </div>
            {adjustedTotals.discountAmount > 0 && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: "right", marginTop: 4 }}><span style={{ textDecoration: "line-through" }}>{fmt(adjustedTotals.subtotal)}</span> → {s.discountPercent}% off</div>}
            {adjustedTotals.annualRecurring > 0 && adjustedTotals.oneTimeTotal > 0 && !adjustedTotals.discountAmount && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: "right", marginTop: 6 }}>{fmt(adjustedTotals.oneTimeTotal)} one-time + {fmt(adjustedTotals.annualRecurring)}/yr</div>}
          </div>

          {customFlags.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: colors.warning, marginBottom: 8 }}>Requires Custom Scoping</div>
              {customFlags.map((f, i) => <CustomFlag key={i} text={f} />)}
            </div>
          )}

          {adjustedTotals.grandTotal === 0 && customFlags.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted, fontSize: 14 }}>Configure services to see pricing</div>}
        </div>
      </div>
    </div>
  );
}

// ─── App with Auth ───
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => { const auth = localStorage.getItem("calibrate-pricing-auth"); if (auth === "true") setIsAuthenticated(true); }, []);
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => { localStorage.removeItem("calibrate-pricing-auth"); setIsAuthenticated(false); };
  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;
  return <Calculator onLogout={handleLogout} />;
}
