import { useState } from "react";
import logo from "./assets/calibrate-full-logo.png";

const VALID_PASSWORD = "DataSe…rate";

const TIERS = [
  { label: "0–500", min: 0, max: 500, perItem: 1250 },
  { label: "500–1,500", min: 501, max: 1500, perItem: 1500 },
  { label: "1,500–5,000", min: 1501, max: 5000, perItem: 1750 },
  { label: "5,000–10,000", min: 5001, max: 10000, perItem: 2800 },
  { label: "10,000+", min: 10001, max: Infinity, perItem: 4200 },
];

const MIGRATION_ITEMS = [
  "Pay stubs",
  "W2s / 1095Cs",
  "Timecards",
  "HR documents (includes i9s, handbooks etc)",
  "Performance reviews",
  "Personnel action forms",
  "ATS data - applications and resumes",
  "Learning course completion history"
];

const getBaseFee = (ee) => ee <= 1500 ? 1000 : 1500;
const getTier = (ee) => TIERS.find((t) => ee >= t.min && ee <= t.max) || TIERS[4];
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

  const tier = getTier(employees);
  let itemCost = tier.perItem;
  if (yearsOfData <= 3) itemCost *= 0.70;
  else if (yearsOfData >= 10) itemCost *= 1.30;

  const baseFee = getBaseFee(employees);
  const itemCount = selectedItems.length;
  const migrationTotal = itemCount > 0 ? baseFee + (itemCount * itemCost) : 0;

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
              {yearsOfData <= 3 && "30% discount applied"} 
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
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 16, textTransform: "uppercase" }}>Pricing Summary</div>
        
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
          <div>Base Fee ({employees <= 1500 ? "0-1,500 EEs" : "1,500+ EEs"})</div>
          <div style={{ fontWeight: 600 }}>{fmt(baseFee)}</div>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
          <div>Data Migration ({itemCount} items × {fmt(itemCost)})</div>
          <div style={{ fontWeight: 600 }}>{fmt(itemCount * itemCost)}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, marginTop: 8, fontSize: 18, fontWeight: 700 }}>
          <div>Total</div>
          <div style={{ color: "#0D9488" }}>{fmt(migrationTotal)}</div>
        </div>
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