'use client';

import { useRef, useState } from 'react';
import type { PrepPackData } from '@/lib/prep/ai-prompt';
import AiPack from './AiPack';
import AskList from './AskList';
import type { ProfileItem } from './helpers';
import QuestionBank from './QuestionBank';
import { focus } from './styles';

const TABS = [
	['bank', 'Question bank'],
	['ai', 'AI prep pack'],
	['ask', 'Questions to ask'],
] as const;
type Tab = (typeof TABS)[number][0];

export default function PrepWorkspace({
	applicationId,
	defaultFamily,
	paid,
	initialPack,
	initialAnswers,
	items,
}: Readonly<{
	applicationId: string;
	defaultFamily: string;
	paid: boolean;
	initialPack: PrepPackData | null;
	initialAnswers: Record<string, string>;
	items: ProfileItem[];
}>) {
	const [tab, setTab] = useState<Tab>('bank');
	const [pack, setPack] = useState(initialPack);
	const [answers, setAnswers] = useState(initialAnswers);
	const refs = useRef<Record<string, HTMLButtonElement | null>>({});
	const bullets = items.filter((i) => i.kind === 'bullet');

	function onSaved(questionId: string, json: string) {
		setAnswers((a) => ({ ...a, [questionId]: json }));
	}

	function onKey(e: React.KeyboardEvent, i: number) {
		const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
		if (!d) return;
		e.preventDefault();
		const next = TABS[(i + d + TABS.length) % TABS.length][0];
		setTab(next);
		refs.current[next]?.focus();
	}

	return (
		<div className="flex flex-col gap-6">
			<div role="tablist" aria-label="Prep sections" className="flex flex-wrap gap-2">
				{TABS.map(([id, label], i) => (
					<button
						key={id}
						ref={(el) => {
							refs.current[id] = el;
						}}
						type="button"
						role="tab"
						id={`tab-${id}`}
						aria-selected={tab === id}
						aria-controls={`panel-${id}`}
						tabIndex={tab === id ? 0 : -1}
						onClick={() => setTab(id)}
						onKeyDown={(e) => onKey(e, i)}
						className={`btn min-h-11 ${focus} ${tab === id ? 'btn-secondary' : 'btn-outline border-base-100/30 text-base-100 hover:border-neutral hover:bg-base-200 hover:text-base-100'}`}
					>
						{label}
					</button>
				))}
			</div>

			<div role="tabpanel" id="panel-bank" aria-labelledby="tab-bank" hidden={tab !== 'bank'}>
				<QuestionBank applicationId={applicationId} defaultFamily={defaultFamily} answers={answers} bullets={bullets} onSaved={onSaved} />
			</div>
			<div role="tabpanel" id="panel-ai" aria-labelledby="tab-ai" hidden={tab !== 'ai'}>
				<AiPack applicationId={applicationId} paid={paid} pack={pack} onPack={setPack} answers={answers} items={items} onSaved={onSaved} />
			</div>
			<div role="tabpanel" id="panel-ask" aria-labelledby="tab-ask" hidden={tab !== 'ask'}>
				<AskList aiAsk={pack?.ask ?? []} />
			</div>
		</div>
	);
}
