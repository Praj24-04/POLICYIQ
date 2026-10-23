import time
import hashlib
from threading import Lock
from fastapi import APIRouter, Query
from app.ml.recommender_v2 import get_recommendations_v2, get_cluster_summary

router = APIRouter()

# ── Recommendation result cache (5-minute TTL) ──────────────────────────
# This prevents the PDF download endpoint from re-running the full ML
# pipeline when the user already viewed the recommendations on the page.
_rec_cache = {}
_rec_cache_lock = Lock()
_REC_CACHE_TTL = 300  # 5 minutes


def _cache_key(policy_id: str, top_n: int, weights) -> str:
    """Deterministic cache key from request params."""
    w_str = str(sorted(weights.items())) if weights else "default"
    raw = f"{policy_id}:{top_n}:{w_str}"
    return hashlib.md5(raw.encode()).hexdigest()


def _get_cached_rec(key: str):
    with _rec_cache_lock:
        entry = _rec_cache.get(key)
        if entry:
            val, expiry = entry
            if time.time() < expiry:
                return val
            else:
                del _rec_cache[key]
    return None


def _set_cached_rec(key: str, value):
    with _rec_cache_lock:
        _rec_cache[key] = (value, time.time() + _REC_CACHE_TTL)
        # Evict stale entries if cache grows beyond 50 items
        if len(_rec_cache) > 50:
            now = time.time()
            stale = [k for k, (_, exp) in _rec_cache.items() if now >= exp]
            for k in stale:
                del _rec_cache[k]


def _get_recommendations_cached(policy_id: str, top_n: int, weights):
    """Get recommendations with caching — shared by display and download."""
    key = _cache_key(policy_id, top_n, weights)
    cached = _get_cached_rec(key)
    if cached is not None:
        return cached
    res = get_recommendations_v2(policy_id, top_n, weights)
    _set_cached_rec(key, res)
    return res


def _parse_weights(
    w_sector: float = None,
    w_maturity: float = None,
    w_semantic: float = None,
    w_regional: float = None,
    w_economic: float = None
):
    if any(w is not None for w in [w_sector, w_maturity, w_semantic, w_regional, w_economic]):
        return {
            "sector_gap": w_sector if w_sector is not None else 0.35,
            "regulatory_maturity": w_maturity if w_maturity is not None else 0.25,
            "semantic_need": w_semantic if w_semantic is not None else 0.20,
            "regional_pressure": w_regional if w_regional is not None else 0.12,
            "economic_tier": w_economic if w_economic is not None else 0.08,
        }
    return None

# Important: /clusters/summary must be BEFORE /{policy_id}
@router.get("/clusters/summary")
def clusters():
    return get_cluster_summary()

@router.get("/download/{policy_id}")
def download_recommendations_pdf(
    policy_id: str, 
    top_n: int = 5,
    w_sector: float = Query(None),
    w_maturity: float = Query(None),
    w_semantic: float = Query(None),
    w_regional: float = Query(None),
    w_economic: float = Query(None)
):
    weights = _parse_weights(w_sector, w_maturity, w_semantic, w_regional, w_economic)
    res = _get_recommendations_cached(policy_id, top_n, weights)
    
    from app.ml.recommender_v2 import DEFAULT_WEIGHTS
    res["weights"] = weights if weights else DEFAULT_WEIGHTS
    
    from app.services.pdf_generator import generate_recommendations_pdf
    from fastapi.responses import Response
    
    pdf_bytes = generate_recommendations_pdf(res)
    
    filename = f"PolicyIQ_Recommendations_{policy_id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.get("/v2/{policy_id}")
def recommend_v2(
    policy_id: str, 
    top_n: int = 5,
    w_sector: float = Query(None),
    w_maturity: float = Query(None),
    w_semantic: float = Query(None),
    w_regional: float = Query(None),
    w_economic: float = Query(None)
):
    weights = _parse_weights(w_sector, w_maturity, w_semantic, w_regional, w_economic)
    return _get_recommendations_cached(policy_id, top_n, weights)

@router.get("/{policy_id}")
def recommend(
    policy_id: str, 
    top_n: int = 5, 
    w_sector: float = Query(None),
    w_maturity: float = Query(None),
    w_semantic: float = Query(None),
    w_regional: float = Query(None),
    w_economic: float = Query(None)
):
    weights = _parse_weights(w_sector, w_maturity, w_semantic, w_regional, w_economic)
    return _get_recommendations_cached(policy_id, top_n, weights)