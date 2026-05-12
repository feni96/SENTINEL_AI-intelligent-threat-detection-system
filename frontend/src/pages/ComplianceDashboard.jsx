import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";

const ComplianceDashboard = () => {
  const { t } = useTranslation();
  const [complianceData, setComplianceData] = useState({});
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock compliance data
  useEffect(() => {
    const mockData = {
      frameworks: [
        {
          id: "iso27001",
          name: "ISO 27001",
          description: "Information Security Management",
          overallScore: 85,
          status: "compliant",
          lastAssessment: "2024-01-10T00:00:00Z",
          nextAssessment: "2024-04-10T00:00:00Z",
          categories: [
            {
              name: "Access Control",
              score: 92,
              status: "compliant",
              controls: 12,
              passed: 11,
              failed: 1
            },
            {
              name: "Cryptography",
              score: 88,
              status: "compliant",
              controls: 8,
              passed: 7,
              failed: 1
            },
            {
              name: "Physical Security",
              score: 75,
              status: "partial",
              controls: 10,
              passed: 7,
              failed: 3
            },
            {
              name: "Incident Management",
              score: 90,
              status: "compliant",
              controls: 6,
              passed: 6,
              failed: 0
            }
          ]
        },
        {
          id: "nist",
          name: "NIST Cybersecurity Framework",
          description: "National Institute of Standards and Technology",
          overallScore: 78,
          status: "partial",
          lastAssessment: "2024-01-05T00:00:00Z",
          nextAssessment: "2024-07-05T00:00:00Z",
          categories: [
            {
              name: "Identify",
              score: 85,
              status: "compliant",
              controls: 15,
              passed: 13,
              failed: 2
            },
            {
              name: "Protect",
              score: 72,
              status: "partial",
              controls: 20,
              passed: 14,
              failed: 6
            },
            {
              name: "Detect",
              score: 80,
              status: "compliant",
              controls: 12,
              passed: 10,
              failed: 2
            },
            {
              name: "Respond",
              score: 75,
              status: "partial",
              controls: 8,
              passed: 6,
              failed: 2
            },
            {
              name: "Recover",
              score: 70,
              status: "partial",
              controls: 6,
              passed: 4,
              failed: 2
            }
          ]
        },
        {
          id: "gdpr",
          name: "GDPR",
          description: "General Data Protection Regulation",
          overallScore: 82,
          status: "compliant",
          lastAssessment: "2024-01-08T00:00:00Z",
          nextAssessment: "2024-06-08T00:00:00Z",
          categories: [
            {
              name: "Data Processing",
              score: 88,
              status: "compliant",
              controls: 10,
              passed: 9,
              failed: 1
            },
            {
              name: "Data Subject Rights",
              score: 85,
              status: "compliant",
              controls: 8,
              passed: 7,
              failed: 1
            },
            {
              name: "Data Protection Impact Assessment",
              score: 75,
              status: "partial",
              controls: 5,
              passed: 4,
              failed: 1
            },
            {
              name: "Breach Notification",
              score: 90,
              status: "compliant",
              controls: 4,
              passed: 4,
              failed: 0
            }
          ]
        }
      ],
      recentAudits: [
        {
          id: "AUD-001",
          framework: "ISO 27001",
          category: "Access Control",
          date: "2024-01-15T10:00:00Z",
          auditor: "Internal Security Team",
          result: "passed",
          findings: 2,
          recommendations: 3
        },
        {
          id: "AUD-002",
          framework: "NIST",
          category: "Protect",
          date: "2024-01-14T14:30:00Z",
          auditor: "External Auditor",
          result: "failed",
          findings: 5,
          recommendations: 8
        },
        {
          id: "AUD-003",
          framework: "GDPR",
          category: "Data Processing",
          date: "2024-01-12T09:15:00Z",
          auditor: "Data Protection Officer",
          result: "passed",
          findings: 1,
          recommendations: 2
        }
      ],
      upcomingTasks: [
        {
          id: "TASK-001",
          title: "Update Access Control Policies",
          framework: "ISO 27001",
          dueDate: "2024-01-20T00:00:00Z",
          priority: "high",
          assignee: "Security Team"
        },
        {
          id: "TASK-002",
          title: "Conduct DPIA for New System",
          framework: "GDPR",
          dueDate: "2024-01-25T00:00:00Z",
          priority: "medium",
          assignee: "Data Protection Officer"
        },
        {
          id: "TASK-003",
          title: "Review Incident Response Plan",
          framework: "NIST",
          dueDate: "2024-01-30T00:00:00Z",
          priority: "low",
          assignee: "Incident Response Team"
        }
      ]
    };
    setComplianceData(mockData);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "compliant": return "#28a745";
      case "partial": return "#ffc107";
      case "non-compliant": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#28a745";
    if (score >= 75) return "#ffc107";
    if (score >= 60) return "#fd7e14";
    return "#dc3545";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#dc3545";
      case "medium": return "#ffc107";
      case "low": return "#28a745";
      default: return "#6c757d";
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case "passed": return "#28a745";
      case "failed": return "#dc3545";
      case "partial": return "#ffc107";
      default: return "#6c757d";
    }
  };

  const filteredFrameworks = complianceData.frameworks?.filter(framework => {
    if (selectedFramework === "all") return true;
    return framework.id === selectedFramework;
  }) || [];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <i className="bi bi-shield-check"></i>
            Compliance Dashboard
          </h1>
          <p className="page-subtitle">Monitor regulatory compliance and security standards</p>
        </div>

        <div className="compliance-dashboard-container">
          {/* Controls */}
          <div className="compliance-controls">
            <div className="filter-group">
              <label>Framework:</label>
              <select 
                value={selectedFramework} 
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Frameworks</option>
                <option value="iso27001">ISO 27001</option>
                <option value="nist">NIST Framework</option>
                <option value="gdpr">GDPR</option>
              </select>
            </div>
            <div className="compliance-actions">
              <button className="btn btn-primary">
                <i className="bi bi-plus"></i>
                New Assessment
              </button>
              <button className="btn btn-secondary">
                <i className="bi bi-download"></i>
                Export Report
              </button>
            </div>
          </div>

          {/* Compliance Overview */}
          <div className="compliance-overview">
            <h3>Compliance Overview</h3>
            <div className="frameworks-grid">
              {filteredFrameworks.map((framework, index) => (
                <div key={index} className="framework-card">
                  <div className="framework-header">
                    <div className="framework-info">
                      <h4>{framework.name}</h4>
                      <p>{framework.description}</p>
                    </div>
                    <div className="framework-score">
                      <div 
                        className="score-circle"
                        style={{ borderColor: getScoreColor(framework.overallScore) }}
                      >
                        <span style={{ color: getScoreColor(framework.overallScore) }}>
                          {framework.overallScore}%
                        </span>
                      </div>
                      <div 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(framework.status) }}
                      >
                        {framework.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="framework-details">
                    <div className="assessment-dates">
                      <div className="date-item">
                        <label>Last Assessment:</label>
                        <span>{new Date(framework.lastAssessment).toLocaleDateString()}</span>
                      </div>
                      <div className="date-item">
                        <label>Next Assessment:</label>
                        <span>{new Date(framework.nextAssessment).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="categories-summary">
                      <h5>Categories</h5>
                      <div className="categories-list">
                        {framework.categories.map((category, catIndex) => (
                          <div key={catIndex} className="category-item">
                            <div className="category-name">{category.name}</div>
                            <div className="category-score">
                              <span style={{ color: getScoreColor(category.score) }}>
                                {category.score}%
                              </span>
                              <div className="category-controls">
                                <span className="passed">{category.passed}</span>
                                /
                                <span className="total">{category.controls}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audits */}
          <div className="recent-audits">
            <h3>Recent Audits</h3>
            <div className="audits-table">
              <table>
                <thead>
                  <tr>
                    <th>Audit ID</th>
                    <th>Framework</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Auditor</th>
                    <th>Result</th>
                    <th>Findings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceData.recentAudits?.map((audit, index) => (
                    <tr key={index}>
                      <td>{audit.id}</td>
                      <td>{audit.framework}</td>
                      <td>{audit.category}</td>
                      <td>{new Date(audit.date).toLocaleDateString()}</td>
                      <td>{audit.auditor}</td>
                      <td>
                        <span 
                          className="result-badge"
                          style={{ backgroundColor: getResultColor(audit.result) }}
                        >
                          {audit.result.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="findings-summary">
                          <span className="findings">{audit.findings} findings</span>
                          <span className="recommendations">{audit.recommendations} recommendations</span>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-secondary">
                          <i className="bi bi-eye"></i>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="upcoming-tasks">
            <h3>Upcoming Compliance Tasks</h3>
            <div className="tasks-list">
              {complianceData.upcomingTasks?.map((task, index) => (
                <div key={index} className="task-item">
                  <div className="task-priority">
                    <div 
                      className="priority-indicator"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    ></div>
                  </div>
                  <div className="task-content">
                    <h4>{task.title}</h4>
                    <div className="task-meta">
                      <span className="framework">{task.framework}</span>
                      <span className="assignee">
                        <i className="bi bi-person"></i>
                        {task.assignee}
                      </span>
                      <span className="due-date">
                        <i className="bi bi-calendar"></i>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="btn btn-sm btn-primary">
                      <i className="bi bi-check"></i>
                      Complete
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      <i className="bi bi-pencil"></i>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Statistics */}
          <div className="compliance-stats">
            <div className="stats-cards">
              <div className="stat-card compliant">
                <div className="stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="stat-content">
                  <h4>
                    {complianceData.frameworks?.filter(f => f.status === "compliant").length || 0}
                  </h4>
                  <p>Compliant Frameworks</p>
                </div>
              </div>
              <div className="stat-card partial">
                <div className="stat-icon">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <div className="stat-content">
                  <h4>
                    {complianceData.frameworks?.filter(f => f.status === "partial").length || 0}
                  </h4>
                  <p>Partial Compliance</p>
                </div>
              </div>
              <div className="stat-card average-score">
                <div className="stat-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="stat-content">
                  <h4>
                    {complianceData.frameworks?.length > 0 
                      ? Math.round(complianceData.frameworks.reduce((sum, f) => sum + f.overallScore, 0) / complianceData.frameworks.length)
                      : 0}%
                  </h4>
                  <p>Average Score</p>
                </div>
              </div>
              <div className="stat-card pending-tasks">
                <div className="stat-icon">
                  <i className="bi bi-list-task"></i>
                </div>
                <div className="stat-content">
                  <h4>{complianceData.upcomingTasks?.length || 0}</h4>
                  <p>Pending Tasks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Trends */}
          <div className="compliance-trends">
            <h3>Compliance Trends</h3>
            <div className="trends-chart">
              <div className="chart-placeholder">
                <i className="bi bi-graph-up"></i>
                <p>Compliance score trends over time</p>
                <small>Chart visualization would be implemented here</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;