import { useState } from "react";
import logo from "./assets/calibrate-full-logo.png";

const VALID_PASSWORD = "DataSe…rate";

const TIERS = [
  { label: "0–500", min: 0, max: 500, perItem: 1250 },
  { label: "500–1,500", min: 501, max: 1500, perItem: 1500 },
  { label: "1,500–5,000", min: 1501, max: 5000, perItem: 1750 },
  { label: "5,000–10,000", min: 5001, max: 10000, perItem: 2800 },
  { label: "10,001–15,000", min: 10001, max: 15000, perItem: 4200 },
  { label: "15,001–25,000", min: 15001, max: 25000, perItem: 5200 },
  { label: "25,000+", min: 25001, max: Infinity, perItem: 7000 },
];

const MIGRATION_ITEMS = [
  { label: "Pay stubs", type: "tiered" },
  { label: "W-2s", type: "tiered" },
  { label: "1095-Cs", type: "tiered" },
  { label: "Timecards", type: "tiered" },
  { label: "Timesheets - monthly", type: "annual", annualRate: 350 },
  { label: "HR documents (includes i9s, handbooks etc)", type: "tiered" },
  { label: "Performance reviews", type: "tiered" },
  { label: "Employee action forms", type: "tiered" },
  { label: "ATS data - applications and resumes", type: "tiered" },
  { label: "Learning course completion history", type: "tiered" },
  { label: "Other item", type: "custom" }
];

const getBaseFee = (ee) => ee <= 1500 ? 1000 : 1500;
const getTier = (ee) => TIERS.find((t) => ee >= t.min && ee <= t.max) || TIERS[TIERS.length - 1];
const fmt = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

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
        localStorage.setItem("calibrate-data-services-auth", "true");
        onLogin();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1A4B84 0%, #2A8A94 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "48px 40px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={logo} alt="Calibrate HCM" style={{ height: 48, marginBottom: 24 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Data Migration Pricing</h1>
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

function Calculator() {
  const [employees, setEmployees] = useState(250);
  const [selectedItems, setSelectedItems] = useState([]);
  const [yearsOfData, setYearsOfData] = useState(5);
  const [otherItem, setOtherItem] = useState("");

  const tier = getTier(employees);
  let itemCost = tier.perItem;
  if (yearsOfData <= 3) itemCost *= 0.85;
  else if (yearsOfData >= 10) itemCost *= 1.30;

  const baseFee = getBaseFee(employees);
  const selectedMigrationItems = selectedItems.map((index) => MIGRATION_ITEMS[index]);
  const needsCustomPricing = selectedMigrationItems.some((item) => item.type === "custom");
  const tieredItemCount = selectedMigrationItems.filter((item) => item.type === "tiered").length;
  const annualItemsTotal = selectedMigrationItems
    .filter((item) => item.type === "annual")
    .reduce((total, item) => total + (item.annualRate * yearsOfData), 0);
  const migrationItemsTotal = (tieredItemCount * itemCost) + annualItemsTotal;
  const migrationTotal = selectedItems.length > 0 ? baseFee + migrationItemsTotal : 0;

  const toggleItem = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src={logo} alt="Calibrate HCM" style={{ height: 48, marginBottom: 16 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Data Migration Pricing</h1>
        <p style={{ color: "#64748B", marginTop: 8 }}>Calibrate HCM — Data Services</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Employees</label>
            <input 
              type="text" 
              inputMode="numeric" 
              value={employees} 
              onChange={(e) => setEmployees(Math.max(0, parseInt(e.target.value) || 0))} 
              style={{ width: "100%", marginTop: 6, padding: "12px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 18, fontWeight: 600 }} 
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Years of Data</label>
            <input 
              type="text" 
              inputMode="numeric" 
              value={yearsOfData} 
              onChange={(e) => setYearsOfData(Math.max(0, parseInt(e.target.value) || 0))} 
              style={{ width: "100%", marginTop: 6, padding: "12px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 18, fontWeight: 600 }} 
            />
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
              {yearsOfData <= 3 && "15% discount applied"} 
              {yearsOfData >= 10 && "30% premium applied"}
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Data Migration Items (select all that apply)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
              {MIGRATION_ITEMS.map((item, index) => (
                <label key={index} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(index)}
                    onChange={() => toggleItem(index)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
            {needsCustomPricing && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Other Item Details</label>
                <input
                  type="text"
                  value={otherItem}
                  onChange={(e) => setOtherItem(e.target.value)}
                  placeholder="Describe the item you need priced"
                  style={{ width: "100%", marginTop: 6, padding: "12px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 15 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 16, textTransform: "uppercase" }}>Pricing Summary</div>

        {needsCustomPricing && (
          <div style={{ background: "#F0FDFA", border: "1px solid #99F6E4", borderRadius: 8, padding: 16, color: "#134E4A", fontWeight: 600, marginBottom: 16 }}>
            Custom pricing needed{otherItem.trim() ? ` for ${otherItem.trim()}` : ""}
          </div>
        )}
        
        {!needsCustomPricing && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
              <div>Base Fee</div>
              <div style={{ fontWeight: 600 }}>{fmt(baseFee)}</div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
              <div>Data Migration ({tieredItemCount} items × {fmt(itemCost)})</div>
              <div style={{ fontWeight: 600 }}>{fmt(tieredItemCount * itemCost)}</div>
            </div>

            {annualItemsTotal > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
                <div>Timesheets - monthly ({fmt(350)} × {yearsOfData} years)</div>
                <div style={{ fontWeight: 600 }}>{fmt(annualItemsTotal)}</div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, marginTop: 8, fontSize: 18, fontWeight: 700 }}>
              <div>Total</div>
              <div style={{ color: "#0D9488" }}>{fmt(migrationTotal)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (localStorage.getItem("calibrate-data-services-auth") === "true" && !isAuthenticated) {
    setIsAuthenticated(true);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Calculator />;
}
