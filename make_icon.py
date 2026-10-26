"""Render the Medins Mediacenter launcher icon with Pillow."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parent
SIZE = 1536


def centered_text(draw: ImageDraw.ImageDraw, box, text: str, font, color: str) -> None:
    bounds = draw.textbbox((0, 0), text, font=font)
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    x = (box[0] + box[2] - width) / 2 - bounds[0]
    y = (box[1] + box[3] - height) / 2 - bounds[1]
    draw.text((x, y), text, font=font, fill=color)


def main() -> None:
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((18, 18, 1518, 1518), radius=325, fill="#0C1323")
    draw.rounded_rectangle((32, 32, 1504, 1504), radius=307, outline="#35445E", width=12)

    gap = 34
    start = 156
    tile = (SIZE - 2 * start - gap) // 2
    boxes = [
        (start, start, start + tile, start + tile),
        (start + tile + gap, start, SIZE - start, start + tile),
        (start, start + tile + gap, start + tile, SIZE - start),
        (start + tile + gap, start + tile + gap, SIZE - start, SIZE - start),
    ]
    fills = ("#163E4B", "#30275A", "#492934", "#183D55")
    glows = ("#25D4B8", "#9E7AFF", "#FF6E78", "#63BDFF")

    glow_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    for box, color in zip(boxes, glows):
        cx = (box[0] + box[2]) // 2
        cy = (box[1] + box[3]) // 2
        glow_draw.ellipse((cx - 250, cy - 250, cx + 250, cy + 250), fill=color + "66")
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(90))
    image = Image.alpha_composite(image, glow_layer)
    draw = ImageDraw.Draw(image)
    for box, fill, color in zip(boxes, fills, glows):
        draw.rounded_rectangle(box, radius=105, fill=fill, outline=color, width=14)

    font_path = Path("C:/Windows/Fonts/segoeuib.ttf")
    font = ImageFont.truetype(str(font_path), 480)
    centered_text(draw, boxes[0], "M", font, "#F6FFFE")
    centered_text(draw, boxes[1], "M", font, "#FAF7FF")

    left = boxes[2]
    cx = (left[0] + left[2]) // 2
    cy = (left[1] + left[3]) // 2
    draw.polygon(((cx - 160, cy - 205), (cx - 160, cy + 205), (cx + 205, cy)), fill="#FFF7F5")

    right = boxes[3]
    cx = (right[0] + right[2]) // 2
    cy = (right[1] + right[3]) // 2
    for radius, width in ((205, 51), (137, 49), (69, 45)):
        draw.arc((cx - radius, cy - radius, cx + radius, cy + radius), 210, 330,
                 fill="#F4FCFF", width=width)

    image.resize((1024, 1024), Image.Resampling.LANCZOS).save(ROOT / "icon.png")


if __name__ == "__main__":
    main()
