'use client';

import { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { startCheckoutAction } from '@/app/dashboard/billing/actions';
import {
	LETTER_PRICE_CENTS,
	MAX_LETTERS,
	MIN_LETTERS,
	formatUsd,
	lettersTotalCents,
	parseLetterQuantity,
} from '@/lib/billing-plans';
import SubmitButton from './SubmitButton';

const card =
	'flex w-full flex-col rounded-lg border border-base-100/10 bg-base-300 text-center lg:w-80';
const stepButton =
	'btn btn-secondary btn-square min-h-11 min-w-11 disabled:!border-base-100/10 disabled:!bg-base-200 disabled:!text-base-100/40';

/** Pay-as-you-go card. The buyer picks 1 to 50 credits and sees the total. */
export default function LettersCard({
	configured,
}: Readonly<{ configured: boolean }>) {
	const [value, setValue] = useState('5');
	const n = parseLetterQuantity(value);

	// The minus and plus buttons move the number by 1 and stay inside 1 to 50.
	function step(delta: number) {
		const current = n ?? MIN_LETTERS;
		const next = Math.min(MAX_LETTERS, Math.max(MIN_LETTERS, current + delta));
		setValue(String(next));
	}

	return (
		<form
			action={startCheckoutAction.bind(null, 'letters')}
			className={card}
		>
			<div className="flex flex-col items-center justify-center border-b border-primary p-6">
				<h3 className="text-5xl">
					{formatUsd(LETTER_PRICE_CENTS)}
					<span className="text-xl"> / credit</span>
				</h3>
				<p className="mt-1 text-sm text-base-100/70">Pay as you go</p>
			</div>
			<div className="flex flex-1 flex-col items-center p-6">
				<p className="mb-6 text-base-100">One credit writes one cover letter</p>
				<label htmlFor="letter-quantity" className="text-base-100">
					How many credits?
				</label>
				<div className="mt-2 flex items-center gap-2">
					<button
						type="button"
						className={stepButton}
						onClick={() => step(-1)}
						disabled={n !== null && n <= MIN_LETTERS}
						aria-label="Fewer credits"
						aria-controls="letter-quantity"
					>
						<FaMinus aria-hidden />
					</button>
					<input
						id="letter-quantity"
						name="quantity"
						type="number"
						inputMode="numeric"
						min={MIN_LETTERS}
						max={MAX_LETTERS}
						step={1}
						required
						value={value}
						onChange={(e) => setValue(e.target.value)}
						// Hide the browser's own spinner arrows; the purple buttons replace them.
						className="input input-bordered min-h-11 w-20 border-base-100/30 bg-base-300 text-center text-lg text-base-100 [appearance:textfield] focus:border-neutral [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					/>
					<button
						type="button"
						className={stepButton}
						onClick={() => step(1)}
						disabled={n !== null && n >= MAX_LETTERS}
						aria-label="More credits"
						aria-controls="letter-quantity"
					>
						<FaPlus aria-hidden />
					</button>
				</div>
				<p className="mt-1 text-sm text-base-100/70">
					{MIN_LETTERS} to {MAX_LETTERS} credits
				</p>
				<p className="mb-4 mt-4 text-base-100" aria-live="polite">
					{n === null
						? 'Enter a number from 1 to 50'
						: `Total: ${formatUsd(lettersTotalCents(n))}`}
				</p>
				<SubmitButton
					disabled={!configured || n === null}
					className="btn btn-primary mt-auto w-full"
				>
					{n === null ? 'Buy credits' : `Buy ${n} ${n === 1 ? 'credit' : 'credits'}`}
				</SubmitButton>
				<p className="mt-2 text-sm text-base-100/70">Credits never expire</p>
			</div>
		</form>
	);
}
