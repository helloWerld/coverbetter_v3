import {
	PDFDocument,
	PDFHexString,
	StandardFonts,
	beginText,
	endText,
	popGraphicsState,
	pushGraphicsState,
	rgb,
	setFillingColor,
	setFontAndSize,
	setTextMatrix,
	showText,
	type PDFFont,
	type PDFPage,
} from 'pdf-lib';
import { visualRuns } from './bidi-layout';
import type { FontSet } from './languages';

/** Reads the bytes of a font file in public/fonts, or of the HarfBuzz wasm. */
export interface FontIO {
	font: (file: string) => Promise<Uint8Array>;
	wasm: () => Promise<Uint8Array>;
}

const cache = new Map<string, Promise<Uint8Array>>();
function fetchBytes(url: string): Promise<Uint8Array> {
	let p = cache.get(url);
	if (!p) {
		p = fetch(url).then((r) => {
			if (!r.ok) throw new Error(`Could not load ${url}`);
			return r.arrayBuffer().then((b) => new Uint8Array(b));
		});
		p.catch(() => cache.delete(url));
		cache.set(url, p);
	}
	return p;
}

/** Browser source: fetches from /fonts and /wasm. Results are cached. */
export const browserFontIO: FontIO = {
	font: (file) => fetchBytes(`/fonts/${file}`),
	wasm: () => fetchBytes('/wasm/harfbuzz-subset.wasm'),
};

// ---------- HarfBuzz subsetting (CJK only) ----------

interface HbExports {
	memory: WebAssembly.Memory;
	malloc(n: number): number;
	free(p: number): void;
	[k: string]: any;
}
let hbPromise: Promise<HbExports> | null = null;
function loadHb(io: FontIO): Promise<HbExports> {
	hbPromise ??= io
		.wasm()
		.then((bytes) => WebAssembly.instantiate(bytes as BufferSource))
		.then((r) => (r as unknown as WebAssembly.WebAssemblyInstantiatedSource).instance.exports as unknown as HbExports);
	hbPromise.catch(() => {
		hbPromise = null;
	});
	return hbPromise;
}

/** Cuts a font down to the code points in `text`. */
export async function subsetFont(io: FontIO, bytes: Uint8Array, text: string): Promise<Uint8Array> {
	const hb = await loadHb(io);
	const ptr = hb.malloc(bytes.byteLength);
	new Uint8Array(hb.memory.buffer).set(bytes, ptr);
	const blob = hb.hb_blob_create(ptr, bytes.byteLength, 2, 0, 0);
	const face = hb.hb_face_create(blob, 0);
	hb.hb_blob_destroy(blob);
	const input = hb.hb_subset_input_create_or_fail();
	const set = hb.hb_subset_input_unicode_set(input);
	for (const ch of text) hb.hb_set_add(set, ch.codePointAt(0));
	const sub = hb.hb_subset_or_fail(face, input);
	hb.hb_subset_input_destroy(input);
	const rb = hb.hb_face_reference_blob(sub);
	const off = hb.hb_blob_get_data(rb, 0);
	const len = hb.hb_blob_get_length(rb);
	// Read the buffer again: the wasm memory can grow during subsetting.
	const out = new Uint8Array(hb.memory.buffer).slice(off, off + len);
	hb.hb_blob_destroy(rb);
	hb.hb_face_destroy(sub);
	hb.hb_face_destroy(face);
	hb.free(ptr);
	return out;
}

// ---------- Faces and fallback ----------

interface Face {
	font: PDFFont;
	has: Set<number>;
}

const PRIMARY_FILES: Record<Exclude<FontSet, 'standard'>, { regular: string; bold: string; cjk: boolean }> = {
	'noto-latin': { regular: '', bold: '', cjk: false }, // resolved by `serif`
	'noto-sc': { regular: 'NotoSansSC-Regular.ttf', bold: 'NotoSansSC-Regular.ttf', cjk: true },
	'noto-jp': { regular: 'NotoSansJP-Regular.ttf', bold: 'NotoSansJP-Regular.ttf', cjk: true },
	'noto-kr': { regular: 'NotoSansKR-Regular.ttf', bold: 'NotoSansKR-Regular.ttf', cjk: true },
	'noto-arabic': { regular: 'NotoSansArabic-Regular.ttf', bold: 'NotoSansArabic-Bold.ttf', cjk: false },
	'noto-devanagari': { regular: 'NotoSansDevanagari-Regular.ttf', bold: 'NotoSansDevanagari-Bold.ttf', cjk: false },
};

