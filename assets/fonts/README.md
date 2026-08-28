# Fonts

`InstrumentSerif-Regular.ttf` — used only at build time by `app/opengraph-image.tsx`
and `app/apple-icon.tsx`, which render through Satori and need real font data
(Satori cannot read the `.woff2` files `next/font` produces).

The site itself loads Instrument Serif through `next/font/google` in
`app/(site)/layout.tsx`; this file is not served to browsers.

Instrument Serif is licensed under the SIL Open Font License 1.1, which permits
redistribution: https://fonts.google.com/specimen/Instrument+Serif/license
