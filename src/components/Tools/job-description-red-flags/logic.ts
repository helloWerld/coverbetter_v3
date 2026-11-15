// A fixed list of phrases and patterns that often show up in job posts, and what they CAN mean.
// No AI. One phrase is never proof of a bad job: each note says what to ask.

export type Category = 'scam' | 'pay' | 'workload' | 'role';

/** The order the tool shows the categories. Scam signs come first. */
export const CATEGORIES: { id: Category; label: string }[] = [
	{ id: 'scam', label: 'Scam signs' },
	{ id: 'pay', label: 'Pay' },
	{ id: 'workload', label: 'Workload and culture' },
	{ id: 'role', label: 'Vague role' },
];

export type Flag = {
	id: string;
	category: Category;
	/** Short name for the card. */
	label: string;
	/** A regular expression source. Case-insensitive. Word boundaries are written in the source. Empty for checks done in code. */
	pattern: string;
	/** What it CAN mean. Balanced, not an accusation. */
	canMean: string;
	/** A question to ask in the interview, or a check to make. */
	ask: string;
	/** Match only when the post shows no pay figure. */
	onlyWithoutPay?: boolean;
};

export const FLAGS: Flag[] = [
	// Scam signs
	{
		id: 'scam-fee',
		category: 'scam',
		label: 'Asks you to pay a fee',
		pattern: String.raw`\b(?:(?:training|application|registration|processing|background[- ]check|starter[- ]kit|onboarding|software|certification) fees?|pay (?:a|an|the|for your own) (?:fee|deposit|kit|training|background check))\b`,
		canMean: 'A real employer does not charge you to apply or to start. A fee is a very common sign of a scam.',
		ask: 'Do not pay. Check the company on its own website and search its name with the word "scam".',
	},
	{
		id: 'scam-equipment',
		category: 'scam',
		label: 'Buy equipment, get paid back later',
		pattern: String.raw`\b(?:buy|purchase|order)\b[^.\n]{0,60}\b(?:equipment|laptop|computer|software|supplies|gift cards?)\b[^.\n]{0,60}\breimburs\w*|\breimburs\w*[^.\n]{0,60}\b(?:equipment|laptop|computer|gift cards?)\b`,
		canMean: 'Some real employers do reimburse costs. Scams use this to take your money or to send you a fake check.',
		ask: 'Ask for the equipment to come from the company. Do not spend your own money before you have a signed offer from a company you checked.',
	},
	{
		id: 'scam-check',
		category: 'scam',
		label: 'Check deposit',
		pattern: String.raw`\b(?:cashier'?s check|(?:send|mail) you a check|deposit (?:a|the|this) check|check deposit|mobile deposit|certified check)\b`,
		canMean: 'A fake check scam sends you a check, asks you to send part of it back, and the check later bounces.',
		ask: 'Do not deposit a check from an employer you have not checked, and never send money back from it.',
	},
	{
		id: 'scam-chat',
		category: 'scam',
		label: 'Interview only on a chat app',
		pattern: String.raw`\b(?:telegram|whatsapp|whats app|signal (?:app|messenger|chat)|on signal|via signal|hangouts chat)\b`,
		canMean: 'Some small teams use chat apps. Scams use them to move you away from job sites that can track them.',
		ask: 'Ask for a video call or a phone call with a named person, and check that the person works at the company.',
	},
	{
		id: 'scam-bank',
		category: 'scam',
		label: 'Asks for bank details or SSN',
		pattern: String.raw`\b(?:social security (?:number|card)|ssn|bank account (?:number|details|information)|routing number|bank (?:details|information|login))\b`,
		canMean: 'A real employer asks for these after you accept an offer, on a secure form. Before an offer, it is a common scam.',
		ask: 'Do not send these before a written offer. Ask how the company keeps this data safe.',
	},
	{
		id: 'scam-email',
		category: 'scam',
		label: 'Personal email address for a company',
		pattern: String.raw`\b[a-z0-9._%+-]+@(?:gmail|yahoo|outlook|hotmail|aol|icloud|proton(?:mail)?|mail)\.(?:com|me)\b`,
		canMean: 'Very small businesses sometimes use a personal address. Larger companies use their own domain.',
		ask: 'Look for the company website and a company email address. Check that both belong to the same company.',
	},
	{
		id: 'scam-no-exp-high-pay',
		category: 'scam',
		label: 'No experience needed plus very high pay',
		pattern: '',
		canMean: 'Pay that is far above the market for a job that needs no experience is a common scam sign. Real entry-level jobs exist, but they pay in line with the work.',
		ask: 'Compare the pay with similar jobs on trusted salary sites. Ask what a normal week looks like.',
	},
	{
		id: 'scam-no-exp',
		category: 'scam',
		label: 'No experience needed',
		pattern: String.raw`\bno (?:prior |previous )?(?:experience|skills|resume|interview)(?: is)? (?:needed|necessary|required)\b|\bno (?:experience|resume|interview)\b`,
		canMean: 'Many real entry-level jobs need no experience. It is a warning only together with high pay, a fee, or pressure.',
		ask: 'Ask what training the company gives and who will be your manager.',
	},
	{
		id: 'scam-high-pay',
		category: 'scam',
		label: 'Very high pay claim',
		pattern: String.raw`\$\s?\d{3,}\s?(?:/|per|an?|each)\s?(?:hour|hr)\b|\$\s?\d{1,3},\d{3}\s?(?:/|per|a|each|every)\s?(?:week|wk|month|mo)\b|\bearn \$\s?\d[\d,]*\+? (?:daily|a day|per day|weekly)\b`,
		canMean: 'Some jobs pay well. A very high pay claim for simple work is a common scam sign.',
		ask: 'Ask how the pay is worked out and who has been paid this amount in this role.',
	},
	{
		id: 'scam-urgent',
		category: 'scam',
		label: 'Urgency: hired today',
		pattern: String.raw`\b(?:hire[d]? (?:today|immediately|on the spot|right away)|start (?:today|immediately|tomorrow)|apply (?:now|today) (?:or|before)|immediate(?:ly)? hiring|urgently hiring|limited spots?|act fast|positions? fill(?:ing)? fast)\b`,
		canMean: 'Some real employers hire fast. Scams use pressure so that you do not stop to check.',
		ask: 'Take your time. A real offer will still be there after you check the company.',
	},
	{
		id: 'scam-no-interview',
		category: 'scam',
		label: 'No interview',
		pattern: String.raw`\b(?:no interview|hired without (?:an )?interview|skip the interview|instant(?:ly)? hired)\b`,
		canMean: 'A real hire almost always has a conversation first. A job with no interview can be a scam.',
		ask: 'Ask who will interview you and when. Check the name of the person on the company site.',
	},
	{
		id: 'scam-easy-money',
		category: 'scam',
		label: 'Easy money',
		pattern: String.raw`\b(?:easy money|make money fast|get paid to (?:click|like|type|chat)|earn money (?:from|at) home|be your own boss)\b`,
		canMean: 'Some posts use these words for real gig work. They are also common in scams and in sales schemes.',
		ask: 'Ask exactly what you do each day, who pays you, and when you are paid.',
	},
	{
		id: 'scam-process-payments',
		category: 'scam',
		label: 'Handle payments or move money',
		pattern: String.raw`\b(?:payment processor|process payments for|reship(?:ping)?|package forwarding|forward packages|receive packages at home|transfer funds|wire (?:funds|money))\b`,
		canMean: 'A real finance job has a company, a contract, and company systems. Moving money or packages from your home is a common scam.',
		ask: 'Ask which company owns the money or the goods, and check that company.',
	},
	{
		id: 'scam-reply-privately',
		category: 'scam',
		label: 'Contact by text or private number',
		pattern: String.raw`\b(?:text (?:us|me|our recruiter|this number)|contact (?:us )?(?:by|via|through) text|send (?:us )?a text)\b`,
		canMean: 'Some recruiters use text messages. A post with only a personal phone number and no company site needs a check.',
		ask: 'Look for the company on its own website. Ask for an email from a company domain.',
	},

	// Pay
	{
		id: 'pay-no-range',
		category: 'pay',
		label: 'No pay range found',
		pattern: '',
		canMean: 'The post may leave out pay because the company has not set it, or because the rules in your state do not ask for it. Some employers hide pay on purpose.',
		ask: 'What is the pay range for this role? Ask this early, before you spend time on interviews.',
	},
	{
		id: 'pay-competitive',
		category: 'pay',
		label: '"Competitive salary" with no number',
		pattern: String.raw`\bcompetitive (?:salary|pay|compensation|wages?|rates?)\b`,
		canMean: 'It can mean that the pay is in line with the market. With no number, you cannot check that.',
		ask: 'What is the salary range for this role, and how did you set it?',
		onlyWithoutPay: true,
	},
	{
		id: 'pay-unlimited-pto',
		category: 'pay',
		label: 'Unlimited PTO',
		pattern: String.raw`\bunlimited (?:pto|paid time off|vacation|time off|leave|holidays?|pto policy)\b`,
		canMean: 'It can be a real benefit. In some companies, people take fewer days than with a fixed number, and unused days are not paid out when you leave.',
		ask: 'How many days did people on this team take last year? Is there a minimum?',
	},
	{
		id: 'pay-commission-only',
		category: 'pay',
		label: 'Commission only',
		pattern: String.raw`\b(?:commission[- ]only|100% commission|straight commission|no base (?:salary|pay)|commission[- ]based (?:pay|income))\b`,
		canMean: 'Some sales jobs pay only commission. You carry the risk, and you may earn nothing in a slow month.',
		ask: 'What did a new person on this team earn in their first 6 months, and is there a base or a draw?',
	},
	{
		id: 'pay-uncapped',
		category: 'pay',
		label: 'Uncapped earning potential',
		pattern: String.raw`\b(?:uncapped|unlimited|unrestricted) (?:earning|earnings|income|commissions?|bonus(?:es)?)(?: potential)?\b|\bearning potential\b`,
		canMean: 'It can mean that good sales results pay well. It can also mean that the base pay is low.',
		ask: 'What is the base pay? What share of the team reaches the top of the range?',
	},
	{
		id: 'pay-earn-up-to',
		category: 'pay',
		label: '"Earn up to" a number',
		pattern: String.raw`\b(?:earn|make|paying|pay) up to\b`,
		canMean: 'The top number may be rare. The usual pay may be much lower.',
		ask: 'What is the usual pay for this role, and not the top?',
	},
	{
		id: 'pay-doe',
		category: 'pay',
		label: 'Pay depends on experience',
		pattern: String.raw`\b(?:doe|depending on experience|dependent on experience|based on experience|commensurate with experience)\b`,
		canMean: 'It can be fair, since pay differs by level. It can also leave room to offer you less.',
		ask: 'What range do you have for my level of experience?',
	},
	{
		id: 'pay-unpaid',
		category: 'pay',
		label: 'Unpaid trial or "exposure"',
		pattern: String.raw`\b(?:unpaid (?:trial|test|training|work|shift|period)|trial (?:period|week|shift) (?:is )?unpaid|paid in exposure|work for exposure|volunteer position)\b`,
		canMean: 'Volunteer and some student roles are unpaid by design. A paid job with an unpaid trial may break wage rules in some places.',
		ask: 'Is any part of this process unpaid? If yes, what is the reason, and how long is it?',
	},
	{
		id: 'pay-contractor',
		category: 'pay',
		label: 'Contractor (1099) pay',
		pattern: String.raw`\b(?:1099|independent contractor|contract-to-hire|contract to hire|paid per (?:task|project|piece|job))\b`,
		canMean: 'Contract work can suit some people. You usually pay your own taxes and get no benefits.',
		ask: 'Is this employee (W-2) or contractor (1099) work? Which benefits and expenses are included?',
	},
	{
		id: 'pay-performance',
		category: 'pay',
		label: 'Pay based on performance',
		pattern: String.raw`\b(?:performance[- ]based (?:pay|compensation|income)|pay (?:is )?based on performance|pay for performance|bonus potential|six[- ]figure(?: income| earning potential)?s?)\b`,
		canMean: 'It can mean fair bonuses for good work. It can also mean that part of your pay is not sure.',
		ask: 'How is performance measured? What part of the pay is fixed?',
	},
	{
		id: 'pay-tips',
		category: 'pay',
		label: 'Pay from tips',
		pattern: String.raw`\b(?:tips? (?:only|based)|tip[- ]based pay|earn(?:ings)? from tips)\b`,
		canMean: 'Tips are normal in some jobs. They change a lot by shift and season.',
		ask: 'What is the base hourly wage, and what do people earn on an average week?',
	},

	// Workload and culture
	{
		id: 'work-fast-paced',
		category: 'workload',
		label: '"Fast-paced"',
		pattern: String.raw`\bfast[- ]paced\b`,
		canMean: 'It can mean that the work is busy and varied. It can also mean that the team is short of people and works long hours.',
		ask: 'What does a busy week look like here, and how often do people work extra hours?',
	},
	{
		id: 'work-many-hats',
		category: 'workload',
		label: '"Wear many hats"',
		pattern: String.raw`\bwear(?:ing)? (?:many|multiple|several|a lot of|different) hats\b`,
		canMean: 'It can mean a small team with varied work. It can also mean that you do the work of 2 or 3 roles for the pay of one.',
		ask: 'Which tasks take most of the week? Who did this work before me?',
	},
	{
		id: 'work-hard-play-hard',
		category: 'workload',
		label: '"Work hard, play hard"',
		pattern: String.raw`\bwork hard,? play hard\b`,
		canMean: 'It can mean a fun team culture. It can also mean long hours and social events that you are expected to attend.',
		ask: 'What are the usual working hours? Are social events optional?',
	},
	{
		id: 'work-family',
		category: 'workload',
		label: '"Like a family"',
		pattern: String.raw`\b(?:like a family|we(?:'| a)re a family|one big family|family[- ]like)\b`,
		canMean: 'It can mean a close and kind team. It can also mean that the line between work and personal time is weak.',
		ask: 'How does the team handle time off, and how does it handle disagreements?',
	},
	{
		id: 'work-self-starter',
		category: 'workload',
		label: '"Self-starter"',
		pattern: String.raw`\bself[- ]?(?:starter|motivated|directed)\b`,
		canMean: 'It can mean that you get freedom. It can also mean that you will get little training or support.',
		ask: 'How will the first 30 days go? Who will answer my questions?',
	},
	{
		id: 'work-rockstar',
		category: 'workload',
		label: '"Rockstar", "ninja", "guru"',
		pattern: String.raw`\b(?:rock ?stars?|ninjas?|gurus?|wizards?|unicorns?|superstars?)\b`,
		canMean: 'It is often just a way to sound lively. It can also point to high demands with little clarity.',
		ask: 'What would success look like in this role after 6 months?',
	},
	{
		id: 'work-pressure',
		category: 'workload',
		label: '"High-pressure"',
		pattern: String.raw`\b(?:high[- ](?:pressure|stress|stakes|intensity)|thrives? (?:under|in) pressure|work(?:ing)? under pressure|handle pressure)\b`,
		canMean: 'Some jobs, like emergency or sales roles, have real pressure. In other jobs it points to a stressful team.',
		ask: 'What causes the pressure here, and how does the team handle it?',
	},
	{
		id: 'work-long-hours',
		category: 'workload',
		label: 'Long or flexible hours',
		pattern: String.raw`\b(?:long hours|extended hours|nights and weekends|evenings and weekends|weekends as needed|available 24/7|24/7|on[- ]call|flexible (?:schedule|hours) required|overtime (?:required|expected))\b`,
		canMean: 'Some roles need shifts or on-call time. The post should say how often.',
		ask: 'How often is on-call or weekend work needed? Is it paid, or does it give time off?',
	},
	{
		id: 'work-extra-mile',
		category: 'workload',
		label: '"Go the extra mile"',
		pattern: String.raw`\b(?:go(?:ing)? the extra mile|above and beyond|whatever it takes|roll up (?:your|their) sleeves)\b`,
		canMean: 'It can describe a team that cares about its work. It can also mean unpaid extra effort is expected.',
		ask: 'Can you give an example of when someone went the extra mile here, and what the company did in return?',
	},
	{
		id: 'work-hit-ground',
		category: 'workload',
		label: '"Hit the ground running"',
		pattern: String.raw`\bhit the ground running\b`,
		canMean: 'It can mean that you need the skills now. It can also mean that there is little time for training.',
		ask: 'What training and onboarding do new people get?',
	},
	{
		id: 'work-changing',
		category: 'workload',
		label: 'Changing, dynamic, or scrappy',
		pattern: String.raw`\b(?:dynamic environment|ever[- ]changing|rapidly changing|constantly changing|changing priorities|scrappy|startup mentality|start-up mentality|thick skin)\b`,
		canMean: 'It can mean a young company with room to grow. It can also mean that plans and priorities change often.',
		ask: 'How often do priorities change? How does the team plan its work?',
	},
	{
		id: 'work-tight-deadlines',
		category: 'workload',
		label: 'Tight deadlines',
		pattern: String.raw`\b(?:tight|aggressive|demanding) deadlines\b|\bmeet(?:ing)? deadlines under pressure\b`,
		canMean: 'It can be normal for some work. It can also mean that the team plans badly.',
		ask: 'What was the last tight deadline, and how did the team meet it?',
	},
	{
		id: 'work-no-ego',
		category: 'workload',
		label: '"No ego", "hustle", or "grind"',
		pattern: String.raw`\b(?:no egos?|check your ego|passionate about (?:the )?(?:grind|hustle)|hustle|grind)\b`,
		canMean: 'It can describe a team that works well together. It can also be a way to ask for hard work without limits.',
		ask: 'How does the company reward and support people who work hard?',
	},

	// Vague role
	{
		id: 'role-other-duties',
		category: 'role',
		label: '"Other duties as assigned"',
		pattern: String.raw`\bother duties as (?:assigned|needed|required)\b|\band other duties\b`,
		canMean: 'It is standard text in many job posts. It can also hide work that is not part of the role.',
		ask: 'What share of the work is not in the list? Can you give examples?',
	},
	{
		id: 'role-not-limited',
		category: 'role',
		label: '"Including but not limited to"',
		pattern: String.raw`\b(?:including but not limited to|but (?:are )?not limited to|not limited to)\b`,
		canMean: 'It is common legal wording. It can also mean that the full job is not in the post.',
		ask: 'What does a normal day look like in this role?',
	},
	{
		id: 'role-evolve',
		category: 'role',
		label: 'The role may change',
		pattern: String.raw`\b(?:role|position|responsibilities|duties) (?:may|will|can) (?:evolve|change|grow|expand)\b|\bfluid role\b`,
		canMean: 'It can mean room to grow. It can also mean that the role is not well defined yet.',
		ask: 'What are the 3 main goals of this role now? Who sets them?',
	},
	{
		id: 'role-jack',
		category: 'role',
		label: '"Jack of all trades"',
		pattern: String.raw`\bjack[- ]of[- ]all[- ]trades\b`,
		canMean: 'It can fit a small company. It can also mean that no one has set the limits of the job.',
		ask: 'Which skills matter most in the first year?',
	},
	{
		id: 'role-multitask',
		category: 'role',
		label: '"Ability to multitask"',
		pattern: String.raw`\bmulti[- ]?task(?:ing)?\b`,
		canMean: 'It is a common line. It can mean that you switch between many tasks all day.',
		ask: 'How many projects or requests does one person handle at the same time?',
	},
	{
		id: 'role-etc',
		category: 'role',
		label: '"Etc." in the duties',
		pattern: String.raw`\betc\b\.?`,
		canMean: 'It can be a short way to write a list. It can also hide parts of the job.',
		ask: 'What else does the role include that the post does not list?',
	},
	{
		id: 'role-various',
		category: 'role',
		label: '"Various" or "as needed"',
		pattern: String.raw`\b(?:various (?:duties|tasks|projects|responsibilities)|varied duties|as needed|as required|ad[- ]hoc)\b`,
		canMean: 'It can mean varied, interesting work. It can also mean that the job has no clear shape.',
		ask: 'Which tasks will take most of my time?',
	},
	{
		id: 'role-growth',
		category: 'role',
		label: 'Growth with no detail',
		pattern: String.raw`\b(?:unlimited growth|growth opportunit(?:y|ies)|room for growth|fast career growth|opportunity for advancement)\b`,
		canMean: 'It can be true. Without a path or dates, it is only a hope.',
		ask: 'How did the last person in this role grow? How long did it take?',
	},
	{
		id: 'role-team-player',
		category: 'role',
		label: 'Buzzwords with no task',
		pattern: String.raw`\b(?:team player|results[- ]driven|detail[- ]oriented|strong work ethic|go[- ]getter|outside the box|synerg(?:y|ies))\b`,
		canMean: 'These are very common and say little. They do not describe the work.',
		ask: 'Which tasks will I do in the first month?',
	},
];

