/** Small RFC 4180 CSV parser. Pure, no dependencies. */

/** Parse CSV text into rows of cells. Handles quotes, "" escapes, line breaks in quotes, CRLF, BOM. */
function parseCells(input: string): string[][] {
	const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let inQuotes = false;
	let i = 0;
	while (i < text.length) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					cell += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
			} else {
				cell += c;
			}
			i++;
			continue;
		}
		if (c === '"') {
			inQuotes = true;
		} else if (c === ',') {
			row.push(cell);
			cell = '';
		} else if (c === '\r' || c === '\n') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			row.push(cell);
			rows.push(row);
			row = [];
			cell = '';
		} else {
			cell += c;
		}
		i++;
	}
	// The last line may have no line break.
	if (cell !== '' || row.length > 0) {
		row.push(cell);
		rows.push(row);
	}
	return rows;
}

/** Parse CSV text into records keyed by the header row. Blank lines are skipped. */
export function parseCsv(text: string): Record<string, string>[] {
	const cells = parseCells(text).filter((r) => r.some((c) => c.trim() !== ''));
	if (cells.length === 0) return [];
	const header = cells[0].map((h) => h.trim());
	return cells.slice(1).map((r) => {
		const rec: Record<string, string> = {};
		header.forEach((h, idx) => {
			if (h !== '') rec[h] = r[idx] ?? '';
		});
		return rec;
	});
}

/** Lowercase and drop everything except letters and digits. */
function norm(s: string): string {
	return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

/** True when the row has a column that matches one of the names. */
export function hasColumn(row: Record<string, string> | undefined, names: string[]): boolean {
	if (!row) return false;
	const wanted = new Set(names.map(norm));
	return Object.keys(row).some((k) => wanted.has(norm(k)));
}

/** First non-empty value among the candidate column names. Matching ignores case, spaces, and punctuation. */
export function pick(row: Record<string, string>, names: string[]): string {
	const byKey = new Map<string, string>();
	for (const k of Object.keys(row)) byKey.set(norm(k), row[k]);
	for (const n of names) {
		const v = byKey.get(norm(n));
		if (v !== undefined && v.trim() !== '') return v.trim();
	}
	return '';
}
