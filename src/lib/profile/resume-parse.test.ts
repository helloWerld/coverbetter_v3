import { describe, expect, it } from 'vitest';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { profileSchema } from './types';
import { parseResumeFile, parseResumeLines } from './resume-parse';
import { docxToLines, htmlToLines, pdfToLines, type Line } from './resume-lines';

type Opt = Partial<Omit<Line, 'text'>>;
/** Build a line with plain defaults. */
const L = (text: string, o: Opt = {}): Line => ({
	text,
	size: 11,
	bold: false,
	x: 50,
	page: 1,
	gapBefore: 1,
	listItem: false,
	...o,
});
const NAME = (t: string) => L(t, { size: 22, bold: true, gapBefore: 0 });
const H = (t: string) => L(t, { size: 13, bold: true, gapBefore: 1.8 });
const B = (t: string) => L(`• ${t}`);
const GAP = { gapBefore: 1.6 };

describe('parseResumeLines', () => {
	it('reads a one-column resume', () => {
		const lines = [
			NAME('Jane Q. Doe'),
			L('Senior Software Engineer'),
			L('jane.doe@example.com | (415) 555-0134 | San Francisco, CA'),
			L('linkedin.com/in/janedoe | github.com/janedoe'),
			H('Summary'),
			L('Engineer with ten years of experience'),
			L('building payment systems.'),
			H('Experience'),
			L('Acme Corp', { bold: true, ...GAP }),
			L('Staff Engineer                Jan 2020 – Present'),
			B('Led a team of six engineers that cut checkout latency by 40%.'),
			B('Built a fraud service in Go'),
			L('and Kafka for real-time scoring.'),
			L('Globex Inc', { bold: true, ...GAP }),
			L('Software Engineer           June 2016 - December 2019'),
			B('Shipped the first mobile app.'),
			H('Education'),
			L('University of California, Berkeley', { bold: true }),
			L('B.S. in Computer Science, 2012 – 2016'),
			L('GPA: 3.8/4.0'),
			H('Skills'),
			L('Languages: Go, Python, TypeScript'),
			L('Tools: AWS, Docker, Kafka'),
			H('Certifications'),
			B('AWS Certified Solutions Architect - Amazon Web Services, 2021'),
		];
		const { profile, unsure } = parseResumeLines(lines);
		expect(() => profileSchema.parse(profile)).not.toThrow();
		expect(profile.basics.name).toBe('Jane Q. Doe');
		expect(profile.basics.email).toBe('jane.doe@example.com');
		expect(profile.basics.phone).toBe('(415) 555-0134');
		expect(profile.basics.location).toBe('San Francisco, CA');
		expect(profile.basics.links.map((l) => l.label)).toEqual(['LinkedIn', 'GitHub']);
		expect(profile.summaries[0].text).toContain('payment systems.');
		expect(profile.positions).toHaveLength(2);
		const [acme, globex] = profile.positions;
		expect(acme).toMatchObject({ title: 'Staff Engineer', company: 'Acme Corp', start: '2020-01', current: true, end: '' });
		expect(acme.bullets).toHaveLength(2);
		expect(acme.bullets[1].text).toBe('Built a fraud service in Go and Kafka for real-time scoring.');
		expect(globex).toMatchObject({ title: 'Software Engineer', company: 'Globex Inc', start: '2016-06', end: '2019-12', current: false });
		expect(profile.education[0]).toMatchObject({
			school: 'University of California, Berkeley',
			degree: 'B.S.',
			field: 'Computer Science',
			start: '2012',
			end: '2016',
			gpa: '3.8/4.0',
		});
		expect(profile.skills.map((s) => s.name)).toEqual(['Go', 'Python', 'TypeScript', 'AWS', 'Docker', 'Kafka']);
		expect(profile.skills[0].group).toBe('technical');
		expect(profile.skills[3].group).toBe('tool');
		expect(profile.certifications[0]).toMatchObject({ name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2021' });
		expect(unsure).not.toContain(acme.id);
		expect(unsure).not.toContain(globex.id);
	});

	it('reads "Title | Company | Dates" on one line', () => {
		const lines = [
			NAME('Carlos Mendez'),
			L('carlos@example.org'),
			H('WORK EXPERIENCE'),
			L('Product Manager | Initech | 03/2019 - 06/2022', { bold: true }),
			B('Owned the roadmap for two products.'),
			L('Business Analyst | Hooli | 2017 to 2019', { bold: true, ...GAP }),
			B('Wrote requirements.'),
		];
		const { profile, unsure } = parseResumeLines(lines);
		expect(profile.positions).toHaveLength(2);
		expect(profile.positions[0]).toMatchObject({ title: 'Product Manager', company: 'Initech', start: '2019-03', end: '2022-06' });
		expect(profile.positions[1]).toMatchObject({ title: 'Business Analyst', company: 'Hooli', start: '2017', end: '2019' });
		expect(profile.positions[0].bullets).toHaveLength(1);
		expect(unsure).toEqual([]);
	});

	it('reads company on one line and title plus dates on the next', () => {
		const lines = [
			NAME('Amira Haddad'),
			L('amira@example.com'),
			H('Professional Experience'),
			L('Stripe — Remote', { bold: true }),
			L('Data Scientist, Jan 2021 – Present'),
			B('Modeled churn.'),
			L('Brightside Health', { bold: true, ...GAP }),
			L('Research Analyst – 2018–2020'),
			B('Ran surveys.'),
		];
		const { profile } = parseResumeLines(lines);
		expect(profile.positions).toHaveLength(2);
		expect(profile.positions[0]).toMatchObject({ title: 'Data Scientist', company: 'Stripe', location: 'Remote', start: '2021-01', current: true });
		expect(profile.positions[1]).toMatchObject({ title: 'Research Analyst', company: 'Brightside Health', start: '2018', end: '2020' });
	});

	it('reads a two-column resume that is already linearised', () => {
		// Left column first (skills, education), then the right column (experience).
		const lines = [
			NAME('Mei Lin Chen'),
			L('mei.chen@example.com  +1 206 555 0199'),
			H('SKILLS'),
			L('Figma, Sketch, Prototyping'),
			L('User research | Accessibility'),
			H('EDUCATION'),
			L('Rhode Island School of Design'),
			L('BFA, Graphic Design'),
			L('2010 - 2014'),
			H('EXPERIENCE'),
			L('Lead Designer at Pixel Co. (Seattle, WA)    Sep 2018 - Now'),
			B('Redesigned the onboarding flow.'),
		];
		const { profile } = parseResumeLines(lines);
		expect(profile.basics.name).toBe('Mei Lin Chen');
		expect(profile.basics.phone).toBe('+1 206 555 0199');
		expect(profile.skills.map((s) => s.name)).toEqual(['Figma', 'Sketch', 'Prototyping', 'User research', 'Accessibility']);
		expect(profile.education[0].school).toBe('Rhode Island School of Design');
		expect(profile.education[0].degree).toBe('BFA');
		expect(profile.education[0]).toMatchObject({ start: '2010', end: '2014' });
		expect(profile.positions[0]).toMatchObject({ title: 'Lead Designer', company: 'Pixel Co.', location: 'Seattle, WA', start: '2018-09', current: true });
	});

	it('finds all-caps headings without bold or larger size', () => {
		const lines = [
			L('SAM OKAFOR', { gapBefore: 0 }),
			L('sam@example.com'),
			L('SUMMARY'),
			L('Line cook turned kitchen manager.'),
			L('EMPLOYMENT HISTORY'),
			L('Kitchen Manager, Blue Door Bistro, May 2019 – Current'),
			L('- Managed a team of 12.'),
			L('- Cut food waste by 20%.'),
			L('EDUCATION'),
			L('Culinary Institute of America, Associate Degree, 2015'),
			L('TECHNICAL SKILLS'),
			L('Inventory, Scheduling, Food safety'),
		];
		const { profile } = parseResumeLines(lines);
		expect(profile.basics.name).toBe('SAM OKAFOR');
		expect(profile.summaries).toHaveLength(1);
		expect(profile.positions).toHaveLength(1);
		expect(profile.positions[0]).toMatchObject({ title: 'Kitchen Manager', company: 'Blue Door Bistro', start: '2019-05', current: true });
		expect(profile.positions[0].bullets.map((b) => b.text)).toEqual(['Managed a team of 12.', 'Cut food waste by 20%.']);
		expect(profile.education[0].school).toBe('Culinary Institute of America');
		expect(profile.education[0].end).toBe('2015');
		expect(profile.skills).toHaveLength(3);
	});

	it('does not crash without section headings and still finds contact data', () => {
		const lines = [
			NAME('Lena Fischer'),
			L('lena.fischer@example.de | +49 30 1234 5678 | Berlin, Germany'),
			L('https://lenafischer.dev'),
			L('Backend Developer, Zalando, 2020 – 2023'),
			L('Built APIs.'),
		];
		const { profile } = parseResumeLines(lines);
		expect(profile.basics).toMatchObject({
			name: 'Lena Fischer',
			email: 'lena.fischer@example.de',
			location: 'Berlin, Germany',
		});
		expect(profile.basics.links[0]).toMatchObject({ url: 'https://lenafischer.dev', label: 'Website' });
		expect(profile.positions[0]).toMatchObject({ title: 'Backend Developer', company: 'Zalando', start: '2020', end: '2023' });
		expect(() => parseResumeLines([])).not.toThrow();
		expect(parseResumeLines([L('just some words')]).profile.positions).toEqual([]);
	});

	it('reads title, company and date on three separate lines, and keeps wrapped bullets together', () => {
		const lines = [
			NAME('Ivy Tran'),
			H('Experience'),
			L('Marketing Manager', { bold: true }),
			L('Fabrikam Ltd'),
			L('2019 - 2022'),
			B('Grew the newsletter from 2k to 40k readers while'),
			L('keeping the unsubscribe rate flat.'),
			B('Ran 12 campaigns.'),
			L('Marketing Associate', { bold: true, ...GAP }),
			L('Tailspin Toys'),
			L('2016 - 2019'),
			B('Wrote copy.'),
		];
		const { profile } = parseResumeLines(lines);
		expect(profile.positions).toHaveLength(2);
		expect(profile.positions[0]).toMatchObject({ title: 'Marketing Manager', company: 'Fabrikam Ltd', start: '2019', end: '2022' });
		expect(profile.positions[0].bullets.map((b) => b.text)).toEqual([
			'Grew the newsletter from 2k to 40k readers while keeping the unsubscribe rate flat.',
			'Ran 12 campaigns.',
		]);
		expect(profile.positions[1]).toMatchObject({ title: 'Marketing Associate', company: 'Tailspin Toys' });
	});

	it('marks a position unsure when title and company cannot be told apart', () => {
		const lines = [
			NAME('Pat Rivera'),
			H('Experience'),
			L('Moonbase Alpha | Jan 2020 - Present'),
			B('Did things.'),
		];
		const { profile, unsure } = parseResumeLines(lines);
		expect(profile.positions[0].title).toBe('Moonbase Alpha');
		expect(profile.positions[0].company).toBe('');
		expect(unsure).toContain(profile.positions[0].id);
	});

	it('always returns a profile that passes the schema', () => {
		const long = 'word '.repeat(400);
		const lines = [
			NAME('Very Long'),
			H('Experience'),
			L('Engineer, Corp, 2020 – 2021'),
			B(long),
			H('Skills'),
			L(`${'x'.repeat(200)}, ok`),
		];
		const { profile, unsure } = parseResumeLines(lines);
		expect(() => profileSchema.parse(profile)).not.toThrow();
		expect(profile.positions[0].bullets[0].text.length).toBeLessThanOrEqual(500);
		expect(unsure).toContain(profile.positions[0].bullets[0].id);
	});
});

describe('htmlToLines', () => {
	it('maps headings, strong-only paragraphs and list items', () => {
		const lines = htmlToLines(
			'<h1>Ann Lee</h1><p><strong>Experience</strong></p><p>Plain &amp; simple</p><ul><li>One</li><li>Two</li></ul>',
		);
		expect(lines.map((l) => l.text)).toEqual(['Ann Lee', 'Experience', 'Plain & simple', 'One', 'Two']);
		expect(lines[0]).toMatchObject({ bold: true, size: 20 });
		expect(lines[1].bold).toBe(true);
		expect(lines[2].bold).toBe(false);
		expect(lines[3].listItem).toBe(true);
		expect(lines[2].listItem).toBe(false);
	});
});

describe('docx file', () => {
	it('reads a DOCX resume', async () => {
		const p = (text: string, bold = false) => new Paragraph({ children: [new TextRun({ text, bold })] });
		const doc = new Document({
			sections: [
				{
					children: [
						new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Dana Whitfield')] }),
						p('dana@example.com | Austin, TX'),
						p('Experience', true),
						p('Operations Lead | Northwind | Feb 2018 – Present'),
						new Paragraph({ bullet: { level: 0 }, children: [new TextRun('Cut shipping costs by 12%.')] }),
						p('Education', true),
						p('University of Texas at Austin, B.A. in History, 2014'),
					],
				},
			],
		});
		const bytes = new Uint8Array(await Packer.toBuffer(doc));
		const lines = await docxToLines(bytes);
		expect(lines[0]).toMatchObject({ text: 'Dana Whitfield', bold: true });
		expect(lines.find((l) => l.text.startsWith('Cut'))?.listItem).toBe(true);
		const { profile } = parseResumeLines(lines);
		expect(profile.basics).toMatchObject({ name: 'Dana Whitfield', email: 'dana@example.com', location: 'Austin, TX' });
		expect(profile.positions[0]).toMatchObject({ title: 'Operations Lead', company: 'Northwind', start: '2018-02', current: true });
		expect(profile.positions[0].bullets.map((b) => b.text)).toEqual(['Cut shipping costs by 12%.']);
		expect(profile.education[0]).toMatchObject({ school: 'University of Texas at Austin', field: 'History', end: '2014' });
		const viaFile = await parseResumeFile(bytes, 'docx');
		expect(viaFile.profile.basics.name).toBe('Dana Whitfield');
	});
});

describe('pdf file', () => {
	async function makePdf(twoColumns: boolean): Promise<Uint8Array> {
		const pdf = await PDFDocument.create();
		const page = pdf.addPage([612, 792]);
		const reg = await pdf.embedFont(StandardFonts.Helvetica);
		const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
		const t = (s: string, x: number, y: number, size = 11, b = false) =>
			page.drawText(s, { x, y, size, font: b ? bold : reg });
		t('Omar Haddad', 50, 740, 22, true);
		t('omar@example.com | Denver, CO', 50, 720);
		if (!twoColumns) {
			t('Experience', 50, 690, 14, true);
			t('Site Reliability Engineer | Contoso | Jan 2019 - Present', 50, 670, 11, true);
			t('- Kept the platform up.', 50, 654);
			t('Education', 50, 620, 14, true);
			t('Colorado State University, B.S. in Physics, 2016', 50, 600);
			t('Skills', 50, 570, 14, true);
			t('Linux, Terraform, Go', 50, 552);
		} else {
			// Left column: skills and education. Right column: experience.
			t('Skills', 50, 690, 14, true);
			for (let i = 0; i < 6; i++) t(`Skill number ${i + 1}`, 50, 670 - i * 16);
			t('Education', 50, 560, 14, true);
			t('Colorado State University', 50, 540);
			t('B.S. in Physics, 2012 - 2016', 50, 524);
			t('Experience', 330, 690, 14, true);
			t('Site Reliability Engineer | Contoso | Jan 2019 - Present', 330, 670, 9, true);
			for (let i = 0; i < 6; i++) t(`- Kept service ${i + 1} up.`, 330, 654 - i * 16);
		}
		return new Uint8Array(await pdf.save());
	}

	it('reads a one-column PDF', async () => {
		const bytes = await makePdf(false);
		const lines = await pdfToLines(bytes);
		expect(lines[0]).toMatchObject({ text: 'Omar Haddad', bold: true });
		expect(lines[0].size).toBeCloseTo(22, 0);
		expect(lines.find((l) => l.text === 'Skills')?.bold).toBe(true);
		expect(lines.find((l) => l.text.startsWith('Linux'))?.bold).toBe(false);
		const { profile } = await parseResumeFile(bytes, 'pdf');
		expect(profile.basics).toMatchObject({ name: 'Omar Haddad', email: 'omar@example.com', location: 'Denver, CO' });
		expect(profile.positions[0]).toMatchObject({ title: 'Site Reliability Engineer', company: 'Contoso', start: '2019-01', current: true });
		expect(profile.positions[0].bullets[0].text).toBe('Kept the platform up.');
		expect(profile.education[0]).toMatchObject({ school: 'Colorado State University', degree: 'B.S.', field: 'Physics', end: '2016' });
		expect(profile.skills.map((s) => s.name)).toEqual(['Linux', 'Terraform', 'Go']);
	});

	it('reads the left column fully, then the right column', async () => {
		const lines = await pdfToLines(await makePdf(true));
		const texts = lines.map((l) => l.text);
		expect(texts.indexOf('B.S. in Physics, 2012 - 2016')).toBeLessThan(texts.indexOf('Experience'));
		expect(texts.indexOf('Skill number 6')).toBeLessThan(texts.indexOf('Experience'));
		const { profile } = parseResumeLines(lines);
		expect(profile.positions[0].bullets).toHaveLength(6);
		expect(profile.skills).toHaveLength(6);
	});
});
