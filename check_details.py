import fitz

doc = fitz.open("AAT2_Spelling_Correction_Tool_Report_FIXED.pdf")

figs = [
    "Fig 3.1", "Fig 4.1", "Fig 5.1", "Fig 5.2", "Fig 5.3", "Fig 5.4",
    "Fig 5.5", "Fig 5.6", "Fig 5.7", "Fig 5.8", "Fig 6.1", "Fig 6.2",
    "Fig 6.3", "Fig 6.4", "Fig 6.5", "Fig 6.6", "Fig 6.7", "Fig 6.8"
]

print("--- FIGURE DETECTIONS ---")
for f in figs:
    found_on = []
    for idx, page in enumerate(doc):
        text = page.get_text()
        if f.lower() in text.lower():
            # calculate report page (page 9 is report page 1)
            report_p = idx - 9 + 1 if idx >= 8 else f"Frontmatter {idx+1}"
            found_on.append(f"PDF P{idx+1} (Report P{report_p})")
    print(f"{f}: {', '.join(found_on)}")

print("\n--- CHECK FOR BLANK OR LOW-CONTENT PAGES ---")
for idx, page in enumerate(doc):
    text = page.get_text().strip()
    word_count = len(text.split())
    if word_count < 25:
        print(f"Warning: PDF Page {idx+1} has only {word_count} words! Text: {text[:100]}...")
