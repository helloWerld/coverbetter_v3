// Fixed cover letter templates. The tool puts the user's answers into one template. No AI.

export type LetterInput = {
	name: string;
	role: string;
	company: string;
	hiringManager: string;
	strength1: string;
	strength2: string;
	achievement: string;
	/** Used by the referral template only. */
	referrer: string;
};

export type TemplateId = 'standard' | 'career-change' | 'no-experience' | 'internship' | 'referral' | 'email';

export const TEMPLATES: { id: TemplateId; label: string; when: string }[] = [
	{ id: 'standard', label: 'Standard', when: 'Most jobs, when you have related experience.' },
	{ id: 'career-change', label: 'Career change', when: 'You move into a new field and bring skills from another one.' },
	{ id: 'no-experience', label: 'No experience', when: 'Your first full-time job, or a role with no direct experience.' },
	{ id: 'internship', label: 'Internship', when: 'Students and recent graduates who apply for an internship.' },
	{ id: 'referral', label: 'Referral', when: 'Someone at the company told you about the job.' },
	{ id: 'email', label: 'Short email', when: 'You send the letter in the body of an email.' },
];

/** An empty answer stays as a [placeholder], so the user can see what to fill in. */
function v(value: string, placeholder: string) {
	const t = value.trim();
	return t || `[${placeholder}]`;
}

export function greeting(hiringManager: string, company: string): string {
	const name = hiringManager.trim();
	if (name) return `Dear ${name},`;
	return company.trim() ? `Dear ${company.trim()} Hiring Team,` : 'Dear Hiring Manager,';
}

export function fillTemplate(id: TemplateId, input: LetterInput): string {
	const name = v(input.name, 'Your Name');
	const role = v(input.role, 'Job Title');
	const company = v(input.company, 'Company');
	const s1 = v(input.strength1, 'Strength 1');
	const s2 = v(input.strength2, 'Strength 2');
	const win = v(input.achievement, 'one result you are proud of, with a number if you have one');
	const referrer = v(input.referrer, 'Referrer Name');
	const hello = greeting(input.hiringManager, input.company);

	const bodies: Record<TemplateId, string[]> = {
		standard: [
			`I am applying for the ${role} position at ${company}. My background in ${s1} and ${s2} matches what this role needs, and I would like to bring that work to your team.`,
			`In my recent work, ${win}. That experience taught me how to [skill the job post asks for], which I would use from my first week at ${company}.`,
			`I am interested in ${company} because [one specific reason: a product, a goal, or something from the job post]. I would welcome the chance to talk about how I can help with [a need from the job post].`,
		],
		'career-change': [
			`I am applying for the ${role} position at ${company}. I come from [your current field], and I am moving into this field because [your real reason, in one sentence].`,
			`My work in [your current field] gave me strong skills in ${s1} and ${s2}. These skills transfer directly: ${win}. I have also prepared for this change through [course, project, or certificate].`,
			`I would bring a different view to ${company} and the habits of someone who has already delivered results in a demanding role. I would welcome the chance to talk about how my background fits this job.`,
		],
		'no-experience': [
			`I am applying for the ${role} position at ${company}. I do not have years of experience in this role yet, but I have the skills it asks for: ${s1} and ${s2}.`,
			`In [school, a project, volunteer work, or a part-time job], ${win}. That work showed me that I learn quickly and that I care about doing the job well.`,
			`I am excited about ${company} because [one specific reason]. I would welcome the chance to show you what I can do and to learn from your team.`,
		],
		internship: [
			`I am a [year] student in [your program] at [your school], and I am applying for the ${role} internship at ${company}.`,
			`My coursework and projects gave me practical skills in ${s1} and ${s2}. For example, ${win}.`,
			`I want this internship because [what you want to learn, tied to the company]. I am available [dates or hours], and I would welcome the chance to talk with you.`,
		],
		referral: [
			`${referrer}, who works on [their team] at ${company}, suggested that I apply for the ${role} position. After our conversation about [one topic you discussed], I am sure this role is a strong fit.`,
			`I bring experience in ${s1} and ${s2}. In my recent work, ${win}.`,
			`${referrer} told me that the team needs [a need they mentioned]. That is the kind of work I do best, and I would welcome the chance to talk about it.`,
		],
		email: [
			`I am applying for the ${role} position at ${company}. My resume is attached.`,
			`I bring experience in ${s1} and ${s2}. Recently, ${win}.`,
			`I would welcome the chance to talk about how I can help ${company}. Thank you for your time.`,
		],
	};

	const closing = id === 'email' ? `Best regards,\n${name}\n[Phone] · [Email] · [LinkedIn URL]` : `Sincerely,\n${name}`;
	const subject = id === 'email' ? `Subject: Application for ${role}: ${name}\n\n` : '';
	return `${subject}${hello}\n\n${bodies[id].join('\n\n')}\n\n${closing}`;
}

export function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

/** The [placeholders] that are still in the letter. */
export function openPlaceholders(text: string): string[] {
	return [...new Set([...text.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]))];
}
