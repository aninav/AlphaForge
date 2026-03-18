# AlphaForge — Next.js Shell

A two-layer experience: cinematic landing page → Streamlit research terminal.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** — landing page animations
- **DM Mono** — UI monospace font
- **Playfair Display** — hero display font

## Project Structure

```
alphaforge/
├── app/
│   ├── layout.tsx          # Root layout + Google Fonts
│   ├── globals.css         # Base styles + Tailwind directives
│   ├── page.tsx            # / → landing page
│   └── terminal/
│       └── page.tsx        # /terminal → Streamlit iframe shell
├── components/
│   ├── landing-page.tsx    # Full hero assembly
│   ├── terminal-shell.tsx  # Iframe wrapper + nav bar
│   └── ui/
│       ├── background-paths.tsx        # Animated SVG paths
│       ├── gradient-text.tsx           # Gradient title component
│       └── interactive-hover-button.tsx # CTA button
├── lib/
│   └── utils.ts            # cn() helper
├── .env.local              # NEXT_PUBLIC_STREAMLIT_URL
├── tailwind.config.ts
└── next.config.mjs
```

## Setup

```bash
# 1. Install
npm install

# 2. Configure Streamlit URL
# Edit .env.local:
NEXT_PUBLIC_STREAMLIT_URL=http://localhost:8501

# 3. Start Streamlit (separate terminal)
cd ../your-alphaforge-python-project
python -m streamlit run app.py

# 4. Start Next.js
npm run dev
# → http://localhost:3000
```

## Streamlit CORS / iframe

For local dev, Streamlit allows iframes by default.

For production (Streamlit Community Cloud), add this to your `config.toml` or `.streamlit/config.toml`:

```toml
[server]
enableCORS = false
enableXsrfProtection = false
headless = true
```

Or use `--server.enableCORS=false` when running Streamlit.

## Production Deployment

**Next.js** → Vercel (zero config, just push to GitHub and import)

Set `NEXT_PUBLIC_STREAMLIT_URL` in your Vercel environment variables.

**Streamlit** → Streamlit Community Cloud, Railway, or Render.

## Color System

All colors live in `tailwind.config.ts` under the `forge` namespace:

| Token            | Value     | Usage                        |
|------------------|-----------|------------------------------|
| `forge-bg`       | `#0b0b0b` | Page background              |
| `forge-surface`  | `#0f0f0d` | Nav bar, panels              |
| `forge-border`   | `#1a1a18` | Borders                      |
| `forge-text`     | `#c8c5bc` | Primary text                 |
| `forge-bright`   | `#e8e6e0` | High-contrast text           |
| `forge-pos`      | `#3d7a4a` | Long / profit / trending     |
| `forge-neg`      | `#7a3d3d` | Short / loss / high vol      |
| `forge-warn`     | `#7a6a3d` | Warning / choppy regime      |
