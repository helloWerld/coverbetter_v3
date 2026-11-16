import { unzipSync } from 'fflate';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 60;

/** Read the CSV files of a LinkedIn export ZIP. Keys are the paths inside the ZIP. Runs in the browser. */
export function readLinkedInZip(bytes: Uint8Array): Record<string, string> {
	let count = 0;
	const entries = unzipSync(bytes, {
		filter: (file) => {
			if (!file.name.toLowerCase().endsWith('.csv')) return false;
			if (file.originalSize > MAX_FILE_BYTES) return false;
			if (count >= MAX_FILES) return false;
			count++;
			return true;
		},
	});
	const decoder = new TextDecoder('utf-8');
	const out: Record<string, string> = {};
	for (const [name, data] of Object.entries(entries)) out[name] = decoder.decode(data);
	return out;
}