/** Characters kept as they are. They join the font of the text before them. */
const JOINERS = /[​-‍⁠︀-️]/;
/** Direction marks. The bidi step handles direction, so these are dropped. */
const DIRECTION_MARKS = /[‎‏‪-‮⁦-⁩﻿]/g;

const COMBINING = /[\p{M}]/u;

interface Shaped {
	/** Glyph ids as 4 digit hex, one per glyph, in drawing order. */
	codes: string[];
	/** Offsets and advances in points per unit of font size. */
	dx: number[];
	dy: number[];
	adv: number[];
}

/**
 * Lays out text with fontkit, GPOS included. pdf-lib drops the GPOS offsets and
 * keeps the full advance of mark glyphs, so Arabic dots and Devanagari matras
 * land in the wrong place. This keeps them. The glyph ids come from pdf-lib
 * (`encodeText`), so the font subset stays correct.
 */
function shape(font: PDFFont, text: string): Shaped {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const emb = (font as any).embedder;
	const run = emb.font.layout(text, emb.fontFeatures);
	const hex = font.encodeText(text).asString();
	const upm: number = emb.font.unitsPerEm;
	const n: number = run.glyphs.length;
	const out: Shaped = { codes: [], dx: [], dy: [], adv: [] };
	for (let i = 0; i < n; i++) {
		const pos = run.positions[i];
		out.codes.push(hex.slice(i * 4, i * 4 + 4));
		out.dx.push(pos.xOffset / upm);
		out.dy.push(pos.yOffset / upm);
		out.adv.push(pos.xAdvance / upm);
	}
	return out;
}

/** Eastern Arabic digits are left to right, but fontkit lays them out as Arabic. */
const AN_DIGITS = /[\u0660-\u0669\u06f0-\u06f9\u066b\u066c]+/g;
const fixDigits = (t: string) => t.replace(AN_DIGITS, (m) => Array.from(m).reverse().join(''));

interface Segment {
	text: string;
	face: Face;
}

export interface TextFace {
	/** True for CJK fonts: a line may break between any two CJK characters. */
	breaksBetweenCjk?: boolean;
	/** Replaces tabs and characters that no font has. */
	clean(text: string): string;
	width(text: string, size: number): number;
	/** Draws the text with its left edge at x. */
	draw(page: PDFPage, text: string, x: number, y: number, size: number, hex: string): void;
}

