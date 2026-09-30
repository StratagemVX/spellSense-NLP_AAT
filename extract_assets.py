import fitz
import os

os.makedirs('report_assets', exist_ok=True)
doc = fitz.open(r'C:\Users\cheth\Downloads\Cloud Computing Final AAT - 2  .pdf')

for page_no in range(len(doc)):
    page = doc[page_no]
    for img_idx, img in enumerate(page.get_images()):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image['image']
        image_ext = base_image['ext']
        w = base_image['width']
        h = base_image['height']
        fname = f"report_assets/page{page_no+1}_img{img_idx}_{w}x{h}.{image_ext}"
        if not os.path.exists(fname):
            with open(fname, 'wb') as f:
                f.write(image_bytes)
            print(f"Saved: {fname}")

print("Extraction complete.")
