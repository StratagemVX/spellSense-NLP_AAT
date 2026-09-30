import fitz

doc = fitz.open("AAT2_Spelling_Correction_Tool_Report_FIXED.pdf")
pages_to_render = [0, 1, 2, 5, 6, 7] # P1, P2, P3, P6, P7, P8

for p_idx in pages_to_render:
    page = doc[p_idx]
    pix = page.get_pixmap(dpi=150)
    out_file = f"rendered_page_{p_idx+1}.png"
    pix.save(out_file)
    print(f"Saved {out_file}")
