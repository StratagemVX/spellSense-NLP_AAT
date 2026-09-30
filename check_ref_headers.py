import fitz

doc = fitz.open(r"C:\Users\cheth\.gemini\antigravity-ide\brain\0a4ed4d6-e0c3-4135-9698-bd3dfd320d5b\.user_uploaded\media_1790748592274.pdf")
print(f"Reference Total Pages: {len(doc)}")

for i in range(min(12, len(doc))):
    page = doc[i]
    top_rect = fitz.Rect(0, 0, page.rect.width, 80)
    bot_rect = fitz.Rect(0, page.rect.height - 80, page.rect.width, page.rect.height)
    top_text = page.get_text(clip=top_rect).strip().replace("\n", " | ")
    bot_text = page.get_text(clip=bot_rect).strip().replace("\n", " | ")
    first_few = [l.strip() for l in page.get_text().split("\n") if l.strip()][:2]
    print(f"Ref P{i+1} ({' - '.join(first_few)}): TOP='{top_text}' | BOT='{bot_text}'")
