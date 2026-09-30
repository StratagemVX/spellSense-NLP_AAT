from PIL import Image
import numpy as np

img = Image.open('report_assets/page1_img0_1486x1985.png').convert('L')
arr = np.array(img)

h, w = arr.shape
rgba = np.zeros((h, w, 4), dtype=np.uint8)

# The extracted mask has white border strokes (values 0-255) on black background.
# We want black border strokes with transparent interior and exterior!
mask = arr > 30
rgba[mask, 0] = 0   # R
rgba[mask, 1] = 0   # G
rgba[mask, 2] = 0   # B
rgba[mask, 3] = arr[mask] # Alpha

out_img = Image.fromarray(rgba, 'RGBA')
out_img.save('report_assets/cover_border_transparent.png')
print("Saved report_assets/cover_border_transparent.png")
