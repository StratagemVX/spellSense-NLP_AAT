import fitz

doc = fitz.open("AAT2_Spelling_Correction_Tool_Report_FIXED.pdf")

print("=== INSPECTING FOOTER TEXT ON PAGES 9 to 34 ===")
for p_num in range(9, len(doc) + 1):
    page = doc[p_num - 1]
    # footer is in the bottom 80 points
    rect = fitz.Rect(0, page.rect.height - 80, page.rect.width, page.rect.height)
    footer_text = page.get_text(clip=rect).strip().replace("\n", " | ")
    print(f"PDF P{p_num} (Expected Page {p_num-8}): {footer_text}")