export const FLAGS_BY_ID: Record<string, Flag> = Object.fromEntries(FLAGS.map((f) => [f.id, f]));

/** A dollar amount, a pay rate, or a stated currency. Years and head counts like "50,000 customers" do not count. */
const PAY_FIGURE = /\$\s?\d|\b\d[\d,.]*\s?(?:usd|dollars)\b|\b\d[\d,.]*\s?(?:\/|per|an|a)\s?(?:hr|hour|year|yr)\b/i;

export function hasPayFigure(text: string): boolean {
	return PAY_FIGURE.test(text);
}

export type Match = { start: number; end: number; flagId: string; text: string };

const NO_EXPERIENCE_ID = 'scam-no-exp';
const HIGH_PAY_ID = 'scam-high-pay';

/**
 * Finds every phrase in the text. Matching ignores case and uses word boundaries.
 * When 2 matches overlap, the one that starts first wins, and the longer one wins a tie.
 */
export function findMatches(text: string): Match[] {
	const withoutPay = !hasPayFigure(text);
	const all: Match[] = [];
	for (const flag of FLAGS) {
		if (!flag.pattern) continue;
		if (flag.onlyWithoutPay && !withoutPay) continue;
		const re = new RegExp(flag.pattern, 'gi');
		for (const m of text.matchAll(re)) {
			if (m[0].length === 0 || m.index === undefined) continue;
			all.push({ start: m.index, end: m.index + m[0].length, flagId: flag.id, text: m[0] });
		}
	}
	all.sort((a, b) => a.start - b.start || b.end - a.end);
	const kept: Match[] = [];
	let lastEnd = -1;
	for (const m of all) {
		if (m.start < lastEnd) continue;
		kept.push(m);
		lastEnd = m.end;
	}
	return kept;
}

