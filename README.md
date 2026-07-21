# Average Down Calculator

A dollar-cost-averaging calculator that shows what a follow-up purchase does to your cost basis.

**Live:** https://officinaprima.github.io/dca/

Enter your current position once — shares held, original average price, current market price — then pick how you want to think about the next buy:

| Mode | You enter | You get |
| --- | --- | --- |
| **Hit Target Average** | the average you want to end up at | shares to buy, total cost |
| **Spend Fixed Budget** | dollars you have available | shares purchasable, new blended average |
| **Buy Custom Amount** | number of shares to buy | new blended average, total spent |

Your inputs carry across all three modes, so you can flip between them without retyping.

If the current market price is *above* your original average, the app warns you that the purchase will raise your cost basis rather than lower it.

## Not investment advice

This is arithmetic, not a recommendation. It tells you what a purchase would do to your average cost per share — nothing more. It does not know whether the purchase is a good idea.

Averaging down increases your exposure to a position that has already moved against you. If the price keeps falling, a lower average cost means larger losses, not smaller ones. A lower average is not the same thing as a better outcome. Do your own research, and consider talking to a licensed financial advisor before committing money.

## Privacy

Everything runs in your browser. There is no backend, no database, no analytics, and no network request carrying your numbers anywhere. Nothing you type is stored or transmitted.

## Running it locally

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/OfficinaPrima/dca.git
cd dca
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server with hot reload |
| `npm run build` | type-check, then build to `dist/` |
| `npm run preview` | serve the built output locally |
| `npm run typecheck` | type-check only |
| `npm run deploy` | build and publish to the live site |

## Deploying

The live site is served from the `gh-pages` branch. After committing a change to `main`:

```bash
npm run deploy
```

That builds the site, pushes the result to `gh-pages`, and GitHub Pages picks it up within a minute or so.

## How it's built

React 19, TypeScript, Vite 7, Tailwind CSS 4, framer-motion for animation, lucide-react for icons. No backend.

```
src/
├── main.tsx                        entry point
├── index.css                       theme tokens and base styles
├── lib/utils.ts                    number parsing and formatting
└── components/
    ├── ui/number-input.tsx         numeric text field
    └── calculator/
        ├── calculator.tsx          all three modes and their math
        ├── result-card.tsx         result display
        └── warning-banner.tsx      averaging-up warning
```

## The math

With `s` shares held at average `a`, buying `n` shares at price `p`:

**New average** — used by *Spend Fixed Budget* and *Buy Custom Amount*:

```
newAvg = (s × a + n × p) / (s + n)
```

**Shares needed to reach a target average `t`** — used by *Hit Target Average*, derived by solving the above for `n`:

```
n = s × (t - a) / (p - t)
```

This has no valid solution when `t` equals `p` (division by zero), or when `t` falls outside the range between `p` and `a` — you cannot average down to below the price you are paying. The app reports both cases as errors rather than showing a nonsense number.

## History

Originally prototyped on Replit, then extracted into this standalone repo. The carve-out dropped an unused API server, an unused Postgres/Drizzle layer, an unused OpenAPI codegen step, ~45 unused UI components, and a pnpm monorepo — none of which the calculator touched — and fixed a bug where the tab switcher changed state but never swapped the visible panel, leaving two of the three modes unreachable.

## License

MIT — see [LICENSE](LICENSE).
