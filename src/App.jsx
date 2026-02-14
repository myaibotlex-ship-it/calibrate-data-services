import { useState, useEffect, useRef } from "react";

const TIERS = [
  { label: "0–500", min: 0, max: 500, perItem: 1250, gpp: "42%" },
  { label: "500–1,500", min: 501, max: 1500, perItem: 1500, gpp: "53%" },
  { label: "1,500–5,000", min: 1501, max: 5000, perItem: 1750, gpp: "60%" },
  { label: "5,000–10,000", min: 5001, max: 10000, perItem: 2800, gpp: "75%" },
  { label: "10,000+", min: 10001, max: Infinity, perItem: 4200, gpp: "83%" },
];

const BASE_FEE = 1500;

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

// ─── Animated counter ───
function AnimNum({ value, prefix = "" }) {
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

  return (
    <span>
      {prefix}
      {fmtNum(display)}
    </span>
  );
}

// ─── Section wrapper ───
function Section({ title, children, accent = "#E8C872" }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "28px 32px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: accent,
          marginBottom: 18,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Toggle chip ───
function Toggle({ label, value, onChange, sub }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        borderRadius: 10,
        border: value
          ? "1.5px solid #E8C872"
          : "1.5px solid rgba(255,255,255,0.1)",
        background: value ? "rgba(232,200,114,0.08)" : "transparent",
        color: value ? "#E8C872" : "rgba(255,255,255,0.5)",
        cursor: "pointer",
        fontSize: 14,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        transition: "all 0.2s",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: value
            ? "2px solid #E8C872"
            : "2px solid rgba(255,255,255,0.2)",
          background: value ? "#E8C872" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "#1A1A2E",
          fontWeight: 800,
          transition: "all 0.2s",
        }}
      >
        {value ? "✓" : ""}
      </span>
      <span>{label}</span>
      {sub && <span style={{ fontSize: 11, opacity: 0.6 }}>{sub}</span>}
    </button>
  );
}

// ─── Number input ───
function NumInput({ label, value, onChange, min = 0, max = 99999, suffix = "" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(255,255,255,0.45)",
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "0.04em",
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
            border: "1.5px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "#fff",
            fontSize: 16,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 500,
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#E8C872")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        {suffix && (
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Line item in summary ───
function LineItem({ label, amount, note, sub }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div>
        <div
          style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}
          >
            {sub}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 15,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {amount}
        </div>
        {note && (
          <div style={{ fontSize: 11, color: "#E8C872", marginTop: 2 }}>{note}</div>
        )}
      </div>
    </div>
  );
}

// ─── Custom scope flag ───
function CustomFlag({ text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 8,
        background: "rgba(255,152,0,0.08)",
        border: "1px solid rgba(255,152,0,0.2)",
        marginTop: 8,
      }}
    >
      <span style={{ fontSize: 16 }}>⚠</span>
      <span
        style={{
          fontSize: 12,
          color: "#FFB74D",
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {text}
      </span>
    </div>
  );
}

