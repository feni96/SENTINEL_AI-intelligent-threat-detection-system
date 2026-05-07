import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import "./Reports.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export default function Reports() {
  const { t } = useTranslation();
  // ---------- State for report generation ----------
  const [reportType, setReportType] = useState("Daily");
  const [timeRange, setTimeRange] = useState("Last 24 hours");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [description, setDescription] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedThreatType, setSelectedThreatType] = useState("All");
  const [reportGenerated, setReportGenerated] = useState(false);

  // Mock report data (would be fetched from API)
  const [reportData, setReportData] = useState(null);

  // Mock ObjectId for generatedBy (simulates logged-in user)
  const mockUserId = "65f8a1b2c3d4e5f6a7b8c9d0";

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  // ---------- Generate Report ----------
  const handleGenerateReport = () => {
    // Compute fromDate and toDate based on timeRange
    const now = new Date();
    let fromDate, toDate;

    if (timeRange === "Last 24 hours") {
      toDate = formatDate(now);
      const from = new Date(now);
      from.setDate(from.getDate() - 1);
      fromDate = formatDate(from);
    } else if (timeRange === "Last 7 days") {
      toDate = formatDate(now);
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      fromDate = formatDate(from);
    } else if (timeRange === "Last 30 days") {
      toDate = formatDate(now);
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      fromDate = formatDate(from);
    } else if (timeRange === "Custom") {
      fromDate = customStart;
      toDate = customEnd;
    }

    // Mock report data (aligned with schema + rich content)
    const mockReport = {
      // --- Schema fields (metadata) ---
      generatedBy: mockUserId,                // ObjectId as string
      reportType: reportType,
      description: description,
      fromDate: fromDate,                     // ISO date string (YYYY-MM-DD)
      toDate: toDate,
      createdAt: new Date().toISOString(),    // ISO string with time

      // --- Additional report content (not in schema) ---
      totalThreats: 127,
      threatsBySeverity: {
        Critical: 12,
        High: 28,
        Medium: 45,
        Low: 42,
      },
      threatsByType: {
        DDoS: 34,
        Malware: 41,
        "Brute Force": 22,
        "Unauthorized Access": 18,
        "Port Scanning": 12,
      },
      topSourceIPs: [
        { ip: "192.168.1.105", count: 8 },
        { ip: "10.0.0.23", count: 6 },
        { ip: "172.16.0.45", count: 5 },
        { ip: "45.128.34.12", count: 4 },
        { ip: "192.168.2.101", count: 3 },
      ],
      repeatedAttackSources: ["192.168.1.105", "45.128.34.12"],
      threatsByArea: {
        "Data Center": 18,
        "Admin Office": 22,
        Library: 15,
        "Computer Labs": 24,
        Dormitory: 28,
        "Staff Network": 12,
        "Student Wi-Fi": 8,
      },
      systemHealth: {
        modelAccuracy: 98.2,
        falsePositiveRate: 1.8,
        processedLogs: 15420,
        uptime: "99.97%",
      },
      recommendations: [
        "Increase monitoring in Dormitory and Computer Labs due to high threat volume.",
        "Block repeated suspicious IP addresses: 192.168.1.105, 45.128.34.12.",
        "Retrain ML model if false positive rate exceeds 2% (currently 1.8%).",
        "Adjust alert severity thresholds for Port Scanning to reduce low‑priority alerts.",
      ],
    };

    setReportData(mockReport);
    setReportGenerated(true);
  };

  const handleDownload = (format) => {
    console.log('Export clicked:', format);
    console.log('Report data exists:', !!reportData);
    
    // If no report data exists, generate a default report first
    if (!reportData) {
      console.log('Generating report automatically...');
      // Generate a default report automatically
      handleGenerateReport();
      // Wait a moment for data to be set, then proceed with export
      setTimeout(() => {
        console.log('Proceeding with export after report generation...');
        performExport(format);
      }, 500); // Increased timeout
      return;
    }
    
    console.log('Proceeding with export...');
    performExport(format);
  };

  const performExport = (format) => {
    console.log('Performing export:', format);
    console.log('Report data:', reportData);

    if (format === "CSV") {
      console.log('Starting CSV export...');
      // CSV Export
      const csvContent = [
        ['Security Report', ''],
        ['Report Type', reportData.reportType],
        ['Description', reportData.description],
        ['Date Range', `${reportData.fromDate} to ${reportData.toDate}`],
        ['Generated', new Date(reportData.createdAt).toLocaleString()],
        [''],
        ['Summary Statistics', ''],
        ['Total Threats', reportData.totalThreats],
        ['Critical', reportData.threatsBySeverity.Critical],
        ['High', reportData.threatsBySeverity.High],
        ['Medium', reportData.threatsBySeverity.Medium],
        ['Low', reportData.threatsBySeverity.Low],
        [''],
        ['Threats by Type', ''],
        ...Object.entries(reportData.threatsByType).map(([type, count]) => [type, count]),
        [''],
        ['Top Threat Sources', ''],
        ...reportData.topSources.map((source, index) => [`${index + 1}`, source]),
        [''],
        ['Top Affected Areas', ''],
        ...reportData.topAreas.map((area, index) => [`${index + 1}`, area])
      ].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `security_report_${reportData.fromDate}_${format}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('CSV export completed successfully!');
      alert('CSV report exported successfully!');

    } else if (format === "PDF") {
      console.log('Starting PDF export...');
      // PDF Export (HTML to PDF simulation)
      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Security Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin: 20px 0; }
            .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-item { text-align: center; }
            .severity-critical { color: #ef4444; font-weight: bold; }
            .severity-high { color: #f59e0b; font-weight: bold; }
            .severity-medium { color: #eab308; font-weight: bold; }
            .severity-low { color: #10b981; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Security Report</h1>
            <p>Generated: ${new Date(reportData.createdAt).toLocaleString()}</p>
          </div>
          
          <div class="section">
            <h2>Report Information</h2>
            <p><strong>Type:</strong> ${reportData.reportType}</p>
            <p><strong>Description:</strong> ${reportData.description}</p>
            <p><strong>Date Range:</strong> ${reportData.fromDate} to ${reportData.toDate}</p>
          </div>

          <div class="section summary">
            <h2>Summary Statistics</h2>
            <p><strong>Total Threats:</strong> ${reportData.totalThreats}</p>
            <div class="stats">
              <div class="stat-item">
                <div class="severity-critical">${reportData.threatsBySeverity.Critical}</div>
                <div>Critical</div>
              </div>
              <div class="stat-item">
                <div class="severity-high">${reportData.threatsBySeverity.High}</div>
                <div>High</div>
              </div>
              <div class="stat-item">
                <div class="severity-medium">${reportData.threatsBySeverity.Medium}</div>
                <div>Medium</div>
              </div>
              <div class="stat-item">
                <div class="severity-low">${reportData.threatsBySeverity.Low}</div>
                <div>Low</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Threats by Type</h2>
            <table>
              <tr><th>Threat Type</th><th>Count</th></tr>
              ${Object.entries(reportData.threatsByType).map(([type, count]) => 
                `<tr><td>${type}</td><td>${count}</td></tr>`
              ).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Top Threat Sources</h2>
            <table>
              <tr><th>Rank</th><th>Source IP</th></tr>
              ${reportData.topSources.map((source, index) => 
                `<tr><td>${index + 1}</td><td>${source}</td></tr>`
              ).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Top Affected Areas</h2>
            <table>
              <tr><th>Rank</th><th>Area</th></tr>
              ${reportData.topAreas.map((area, index) => 
                `<tr><td>${index + 1}</td><td>${area}</td></tr>`
              ).join('')}
            </table>
          </div>
        </body>
        </html>
      `;

      // Create blob and download HTML file (can be saved as PDF)
      const blob = new Blob([reportContent], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `security_report_${reportData.fromDate}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('PDF export completed successfully!');
      alert('PDF report exported successfully! (HTML file - can be saved as PDF)');
    }
  };

  // ---------- Chart Data (using reportData if available) ----------
  const severityChartData = reportData && {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        data: [
          reportData.threatsBySeverity.Critical,
          reportData.threatsBySeverity.High,
          reportData.threatsBySeverity.Medium,
          reportData.threatsBySeverity.Low,
        ],
        backgroundColor: ["#ef4444", "#f59e0b", "#eab308", "#10b981"],
      },
    ],
  };

  const typeChartData = reportData && {
    labels: Object.keys(reportData.threatsByType),
    datasets: [
      {
        label: "Count",
        data: Object.values(reportData.threatsByType),
        backgroundColor: "#60a5fa",
      },
    ],
  };

  const areaChartData = reportData && {
    labels: Object.keys(reportData.threatsByArea),
    datasets: [
      {
        label: "Threats",
        data: Object.values(reportData.threatsByArea),
        backgroundColor: "#818cf8",
      },
    ],
  };

  const trendChartData = reportData && {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Threats",
        data: [12, 19, 15, 22, 24, 18, 17],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // ---------- Helper for custom time range inputs ----------
  const showCustomInputs = timeRange === "Custom";

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="content-header">
            <h1>{t("reportsAnalytics")}</h1>
            <p className="page-description">
              {t("reportsAnalyticsDescription")}
            </p>
          </div>

          {/* Report Generation Controls */}
          <div className="report-controls card">
            <h3>{t("generateReport")}</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>{t("reportType")}</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option>{t("daily")}</option>
                  <option>{t("weekly")}</option>
                  <option>{t("monthly")}</option>
                  <option>{t("onDemand")}</option>
                </select>
              </div>
              <div className="filter-group">
                <label>{t("timeRange")}</label>
                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                  <option>{t("last24Hours")}</option>
                  <option>{t("last7Days")}</option>
                  <option>{t("last30Days")}</option>
                  <option>{t("custom")}</option>
                </select>
              </div>
              {showCustomInputs && (
                <>
                  <div className="filter-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                    />
                  </div>
                </>
              )}
              {reportType === "On-Demand" && (
                <>
                  <div className="filter-group">
                    <label>Campus Area</label>
                    <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                      <option>All</option>
                      <option>Data Center</option>
                      <option>Admin Office</option>
                      <option>Library</option>
                      <option>Computer Labs</option>
                      <option>Dormitory</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Threat Type</label>
                    <select value={selectedThreatType} onChange={(e) => setSelectedThreatType(e.target.value)}>
                      <option>All</option>
                      <option>DDoS</option>
                      <option>Malware</option>
                      <option>Brute Force</option>
                      <option>Unauthorized Access</option>
                    </select>
                  </div>
                </>
              )}
              {/* Description Field */}
              <div className="filter-group" style={{ gridColumn: "span 2" }}>
                <label>Description (optional)</label>
                <textarea
                  rows="2"
                  placeholder="Brief description of the report..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {/* Generate Report Button */}
              <div className="filter-group actions">
                <button className="btn-primary" onClick={handleGenerateReport}>
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Report Preview (only shown after generation) */}
          {reportGenerated && reportData && (
            <div className="report-preview card">
              <div className="report-header">
                <h2>Security Report</h2>
                <div className="report-actions">
                  <button className="btn-outline" onClick={() => handleDownload("PDF")}>
                    <i className="bi bi-file-pdf"></i> PDF
                  </button>
                  <button className="btn-outline" onClick={() => handleDownload("CSV")}>
                    <i className="bi bi-file-spreadsheet"></i> CSV
                  </button>
                </div>
              </div>

              {/* Metadata (aligned with database fields) */}
              <div className="report-metadata">
                <div className="metadata-item">
                  <span className="metadata-label">Generated By (User ID):</span>
                  <span className="metadata-value">{reportData.generatedBy}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Report Type:</span>
                  <span className="metadata-value">{reportData.reportType}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Description:</span>
                  <span className="metadata-value">{reportData.description || "—"}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">From Date:</span>
                  <span className="metadata-value">{reportData.fromDate}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">To Date:</span>
                  <span className="metadata-value">{reportData.toDate}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Created At:</span>
                  <span className="metadata-value">
                    {new Date(reportData.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Threat Summary Section */}
              <div className="report-section">
                <h3>Threat Summary</h3>
                <div className="summary-stats">
                  <div className="stat-big">
                    <span className="stat-label">Total Threats</span>
                    <span className="stat-number">{reportData.totalThreats}</span>
                  </div>
                  <div className="severity-breakdown">
                    {Object.entries(reportData.threatsBySeverity).map(([sev, count]) => (
                      <div key={sev} className={`severity-item ${sev.toLowerCase()}`}>
                        <span className="severity-name">{sev}</span>
                        <span className="severity-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="top-ips">
                  <h4>Top Source IPs</h4>
                  <ul>
                    {reportData.topSourceIPs.map((item, idx) => (
                      <li key={idx}>
                        <span className="ip">{item.ip}</span>
                        <span className="count">{item.count} threats</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="repeated-sources">
                  <h4>Repeated Attack Sources</h4>
                  <div className="ip-tags">
                    {reportData.repeatedAttackSources.map((ip, idx) => (
                      <span key={idx} className="ip-tag">{ip}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Analytics */}
              <div className="report-section">
                <h3>Visual Analytics</h3>
                <div className="charts-grid">
                  <div className="chart-card">
                    <h4>Threats by Severity</h4>
                    <Pie data={severityChartData} options={{ plugins: { legend: { position: "bottom" } } }} />
                  </div>
                  <div className="chart-card">
                    <h4>Threats by Type</h4>
                    <Bar data={typeChartData} options={{ plugins: { legend: { display: false } } }} />
                  </div>
                  <div className="chart-card">
                    <h4>Threats Over Time (Weekly)</h4>
                    <Line data={trendChartData} />
                  </div>
                  <div className="chart-card">
                    <h4>Area‑Based Distribution</h4>
                    <Bar data={areaChartData} options={{ plugins: { legend: { display: false } }, indexAxis: 'y' }} />
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="report-section">
                <h3>System Health</h3>
                <div className="health-grid">
                  <div className="health-item">
                    <span className="health-label">ML Model Accuracy</span>
                    <span className="health-value">{reportData.systemHealth.modelAccuracy}%</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">False Positive Rate</span>
                    <span className="health-value">{reportData.systemHealth.falsePositiveRate}%</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Processed Logs</span>
                    <span className="health-value">{reportData.systemHealth.processedLogs.toLocaleString()}</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">System Uptime</span>
                    <span className="health-value">{reportData.systemHealth.uptime}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="report-section">
                <h3>Actionable Recommendations</h3>
                <ul className="recommendations-list">
                  {reportData.recommendations.map((rec, idx) => (
                    <li key={idx}><i className="bi bi-lightbulb"></i> {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}