function color(hex: string) {
	const n = parseInt(hex.slice(1), 16);
	return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

class StandardFace implements TextFace {
	constructor(private font: PDFFont) {}
	clean(text: string): string {
		const ok = new Set(this.font.getCharacterSet());
		return Array.from(text.replace(/\t/g, '    '))
			.map((ch) => {
				if (ok.has(ch.codePointAt(0)!)) return ch;
				if (ch === '→') return '->';
				return '?';
			})
			.join('');
	}
	width(text: string, size: number) {
		return this.font.widthOfTextAtSize(text, size);
	}
	draw(page: PDFPage, text: string, x: number, y: number, size: number, hex: string) {
		page.drawText(text, { x, y, size, font: this.font, color: color(hex) });
	}
}

/** A font list: the script font first, then fallbacks for characters it lacks. */
class StackFace implements TextFace {
	constructor(
		private faces: Face[],
		private rtl: boolean,
		readonly breaksBetweenCjk = false,
	) {}

	clean(text: string): string {
		let out = '';
		for (const ch of text.replace(/\t/g, '    ').replace(DIRECTION_MARKS, '')) {
			const cp = ch.codePointAt(0)!;
			if (JOINERS.test(ch) || this.faces.some((f) => f.has.has(cp))) out += ch;
			else if (ch === '→') out += '->';
			else out += '?';
		}
		return out;
	}

	private segments(text: string): Segment[] {
		const out: Segment[] = [];
		let cur: Face | null = null;
		for (const ch of text) {
			const cp = ch.codePointAt(0)!;
			let face: Face | null = cur;
			// Stay with the current font when it has the character, so a run stays whole.
			if (!face || !(face.has.has(cp) || JOINERS.test(ch) || COMBINING.test(ch))) {
				face = this.faces.find((f) => f.has.has(cp)) ?? cur ?? this.faces[0];
			}
			const last = out[out.length - 1];
			if (last && last.face === face) last.text += ch;
			else out.push({ text: ch, face });
			cur = face;
		}
		return out;
	}

	private segWidth(segs: Segment[], size: number) {
		let w = 0;
		for (const s of segs) {
			for (const a of shape(s.face.font, fixDigits(s.text)).adv) w += a * size;
		}
		return w;
	}

	/** pdf-lib ignores GPOS, so a space is a fixed width taken from the script font. */
	private space(size: number) {
		return shape(this.faces[0].font, ' ').adv[0] * size;
	}

	width(text: string, size: number): number {
		if (this.rtl) {
			return visualRuns(text, 'rtl').reduce(
				(w, r) => w + this.segWidth(this.segments(r.text), size),
				0,
			);
		}
		const words = text.split(' ');
		let w = (words.length - 1) * this.space(size);
		for (const word of words) w += this.segWidth(this.segments(word), size);
		return w;
	}

	draw(page: PDFPage, text: string, x: number, y: number, size: number, hex: string) {
		const c = color(hex);
		const put = (seg: Segment) => {
			const font = seg.face.font;
			const sh = shape(font, fixDigits(seg.text));
			const key = page.node.newFontDictionary(font.name, font.ref);
			const ops = [pushGraphicsState(), beginText(), setFillingColor(c), setFontAndSize(key, size)];
			for (let i = 0; i < sh.codes.length; i++) {
				ops.push(
					setTextMatrix(1, 0, 0, 1, x + sh.dx[i] * size, y + sh.dy[i] * size),
					showText(PDFHexString.of(sh.codes[i])),
				);
				x += sh.adv[i] * size;
			}
			ops.push(endText(), popGraphicsState());
			page.pushOperators(...ops);
		};
		if (this.rtl) {
			for (const run of visualRuns(text, 'rtl')) {
				const segs = this.segments(run.text);
				// Inside a right-to-left run, fontkit reverses glyphs per segment.
				// The segments themselves go in reverse order.
				if (run.level % 2 === 1) segs.reverse();
				segs.forEach(put);
			}
			return;
		}
		const sp = this.space(size);
		text.split(' ').forEach((word, i) => {
			if (i > 0) x += sp;
			this.segments(word).forEach(put);
		});
	}
}

export interface FaceSet {
	regular: TextFace;
	bold: TextFace;
}

/** The built-in PDF fonts. No download. */
export async function standardFaces(pdf: PDFDocument, serif: boolean): Promise<FaceSet> {
	const regular = await pdf.embedFont(StandardFonts[serif ? 'TimesRoman' : 'Helvetica']);
	const bold = await pdf.embedFont(StandardFonts[serif ? 'TimesRomanBold' : 'HelveticaBold']);
	return { regular: new StandardFace(regular), bold: new StandardFace(bold) };
}

/**
 * Noto fonts for the other languages. `text` is every string in the letter.
 * It decides which characters the CJK fonts keep.
 */
export async function notoFaces(
	pdf: PDFDocument,
	fontSet: Exclude<FontSet, 'standard'>,
	serif: boolean,
	text: string,
	io: FontIO,
	rtl: boolean,
): Promise<FaceSet> {
	const fontkit = (await import('@pdf-lib/fontkit')).default;
	// The Devanagari shaper in fontkit needs this global.
	await import('regenerator-runtime/runtime.js' as string);
	pdf.registerFontkit(fontkit);

	const embed = async (bytes: Uint8Array, subset: boolean): Promise<Face> => {
		const font = await pdf.embedFont(bytes, { subset });
		return { font, has: new Set(font.getCharacterSet()) };
	};

	const latinReg = serif ? 'NotoSerif-Regular.ttf' : 'NotoSans-Regular.ttf';
	const latinBold = serif ? 'NotoSerif-Bold.ttf' : 'NotoSans-Bold.ttf';
	const spec = PRIMARY_FILES[fontSet];
	const regFile = fontSet === 'noto-latin' ? latinReg : spec.regular;
	const boldFile = fontSet === 'noto-latin' ? latinBold : spec.bold;

	const chars = Array.from(new Set(Array.from(text + ' ?')))
		.join('')
		.replace(DIRECTION_MARKS, '');

	// The Latin and CJK files go through HarfBuzz. pdf-lib's own subsetting drops
	// glyphs from these files. Arabic and Devanagari must keep their full font
	// tables for shaping, so pdf-lib subsets those.
	const latin = async (file: string): Promise<Face> =>
		embed(await subsetFont(io, await io.font(file), chars), false);
	const primary = async (file: string): Promise<Face> =>
		spec.cjk || fontSet === 'noto-latin'
			? latin(file)
			: embed(await io.font(file), true);

	const regPrimary = await primary(regFile);
	const boldPrimary = boldFile === regFile ? regPrimary : await primary(boldFile);

	const regStack = [regPrimary];
	const boldStack = [boldPrimary];
	if (fontSet !== 'noto-latin') {
		regStack.push(await latin(latinReg));
		boldStack.push(await latin(latinBold));
	}
	return {
		regular: new StackFace(regStack, rtl, spec.cjk),
		bold: new StackFace(boldStack, rtl, spec.cjk),
	};
}
