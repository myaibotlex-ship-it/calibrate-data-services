import { useMemo, useState } from "react";
import logo from "./assets/calibrate-full-logo.png";

const VALID_PASSWORD = "Calibrate+PEPL";
const AUTH_STORAGE_KEY = "calibrate-data-services-auth";
const AUTH_COOKIE = "calibrate_site_auth=calibrate-pepl-v1";

const TIERS = [
  { label: "0-500", min: 0, max: 500, perItem: 1250 },
  { label: "501-1,500", min: 501, max: 1500, perItem: 1500 },
  { label: "1,501-5,000", min: 1501, max: 5000, perItem: 1750 },
  { label: "5,001-10,000", min: 5001, max: 10000, perItem: 2800 },
  { label: "10,001-15,000", min: 10001, max: 15000, perItem: 4200 },
  { label: "15,001-25,000", min: 15001, max: 25000, perItem: 5200 },
  { label: "25,001+", min: 25001, max: Infinity, perItem: 7000 },
];

const MIGRATION_GROUPS = [
  {
    name: "Employee Data",
    items: [
      { label: "HR documents (includes i9s, handbooks etc)", type: "tiered" },
      { label: "Employee action forms", type: "tiered" },
      { label: "Performance reviews", type: "tiered" },
    ],
  },
  {
    name: "Payroll",
    items: [
      { label: "Pay stubs", type: "tiered" },
      { label: "Check registers", type: "discountedTiered", discount: 0.40 },
    ],
  },
  {
    name: "Tax & Compliance",
    items: [
      { label: "W-2s", type: "tiered" },
      { label: "1095-Cs", type: "tiered" },
    ],
  },
  {
    name: "Learning",
    items: [
      { label: "Learning course completion history", type: "tiered" },
      { label: "Learning certificates", type: "halfTiered" },
    ],
  },
  {
    name: "Time & Attendance",
    items: [
      { label: "Timecards", type: "tiered" },
      { label: "Timesheet reports", type: "timesheets" },
    ],
  },
  {
    name: "Recruiting",
    items: [
      { label: "ATS data - applications and resumes", type: "tiered" },
    ],
  },
];

const MIGRATION_ITEMS = MIGRATION_GROUPS.flatMap((group) => (
  group.items.map((item) => ({ ...item, category: group.name }))
));

const TIMESHEET_OPTIONS = {
  monthly: { label: "By month", annualRate: 200 },
  payPeriod: { label: "By pay period", annualRate: 300 },
};

const getBaseFee = (ee) => ee <= 1500 ? 1000 : 1500;
const getTier = (ee) => TIERS.find((t) => ee >= t.min && ee <= t.max) || TIERS[TIERS.length - 1];
const fmt = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

const getImageDataUrl = async (src) => {
  const response = await fetch(src);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const safeFilename = (value) => {
  const name = value.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return name || "data-migration-pricing-summary";
};

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
        localStorage.setItem(AUTH_STORAGE_KEY, VALID_PASSWORD);
        onLogin();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Calibrate HCM" />
          <h1>Data Migration Pricing</h1>
          <p>Enter access code to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Access code"
            className={error ? "field-error" : ""}
          />
          {error && <p className="error-message">Invalid access code. Please try again.</p>}
          <button type="submit" disabled={loading || !password}>
            {loading ? "Verifying..." : "Access Calculator"}
          </button>
        </form>
        <p className="login-note">Contact your Calibrate representative for access</p>
      </div>
    </div>
  );
}

function CollapsibleSection({ id, step, title, complete, open, onToggle, children }) {
  return (
    <section className={`quote-section ${open ? "is-open" : ""}`}>
      <button className="section-header" type="button" onClick={() => onToggle(id)}>
        <span className="section-step">{step}</span>
        <span>
          <span className="section-title">{title}</span>
          <span className={`section-status ${complete ? "complete" : ""}`}>
            {complete ? "Complete" : "Needs input"}
          </span>
        </span>
        <span className="section-toggle">{open ? "-" : "+"}</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </section>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value, negative = false }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong className={negative ? "negative" : ""}>{negative ? "-" : ""}{value}</strong>
    </div>
  );
}

