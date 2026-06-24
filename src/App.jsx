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
  { label: "Timesheets", type: "timesheets" },
  { label: "HR documents (includes i9s, handbooks etc)", type: "tiered" },
  { label: "Performance reviews", type: "tiered" },
  { label: "Employee action forms", type: "tiered" },
  { label: "ATS data - applications and resumes", type: "tiered" },
  { label: "Learning course completion history", type: "tiered" }
];

const getBaseFee = (ee) => ee <= 1500 ? 1000 : 1500;
const getTier = (ee) => TIERS.find((t) => ee >= t.min && ee <= t.max) || TIERS[TIERS.length - 1];
const fmt = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
const TIMESHEET_OPTIONS = {
  monthly: { label: "By month", annualRate: 200 },
  payPeriod: { label: "By pay period", annualRate: 300 },
};
const LEARNING_HISTORY_LABEL = "Learning course completion history";

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
  const [otherItems, setOtherItems] = useState([]);
  const [timesheetOption, setTimesheetOption] = useState("monthly");
  const [includeLearningCertificates, setIncludeLearningCertificates] = useState(false);
  const [extractionOnly, setExtractionOnly] = useState(false);
  const [systems, setSystems] = useState([{ from: "", to: "" }]);

  const tier = getTier(employees);
  let itemCost = tier.perItem;
  if (yearsOfData <= 3) itemCost *= 0.85;
  else if (yearsOfData >= 10) itemCost *= 1.30;

  const baseFee = getBaseFee(employees);
  const selectedMigrationItems = selectedItems.map((index) => MIGRATION_ITEMS[index]);
  const needsCustomPricing = otherItems.length > 0;
  const includesTimesheets = selectedMigrationItems.some((item) => item.type === "timesheets");
  const includesLearningHistory = selectedMigrationItems.some((item) => item.label === LEARNING_HISTORY_LABEL);
  const tieredItemCount = selectedMigrationItems.filter((item) => item.type === "tiered").length;
  const learningCertificatesTotal = includesLearningHistory && includeLearningCertificates ? itemCost * 0.50 : 0;
  const timesheetsTotal = includesTimesheets ? TIMESHEET_OPTIONS[timesheetOption].annualRate * yearsOfData : 0;
  const dataMigrationTotal = (tieredItemCount * itemCost) + learningCertificatesTotal;
  const migrationItemsTotal = dataMigrationTotal + timesheetsTotal;
  const migrationSubtotal = selectedItems.length > 0 ? baseFee + migrationItemsTotal : 0;
  const extractionOnlyDiscount = extractionOnly ? migrationSubtotal * 0.30 : 0;
  const migrationTotal = migrationSubtotal - extractionOnlyDiscount;

  const toggleItem = (index) => {
    const item = MIGRATION_ITEMS[index];
    if (selectedItems.includes(index)) {
      if (item.label === LEARNING_HISTORY_LABEL) {
        setIncludeLearningCertificates(false);
      }
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const updateSystem = (index, field, value) => {
    setSystems(systems.map((system, currentIndex) => (
      currentIndex === index ? { ...system, [field]: value } : system
    )));
  };

  const addSystem = () => {
    setSystems([...systems, { from: "", to: "" }]);
  };

  const removeSystem = (index) => {
    setSystems(systems.filter((_, currentIndex) => currentIndex !== index));
  };

  const addOtherItem = () => {
    setOtherItems([...otherItems, ""]);
  };

  const updateOtherItem = (index, value) => {
    setOtherItems(otherItems.map((item, currentIndex) => (
      currentIndex === index ? value : item
    )));
  };

  const removeOtherItem = (index) => {
    setOtherItems(otherItems.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src={logo} alt="Calibrate HCM" style={{ height: 48, marginBottom: 16 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Data Migration Pricing</h1>
        <p style={{ color: "#64748B", marginTop: 8 }}>Calibrate HCM — Data Services</p>
      </div>

      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "14px 16px", color: "#1E3A5F", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
        All standard migration projects included extraction from previous vendor and import to new vendor
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Systems</label>
            <div style={{ display: "grid", gap: 12 }}>
              {systems.map((system, index) => (
                <div key={index} style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 190px" }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>Extracting from</label>
                    <input
                      type="text"
                      value={system.from}
                      onChange={(e) => updateSystem(index, "from", e.target.value)}
                      placeholder="Previous vendor"
                      style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }}
                    />
                  </div>
                  <div style={{ flex: "1 1 190px" }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>Going to</label>
                    <input
                      type="text"
                      value={system.to}
                      onChange={(e) => updateSystem(index, "to", e.target.value)}
                      placeholder="New vendor"
                      style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }}
                    />
                  </div>
                  {systems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSystem(index)}
                      style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSystem}
              style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, border: "1px solid #0D9488", background: "#F0FDFA", color: "#0F766E", fontWeight: 600, cursor: "pointer" }}
            >
              Add extraction system
            </button>
          </div>

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
            {includesTimesheets && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Timesheet Pricing</label>
                <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                  {Object.entries(TIMESHEET_OPTIONS).map(([value, option]) => (
                    <label key={value} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="timesheet-option"
                        value={value}
                        checked={timesheetOption === value}
                        onChange={() => setTimesheetOption(value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {includesLearningHistory && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={includeLearningCertificates}
                  onChange={(e) => setIncludeLearningCertificates(e.target.checked)}
                />
                Learning certificates
              </label>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 16, textTransform: "uppercase" }}>Additional Options</div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={extractionOnly}
            onChange={(e) => setExtractionOnly(e.target.checked)}
          />
          Extraction only
        </label>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Other Items</div>
              <div style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>Items outside the standard list will need custom pricing.</div>
            </div>
            <button
              type="button"
              onClick={addOtherItem}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #0D9488", background: "#F0FDFA", color: "#0F766E", fontWeight: 600, cursor: "pointer" }}
            >
              Add other item
            </button>
          </div>

          {otherItems.length > 0 && (
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {otherItems.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateOtherItem(index, e.target.value)}
                    placeholder="Describe the item you need priced"
                    style={{ flex: "1 1 auto", minWidth: 0, padding: "12px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 15 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeOtherItem(index)}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 16, textTransform: "uppercase" }}>Pricing Summary</div>

        {needsCustomPricing && (
          <div style={{ background: "#F0FDFA", border: "1px solid #99F6E4", borderRadius: 8, padding: 16, color: "#134E4A", fontWeight: 600, marginBottom: 16 }}>
            Custom pricing needed for other item{otherItems.length > 1 ? "s" : ""}
            {otherItems.some((item) => item.trim()) ? `: ${otherItems.filter((item) => item.trim()).join(", ")}` : ""}
          </div>
        )}
        
        <>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
            <div>Base Fee</div>
            <div style={{ fontWeight: 600 }}>{fmt(baseFee)}</div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
            <div>Data Migration</div>
            <div style={{ fontWeight: 600 }}>{fmt(dataMigrationTotal)}</div>
          </div>

          {includesTimesheets && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
              <div>Timesheets</div>
              <div style={{ fontWeight: 600 }}>{fmt(timesheetsTotal)}</div>
            </div>
          )}

          {extractionOnly && migrationSubtotal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
              <div>Extraction Only Discount</div>
              <div style={{ fontWeight: 600 }}>-{fmt(extractionOnlyDiscount)}</div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, marginTop: 8, fontSize: 18, fontWeight: 700 }}>
            <div>Total</div>
            <div style={{ color: "#0D9488" }}>{fmt(migrationTotal)}</div>
          </div>
        </>
        {needsCustomPricing && (
          <div style={{ color: "#64748B", fontSize: 13, marginTop: 12 }}>
            Total shown excludes custom-priced other items.
          </div>
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