export default function App() {
  // ─── State ───
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

  // ─── Calculations ───
  const tier = getTier(employees);
  const itemCost = downloadOnly ? tier.perItem * 0.5 : tier.perItem;
  const migrationTotal =
    migrationItems > 0 ? BASE_FEE + migrationItems * itemCost : 0;

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
    migrationTotal +
    integrationTotal +
    aiOnboarding +
    handbookCost +
    techCost +
    hrCost;
  const annualRecurring = maintenanceCost + storageCost + aiAnnual;
  const grandTotal = oneTimeTotal + annualRecurring;

  const customFlags = [];
  if (includePayrollExport)
    customFlags.push(
      "Payroll registers / tax report exports require custom scoping — not included in total."
    );
  if (newIntegration)
    customFlags.push(
      "New/uncommon integration system — may require additional pricing above standard rates."
    );
  if (customDevHours > 0 && newIntegration)
    customFlags.push(
      "Custom dev hours for a new integration type should be reviewed for adjusted rates."
    );
  if (hrPayroll)
    customFlags.push(
      "HR Payroll services (IMPACT) — requires custom scoping based on specific payroll needs."
    );
  if (includeHandbook)
    customFlags.push(
      "Handbook pricing ($5,000) is a standard estimate — complex situations may vary."
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F0F1A",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        padding: "0 0 60px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap"
        rel="stylesheet"
      />

      {/* ─── Header ─── */}
      <div
        style={{
          padding: "48px 40px 36px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#E8C872",
            marginBottom: 10,
          }}
        >
          Calibrate
        </div>
        <h1
          style={{
            fontSize: 36,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.15,
            background: "linear-gradient(135deg, #fff 30%, rgba(232,200,114,0.7))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Services Pricing Calculator
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            marginTop: 10,
            maxWidth: 480,
            lineHeight: 1.6,
          }}
        >
          Configure the services below to generate a pricing estimate. Items
          flagged for custom scoping are excluded from totals.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 32,
          padding: "0 40px",
          maxWidth: 1200,
          alignItems: "start",
        }}
      >
        {/* ─── LEFT: Inputs ─── */}
        <div>
          {/* DATA MIGRATION */}
          <Section title="Data Migration">
            <div
              style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}
            >
              <NumInput
                label="Employees"
                value={employees}
                onChange={setEmployees}
                suffix="EEs"
              />
              <NumInput
                label="Migration Items"
                value={migrationItems}
                onChange={setMigrationItems}
                max={100}
                suffix="items"
              />
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                background: "rgba(232,200,114,0.05)",
                border: "1px solid rgba(232,200,114,0.1)",
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Tier: <strong style={{ color: "#E8C872" }}>{tier.label} EEs</strong> —{" "}
              {fmt(tier.perItem)}/item (upload + download) — {tier.gpp} GPP
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Toggle
                label="Download only"
                sub="(50% per-item)"
                value={downloadOnly}
                onChange={setDownloadOnly}
              />
              <Toggle
                label="Payroll/tax export"
                sub="(custom scope)"
                value={includePayrollExport}
                onChange={setIncludePayrollExport}
              />
            </div>
          </Section>

          {/* INTEGRATIONS */}
          <Section title="Integrations" accent="#7EC8E3">
            <div
              style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}
            >
              <NumInput
                label="SFTP Connections"
                value={sftpCount}
                onChange={setSftpCount}
                max={20}
                suffix="× $7,500"
              />
              <NumInput
                label="API Connections"
                value={apiCount}
                onChange={setApiCount}
                max={20}
                suffix="× $10,000"
              />
              <NumInput
                label="Custom Dev Hours"
                value={customDevHours}
                onChange={setCustomDevHours}
                max={500}
                suffix="× $175/hr"
              />
            </div>
            <Toggle
              label="New / uncommon system"
              sub="(may need adjusted pricing)"
              value={newIntegration}
              onChange={setNewIntegration}
            />
            {totalIntegrations > 0 && (
              <div
                style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 12 }}
              >
                Maintenance: {totalIntegrations} integration
                {totalIntegrations > 1 ? "s" : ""} × $250/mo ={" "}
                {fmt(maintenanceCost)}/yr (billed annually, added to recurring)
              </div>
            )}
          </Section>

          {/* PLATFORM SERVICES */}
          <Section title="Platform Services" accent="#A78BFA">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Toggle
                label="Data Storage"
                sub="$200/mo ($2,400/yr)"
                value={includeStorage}
                onChange={setIncludeStorage}
              />
              <Toggle
                label="AI Agent"
                sub="$2,500 setup + $300/mo"
                value={includeAI}
                onChange={setIncludeAI}
              />
            </div>
          </Section>

          {/* TECH CONSULTING */}
          <Section title="Technology Consulting" accent="#4ADE80">
            <div
              style={{
                display: "flex",
                gap: 24,
                alignItems: "flex-end",
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <NumInput
                label="Hours (per month)"
                value={techHours}
                onChange={setTechHours}
                max={500}
                suffix={`× ${fmt(techRate)}/hr`}
              />
            </div>
            <Toggle
              label="IMPACT Contract"
              sub="($150/hr, 6-mo min, 20 hrs/mo min)"
              value={techImpact}
              onChange={setTechImpact}
            />
            {techImpact && techHours < 20 && techHours > 0 && (
              <div style={{ fontSize: 12, color: "#FFB74D", marginTop: 8 }}>
                ⚠ IMPACT minimum is 20 hrs/mo — billing will be calculated at 20
                hours.
              </div>
            )}
          </Section>

          {/* HR SERVICES */}
          <Section title="HR Services" accent="#F472B6">
            <div
              style={{
                display: "flex",
                gap: 24,
                alignItems: "flex-end",
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <NumInput
                label="Hours (per month)"
                value={hrHours}
                onChange={setHrHours}
                max={500}
                suffix={`× ${fmt(hrRate)}/hr`}
              />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Toggle
                label="IMPACT Contract"
                sub="($100/hr, 6-mo min, 20 hrs/mo min)"
                value={hrImpact}
                onChange={setHrImpact}
              />
              <Toggle
                label="Handbook"
                sub="(~$5,000 one-time)"
                value={includeHandbook}
                onChange={setIncludeHandbook}
              />
              <Toggle
                label="Payroll Services"
                sub="(custom scope)"
                value={hrPayroll}
                onChange={setHrPayroll}
              />
            </div>
            {hrImpact && hrHours < 20 && hrHours > 0 && (
              <div style={{ fontSize: 12, color: "#FFB74D", marginTop: 8 }}>
                ⚠ IMPACT minimum is 20 hrs/mo — billing will be calculated at 20
                hours.
              </div>
            )}
          </Section>
        </div>

        {/* ─── RIGHT: Summary ─── */}
        <div
          style={{
            position: "sticky",
            top: 24,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "32px 28px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: 20,
            }}
          >
            Pricing Summary
          </div>

          {/* One-time */}
          {migrationTotal > 0 && (
            <LineItem
              label="Data Migration"
              amount={fmt(migrationTotal)}
              sub={`${fmt(BASE_FEE)} base + ${migrationItems} items × ${fmt(itemCost)}${downloadOnly ? " (DL only)" : ""}`}
            />
          )}
          {sftpCost > 0 && (
            <LineItem label={`SFTP (${sftpCount})`} amount={fmt(sftpCost)} />
          )}
          {apiCost > 0 && (
            <LineItem label={`API (${apiCount})`} amount={fmt(apiCost)} />
          )}
          {devCost > 0 && (
            <LineItem
              label={`Custom Dev (${customDevHours} hrs)`}
              amount={fmt(devCost)}
            />
          )}
          {aiOnboarding > 0 && (
            <LineItem label="AI Agent Onboarding" amount={fmt(aiOnboarding)} />
          )}
          {techCost > 0 && (
            <LineItem
              label={`Tech Consulting${techImpact ? " (IMPACT)" : ""}`}
              amount={fmt(techCost)}
              sub={`${techImpact ? Math.max(techHours, 20) : techHours} hrs × ${fmt(techRate)}/hr`}
            />
          )}
          {hrCost > 0 && (
            <LineItem
              label={`HR Consulting${hrImpact ? " (IMPACT)" : ""}`}
              amount={fmt(hrCost)}
              sub={`${hrImpact ? Math.max(hrHours, 20) : hrHours} hrs × ${fmt(hrRate)}/hr`}
            />
          )}
          {handbookCost > 0 && (
            <LineItem label="HR Handbook" amount={fmt(handbookCost)} />
          )}

          {oneTimeTotal > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0 8px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                marginTop: 4,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                One-Time
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                $<AnimNum value={oneTimeTotal} />
              </span>
            </div>
          )}

          {/* Recurring */}
          {annualRecurring > 0 && (
            <>
              <div style={{ height: 16 }} />
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                  marginBottom: 8,
                }}
              >
                Annual Recurring
              </div>
              {maintenanceCost > 0 && (
                <LineItem
                  label={`Integration Maint. (${totalIntegrations})`}
                  amount={fmt(maintenanceCost)}
                  sub="$250/mo per integration"
                  note="/yr"
                />
              )}
              {storageCost > 0 && (
                <LineItem
                  label="Data Storage"
                  amount={fmt(storageCost)}
                  sub="$200/mo"
                  note="/yr"
                />
              )}
              {aiAnnual > 0 && (
                <LineItem
                  label="AI Agent"
                  amount={fmt(aiAnnual)}
                  sub="$300/mo"
                  note="/yr"
                />
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 0 8px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Annual
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 600,
                    color: "#7EC8E3",
                  }}
                >
                  $<AnimNum value={annualRecurring} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    /yr
                  </span>
                </span>
              </div>
            </>
          )}

          {/* Grand total */}
          <div
            style={{
              marginTop: 16,
              padding: "20px 0 0",
              borderTop: "2px solid rgba(232,200,114,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#E8C872",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Total (Year 1)
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 800,
                  color: "#E8C872",
                }}
              >
                $<AnimNum value={grandTotal} />
              </span>
            </div>
            {annualRecurring > 0 && oneTimeTotal > 0 && (
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "right",
                  marginTop: 4,
                }}
              >
                {fmt(oneTimeTotal)} one-time + {fmt(annualRecurring)}/yr recurring
              </div>
            )}
          </div>

          {/* Custom scope flags */}
          {customFlags.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,152,0,0.6)",
                  marginBottom: 8,
                }}
              >
                Requires Custom Scoping
              </div>
              {customFlags.map((f, i) => (
                <CustomFlag key={i} text={f} />
              ))}
            </div>
          )}

          {grandTotal === 0 && customFlags.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "rgba(255,255,255,0.2)",
                fontSize: 14,
              }}
            >
              Configure services to see pricing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
