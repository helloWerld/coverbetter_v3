import bidiFactory from 'bidi-js';

export interface VisualRun {
	text: string;
	/** Odd levels are right-to-left runs. */
	level: number;
}

let bidi: ReturnType<typeof bidiFactory> | null = null;

/**
 * Splits one line into runs by bidi embedding level and returns them in
 * visual (left to right) order. Each run is still in logical order inside.
 * The caller draws each run left to right.
 */
export function visualRuns(line: string, base: 'ltr' | 'rtl'): VisualRun[] {
	if (!line) return [];
	bidi ??= bidiFactory();
	const { levels } = bidi.getEmbeddingLevels(line, base);
	const runs: VisualRun[] = [];
	for (let i = 0; i < line.length; i++) {
		const level = levels[i];
		const last = runs[runs.length - 1];
		if (last && last.level === level) last.text += line[i];
		else runs.push({ text: line[i], level });
	}
	// Rule L2: from the highest level down to the lowest odd level,
	// reverse every sequence of runs at that level or higher.
	let max = 0;
	let minOdd = Infinity;
	for (const r of runs) {
		if (r.level > max) max = r.level;
		if (r.level % 2 === 1 && r.level < minOdd) minOdd = r.level;
	}
	for (let lvl = max; lvl >= minOdd; lvl--) {
		for (let i = 0; i < runs.length; i++) {
			if (runs[i].level < lvl) continue;
			let j = i;
			while (j + 1 < runs.length && runs[j + 1].level >= lvl) j++;
			const part = runs.slice(i, j + 1).reverse();
			runs.splice(i, part.length, ...part);
			i = j;
		}
	}
	return runs;
}
