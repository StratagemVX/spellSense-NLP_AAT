import fitz

doc = fitz.open(r'C:\Users\cheth\Downloads\Cloud Computing Final AAT - 2  .pdf')

for pno in range(len(doc)):
    page = doc[pno]
    rect = page.rect
    blocks = page.get_text('dict')['blocks']
    text_blocks = [b for b in blocks if 'lines' in b]
    print(f"\n=== PAGE {pno+1} ({rect.width} x {rect.height} pt) ===")
    for b in text_blocks[:4]:
        for line in b['lines'][:2]:
            for span in line['spans']:
                text = span['text'].strip()
                if text:
                    print(f"  [{span['font']} {span['size']:.1f}pt color={span['color']}] : {text[:60]}")
