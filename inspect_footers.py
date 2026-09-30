import fitz

doc = fitz.open("AAT2_Spelling_Correction_Tool_Report_FIXED.pdf")

for idx, page in enumerate(doc):
    text = page.get_text()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    # look for page number or footer lines
    footers = [l for l in lines if any(w in l for w in ["Page", "DEPT", "2026", "ACKNOWLEDGEMENT", "ABSTRACT", "CONTRIBUTION", "TABLE OF CONTENT", "LIST OF FIGURES", "CHAPTER"])]
    print(f"--- Page {idx+1} ---")
    print(lines[-4:])
