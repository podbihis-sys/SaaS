"""Draw the app's icon set.

    python scripts/make_icons.py        # needs Pillow

The icons are generated rather than committed as opaque binaries: a PNG in a
diff tells a reviewer nothing, while thirty lines of geometry can be read and
changed. Re-run this after touching the brand colour and commit the result.

One mark, three shapes: a white calendar sheet, two rings, a blue check. No
text and no gradient — at 40 px in a home-screen grid, anything finer turns to
mud. The header band this started with is deliberately gone: it was the brand
blue on a brand-blue ground, so it read as a gap rather than a band.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets"
BLUE = (29, 78, 216)  # #1d4ed8, the app's primary
WHITE = (255, 255, 255)


def mark(size: int, *, margin: float = 0.17, transparent: bool = False) -> Image.Image:
    """The calendar mark, square, on the brand colour unless asked otherwise."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0) if transparent else BLUE + (255,))
    draw = ImageDraw.Draw(img)
    s = size

    left, right = s * margin, s * (1 - margin)
    top, bottom = s * (margin + 0.05), s * (1 - margin)
    draw.rounded_rectangle([left, top, right, bottom], radius=s * 0.075, fill=WHITE)

    # Rings overlap the sheet's top edge, the way real ones sit on a binder.
    ring_w, ring_h = s * 0.028, s * 0.10
    for x in (left + (right - left) * 0.3, left + (right - left) * 0.7):
        draw.rounded_rectangle(
            [x - ring_w, top - ring_h * 0.75, x + ring_w, top + ring_h * 0.25],
            radius=ring_w,
            fill=WHITE,
        )

    centre_x = (left + right) / 2
    centre_y = top + (bottom - top) * 0.58
    draw.line(
        [
            (centre_x - s * 0.13, centre_y),
            (centre_x - s * 0.03, centre_y + s * 0.10),
            (centre_x + s * 0.15, centre_y - s * 0.12),
        ],
        fill=BLUE,
        width=max(2, int(s * 0.07)),
        joint="curve",
    )
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # The App Store rejects an icon with an alpha channel.
    mark(1024).convert("RGB").save(OUT / "icon.png")

    # Android masks an adaptive foreground down to the middle ~66 %.
    mark(1024, margin=0.28, transparent=True).save(OUT / "adaptive-icon.png")

    # A notification icon is drawn as a silhouette: only the alpha matters, so
    # the sheet is solid and the check would disappear into it.
    notification = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(notification)
    draw.rounded_rectangle([16, 24, 80, 82], radius=7, fill=WHITE)
    draw.rounded_rectangle([31, 14, 37, 32], radius=3, fill=WHITE)
    draw.rounded_rectangle([59, 14, 65, 32], radius=3, fill=WHITE)
    notification.save(OUT / "notification-icon.png")

    # Splash: sized for the largest phone so Expo scales down, never up.
    splash = Image.new("RGB", (1284, 2778), BLUE)
    glyph = mark(620, transparent=True)
    splash.paste(glyph, ((1284 - 620) // 2, (2778 - 620) // 2), glyph)
    splash.save(OUT / "splash.png")

    mark(196).convert("RGB").save(OUT / "favicon.png")

    for path in sorted(OUT.iterdir()):
        print(f"  {path.name:24} {path.stat().st_size / 1024:6.1f} kB")


if __name__ == "__main__":
    main()
