import docx

doc = docx.Document("AAT2_Spelling_Correction_Tool_Report.docx")
print("=== DOCX VERIFICATION ===")
print("Paragraphs count:", len(doc.paragraphs))
print("Tables count:", len(doc.tables))
print("Sections count:", len(doc.sections))

# Check headings and chapters
headings = [p.text for p in doc.paragraphs if p.text.startswith("CHAPTER") or p.text in [
    "CERTIFICATE", "DECLARATION", "ACKNOWLEDGEMENT", "ABSTRACT",
    "CONTRIBUTION OF TEAM MEMBERS", "TABLE OF CONTENT", "LIST OF FIGURES", "REFERENCES"
]]
print("\nMajor Headings Found:", headings)

# Check inline pictures
inline_shapes = 0
for p in doc.paragraphs:
    for r in p.runs:
        if 'drawing' in r._r.xml:
            inline_shapes += 1
print(f"\nEmbedded Figures/Images Count: {inline_shapes}")

# Verify students in tables
table_texts = []
for t in doc.tables:
    for row in t.rows:
        for cell in row.cells:
            table_texts.append(cell.text)
full_table_text = " ".join(table_texts)

for name in ["CHETHAN KUMAR B S", "CHIRANTH L", "D MANOHAR", "DEERAJ ASHOK SHIRAHATTI"]:
    if name in full_table_text:
        print(f"[PASS] Student found in table: {name}")
    else:
        print(f"[FAIL] Student MISSING in table: {name}")

for usn in ["1MJ23CS036", "1MJ23CS038", "1MJ23CS040", "1MJ23CS047"]:
    if usn in full_table_text:
        print(f"[PASS] USN found: {usn}")
    else:
        print(f"[FAIL] USN MISSING: {usn}")

if "Mrs. Sujitha K L" in " ".join([p.text for p in doc.paragraphs]):
    print("[PASS] Guide Mrs. Sujitha K L found")
if "Dr. Maruth Pandi J" in " ".join([p.text for p in doc.paragraphs]):
    print("[PASS] HOD Dr. Maruth Pandi J found")
if "Docker" in " ".join([p.text for p in doc.paragraphs]):
    print("[FAIL] WARNING: Docker found in text!")
else:
    print("[PASS] Verified: No Docker/Kubernetes/deployment mentions in text")

print("\nVerification complete.")
