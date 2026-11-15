// The list of all free tools, in the order of the /tools hub page. Add each new tool's meta here.
import type { ToolMeta } from './types';
import { meta as coverLetterTemplate } from '@/components/Tools/cover-letter-template/meta';
import { meta as howToAddressACoverLetter } from '@/components/Tools/how-to-address-a-cover-letter/meta';
import { meta as coverLetterLengthChecker } from '@/components/Tools/cover-letter-length-checker/meta';
import { meta as thankYouEmail } from '@/components/Tools/thank-you-email/meta';
import { meta as jobApplicationEmailSubjectLine } from '@/components/Tools/job-application-email-subject-line/meta';
import { meta as recruiterMessageTemplates } from '@/components/Tools/recruiter-message-templates/meta';
import { meta as resumeActionVerbs } from '@/components/Tools/resume-action-verbs/meta';
import { meta as resumeBulletPointBuilder } from '@/components/Tools/resume-bullet-point-builder/meta';
import { meta as linkedinHeadlineGenerator } from '@/components/Tools/linkedin-headline-generator/meta';
import { meta as starMethodAnswerBuilder } from '@/components/Tools/star-method-answer-builder/meta';
import { meta as interviewQuestionPractice } from '@/components/Tools/interview-question-practice/meta';
import { meta as interviewTimeZoneConverter } from '@/components/Tools/interview-time-zone-converter/meta';
import { meta as salaryToHourlyCalculator } from '@/components/Tools/salary-to-hourly-calculator/meta';
import { meta as jobOfferComparisonCalculator } from '@/components/Tools/job-offer-comparison-calculator/meta';
import { meta as twoWeeksNoticeCalculator } from '@/components/Tools/two-weeks-notice-calculator/meta';
import { meta as resignationLetterTemplate } from '@/components/Tools/resignation-letter-template/meta';
import { meta as jobSearchRunwayCalculator } from '@/components/Tools/job-search-runway-calculator/meta';
import { meta as jobApplicationGoalCalculator } from '@/components/Tools/job-application-goal-calculator/meta';
import { meta as jobDescriptionRedFlags } from '@/components/Tools/job-description-red-flags/meta';

export const TOOLS: ToolMeta[] = [
	coverLetterTemplate,
	howToAddressACoverLetter,
	coverLetterLengthChecker,
	thankYouEmail,
	jobApplicationEmailSubjectLine,
	recruiterMessageTemplates,
	resumeActionVerbs,
	resumeBulletPointBuilder,
	linkedinHeadlineGenerator,
	starMethodAnswerBuilder,
	interviewQuestionPractice,
	interviewTimeZoneConverter,
	salaryToHourlyCalculator,
	jobOfferComparisonCalculator,
	twoWeeksNoticeCalculator,
	resignationLetterTemplate,
	jobSearchRunwayCalculator,
	jobApplicationGoalCalculator,
	jobDescriptionRedFlags,
];

export function getToolMeta(slug: string): ToolMeta | undefined {
	return TOOLS.find((t) => t.slug === slug);
}
