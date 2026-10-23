import re
import io
try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.config import GOOGLE_API_KEY, GEMINI_MODEL

def extract_text_from_pdf(file_bytes: bytes) -> str:
    # Try using PyMuPDF (fitz) first for high performance
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page in doc:
            text = page.get_text("text")
            if text:
                text_parts.append(text)
        doc.close()
        full_text = "\n".join(text_parts)
        full_text = re.sub(r'\n{3,}', '\n\n', full_text)
        full_text = re.sub(r'[ \t]{2,}', ' ', full_text)
        return full_text.strip()
    except Exception as mupdf_err:
        print(f"[WARN] PyMuPDF extraction failed or not installed: {mupdf_err}. Falling back to pdfplumber...")
        # Fallback to pdfplumber which is guaranteed to be present
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                text_parts = []
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
                full_text = "\n".join(text_parts)
                full_text = re.sub(r'\n{3,}', '\n\n', full_text)
                full_text = re.sub(r'[ \t]{2,}', ' ', full_text)
                return full_text.strip()
        except Exception as plumber_err:
            raise ValueError(f"Could not extract text from PDF using any parser. (PyMuPDF: {mupdf_err}; pdfplumber: {plumber_err})")


def extract_policy_metadata(text: str) -> dict:
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    title = lines[0] if lines else "Uploaded Policy"
    if len(title) > 120:
        title = title[:120] + "..."

    year = None
    year_match = re.search(r'\b(20\d{2})\b', text[:500])
    if year_match:
        year = int(year_match.group(1))

    common_policy_keywords = [
        "transparency", "accountability", "privacy", "security",
        "compliance", "risk", "data protection", "cybersecurity",
        "artificial intelligence", "governance", "human rights",
        "safety", "ethics", "regulation", "enforcement"
    ]

    text_lower = text.lower()
    detected_tags = [
        kw for kw in common_policy_keywords
        if kw in text_lower
    ][:6]

    return {
        "title": title,
        "year": year,
        "tags": detected_tags,
    }


def validate_policy_text(text: str) -> tuple[bool, str]:
    """
    Validates whether the extracted text represents a policy, regulation, or guideline framework.
    Returns (is_valid, error_message).
    """
    text_lower = text.lower()
    words = text_lower.split()
    total_words = len(words)

    # 1. Quick length pre-check
    if total_words < 60:
        return False, "Document is too short to be a valid policy framework (minimum 60 words)."

    # 2. Try LLM-based validation if configured and available
    if genai and GOOGLE_API_KEY:
        try:
            import json
            genai.configure(api_key=GOOGLE_API_KEY)
            
            system_prompt = (
                "You are an expert policy analyst and regulatory compliance inspector.\n"
                "Your sole task is to inspect the provided document text and determine if it is a valid, substantive, "
                "and complete policy, regulation, law, act, standard, directive, ordinance, code of conduct, or official guideline framework.\n\n"
                "You MUST reject documents that are not genuine, detailed, and comprehensive policy frameworks. This includes rejecting:\n"
                "- Resumes, CVs, portfolios, professional profiles, job applications, or cover letters.\n"
                "- Personal emails, chat logs, forum posts, letters, essays, or recipes.\n"
                "- Generic news articles, novels, user manuals, cookbooks, books, or random informational wiki pages.\n"
                "- Source code, shell scripts, configurations, or technical logs.\n"
                "- Brief summaries, short placeholder drafts, outlines, or mock sections that only contain a few sentences (even if they use policy-like vocabulary).\n"
                "- Arbitrary random words, sentences, or placeholders.\n\n"
                "A genuine policy document must be detailed, comprehensive, and have actual operational clauses, specific compliance requirements, "
                "and substantial depth. Do not accept short 2-3 paragraph templates or brief summaries that lack substance and detail.\n\n"
                "Respond ONLY with a JSON object containing exactly these two keys:\n"
                '1. "is_policy": boolean (true if the document is strictly a genuine, substantive, and comprehensive policy, regulation, act, or official guideline framework; false otherwise).\n'
                '2. "reason": string (if is_policy is false, a short, polite explanation of why it was rejected. If is_policy is true, this can be empty).'
            )

            # Limit text sample size for analysis to keep latency low
            sample_text = text[:4000]
            user_prompt = (
                "Determine if the following document is a policy framework:\n\n"
                f"--- START DOCUMENT ---\n{sample_text}\n--- END DOCUMENT ---"
            )

            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL,
                system_instruction=system_prompt
            )

            response = model.generate_content(
                contents=user_prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                ),
                request_options={"timeout": 20.0}
            )

            raw_text = response.text.strip()
            # Clean markdown code blocks if wrapped
            if raw_text.startswith("```"):
                parts = raw_text.split("```")
                if len(parts) >= 3:
                    raw_text = parts[1]
                    if raw_text.startswith("json"):
                        raw_text = raw_text[4:]
            raw_text = raw_text.strip()

            result = json.loads(raw_text)
            is_policy = result.get("is_policy", False)
            reason = result.get("reason", "This document is not a valid policy framework.")
            
            if not is_policy:
                return False, reason
            return True, ""
        except Exception as llm_err:
            print(f"[WARN] LLM policy validation failed: {llm_err}. Falling back to rule-based validation.")

    # 3. Fallback to local rule-based heuristic validation
    # Check for unambiguous developer / portfolio keywords
    unambiguous_dev_keywords = [
        "react.js", "reactjs", "fastapi", "flask", "mongodb", "chromadb", "pgvector", 
        "postman", "vscode", "vs code", "scikit-learn", "spacy", "git/github",
        "cgpa", "b.tech", "m.tech", "btech", "mtech", "developer intern",
        "professional summary", "technical skills", "work experience", "academic profile"
    ]
    
    dev_matches = [kw for kw in unambiguous_dev_keywords if kw in text_lower]
    if len(dev_matches) >= 1:
        return False, f"This document appears to be a developer resume or technical portfolio (detected: {', '.join(dev_matches)})."

    # Check for structural resume headers
    resume_headers = ["education", "experience", "skills", "projects", "languages", "cv", "resume", "employment", "intern"]
    resume_header_matches = [h for h in resume_headers if h in text_lower]
    
    if len(resume_header_matches) >= 3:
        return False, "This document contains structural sections typical of a resume, CV, or professional profile rather than a policy framework."

    # General regulatory relevance check
    core_policy_words = [
        "policy", "policies", "regulation", "regulations", "regulatory", 
        "act", "acts", "directive", "directives", "guideline", "guidelines", 
        "framework", "frameworks", "governance", "compliance", "mandate", 
        "law", "laws", "legal", "decree", "statute", "statutes", 
        "requirement", "requirements", "standard", "standards", "provision", "provisions",
        "obligation", "obligations", "enforcement", "penalties", "penalty", "safety", "security",
        "privacy", "transparency", "accountability", "ethics", "ethical"
    ]

    matches = [w for w in core_policy_words if w in text_lower]
    unique_matches_count = len(set(matches))
    total_occurrences = sum(text_lower.count(w) for w in core_policy_words)

    # Valid policies require at least 3 unique core policy terms and 5 total occurrences
    if unique_matches_count < 3 or total_occurrences < 5:
        return False, "The document does not contain sufficient regulatory, policy, or compliance-related terminology."

    return True, ""