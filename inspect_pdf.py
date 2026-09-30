import win32com.client
import os
import fitz # PyMuPDF

docx_path = os.path.abspath("AAT2_Spelling_Correction_Tool_Report_FIXED.docx")
pdf_path = os.path.abspath("AAT2_Spelling_Correction_Tool_Report_FIXED.pdf")

print("Opening Word...")
word = win32com.client.Dispatch("Word.Application")
word.Visible = False

try:
    doc = word.Documents.Open(docx_path)
    print("Saving as PDF...")
    doc.SaveAs(pdf_path, FileFormat=17) # 17 = wdFormatPDF
    doc.Close()
    print("PDF saved successfully.")
finally:
    word.Quit()

# Now inspect PDF with fitz
doc = fitz.open(pdf_path)
print(f"Total Pages in PDF: {len(doc)}")

for i in range(min(12, len(doc))):
    text = doc[i].get_text()
    first_lines = [line.strip() for line in text.split("\n") if line.strip()][:4]
    print(f"Page {i+1}: {first_lines}")
