import { useEffect, useState, useCallback, useRef } from "react";
import { fetchPolicies, fetchSectors, fetchRegions } from "../services/api";
import PolicyCard from "../components/PolicyCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PartnerLogos from "../components/PartnerBar";
import { Search, Filter, X, Globe2, ExternalLink, MapPin, ChevronDown, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";

const PAGE_SIZE = 30;

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sectors,  setSectors]  = useState([]);
  const [regions,  setRegions]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [sector,   setSector]   = useState("");
  const [region,   setRegion]   = useState("");

  // Autocomplete states
  const [allTitles, setAllTitles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce timer for search
  const searchTimer = useRef(null);

  const load = useCallback((page = 1) => {
    setLoading(true);
    fetchPolicies({ search, sector, region, page, limit: PAGE_SIZE }).then(d => {
      if (d && d.data) {
        // Server-side paginated response
        setPolicies(d.data);
        setTotalCount(d.total || 0);
        setCurrentPage(d.page || 1);
      } else if (Array.isArray(d)) {
        // Legacy fallback (flat array)
        setPolicies(d);
        setTotalCount(d.length);
      } else {
        setPolicies([]);
        setTotalCount(0);
      }
      setLoading(false);
    });
  }, [search, sector, region]);

  useEffect(() => {
    fetchSectors().then(d => setSectors(d || []));
    fetchRegions().then(d => setRegions(d || []));
    // Fetch first page for autocomplete suggestions
    fetchPolicies({ page: 1, limit: 100 }).then(data => {
      const items = data?.data || (Array.isArray(data) ? data : []);
      if (items.length > 0) {
        setAllTitles(items.map(p => ({ title: p.title, id: p.id, sector: p.sector, country: p.country })));
      }
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const query = search.toLowerCase();
    const filtered = allTitles.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.sector.toLowerCase().includes(query) ||
      item.country.toLowerCase().includes(query)
    ).slice(0, 6);
    setSuggestions(filtered);
  }, [search, allTitles]);

  // Debounce search: wait 400ms after typing stops before fetching
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1);
      load(1);
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search, sector, region, load]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    load(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => { setSearch(""); setSector(""); setRegion(""); setCurrentPage(1); };
  const hasFilters = search || sector || region;

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      background: "var(--bg-deep)",
      minHeight: "100vh"
    }}>
      <div className="page-container-sm">
        
        {/* ── Page Header Section ── */}
        <div className="fade-up" style={{ marginBottom: 24 }}>
          
          {/* Breadcrumb line above title */}
          <div style={{ 
            fontSize: "10px", 
            color: "var(--text-dim)", 
            fontFamily: "'JetBrains Mono', monospace", 
            textTransform: "uppercase", 
            letterSpacing: "1.5px", 
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            <span style={{ 
              width: 6, 
              height: 6, 
              background: "#5c9e2e", 
              display: "inline-block",
              borderRadius: "1px"
            }} />
            BROWSE / DATABASE
          </div>

          {/* Title Stack */}
          <h1 className="page-title">
            Search the <span className="half-highlight-custom">database.</span>
          </h1>

          {/* Subtitle & Stats Row */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-end", 
            flexWrap: "wrap",
            gap: 20,
            marginTop: 8
          }}>
            <p style={{ 
              fontFamily: "'DM Sans', sans-serif", 
              color: "var(--text-muted)", 
              fontSize: "14px", 
              margin: 0,
              maxWidth: "600px",
              lineHeight: 1.5
            }}>
              Open frameworks from partner jurisdictions plus curated global policies, updated daily.
            </p>

            {/* Metrics Stack */}
            <div style={{ 
              display: "flex", 
              gap: 16, 
              fontFamily: "'JetBrains Mono', monospace", 
              fontSize: "11px", 
              color: "var(--text-muted)",
              fontWeight: 500,
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <span>PAGE <strong style={{ color: "var(--text-main)", marginLeft: 4 }}>{currentPage}</strong> of <strong style={{ color: "var(--text-main)" }}>{totalPages}</strong></span>
              <span style={{ color: "var(--border)" }}>|</span>
              <span>INDEXED <strong style={{ color: "var(--bg-base)", background: "var(--text-main)", padding: "2px 6px", borderRadius: "3px", marginLeft: 4, fontWeight: 700 }}>{totalCount}</strong></span>
            </div>
          </div>

        </div>

        {/* ── Top Promo Card ── */}
        <div 
          className="fade-up"
          style={{
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            marginBottom: "24px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            transition: "all 0.15s ease"
          }}
          onClick={() => setSector("AI Governance")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Icon box */}
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "6px",
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)"
            }}>
              <Globe2 size={18} />
            </div>
            {/* Text info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>
                Top 100 Policy Frameworks in AI Governance 2026
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.06em" }}>
                GOVERNMENT / STANDARDS / ISO / REGULATION
              </div>
            </div>
          </div>
          <ExternalLink size={14} color="var(--text-dim)" />
        </div>

        {/* ── Search & Location Dual Inputs ── */}
        <div className="policies-search-row">
          {/* Main Search Input */}
          <div style={{ position: "relative", flex: 3, minWidth: "200px" }}>
            <Search 
              size={16} 
              color="var(--text-dim)" 
              style={{ 
                position: "absolute", 
                left: 16, 
                top: "50%", 
                transform: "translateY(-50%)",
                pointerEvents: "none"
              }} 
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Search by title, sector, or keyword..."
              className="search-input-custom"
              style={{
                width: "100%",
                height: 48,
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0 16px 0 44px",
                outline: "none",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                marginTop: "4px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                zIndex: 50,
                maxHeight: "280px",
                overflowY: "auto"
              }}>
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearch(item.title);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: index < suggestions.length - 1 ? "1px solid var(--border)" : "none",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ fontSize: "13px", color: "var(--text-main)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: "12px" }}>
                      {item.title}
                    </div>
                    <span style={{
                      fontSize: "10px",
                      fontFamily: "JetBrains Mono",
                      background: "rgba(92, 158, 46, 0.08)",
                      color: "#5c9e2e",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      flexShrink: 0
                    }}>
                      {item.sector}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location Dropdown */}
          <div style={{ position: "relative", flex: 1, minWidth: "150px" }}>
            <span style={{ 
              position: "absolute", 
              left: 16, 
              top: "50%", 
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              zIndex: 1
            }}>
              <MapPin size={16} />
            </span>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="select-custom"
              style={{
                width: "100%",
                height: 48,
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0 32px 0 40px",
                outline: "none",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                cursor: "pointer",
                appearance: "none",
                WebkitAppearance: "none"
              }}
            >
              <option value="">Location (All)</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <span style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center"
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </span>
          </div>
        </div>

        {/* ── Pill Tags Filter Row ── */}
        <div style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "24px"
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "#9ca3af",
            letterSpacing: "0.08em",
            marginRight: "4px"
          }}>
            FILTER /
          </span>
          
          {/* Sector Pills */}
          <button 
            onClick={() => setSector("")}
            style={{
              padding: "5px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: sector === "" ? "var(--text-main)" : "var(--bg-card)",
              color: sector === "" ? "var(--bg-base)" : "var(--text-muted)",
              border: sector === "" ? "1px solid var(--text-main)" : "1px solid var(--border)",
              fontWeight: sector === "" ? 500 : 400
            }}
          >
            All Sectors
          </button>

          {sectors.map(s => {
            const isSelected = sector === s;
            return (
              <button 
                key={s}
                onClick={() => setSector(s)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isSelected ? "var(--text-main)" : "var(--bg-card)",
                  color: isSelected ? "var(--bg-base)" : "var(--text-muted)",
                  border: isSelected ? "1px solid var(--text-main)" : "1px solid var(--border)",
                  fontWeight: isSelected ? 500 : 400
                }}
              >
                {s}
              </button>
            );
          })}

          {hasFilters && (
            <button 
              onClick={clearFilters} 
              style={{
                display: "flex", 
                alignItems: "center", 
                gap: 5,
                background: "rgba(244,63,94,0.06)", 
                border: "1px solid rgba(244,63,94,0.12)",
                color: "#f43f5e", 
                borderRadius: "20px", 
                padding: "5px 14px",
                fontSize: "12px", 
                cursor: "pointer", 
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                transition: "all 0.15s ease"
              }}
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* ── Subtitle Divider Line ── */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "20px",
          marginTop: "16px"
        }}>
          <div>
            <div style={{ 
              fontSize: "10px", 
              color: "var(--text-dim)", 
              fontFamily: "'JetBrains Mono', monospace", 
              textTransform: "uppercase", 
              letterSpacing: "1px", 
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <span style={{ 
                width: 6, 
                height: 6, 
                background: "#5c9e2e", 
                display: "inline-block",
                borderRadius: "1px"
              }} />
              POLICY DATA / EMBEDDINGS
            </div>
            <h2 style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--text-main)",
              margin: 0,
              letterSpacing: "-0.5px"
            }}>
              Global policy intelligence database
            </h2>
          </div>

          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            fontWeight: 500
          }}>
            REFRESHED EVERY 24H
          </div>
        </div>

        {/* ── Responsive Card Grid ── */}
        {loading ? <LoadingSpinner label="Fetching policies..." /> : (
          <div>
            {policies.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                color: "var(--text-muted)", 
                padding: "60px 0",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px"
              }}>
                No policies match your filters.
              </div>
            ) : (
              <>
                {/* Showing X of Y counter */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <span style={{
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "var(--text-dim)",
                    letterSpacing: "0.05em"
                  }}>
                    Showing <strong style={{ color: "var(--text-main)" }}>{policies.length}</strong> of <strong style={{ color: "var(--text-main)" }}>{totalCount}</strong> policies
                    {totalPages > 1 && <> · Page <strong style={{ color: "var(--text-main)" }}>{currentPage}</strong> of <strong style={{ color: "var(--text-main)" }}>{totalPages}</strong></>}
                  </span>
                </div>

                <div className="policies-grid-custom">
                  {policies.map((p, i) => (
                    <PolicyCard key={p.id} policy={p} delay={(i % 6) + 1} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    padding: "32px 0 16px",
                    flexWrap: "wrap"
                  }}>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        color: currentPage <= 1 ? "var(--text-dim)" : "var(--text-main)",
                        cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                        opacity: currentPage <= 1 ? 0.5 : 1,
                        transition: "all 0.15s ease"
                      }}
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>

                    {/* Page number buttons */}
                    {(() => {
                      const pages = [];
                      const maxVisible = 7;
                      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      let end = Math.min(totalPages, start + maxVisible - 1);
                      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

                      if (start > 1) {
                        pages.push(
                          <button key={1} onClick={() => goToPage(1)} style={{
                            width: 36, height: 36, borderRadius: "6px", border: "1px solid var(--border)",
                            background: "var(--bg-card)", color: "var(--text-muted)", cursor: "pointer",
                            fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                            transition: "all 0.15s ease"
                          }}>1</button>
                        );
                        if (start > 2) pages.push(<span key="s1" style={{ color: "var(--text-dim)", fontSize: "12px" }}>…</span>);
                      }

                      for (let i = start; i <= end; i++) {
                        const isActive = i === currentPage;
                        pages.push(
                          <button key={i} onClick={() => goToPage(i)} style={{
                            width: 36, height: 36, borderRadius: "6px",
                            border: isActive ? "1px solid var(--text-main)" : "1px solid var(--border)",
                            background: isActive ? "var(--text-main)" : "var(--bg-card)",
                            color: isActive ? "var(--bg-base)" : "var(--text-muted)",
                            cursor: "pointer", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: isActive ? 700 : 500, transition: "all 0.15s ease"
                          }}>{i}</button>
                        );
                      }

                      if (end < totalPages) {
                        if (end < totalPages - 1) pages.push(<span key="s2" style={{ color: "var(--text-dim)", fontSize: "12px" }}>…</span>);
                        pages.push(
                          <button key={totalPages} onClick={() => goToPage(totalPages)} style={{
                            width: 36, height: 36, borderRadius: "6px", border: "1px solid var(--border)",
                            background: "var(--bg-card)", color: "var(--text-muted)", cursor: "pointer",
                            fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                            transition: "all 0.15s ease"
                          }}>{totalPages}</button>
                        );
                      }

                      return pages;
                    })()}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        color: currentPage >= totalPages ? "var(--text-dim)" : "var(--text-main)",
                        cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                        opacity: currentPage >= totalPages ? 0.5 : 1,
                        transition: "all 0.15s ease"
                      }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <PartnerLogos className="partner-logos-footer" showDivider={false} label="powered by" />
      </div>
    </div>
  );
}