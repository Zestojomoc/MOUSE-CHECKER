# Mouse Checker

Mouse Checker is a lightweight browser utility for checking the buttons, wheel, movement, click-and-hold behavior, and double-click input of a computer mouse.

## Features

- Live visual feedback for left, right, middle, back, and forward buttons
- Scroll up/down and pointer movement detection
- Click-and-hold and double-click checks
- Persistent status tracking with reset
- Responsive, accessible interface with reduced-motion support

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The Vite output is generated in `dist/` and is ready to deploy on Vercel. Use the default Vercel framework preset or set the build command to `npm run build` and output directory to `dist`.

## Browser limitations

This app reports mouse input exposed to the browser. Back and forward buttons depend on browser support and the physical mouse. It does not diagnose internal mouse hardware, DPI, polling rate, or sensor performance. No data is collected.