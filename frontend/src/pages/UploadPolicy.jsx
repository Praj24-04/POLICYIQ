import { useState } from "react";
import { Upload, FileText, Sparkles, CheckCircle2, Download } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import PartnerLogos from "../components/PartnerBar";
import { getToken, BASE, clearApiCache } from "../services/api";
import { jsPDF } from "jspdf";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";



export default function UploadPolicy() {
  const [file,     setFile]     = useState(null);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [dragging, setDragging] = useState(false);
  const [requirements, setRequirements] = useState("");

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleFile = (f) => {
    if (!f) return;

    // Check file extension
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Invalid file type. Only PDF files (.pdf) are accepted.");
      return;
    }

    // Check MIME type
    if (f.type && f.type !== "application/pdf") {
      setError(`Invalid file format (${f.type}). Only PDF documents are supported.`);
      return;
    }

    // Check file size
    if (f.size > MAX_FILE_SIZE) {
      const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
      setError(`File too large (${sizeMB} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    // Check for empty files
    if (f.size === 0) {
      setError("The selected file is empty. Please choose a valid PDF document.");
      return;
    }

    setError(null);
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (requirements.trim()) {
      formData.append("user_prompt", requirements.trim());
    }

    try {
      const token = getToken();
      const res = await fetch(`${BASE}/upload/pdf`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.status === 401) throw new Error("Session expired. Please log in again.");
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      clearApiCache();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    
    // Helper function for local client-side jsPDF fallback
    const runJsPDFFallback = () => {
      const doc = new jsPDF();
      const primaryColor = [92, 158, 46]; // #5c9e2e
      const textColor = [33, 37, 41];
      const grayColor = [108, 117, 125];
      
      // Header background bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 25, "F");
      
      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("POLICYIQ - DOCUMENT ANALYSIS REPORT (FALLBACK)", 14, 16);
      
      // Metadata block
      doc.setTextColor(...textColor);
      doc.setFontSize(12);
      doc.text(`Document Title: ${result.title || "Uploaded Document"}`, 14, 38);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Sector: ${result.detected_sector || "Auto-detected"}`, 14, 46);
      doc.text(`Word Count: ${result.word_count ? result.word_count.toLocaleString() : "N/A"} words`, 14, 52);
      if (result.year) {
        doc.text(`Year: ${result.year}`, 140, 46);
      }
      doc.text(`Countries Detected: ${result.extracted_countries?.join(", ") || "None"}`, 140, 52);
      
      // Section: Content Preview
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("CONTENT PREVIEW", 14, 65);
      doc.line(14, 67, 196, 67);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const splitPreview = doc.splitTextToSize(result.content_preview || "", 182);
      doc.text(splitPreview, 14, 73);
      
      // Similar Policies section
      let yPos = 73 + (splitPreview.length * 4) + 12;
      if (result.similar_policies?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...textColor);
        doc.text("SIMILAR POLICIES IN DATABASE", 14, yPos);
        doc.line(14, yPos + 2, 196, yPos + 2);
        yPos += 8;
        
        result.similar_policies.forEach((p, idx) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${idx + 1}. ${p.title} (${Math.round(p.similarity * 100)}% Match)`, 14, yPos);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...grayColor);
          doc.text(`Country: ${p.country} | Sector: ${p.sector}`, 18, yPos + 5);
          yPos += 12;
        });
        yPos += 4;
      }
      
      // Recommendations Section
      if (result.recommendations?.length > 0) {
        // Add page break if near the bottom
        if (yPos > 150) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...textColor);
        doc.text("ADOPTION RECOMMENDATIONS", 14, yPos);
        doc.line(14, yPos + 2, 196, yPos + 2);
        yPos += 10;
        
        result.recommendations.forEach((rec, idx) => {
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...textColor);
          doc.text(`${idx + 1}. ${rec.country} (Need Index: ${rec.need_score.toFixed(3)})`, 14, yPos);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          const splitReasoning = doc.splitTextToSize(rec.reasoning || "", 182);
          doc.text(splitReasoning, 18, yPos + 5);
          
          yPos += 5 + (splitReasoning.length * 4) + 4;
          
          // Expected Benefits bullet points
          if (rec.expected_benefits?.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.text("Expected Benefits:", 18, yPos);
            yPos += 4;
            
            doc.setFont("helvetica", "normal");
            rec.expected_benefits.forEach((benefit) => {
              doc.text(`- ${benefit}`, 22, yPos);
              yPos += 4;
            });
          }
          yPos += 6;
        });
      }
      
      // Save report
      const cleanTitle = (result.title || "document_analysis").toLowerCase().replace(/[^a-z0-9]/g, "_");
      doc.save(`policyiq_analysis_${cleanTitle}.pdf`);
    };

    try {
      const token = getToken();
      const res = await fetch(`${BASE}/upload/download-pdf`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error("Backend PDF generation failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PolicyIQ_Analysis_${(result.title || "document").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.warn("Backend PDF generation failed, using client-side jsPDF fallback:", err);
      runJsPDFFallback();
    }
  };

  // Inline section label matching Dashboard/Recommend style
  const SectionLabel = ({ text }) => (
    <div style={{
      display: "inline-block",
      background: "rgba(92, 158, 46, 0.08)",
      border: "1px solid rgba(92, 158, 46, 0.15)",
      borderRadius: "4px",
      padding: "4px 10px",
      marginBottom: "8px"
    }}>
      <span style={{
        fontFamily: "DM Sans",
        fontWeight: 600,
        fontSize: "13px",
        color: "#5c9e2e",
        letterSpacing: "0.02em"
      }}>
        {text}
      </span>
    </div>
  );

  // Mono section divider matching Compare page
  const SectionDivider = ({ label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", marginTop: "28px" }}>
      <div style={{ width: "20px", height: "1px", background: "var(--border)" }} />
      <span style={{
        fontSize: "11px",
        fontFamily: "JetBrains Mono",
        color: "var(--text-muted)",
        letterSpacing: "0.12em",
        fontWeight: 500,
        textTransform: "uppercase",
        whiteSpace: "nowrap"
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      background: "var(--bg-deep)",
      minHeight: "100vh"
    }}>
      <style>{`
        .upload-dropzone {
          background: var(--bg-card);
          border: 1.5px dashed var(--border);
          border-radius: 8px;
          padding: 56px 48px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 16px;
        }
        .upload-dropzone:hover {
          border-color: #5c9e2e;
          background: rgba(92, 158, 46, 0.02);
        }
        .upload-dropzone.dragging {
          border-color: #5c9e2e;
          background: rgba(92, 158, 46, 0.03);
        }
        .upload-dropzone.has-file {
          border-color: #5c9e2e;
          border-style: solid;
          background: rgba(92, 158, 46, 0.02);
        }
        .upload-btn-primary {
          width: 100%;
          height: 48px;
          background: #0a0a0a;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s ease;
          margin-bottom: 24px;
        }
        .upload-btn-primary:hover {
          background: #222222;
        }
        [data-theme="dark"] .upload-btn-primary {
          background: #fafafa;
          color: #09090b;
        }
        [data-theme="dark"] .upload-btn-primary:hover {
          background: #e4e4e7;
        }
        .sim-policy-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 6px;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          transition: border-color 0.15s ease;
        }
        .sim-policy-row:hover {
          border-color: var(--border-lit);
        }
        .rec-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 22px 24px;
          transition: border-color 0.15s ease;
        }
        .rec-card:hover {
          border-color: var(--border-lit);
        }
      `}</style>

      <div className="page-container-sm">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--cyan)" }} />
                <span style={{ fontSize: "12px", fontFamily: "JetBrains Mono", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
                  DISCOVER / ANALYSIS
                </span>
              </div>
              <h1 className="page-title" style={{
                margin: "0 0 8px 0",
                letterSpacing: "-1px",
                lineHeight: "1.1"
              }}>
                Analyse policy{" "}
                <span style={{ position: "relative", display: "inline-block", zIndex: 1 }}>
                  document.
                  <span style={{
                    position: "absolute",
                    bottom: "4px",
                    left: 0,
                    right: 0,
                    height: "45%",
                    background: "rgba(163, 230, 53, 0.45)",
                    zIndex: -1
                  }} />
                </span>
              </h1>
              <p style={{ fontFamily: "DM Sans", fontSize: "15px", color: "var(--text-muted)", margin: 0 }}>
                Upload a policy PDF and specify analysis requirements to get ML-powered recommendations and similarity analysis
              </p>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "20px",
              background: "var(--stat-bg)",
              border: "1px solid var(--stat-border)",
              flexShrink: 0
            }}>
              <Sparkles size={14} color="#5c9e2e" />
              <span style={{ fontSize: "13px", color: "var(--stat-label)", fontFamily: "JetBrains Mono", fontWeight: 600 }}>
                ML POWERED
              </span>
            </div>
          </div>
        </div>

        {/* ── Upload Dropzone ── */}
        <div
          className={`upload-dropzone${dragging ? " dragging" : ""}${file ? " has-file" : ""}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("pdf-input").click()}
        >
          <input
            id="pdf-input"
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])}
          />

          {file ? (
            <>
              <FileText size={40} color="#5c9e2e" style={{ margin: "0 auto 16px", display: "block" }} />
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "#5c9e2e",
                marginBottom: "4px"
              }}>
                {file.name}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "DM Sans" }}>
                {(file.size / 1024).toFixed(1)} KB · Click or drop another to replace
              </div>
            </>
          ) : (
            <>
              <Upload size={40} color="var(--text-dim)" style={{ margin: "0 auto 16px", display: "block" }} />
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: "4px"
              }}>
                Drop PDF here or click to browse
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-dim)", fontFamily: "DM Sans" }}>
                Max 10 MB · PDF format only
              </div>
            </>
          )}
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "16px",
            background: "rgba(244,63,94,0.06)",
            border: "1px solid rgba(244,63,94,0.18)",
            color: "#f43f5e",
            fontSize: "13px",
            fontFamily: "DM Sans"
          }}>
            {error}
          </div>
        )}

        {/* ── Requirements Chatbox ── */}
        {file && !loading && (
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#5c9e2e" }} />
              <span style={{
                fontSize: "12px",
                fontFamily: "JetBrains Mono",
                color: "var(--text-main)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}>
                Analysis Guidance & Focus Areas (Optional)
              </span>
            </div>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe what you want to extract, analyze, or focus on in this document (e.g. 'Show the grading scheme details', 'What are the main penalties?', 'Extract data privacy rules')..."
              style={{
                width: "100%",
                minHeight: "80px",
                background: "var(--bg-hover)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "12px 14px",
                fontSize: "14px",
                fontFamily: "DM Sans",
                color: "var(--text-main)",
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "#5c9e2e"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          </div>
        )}

        {/* ── Analyze Button ── */}
        {file && !loading && (
          <button className="upload-btn-primary" onClick={handleUpload}>
            <Sparkles size={15} />
            Analyse Policy Document
          </button>
        )}

        {/* ── Loading State ── */}
        {loading && <LoadingSpinner label="Extracting text, computing embeddings, and running ML analysis..." />}

        {/* ── Results ── */}
        {result && !loading && (
          <div className="fade-up">

            {/* ── Document Metadata Card ── */}
            <SectionDivider label="Document Analysis" />
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
              <button
                onClick={handleDownloadPDF}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#5c9e2e",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontFamily: "DM Sans",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "background 0.15s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#4d7c0f"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#5c9e2e"}
              >
                <Download size={14} />
                Download Report PDF
              </button>
            </div>
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "22px 28px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <SectionLabel text="Ingested Document" />
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "20px",
                    color: "var(--text-main)",
                    marginBottom: "12px"
                  }}>
                    {result.title}
                  </div>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "DM Sans" }}>
                      📄 <b>{result.word_count?.toLocaleString()}</b> words
                    </span>
                    {result.year && (
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "DM Sans" }}>
                        📅 <b>{result.year}</b>
                      </span>
                    )}
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "DM Sans" }}>
                      🌍 <b>{result.extracted_countries?.length || 0}</b> countries detected
                    </span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    display: "block",
                    fontSize: "10px",
                    fontFamily: "JetBrains Mono",
                    color: "var(--text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "4px"
                  }}>
                    Detected Sector
                  </span>
                  <span style={{
                    background: "var(--stat-bg)",
                    border: "1px solid var(--stat-border)",
                    borderRadius: "4px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono",
                    fontWeight: 600,
                    color: "var(--stat-label)"
                  }}>
                    {result.detected_sector || "Auto-detected"}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {result.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                  {result.tags.map(t => (
                    <span key={t} style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background: "var(--bg-hover)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                      fontFamily: "JetBrains Mono"
                    }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Content Preview */}
              <div style={{
                background: "var(--bg-hover)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "12px 16px"
              }}>
                <div style={{
                  fontSize: "10px",
                  color: "var(--text-dim)",
                  fontFamily: "JetBrains Mono",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "8px"
                }}>
                  Content Preview
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65, margin: 0, fontFamily: "DM Sans" }}>
                  {result.content_preview}
                </p>
              </div>
            </div>

            {/* ── Similar Policies ── */}
            {result.similar_policies?.length > 0 && (
              <>
                <SectionDivider label="Most Similar Policies in Database" />
                <div style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "22px 28px",
                  marginBottom: "20px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <SectionLabel text="Cosine Similarity Match" />
                      <div style={{ fontSize: "12px", fontFamily: "DM Sans", color: "var(--text-muted)" }}>
                        Top matching frameworks from the policy database
                      </div>
                    </div>
                    <span style={{
                      background: "var(--bg-hover)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      fontFamily: "JetBrains Mono"
                    }}>
                      {result.similar_policies.length} results
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.similar_policies.map((p, i) => (
                      <div key={i} className="sim-policy-row">
                        <div>
                          <div style={{ fontSize: "14px", color: "var(--text-main)", fontWeight: 600, fontFamily: "DM Sans", marginBottom: "3px" }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "DM Sans" }}>
                            {p.country}{p.sector ? ` · ${p.sector}` : ""}{p.year ? ` · ${p.year}` : ""}
                          </div>
                        </div>
                        <div style={{
                          fontFamily: "JetBrains Mono",
                          fontSize: "17px",
                          fontWeight: 700,
                          color: p.similarity > 0.5 ? "#5c9e2e" : p.similarity > 0.3 ? "#f59e0b" : "var(--text-muted)",
                          flexShrink: 0,
                          marginLeft: "16px"
                        }}>
                          {Math.round(p.similarity * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── ML Recommendations ── */}
            <SectionDivider label="Adoption Priority Recommendations" />

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "20px"
            }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#5c9e2e" }} />
              <span style={{ fontSize: "11px", fontFamily: "JetBrains Mono", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                {result.ml_method}
              </span>
            </div>

            {/* Scoring Legend Card */}
            <div style={{
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#5c9e2e" }} />
                <span style={{ fontSize: "11px", fontFamily: "JetBrains Mono", color: "var(--text-main)", fontWeight: 600, letterSpacing: "0.08em" }}>
                  NEED INDEX METHODOLOGY & LEGEND
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5", fontFamily: "DM Sans" }}>
                The Need Index (from <code style={{ fontFamily: "JetBrains Mono", color: "var(--cyan)" }}>0.000</code> to <code style={{ fontFamily: "JetBrains Mono", color: "var(--cyan)" }}>1.000</code>) is computed dynamically using our multi-factor scoring system:
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "10px",
                marginTop: "6px"
              }}>
                {[
                  { name: "Sector Gap Severity (35%)", desc: "Absence of active legislation in primary sector." },
                  { name: "Statutory Infrastructure (25%)", desc: "Country's baseline regulatory maturity tier." },
                  { name: "Legislative Intent (20%)", desc: "Semantic alignment using Legal-BERT embeddings." },
                  { name: "Geopolitical Peer (12%)", desc: "Adoption velocity in adjacent regional markets." },
                  { name: "Developmental Tier (8%)", desc: "Socioeconomic and GDP tier alignment." }
                ].map((f, idx) => (
                  <div key={idx} style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontFamily: "DM Sans"
                  }}>
                    <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                      {f.name}
                    </div>
                      <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block", lineHeight: "1.3" }}>{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {result.recommendations.map((rec, i) => {
                const needPctVal = rec.need_score * 100;
                const needPct = needPctVal.toFixed(1);
                const needColor = rec.need_score > 0.6 ? "#f43f5e" : rec.need_score > 0.4 ? "#f59e0b" : "#5c9e2e";

                return (
                  <div key={rec.country} className={`rec-card fade-up fade-up-${Math.min(i + 1, 5)}`}>
                    {/* Card Header */}
                    <div className="rec-card-header">
                      <div className="rec-header-left">
                        <div className="rec-title-row">
                          <span style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: "18px",
                            color: "var(--text-main)"
                          }}>
                            #{i + 1} {rec.country}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "DM Sans", whiteSpace: "nowrap" }}>
                            · {rec.region}
                          </span>
                        </div>

                        <div className="rec-badges-row">
                          {!rec.already_has_sector && (
                            <span className="badge-custom badge-custom--danger">
                              Missing sector
                            </span>
                          )}
                          <span className={`badge-custom badge-custom--${rec.regulatory_maturity?.toLowerCase() || 'developing'}`}>
                            {rec.regulatory_maturity?.toUpperCase()} MATURITY
                          </span>
                        </div>
                      </div>
                      <div className="rec-header-right">
                        <div style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          fontFamily: "JetBrains Mono",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: "4px"
                        }}>
                          Need Index
                        </div>
                        <div style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: "28px",
                          color: needColor,
                          lineHeight: 1
                        }}>
                          {rec.need_score.toFixed(3)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      height: "4px",
                      background: "var(--bg-hover)",
                      borderRadius: "2px",
                      marginBottom: "16px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${needPct}%`,
                        background: needColor,
                        borderRadius: "2px",
                        transition: "width 0.8s ease"
                      }} />
                    </div>

                    {/* Three-Column Content Grid */}
                    <div 
                      className="recommender-details-grid-custom"
                      style={{ gap: "20px" }}
                    >
                      {/* COLUMN 1 — "WHY THIS COUNTRY" */}
                      <div>
                        <div style={{
                          fontSize: "10px",
                          color: "var(--text-dim)",
                          fontFamily: "JetBrains Mono",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: "8px"
                        }}>
                          Why This Country
                        </div>
                        <div style={{
                          background: "var(--bg-hover)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          padding: "12px 16px",
                        }}>
                          <p style={{ fontSize: "13px", color: "var(--text-main)", lineHeight: 1.65, margin: 0, fontFamily: "DM Sans" }}>
                            {rec.reasoning}
                          </p>
                        </div>
                      </div>

                      {/* COLUMN 2 — "EXPECTED BENEFITS" */}
                      <div>
                        <div style={{
                          fontSize: "10px",
                          color: "var(--text-dim)",
                          fontFamily: "JetBrains Mono",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: "8px"
                        }}>
                          Expected Regulatory Benefits
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {rec.expected_benefits.map((b, j) => (
                            <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                              <CheckCircle2
                                size={14}
                                color="#5c9e2e"
                                style={{ flexShrink: 0, marginTop: "2px" }}
                              />
                              <span style={{
                                fontSize: "12px",
                                color: "var(--text-muted)",
                                lineHeight: 1.5,
                                fontFamily: "DM Sans"
                              }}>
                                {b}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* COLUMN 3 — RADAR CHART */}
                      {rec.score_breakdown && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ width: "200px", height: "180px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="55%" data={[
                                { subject: "Gap Severity", score: Math.round((rec.score_breakdown.sector_gap || 0) / 0.35 * 100) },
                                { subject: "Infrastructure", score: Math.round((rec.score_breakdown.regulatory_maturity || 0) / 0.25 * 100) },
                                { subject: "Intent Match", score: Math.round((rec.score_breakdown.semantic_need || 0) / 0.20 * 100) },
                                { subject: "Peer Adoption", score: Math.round((rec.score_breakdown.regional_pressure || 0) / 0.12 * 100) },
                                { subject: "Development", score: Math.round((rec.score_breakdown.economic_tier || 0) / 0.08 * 100) }
                              ]}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar 
                                  name="Need Index" 
                                  dataKey="score" 
                                  stroke="#5c9e2e" 
                                  fill="#5c9e2e" 
                                  fillOpacity={0.08} 
                                  strokeWidth={1.5}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Factor values mini grid */}
                          <div className="score-grid" style={{
                            textAlign: "center",
                            marginTop: "8px",
                            paddingTop: "8px",
                            borderTop: "1px solid var(--border)",
                            width: "100%",
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: "4px"
                          }}>
                            {[
                              { label: "Gap", val: rec.score_breakdown.sector_gap },
                              { label: "Inf", val: rec.score_breakdown.regulatory_maturity },
                              { label: "Int", val: rec.score_breakdown.semantic_need },
                              { label: "Pee", val: rec.score_breakdown.regional_pressure },
                              { label: "Dev", val: rec.score_breakdown.economic_tier }
                            ].map(itm => (
                              <div key={itm.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>
                                  {itm.label}
                                </span>
                                <span style={{ fontSize: "12px", fontFamily: "JetBrains Mono", color: "var(--text-main)", fontWeight: 600 }}>
                                  {(itm.val || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <PartnerLogos className="partner-logos-footer" showDivider={false} label="powered by" />
      </div>
    </div>
  );
}