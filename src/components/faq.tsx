// Visible FAQ (indexable text) plus a matching FAQPage JSON-LD block generated
// from the same source, so Google and AI engines read exactly what users see.

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is a dollar-cost averaging (DCA) calculator?",
    a: "A dollar-cost averaging calculator shows what happens to your average cost per share when you buy more of a stock or crypto. This one is also an average-down and break-even calculator: it tells you how far the price has to move for you to get back to even. Use it for a single position, or upload your whole brokerage portfolio and run it on every holding at once.",
  },
  {
    q: "What's the difference between the Single Calculator and Upload Portfolio?",
    a: "The Single Calculator works one position at a time — type in your shares and average cost, or look up a live crypto price. Upload Portfolio reads your Charles Schwab CSV export and builds an average-down calculator card for every holding automatically.",
  },
  {
    q: "What can the Single Calculator work out?",
    a: "Three ways to average down: hit a target average (how many shares to buy to reach a chosen average cost), spend a fixed budget (what your new average becomes for a set dollar amount), or buy a set number of shares (your new average and total spent).",
  },
  {
    q: "Does it pull live prices?",
    a: "For crypto, yes — search a coin and it fills in the live price from CoinGecko, free and in your browser. For stocks, prices come from your uploaded Schwab file for now; live stock prices are on the roadmap.",
  },
  {
    q: "How does the portfolio upload work?",
    a: "Export your positions from Charles Schwab as a CSV file, drop it in, and each holding becomes its own average-down calculator. The file is read entirely in your browser and is never uploaded to any server.",
  },
  {
    q: "What can I do for each holding?",
    a: "Four modes, each with a slider: break-even bounce (how many shares to buy so a chosen percentage rebound gets you to even), buy shares (set a share count and see your new average plus the rise needed to break even), budget (set a dollar amount), and target average (DCA down to a specific average cost). Every mode shows exactly how far the price must rise for you to break even.",
  },
  {
    q: "What is the “Can't decide” box?",
    a: "Enter how much you have to invest and it checks every losing position, then names the one where that money needs the smallest price increase to break even — your easiest path back to green.",
  },
  {
    q: "Is averaging down a good idea?",
    a: "This is a calculator, not financial advice. It shows what a purchase does to your numbers, not whether it's wise. Averaging down adds money to a position that has already lost value; if it keeps falling, a lower average cost means larger losses, not smaller. Do your own research.",
  },
  {
    q: "Do you store my data?",
    a: "No. Everything runs in your browser — no accounts, no server, nothing uploaded. Nothing is saved between visits unless you turn on “Remember on this device,” which keeps your data only on your own computer.",
  },
  {
    q: "Is it free?",
    a: "Yes — completely free, with no sign-up.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function Faq() {
  return (
    <section className="py-12 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-6 tracking-tight">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm"
            >
              <summary className="cursor-pointer list-none font-semibold text-slate-800 flex items-center justify-between gap-3">
                {f.q}
                <span className="text-slate-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
