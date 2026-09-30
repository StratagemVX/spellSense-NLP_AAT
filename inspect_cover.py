import fitz

doc = fitz.open(r'C:\Users\cheth\Downloads\Cloud Computing Final AAT - 2  .pdf')

print("=== PAGE 1 (COVER) ===")
p1 = doc[0]
for b in p1.get_text('dict')['blocks']:
    if 'lines' in b:
        for l in b['lines']:
            for s in l['spans']:
                txt = s['text'].strip()
                if txt:
                    print(f"y={s['bbox'][1]:.1f} [{s['font']} {s['size']:.1f}pt c={s['color']}]: {txt}")

print("\n=== PAGE 6 (CONTRIBUTION) ===")
p6 = doc[5]
for b in p6.get_text('dict')['blocks']:
    if 'lines' in b:
        for l in b['lines']:
            for s in l['spans']:
                txt = s['text'].strip()
                if txt:
                    print(f"y={s['bbox'][1]:.1f} [{s['font']} {s['size']:.1f}pt]: {txt}")
