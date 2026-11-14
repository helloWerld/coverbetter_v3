import { LANGUAGE_CODES, type LanguageCode } from './languages';
import type { LetterDoc } from './templates';

const CONTACT = 'jane@example.com | +1 555-123-4567 | linkedin.com/in/janedoe';

/** Realistic sample letters in every language. Used by the export tests. */
const SAMPLES: Record<LanguageCode, { name: string; date: string; paragraphs: string[] }> = {
	en: {
		name: 'Jane Doe',
		date: 'November 13, 2026',
		paragraphs: ['Dear Hiring Manager,', 'I am excited to apply for the Product Manager role at Acme.', 'Sincerely,\nJane Doe'],
	},
	es: {
		name: 'Jane Peña',
		date: '13 de noviembre de 2026',
		paragraphs: ['Estimado equipo de selección:', 'Me entusiasma postularme al puesto de gerente de producto en Acme.', 'Atentamente,\nJane Peña'],
	},
	fr: {
		name: 'Jeanne Dupré',
		date: '13 novembre 2026',
		paragraphs: ['Madame, Monsieur,', 'Je souhaite vivement rejoindre Acme en tant que chef de produit.', 'Cordialement,\nJeanne Dupré'],
	},
	de: {
		name: 'Jana Müller',
		date: '13. November 2026',
		paragraphs: ['Sehr geehrte Damen und Herren,', 'mit großem Interesse bewerbe ich mich bei Acme als Produktmanagerin.', 'Mit freundlichen Grüßen\nJana Müller'],
	},
	pt: {
		name: 'Joana Coração',
		date: '13 de novembro de 2026',
		paragraphs: ['Prezados senhores,', 'Tenho grande interesse na vaga de gerente de produto na Acme.', 'Atenciosamente,\nJoana Coração'],
	},
	it: {
		name: 'Gianna Rossi',
		date: '13 novembre 2026',
		paragraphs: ['Gentile team di selezione,', 'Sono molto interessata alla posizione di product manager presso Acme.', 'Cordiali saluti,\nGianna Rossi'],
	},
	pl: {
		name: 'Joanna Łukasiewicz',
		date: '13 listopada 2026',
		paragraphs: ['Szanowni Państwo,', 'Z dużym zainteresowaniem aplikuję na stanowisko menedżera produktu w firmie Acme. Zażółć gęślą jaźń.', 'Z poważaniem,\nJoanna Łukasiewicz'],
	},
	zh: {
		name: '李静',
		date: '2026年11月13日',
		paragraphs: ['尊敬的招聘经理：', '我非常希望申请贵公司（Acme）的产品经理职位。我在 B2B SaaS 领域有五年经验，曾带领团队将活跃用户提升 40%。', '此致\n敬礼\n李静'],
	},
	ja: {
		name: '山田 花子',
		date: '2026年11月13日',
		paragraphs: ['採用ご担当者様', '貴社のプロダクトマネージャー職に応募いたします。これまでにBtoB SaaSの開発チームを率い、利用者数を向上させました。', '敬具\n山田 花子'],
	},
	ko: {
		name: '김지은',
		date: '2026년 11월 13일',
		paragraphs: ['채용 담당자님께', '귀사의 프로덕트 매니저 직무에 지원하게 되어 기쁩니다. 저는 B2B SaaS 분야에서 5년간 팀을 이끌어 왔습니다.', '감사합니다.\n김지은'],
	},
	ar: {
		name: 'سارة أحمد',
		date: '١٣ نوفمبر ٢٠٢٦',
		paragraphs: ['السادة مسؤولي التوظيف المحترمين،', 'يسعدني التقدم لوظيفة مدير المنتج في شركة Acme. لدي خمس سنوات من الخبرة في مجال البرمجيات، وزدت عدد المستخدمين بنسبة 40% عبر sarah@example.com.', 'مع خالص التحية،\nسارة أحمد'],
	},
	hi: {
		name: 'प्रिया शर्मा',
		date: '13 नवंबर 2026',
		paragraphs: ['प्रिय भर्ती प्रबंधक,', 'मैं Acme में प्रोडक्ट मैनेजर पद के लिए आवेदन करना चाहती हूँ। मुझे B2B SaaS में पाँच वर्षों का अनुभव है और मैंने उपयोगकर्ताओं की संख्या 40% बढ़ाई।', 'सादर,\nप्रिया शर्मा'],
	},
};

export function sampleDoc(code: LanguageCode): LetterDoc {
	const s = SAMPLES[code];
	return { language: code, name: s.name, contactLine: CONTACT, date: s.date, paragraphs: s.paragraphs };
}

export const SAMPLE_CODES = LANGUAGE_CODES;
