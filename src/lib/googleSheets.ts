export type SheetResearchItem = {
  title: string;
  author: string;
  year: string;
  category: string;
  type: string;
  description: string;
  url: string;
};

const SHEET_ID = "1YMeIyVJXZF14OIc2kx61TVmGmSkRXBsE2DvqYH2NMHA";

function parseCsvLine(line: string) {
  return line
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((cell) => cell.replace(/^"|"$/g, "").replace(/""/g, '"').trim());
}

export async function getResearchItemsFromSheet(): Promise<SheetResearchItem[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch research sheet");
  }

  const csv = await response.text();
  const rows = csv.trim().split("\n").map(parseCsvLine);

  const [headers, ...dataRows] = rows;

  return dataRows
    .map((row) => {
      const item = Object.fromEntries(
        headers.map((header, index) => [header, row[index] ?? ""])
      ) as SheetResearchItem;

      return item;
    })
    .filter((item) => item.title && item.url);
}