'use client';

import { useState } from 'react';
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

/** Pay-as-you-go card. The buyer picks 1 to 50 letters and sees the total. */
export default function LettersCard({
	configured,
}: Readonly<{ configured: boolean }>) {
	const [value, setValue] = useState('5');
	const n = parseLetterQuantity(value);

	return (
		<form
			action={startCheckoutAction.bind(null, 'letters')}
			className={card}
		>
			<div className="flex flex-col items-center justify-center border-b border-primary p-6">
				<h3 className="text-5xl">
					{formatUsd(LETTER_PRICE_CENTS)}
					<span className="text-xl"> / letter</span>
				</h3>
				<p className="mt-1 text-sm text-base-100/70">Pay as you go</p>
			</div>
			<div className="flex flex-1 flex-col items-center p-6">
				<label htmlFor="letter-quantity" className="text-base-100">
					How many letters?
				</label>
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
					className="input input-bordered mt-2 min-h-11 w-28 border-base-100/30 bg-base-300 text-center text-base-100 focus:border-neutral"
				/>
				<p className="mt-1 text-sm text-base-100/70">
					{MIN_LETTERS} to {MAX_LETTERS} letters
				</p>
				<p className="mt-4 text-base-100" aria-live="polite">
					{n === null
						? 'Enter a number from 1 to 50'
						: `Total: ${formatUsd(lettersTotalCents(n))}`}
				</p>
				<p className="mt-1 text-sm text-base-100/70">Letters never expire</p>
				<SubmitButton
					disabled={!configured || n === null}
					className="btn btn-primary mt-auto w-full"
				>
					{n === null ? 'Buy letters' : `Buy ${n} ${n === 1 ? 'letter' : 'letters'}`}
				</SubmitButton>
			</div>
		</form>
	);
}
