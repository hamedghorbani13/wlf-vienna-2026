# Responsive banner images

The landing page automatically selects one of these files according to the
visitor's screen width:

| File | Screen width | Recommended size | Aspect ratio |
| --- | --- | --- | --- |
| `images/banner-desktop.webp` | 901 px and wider | 2400 × 1350 px | 16:9 |
| `images/banner-tablet.webp` | 601–900 px | 1600 × 1600 px | 1:1 |
| `images/banner-mobile.webp` | 600 px and narrower | 900 × 1600 px | 9:16 |

Larger images are acceptable when they keep the same aspect ratio. WebP is
recommended because it provides good quality at a smaller file size. As a
general target, keep the desktop image below 700 KB and the tablet and mobile
images below 500 KB each.

## Composition guidance

- Keep the main figure on the right side of the English/German crops.
- Leave the left side relatively quiet so the headline remains readable.
- Keep faces and other important details at least 8% away from every edge.
- Do not include text inside the image.
- Do not create separate Farsi crops. The website mirrors the selected image
  automatically for Farsi, placing the main figure on the left.

Until a crop is added under the exact filename above, the website safely uses
the existing `banner.jpeg` image instead.
