'use client';

import { useMemo, useState } from 'react';
import { toLetterDoc, type TemplateId } from '@/lib/templates';
import DownloadButtons from './DownloadButtons';
import LetterPreview from './LetterPreview';
import TemplateSwitcher from './TemplateSwitcher';

/** Sample letter in the preview with the template switcher and downloads. Nothing is saved. */
export default function SampleViewer({
	body,
	company,
}: Readonly<{ body: string; company: string }>) {
	const [template, setTemplate] = useState<TemplateId>('classic');
	const [today] = useState(() => new Date());
	const doc = useMemo(() => toLetterDoc(body, today), [body, today]);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end gap-x-6 gap-y-4">
				<TemplateSwitcher value={template} onChange={setTemplate} />
				<div className="flex flex-wrap gap-2">
					<DownloadButtons getDoc={() => doc} template={template} company={company} />
				</div>
			</div>
			<div className="mx-auto w-full max-w-xl">
				<LetterPreview doc={doc} template={template} />
			</div>
		</div>
	);
}