export type Finding = { flag: Flag; count: number };

export type Analysis = {
	matches: Match[];
	/** One entry per flag that was found, in the order of the list. */
	findings: Finding[];
	/** The number of findings per category. */
	counts: Record<Category, number>;
	/** True when the text has enough words to check the pay. */
	hasText: boolean;
};

/** The post must have at least this many words before the "no pay range" check runs. */
const MIN_WORDS_FOR_PAY_CHECK = 20;

export function analyze(text: string): Analysis {
	const matches = findMatches(text);
	const counts: Record<Category, number> = { scam: 0, pay: 0, workload: 0, role: 0 };
	const byFlag = new Map<string, number>();
	for (const m of matches) byFlag.set(m.flagId, (byFlag.get(m.flagId) ?? 0) + 1);

	const words = text.trim() ? text.trim().split(/\s+/).length : 0;
	const hasText = words > 0;

	// Checks that use more than one phrase.
	if (byFlag.has(NO_EXPERIENCE_ID) && byFlag.has(HIGH_PAY_ID)) byFlag.set('scam-no-exp-high-pay', 1);
	if (words >= MIN_WORDS_FOR_PAY_CHECK && !hasPayFigure(text)) byFlag.set('pay-no-range', 1);

	const findings: Finding[] = [];
	for (const flag of FLAGS) {
		const count = byFlag.get(flag.id);
		if (!count) continue;
		findings.push({ flag, count });
		counts[flag.category] += 1;
	}
	return { matches, findings, counts, hasText };
}

export type Segment = { text: string; flagId?: string };

/** Splits the text into plain parts and matched parts, so React can draw them with no innerHTML. */
export function segments(text: string, matches: Match[]): Segment[] {
	const out: Segment[] = [];
	let pos = 0;
	for (const m of matches) {
		if (m.start > pos) out.push({ text: text.slice(pos, m.start) });
		out.push({ text: text.slice(m.start, m.end), flagId: m.flagId });
		pos = m.end;
	}
	if (pos < text.length) out.push({ text: text.slice(pos) });
	return out;
}
