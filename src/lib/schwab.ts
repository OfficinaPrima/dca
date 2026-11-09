export interface Holding {
  symbol: string;
  description: string;
  shares: number;
  currentPrice: number;
  costBasis: number;
  avgCost: number;
  marketValue: number;
  gainPct: number;
  assetType: string;
}

export interface ParseResult {
  holdings: Holding[];
  error: string | null;
}

// Parse one CSV line, honoring double-quoted fields. Schwab wraps any value
// that contains a comma in quotes, e.g. "$1,441.65".
function parseLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

// Strip $, commas, %, quotes and spaces; return a number (NaN if not parseable).
function num(raw: string | undefined): number {
  if (!raw) return NaN;
  const cleaned = raw.replace(/[$,%\s"]/g, "");
  if (cleaned === "" || cleaned === "--") return NaN;
  return parseFloat(cleaned);
}

/**
 * Parse a Charles Schwab positions export (CSV) into tradeable holdings.
 * Skips any leading rows, the Cash line, and the Positions Total line.
 * Schwab reports a total Cost Basis per row, not a per-share average, so the
 * average cost is derived as costBasis / shares.
 */
export function parseSchwabCsv(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const headerIdx = lines.findIndex(
    (l) => parseLine(l)[0]?.trim().toLowerCase() === "symbol",
  );
  if (headerIdx === -1) {
    return {
      holdings: [],
      error:
        "This doesn't look like a Schwab positions export — no 'Symbol' header row found.",
    };
  }

  const holdings: Holding[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    const symbol = (cells[0] ?? "").trim();
    if (!symbol) continue;
    if (/^positions total$/i.test(symbol)) continue;
    if (/^cash/i.test(symbol)) continue;

    const assetType = (cells[14] ?? "").trim();
    if (/cash|money market/i.test(assetType)) continue;

    const shares = num(cells[2]);
    if (!(shares > 0)) continue;

    const costBasis = num(cells[9]);
    holdings.push({
      symbol,
      description: (cells[1] ?? "").trim(),
      shares,
      currentPrice: num(cells[3]),
      costBasis,
      avgCost: costBasis > 0 ? costBasis / shares : NaN,
      marketValue: num(cells[6]),
      gainPct: num(cells[11]),
      assetType: assetType || "Equity",
    });
  }

  if (holdings.length === 0) {
    return { holdings: [], error: "No tradeable positions found in this file." };
  }
  return { holdings, error: null };
}