function Calculator() {
  const [employees, setEmployees] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [yearsOfData, setYearsOfData] = useState("");
  const [otherItems, setOtherItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [timesheetOption, setTimesheetOption] = useState("monthly");
  const [extractionOnly, setExtractionOnly] = useState(false);
  const [systems, setSystems] = useState([{ from: "", to: "" }]);
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });
  const [openSections, setOpenSections] = useState({
    client: true,
    systems: true,
    scope: true,
    items: true,
    options: true,
  });

  const employeeCount = Number.parseInt(employees, 10) || 0;
  const dataYears = Number.parseInt(yearsOfData, 10) || 0;
  const tier = getTier(employeeCount);
  let itemCost = tier.perItem;
  if (dataYears > 0 && dataYears <= 3) itemCost *= 0.85;
  else if (dataYears >= 10) itemCost *= 1.30;

  const baseFee = getBaseFee(employeeCount);
  const selectedMigrationItems = selectedItems.map((index) => MIGRATION_ITEMS[index]);
  const needsCustomPricing = otherItems.length > 0;
  const includesTimesheets = selectedMigrationItems.some((item) => item.type === "timesheets");
  const tieredItemCount = selectedMigrationItems.filter((item) => item.type === "tiered").length;
  const halfTieredItemCount = selectedMigrationItems.filter((item) => item.type === "halfTiered").length;
  const halfTieredTotal = halfTieredItemCount * itemCost * 0.50;
  const discountedTieredTotal = selectedMigrationItems
    .filter((item) => item.type === "discountedTiered")
    .reduce((total, item) => total + (itemCost * (1 - item.discount)), 0);
  const timesheetsTotal = includesTimesheets ? TIMESHEET_OPTIONS[timesheetOption].annualRate * dataYears : 0;
  const dataMigrationTotal = (tieredItemCount * itemCost) + halfTieredTotal + discountedTieredTotal;
  const migrationItemsTotal = dataMigrationTotal + timesheetsTotal;
  const migrationSubtotal = selectedItems.length > 0 ? baseFee + migrationItemsTotal : 0;
  const extractionOnlyDiscount = extractionOnly ? migrationSubtotal * 0.30 : 0;
  const migrationTotal = migrationSubtotal - extractionOnlyDiscount;

  const trimmedOtherItems = otherItems.map((item) => item.trim()).filter(Boolean);
  const firstSystemComplete = Boolean(systems[0]?.from.trim() && systems[0]?.to.trim());
  const clientComplete = Boolean(clientInfo.name.trim() || clientInfo.company.trim());
  const itemsComplete = selectedItems.length > 0 || needsCustomPricing;
  const quoteIssues = useMemo(() => {
    const issues = [];
    if (!clientComplete) issues.push("Add a client or company name.");
    if (!firstSystemComplete) issues.push("Add the primary extraction and destination systems.");
    if (employeeCount <= 0) issues.push("Enter employee count.");
    if (dataYears <= 0) issues.push("Enter years of data.");
    if (!itemsComplete) issues.push("Select at least one migration item or add an other item.");
    return issues;
  }, [clientComplete, dataYears, employeeCount, firstSystemComplete, itemsComplete]);
  const quoteReady = quoteIssues.length === 0;

  const toggleSection = (id) => {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  };

  const toggleItem = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter((i) => i !== index));
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

  const updateClientInfo = (field, value) => {
    setClientInfo({ ...clientInfo, [field]: value });
  };

  const handleSavePdf = async () => {
    if (!quoteReady) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentWidth = pageWidth - (margin * 2);
    let y = 42;

    const checkPage = (needed = 40) => {
      if (y + needed <= pageHeight - margin) return;
      doc.addPage();
      y = margin;
    };

    const sectionTitle = (title) => {
      checkPage(34);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 95);
      doc.text(title.toUpperCase(), margin, y);
      y += 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 18;
    };

    const labelValue = (label, value) => {
      if (value === undefined || value === null || value === "") return;
      checkPage(24);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(label, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      const lines = doc.splitTextToSize(String(value), contentWidth - 150);
      doc.text(lines, margin + 150, y);
      y += Math.max(18, lines.length * 14);
    };

    const summaryRow = (label, value, strong = false) => {
      checkPage(24);
      doc.setFont("helvetica", strong ? "bold" : "normal");
      doc.setFontSize(strong ? 12 : 10);
      doc.setTextColor(15, 23, 42);
      doc.text(label, margin, y);
      doc.text(value, pageWidth - margin, y, { align: "right" });
      y += 20;
    };

    try {
      const logoData = await getImageDataUrl(logo);
      doc.addImage(logoData, "PNG", margin, y - 10, 150, 36);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 95);
      doc.text("Calibrate HCM", margin, y + 8);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 95);
    doc.text("Data Migration Pricing Summary", pageWidth - margin, y + 8, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, y + 26, { align: "right" });
    y += 70;

    sectionTitle("Client Information");
    labelValue("Client Name", clientInfo.name);
    labelValue("Company", clientInfo.company);
    labelValue("Email", clientInfo.email);
    labelValue("Phone", clientInfo.phone);
    labelValue("Address", clientInfo.address);

    sectionTitle("Systems");
    systems.forEach((system, index) => {
      labelValue(`System ${index + 1}`, `${system.from || "Previous vendor"} to ${system.to || "New vendor"}`);
    });

    sectionTitle("Project Details");
    labelValue("Employees (active + terminated)", employeeCount.toLocaleString("en-US"));
    labelValue("Years of Data", dataYears);
    labelValue("Selected Items", selectedMigrationItems.map((item) => item.label).join(", ") || "None selected");
    if (includesTimesheets) labelValue("Timesheet Report Frequency", TIMESHEET_OPTIONS[timesheetOption].label);
    if (extractionOnly) labelValue("Extraction Only", "30% discount applied");
    if (otherItems.length > 0) {
      labelValue("Other Items", trimmedOtherItems.join(", ") || "Custom items requested");
    }
    labelValue("Notes", notes);

    sectionTitle(needsCustomPricing ? "Partial Pricing Summary" : "Pricing Summary");
    summaryRow("Base Fee", fmt(baseFee));
    summaryRow("Data Migration", fmt(dataMigrationTotal));
    if (includesTimesheets) summaryRow("Timesheet Reports", fmt(timesheetsTotal));
    if (extractionOnly && migrationSubtotal > 0) summaryRow("Extraction Only Discount", `-${fmt(extractionOnlyDiscount)}`);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;
    summaryRow(needsCustomPricing ? "Quoted Total Excluding Custom Items" : "Total", fmt(migrationTotal), true);

    if (needsCustomPricing) {
      checkPage(46);
      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(153, 246, 228);
      doc.roundedRect(margin, y, contentWidth, 42, 6, 6, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(19, 78, 74);
      doc.text("Custom pricing is needed for other items. Total shown excludes custom-priced items.", margin + 12, y + 25);
      y += 60;
    }

    checkPage(54);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const note = "All standard migration projects include extraction from previous vendor and import to new vendor.";
    doc.text(doc.splitTextToSize(note, contentWidth), margin, pageHeight - 34);

    doc.save(`${safeFilename(clientInfo.company || clientInfo.name)}.pdf`);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src={logo} alt="Calibrate HCM" />
        <div>
          <h1>Data Migration Pricing</h1>
          <p>Calibrate HCM Data Services</p>
        </div>
      </header>

      <div className="notice-banner">
        All standard migration projects included extraction from previous vendor and import to new vendor
      </div>

      <div className="quote-layout">
        <main className="quote-main">
          <div className="step-nav" aria-label="Quote steps">
            {[
              ["1", "Client", clientComplete],
              ["2", "Systems", firstSystemComplete],
              ["3", "Scope", employeeCount > 0 && dataYears > 0],
              ["4", "Items", itemsComplete],
            ].map(([number, label, complete]) => (
              <span className={`step-pill ${complete ? "complete" : ""}`} key={label}>
                <span>{number}</span>{label}
              </span>
            ))}
          </div>

          <CollapsibleSection
            id="client"
            step="1"
            title="Client Information"
            complete={clientComplete}
            open={openSections.client}
            onToggle={toggleSection}
          >
            <div className="form-grid">
              <Field label="Client Name">
                <input type="text" value={clientInfo.name} onChange={(e) => updateClientInfo("name", e.target.value)} />
              </Field>
              <Field label="Company Name">
                <input type="text" value={clientInfo.company} onChange={(e) => updateClientInfo("company", e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" value={clientInfo.email} onChange={(e) => updateClientInfo("email", e.target.value)} />
              </Field>
              <Field label="Phone">
                <input type="tel" value={clientInfo.phone} onChange={(e) => updateClientInfo("phone", e.target.value)} />
              </Field>
              <Field label="Address" className="span-all">
                <textarea value={clientInfo.address} onChange={(e) => updateClientInfo("address", e.target.value)} rows={3} />
              </Field>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="systems"
            step="2"
            title="Systems"
            complete={firstSystemComplete}
            open={openSections.systems}
            onToggle={toggleSection}
          >
            <div className="stack">
              {systems.map((system, index) => (
                <div className="system-row" key={index}>
                  <Field label="Extracting From">
                    <input
                      type="text"
                      value={system.from}
                      onChange={(e) => updateSystem(index, "from", e.target.value)}
                      placeholder="Previous vendor"
                    />
                  </Field>
                  <Field label="Going To">
                    <input
                      type="text"
                      value={system.to}
                      onChange={(e) => updateSystem(index, "to", e.target.value)}
                      placeholder="New vendor"
                    />
                  </Field>
                  {systems.length > 1 && (
                    <button className="ghost-button" type="button" onClick={() => removeSystem(index)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className="secondary-button" type="button" onClick={addSystem}>
              Add extraction system
            </button>
          </CollapsibleSection>

          <CollapsibleSection
            id="scope"
            step="3"
            title="Project Scope"
            complete={employeeCount > 0 && dataYears > 0}
            open={openSections.scope}
            onToggle={toggleSection}
          >
            <div className="form-grid compact">
              <Field label="Employees (active + terminated)">
                <input
                  type="text"
                  inputMode="numeric"
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value.replace(/\D/g, ""))}
                  className="large-input"
                />
              </Field>
              <Field label="Years of Data">
                <input
                  type="text"
                  inputMode="numeric"
                  value={yearsOfData}
                  onChange={(e) => setYearsOfData(e.target.value.replace(/\D/g, ""))}
                  className="large-input"
                />
                <small>
                  {dataYears === 0 && "Enter years of data"}
                  {dataYears > 0 && dataYears <= 3 && "15% discount applied"}
                  {dataYears >= 10 && "30% premium applied"}
                  {dataYears > 3 && dataYears < 10 && "Standard data range"}
                </small>
              </Field>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="items"
            step="4"
            title="Migration Items"
            complete={itemsComplete}
            open={openSections.items}
            onToggle={toggleSection}
          >
            <div className="migration-groups">
              {MIGRATION_GROUPS.map((group) => (
                <div className="item-group" key={group.name}>
                  <h3>{group.name}</h3>
                  <div className="checkbox-list">
                    {group.items.map((item) => {
                      const index = MIGRATION_ITEMS.findIndex((migrationItem) => migrationItem.label === item.label);
                      return (
                        <div className="item-with-options" key={item.label}>
                          <label className="checkbox-card">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(index)}
                              onChange={() => toggleItem(index)}
                            />
                            <span>{item.label}</span>
                          </label>
                          {item.type === "timesheets" && selectedItems.includes(index) && (
                            <div className="inline-options">
                              {Object.entries(TIMESHEET_OPTIONS).map(([value, option]) => (
                                <label className={timesheetOption === value ? "selected" : ""} key={value}>
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="options"
            step="5"
            title="Additional Options"
            complete
            open={openSections.options}
            onToggle={toggleSection}
          >
            <div className="sub-panel">
              <label className="checkbox-card inline">
                <input
                  type="checkbox"
                  checked={extractionOnly}
                  onChange={(e) => setExtractionOnly(e.target.checked)}
                />
                <span>Extraction only</span>
              </label>
            </div>

            <div className="custom-items">
              <div className="custom-items-header">
                <div>
                  <h3>Other Items</h3>
                  <p>Items outside the standard list will need custom pricing.</p>
                </div>
                <button className="secondary-button" type="button" onClick={addOtherItem}>
                  Add other item
                </button>
              </div>

              {otherItems.length > 0 && (
                <div className="stack">
                  {otherItems.map((item, index) => (
                    <div className="other-row" key={index}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateOtherItem(index, e.target.value)}
                        placeholder="Describe the item you need priced"
                      />
                      <button className="ghost-button" type="button" onClick={() => removeOtherItem(index)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="custom-items">
              <div className="custom-items-header">
                <div>
                  <h3>Notes</h3>
                  <p>Add context, assumptions, or follow-up details for this quote.</p>
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for the pricing summary"
                rows={4}
              />
            </div>
          </CollapsibleSection>
        </main>

        <aside className="summary-panel" aria-label="Pricing summary">
          <div className="summary-header">
            <div>
              <span>{needsCustomPricing ? "Partial Estimate" : "Pricing Summary"}</span>
              <h2>{fmt(migrationTotal)}</h2>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={handleSavePdf}
              disabled={!quoteReady}
              title={quoteReady ? "Download PDF summary" : "Complete required quote inputs first"}
            >
              Save to PDF
            </button>
          </div>

          {!quoteReady && (
            <div className="readiness-card">
              <strong>Required quote inputs</strong>
              <ul>
                {quoteIssues.map((issue) => <li key={issue}>{issue}</li>)}
              </ul>
            </div>
          )}

          {needsCustomPricing && (
            <div className="custom-note">
              Custom pricing needed for other item{otherItems.length > 1 ? "s" : ""}
              {trimmedOtherItems.length > 0 ? `: ${trimmedOtherItems.join(", ")}` : ""}
            </div>
          )}

          <div className="summary-lines">
            <SummaryRow label="Base Fee" value={fmt(baseFee)} />
            <SummaryRow label="Data Migration" value={fmt(dataMigrationTotal)} />
            {includesTimesheets && <SummaryRow label="Timesheet Reports" value={fmt(timesheetsTotal)} />}
            {extractionOnly && migrationSubtotal > 0 && (
              <SummaryRow label="Extraction Only Discount" value={fmt(extractionOnlyDiscount)} negative />
            )}
          </div>

          <div className="summary-total">
            <span>{needsCustomPricing ? "Quoted Total Excluding Custom Items" : "Total"}</span>
            <strong>{fmt(migrationTotal)}</strong>
          </div>

          {needsCustomPricing && (
            <p className="summary-footnote">Total shown excludes custom-priced other items.</p>
          )}

          <div className="summary-meta">
            <span>{selectedItems.length} standard item{selectedItems.length === 1 ? "" : "s"} selected</span>
            <span>{employeeCount > 0 ? tier.label : "No"} employees</span>
            <span>{dataYears} year{dataYears === 1 ? "" : "s"} of data</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasStoredAuth = localStorage.getItem(AUTH_STORAGE_KEY) === VALID_PASSWORD;
  const hasCookieAuth = document.cookie.includes(AUTH_COOKIE);

  if ((hasStoredAuth || hasCookieAuth) && !isAuthenticated) {
    setIsAuthenticated(true);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Calculator />;
}
