from PIL import Image

im = Image.open('ref_page1.png').convert('RGB')
w, h = im.size

# Find inner boundary along horizontal line at y = h // 2
# From left, find last black/dark pixel of the border
left_border = 0
for x in range(200):
    r, g, b = im.getpixel((x, h // 2))
    if r < 100 and g < 100 and b < 100:
        left_border = x

right_border = w - 1
for x in range(w - 1, w - 200, -1):
    r, g, b = im.getpixel((x, h // 2))
    if r < 100 and g < 100 and b < 100:
        right_border = x

top_border = 0
for y in range(200):
    r, g, b = im.getpixel((w // 2, y))
    if r < 100 and g < 100 and b < 100:
        top_border = y

bottom_border = h - 1
for y in range(h - 1, h - 200, -1):
    r, g, b = im.getpixel((w // 2, y))
    if r < 100 and g < 100 and b < 100:
        bottom_border = y

print(f"Border outer/inner bounds: L={left_border}, R={right_border}, T={top_border}, B={bottom_border}")
