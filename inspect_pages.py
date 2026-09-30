import fitz # PyMuPDF
import re

doc = fitz.open("AAT2_Spelling_Correction_Tool_Report_FIXED.pdf")
print(f"Total Pages: {len(doc)}")

toc_targets = {
    "ACKNOWLEDGEMENT": None,
    "ABSTRACT": None,
    "CONTRIBUTION OF TEAM MEMBERS": None,
    "TABLE OF CONTENT": None,
    "LIST OF FIGURES": None,
    "CHAPTER 1": None,
    "CHAPTER 2": None,
    "CHAPTER 3": None,
    "CHAPTER 4": None,
    "CHAPTER 5": None,
    "CHAPTER 6": None,
    "CHAPTER 7": None,
    "REFERENCES": None,
}

fig_targets = {
    "Fig 3.1": None,
    "Fig 4.1": None,
    "Fig 5.1": None,
    "Fig 5.2": None,
    "Fig 5.3": None,
    "Fig 5.4": None,
    "Fig 5.5": None,
    "Fig 5.6": None,
    "Fig 5.7": None,
    "Fig 5.8": None,
    "Fig 6.1": None,
    "Fig 6.2": None,
    "Fig 6.3": None,
    "Fig 6.4": None,
    "Fig 6.5": None,
    "Fig 6.6": None,
}

for page_idx in range(len(doc)):
    page = doc[page_idx]
    text = page.get_text()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    first_3 = " | ".join(lines[:3]) if lines else "EMPTY"
    
    # check targets
    for target in toc_targets:
        if toc_targets[target] is None and any(target in l.upper() for l in lines[:10]):
            toc_targets[target] = page_idx + 1
            
    for fig in fig_targets:
        if fig_targets[fig] is None and any(fig.upper() in l.upper() for l in lines):
            fig_targets[fig] = page_idx + 1

    print(f"P{page_idx+1}: {first_3}")

print("\n--- TOC Targets (Raw PDF Page) ---")
for k, v in toc_targets.items():
    print(f"{k}: {v}")

print("\n--- Figure Targets (Raw PDF Page) ---")
for k, v in fig_targets.items():
    print(f"{k}: {v}")
