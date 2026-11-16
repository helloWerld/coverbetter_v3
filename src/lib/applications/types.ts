/**
 * Application statuses. The status is the stage the user sets. "No response" is not a status:
 * it is calculated from the dates (see isNoResponse), so nothing has to run on a timer.
 */
export const STATUSES = [
	'saved',
	'applied',
	'interview',
	'offer',
	'accepted',
	'declined',
	'rejected',
	'withdrawn',
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
	saved: 'Saved',
	applied: 'Applied',
	interview: 'Interview',
	offer: 'Offer',
	accepted: 'Accepted',
	declined: 'Declined',
	rejected: 'Rejected',
	withdrawn: 'Withdrawn',
};

/** Statuses where the application is over. */
export const CLOSED_STATUSES: readonly Status[] = ['accepted', 'declined', 'rejected', 'withdrawn'];

export const SOURCES = ['linkedin', 'company_site', 'indeed', 'referral', 'recruiter', 'other'] as const;
export type Source = (typeof SOURCES)[number];
export const SOURCE_LABEL: Record<Source, string> = {
	linkedin: 'LinkedIn',
	company_site: 'Company site',
	indeed: 'Indeed',
	referral: 'Referral',
	recruiter: 'Recruiter',
	other: 'Other',
};

export const EVENT_TYPES = ['status', 'follow_up_sent', 'thank_you_sent', 'interview_added'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const INTERVIEW_ROUNDS = ['phone_screen', 'first', 'second', 'final', 'other'] as const;
export type InterviewRound = (typeof INTERVIEW_ROUNDS)[number];
export const ROUND_LABEL: Record<InterviewRound, string> = {
	phone_screen: 'Phone screen',
	first: 'First interview',
	second: 'Second interview',
	final: 'Final interview',
	other: 'Other',
};

export const INTERVIEW_FORMATS = ['phone', 'video', 'onsite'] as const;
export type InterviewFormat = (typeof INTERVIEW_FORMATS)[number];

export const MESSAGE_KINDS = ['follow_up', 'follow_up_2', 'thank_you'] as const;
export type MessageKind = (typeof MESSAGE_KINDS)[number];

/** Plain data for the analytics and reminder functions. No database types, so they stay pure. */
export interface AppSnapshot {
	id: string;
	status: Status;
	source: Source;
	createdAt: Date;
	appliedAt: Date | null;
	/** True when the application has a tailored resume linked. */
	hasResume: boolean;
	/** True when the application has a cover letter linked. */
	hasLetter: boolean;
	fitScore: number | null;
	/** Status events, oldest first. */
	events: { type: EventType; status: Status | null; at: Date }[];
	/** Interviews, oldest first. */
	interviews: { round: InterviewRound; at: Date }[];
}

/** User settings, stored as JSON in `user_settings`. */
export interface UserSettings {
	tone: 'professional' | 'friendly' | 'confident' | 'enthusiastic';
	length: 'short' | 'standard' | 'detailed';
	template: 'classic' | 'modern' | 'minimal';
	language: string;
	defaultResumeId: string;
	noResponseDays: number;
	followUpDays: number;
	secondFollowUpDays: number;
	resumeMode: 'manual' | 'ai';
}

export const DEFAULT_SETTINGS: UserSettings = {
	tone: 'professional',
	length: 'standard',
	template: 'classic',
	language: 'en',
	defaultResumeId: '',
	noResponseDays: 30,
	followUpDays: 7,
	secondFollowUpDays: 14,
	resumeMode: 'manual',
};
