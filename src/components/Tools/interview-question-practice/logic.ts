export type QuestionType =
	| 'general'
	| 'behavioral'
	| 'situational'
	| 'motivation'
	| 'strengths'
	| 'teamwork'
	| 'leadership'
	| 'career'
	| 'salary'
	| 'ask';

export const TYPES: readonly { value: QuestionType; label: string }[] = [
	{ value: 'general', label: 'General' },
	{ value: 'behavioral', label: 'Behavioral' },
	{ value: 'situational', label: 'Situational' },
	{ value: 'motivation', label: 'Motivation' },
	{ value: 'strengths', label: 'Strengths and weaknesses' },
	{ value: 'teamwork', label: 'Teamwork' },
	{ value: 'leadership', label: 'Leadership' },
	{ value: 'career', label: 'Career goals' },
	{ value: 'salary', label: 'Salary' },
	{ value: 'ask', label: 'Questions to ask the interviewer' },
];

export type Question = { id: number; type: QuestionType; q: string; tip: string };

const RAW: Record<QuestionType, [string, string][]> = {
	general: [
		['Tell me about yourself.', 'Give a short summary of your work, your best fit for this job, and why you are here.'],
		['Walk me through your resume.', 'Follow your jobs in order and link each step to this role.'],
		['What do you know about our company?', 'Show that you did your research, then say why it matters to you.'],
		['Why should we hire you?', 'Match your top skills to the needs in the job post.'],
		['What makes you different from other candidates?', 'Name one real strength and give proof from your work.'],
		['How did you hear about this job?', 'Answer in one or two sentences. Name a person or a source if you can.'],
		['What do you know about this role?', 'Repeat the main duties from the job post in your own words.'],
		['What are you looking for in your next job?', 'Describe things that this job really offers, such as skills to use or a team to join.'],
		['Why are you leaving your current job?', 'Stay positive and look ahead. Do not blame your employer.'],
		['Why was there a gap in your work history?', 'State the reason in a calm, short way, and say what you did or learned.'],
		['What does a good day at work look like for you?', 'Describe tasks and habits that fit this job.'],
		['Do you have any questions about the job before we start?', 'Ask one or two real questions about the role or the team.'],
		['How would your friends describe you?', 'Pick two or three traits that fit the job and add a short example.'],
		['What is your work style?', 'Say how you plan, communicate, and handle busy times. Give one example.'],
		['What do you do outside of work?', 'Share a real interest in a few words. Keep it friendly and short.'],
	],
	behavioral: [
		['Tell me about a time you failed.', 'Pick a real failure, say what you learned, and show what you changed.'],
		['Tell me about a time you met a tight deadline.', 'Explain how you planned, what you cut or asked for, and the result.'],
		['Describe a time you made a mistake at work.', 'Own the mistake, say how you fixed it, and say what you do now to prevent it.'],
		['Tell me about a time you solved a hard problem.', 'Describe the problem, your steps, and the result. Use the STAR format.'],
		['Give an example of a time you showed initiative.', 'Show that you saw a need and acted without being asked.'],
		['Tell me about a time you handled a difficult customer.', 'Show calm, listening, and a fix. End with the outcome.'],
		['Describe a time you had to learn something fast.', 'Say how you learned and how you used it right away.'],
		['Tell me about a time you worked under pressure.', 'Show how you stay focused and what you did to keep quality high.'],
		['Tell me about a time you disagreed with your manager.', 'Show respect, a clear reason, and how you reached a decision.'],
		['Describe a time you received tough feedback.', 'Say what the feedback was and what you did with it.'],
		['Tell me about a time you juggled several priorities.', 'Describe how you ranked tasks and told others about the plan.'],
		['Give an example of a goal you reached and how you did it.', 'Pick a clear goal, name your steps, and give the result.'],
		['Tell me about a time you went beyond your job duties.', 'Show the extra step and the value it gave the team or customer.'],
		['Describe a time you changed someone’s mind.', 'Show that you listened first, then used facts or a clear example.'],
		['Tell me about a time you made a decision with little information.', 'Explain how you weighed the risks and what you did next.'],
		['Tell me about your proudest work achievement.', 'Choose one result. Say what you did and why it mattered.'],
	],
	situational: [
		['What would you do if you disagreed with a decision your manager made?', 'Say you would ask questions, share your view with respect, then support the final decision.'],
		['What would you do if you had two deadlines on the same day?', 'Explain how you would rank the work and who you would tell.'],
		['What would you do in your first 30 days in this job?', 'Talk about learning, meeting people, and finding small ways to help.'],
		['How would you handle an unhappy customer?', 'Name the steps: listen, say sorry for the problem, fix it, and follow up.'],
		['What would you do if you found a mistake in your own finished work?', 'Say you would tell the right person, fix it, and check for the same mistake elsewhere.'],
		['What would you do if a coworker was not doing their share?', 'Start with a private, kind talk. Escalate only if it does not help.'],
		['What would you do if you did not know the answer to a customer’s question?', 'Be honest, find the answer, and come back to them.'],
		['How would you handle a task with unclear instructions?', 'Ask questions early, confirm the goal, and write down what you agree.'],
		['What would you do if your workload became too large?', 'Describe how you would ask for help or reset the priorities.'],
		['What would you do if you saw a coworker break a company rule?', 'Show that you care about the rules and know the right way to report.'],
		['How would you handle a change of plan at the last minute?', 'Show that you stay calm, re-plan fast, and tell the team.'],
		['What would you do if your manager asked for something you thought was wrong?', 'Show that you ask questions and follow policy and the law.'],
	],
	motivation: [
		['Why do you want to work here?', 'Name two real things about the company and link them to your goals.'],
		['Why do you want this job?', 'Link the main duties to the work you enjoy and do well.'],
		['What motivates you?', 'Give an honest answer with a short example from your work.'],
		['Why did you choose this career?', 'Tell a short, true story about how you started and what keeps you here.'],
		['What interests you about this industry?', 'Show real curiosity and say what you follow or learn.'],
		['What would make you leave a job?', 'Keep it fair and general, such as no chance to grow or no fit with your values.'],
		['What do you want from a manager?', 'Describe a style that helps you do your best work, such as clear goals and regular feedback.'],
		['What kind of work environment do you like best?', 'Match your answer to what you know about this team.'],
		['Why are you interested in this company over others?', 'Show that you did your research and name a clear reason.'],
		['What excites you about this role?', 'Pick one part of the job that you look forward to and say why.'],
		['What does success mean to you?', 'Talk about results, learning, and helping others.'],
	],
	strengths: [
		['What is your greatest strength?', 'Pick one strength the job needs and give a short proof.'],
		['What is your greatest weakness?', 'Name a real weakness that is not key to the job and show how you work on it.'],
		['What skills do you bring to this job?', 'Name two or three skills from the job post with a short example for each.'],
		['What are you best at?', 'Pick one skill, give an example, and link it to this role.'],
		['What area do you want to improve?', 'Name a real skill you are building and the steps you take.'],
		['What would your manager say is your biggest strength?', 'Use words from real feedback, if you can.'],
		['What would your manager say you need to improve?', 'Be honest and show what you do about it.'],
		['What is a skill you learned recently?', 'Say how you learned it and how you used it.'],
		['How do you handle criticism?', 'Show that you listen, ask questions, and act on feedback.'],
		['What do you find most difficult about your work?', 'Pick a real challenge and show how you handle it.'],
		['What do you do when you are stuck?', 'Describe your steps: try, search, ask, and learn.'],
		['How do you prioritize your work?', 'Describe a simple method, and give a short example.'],
	],
	teamwork: [
		['Do you prefer to work alone or on a team?', 'Say that you can do both and give an example of each.'],
		['Tell me about a time you worked well on a team.', 'Say what your part was and what the team achieved.'],
		['How do you handle conflict with a coworker?', 'Show that you talk directly, listen, and look for a shared goal.'],
		['Describe a time you helped a teammate.', 'Show that you notice needs and offer help without being asked.'],
		['What role do you usually take in a group?', 'Be honest, and show that you can adapt to what the team needs.'],
		['How do you work with people who think differently from you?', 'Show curiosity and respect, with a short example.'],
		['Tell me about a time you worked with a difficult person.', 'Stay fair and focus on what you did to work well together.'],
		['How do you share bad news with your team?', 'Say that you share it early, with facts and a plan.'],
		['How do you work with a team that is in different places or time zones?', 'Talk about clear written updates, shared tools, and set meeting times.'],
		['What do you do when a teammate misses a deadline?', 'Ask what is blocking them, offer help, and tell the lead if needed.'],
		['How do you build trust with new coworkers?', 'Describe small, steady actions, such as listening and keeping your word.'],
	],
	leadership: [
		['Tell me about a time you led a team or a project.', 'Show the goal, how you guided people, and the result.'],
		['What is your leadership style?', 'Describe your style in plain words and give one example.'],
		['How do you motivate a team?', 'Talk about clear goals, thanks, and listening to people.'],
		['How do you handle a team member who is not performing?', 'Show that you give clear feedback early and offer support.'],
		['How do you delegate tasks?', 'Describe how you match tasks to people and check progress without taking over.'],
		['Tell me about a time you had to make an unpopular decision.', 'Show how you explained the reason and kept trust.'],
		['How do you give feedback?', 'Say that you are specific, kind, and timely.'],
		['Tell me about a time you led without being the manager.', 'Show that you guided others through your actions, not your title.'],
		['How do you handle disagreement within your team?', 'Show that you let each person speak and then guide the team to a decision.'],
		['How do you set goals for your team?', 'Describe clear, shared goals and how you check progress.'],
		['What is the hardest part of leading people?', 'Be honest and show what you learned.'],
		['How do you help someone on your team grow?', 'Talk about feedback, new tasks, and support for their goals.'],
	],
	career: [
		['Where do you see yourself in five years?', 'Show a real, realistic goal that fits the path this job offers.'],
		['What are your career goals?', 'Describe a short-term and a long-term goal, and link both to this role.'],
		['What do you want to learn in this job?', 'Name skills that help you and the company.'],
		['How does this job fit your career plans?', 'Show the link between this role and your next steps.'],
		['Would you like to lead a team one day?', 'Give an honest answer and say how you are preparing.'],
		['What do you hope to achieve in your first year?', 'Describe learning goals and one or two results you can reach.'],
		['How do you keep your skills up to date?', 'Name real habits, such as courses, reading, or practice.'],
		['What professional goal have you set recently?', 'Describe the goal, your plan, and your progress.'],
		['Why are you changing careers?', 'Tell a clear story about what you bring from your past work and what draws you to this field.'],
		['Where do you want to be in 10 years?', 'Keep it honest and general. Focus on the kind of work you want to do.'],
	],
	salary: [
		['What are your salary expectations?', 'Give a range based on your research, and say you are open to talk about the whole offer.'],
		['What is your current salary?', 'Some places do not allow this question. Check your local rules. You can redirect to your target range.'],
		['What salary range are you looking for?', 'Use market data for the role and your area, and say your range with confidence.'],
		['Are you flexible on salary?', 'Say what matters to you, such as total pay, benefits, and growth.'],
		['How did you come up with that number?', 'Point to your research, your skills, and the job’s duties.'],
		['What benefits are most important to you?', 'Name two or three real priorities, such as health care or flexible hours.'],
		['Would you accept a lower salary for other benefits?', 'Show that you look at the whole offer and give your honest limits.'],
		['When could you start if we make you an offer?', 'Give a clear date and check your contract for any notice rules.'],
		['Do you have other job offers or interviews?', 'Be honest, brief, and polite. Say that this job is a strong interest.'],
		['If we offer you the job, will you accept it?', 'Say what you can say truthfully. You may ask for time to review the full offer.'],
	],
	ask: [
		['What does a typical day look like in this role?', 'This shows that you think about the real work.'],
		['How do you measure success in this role?', 'This shows that you care about results.'],
		['What are the biggest challenges for the person in this job?', 'This helps you see what the work is really like.'],
		['How would you describe the team’s culture?', 'Listen for how the team works and talks together.'],
		['What are the next steps in the hiring process?', 'Always ask this near the end, so you know what to expect.'],
		['What do you enjoy most about working here?', 'This makes it personal, and you learn about the company.'],
		['What learning or growth chances does the company offer?', 'This shows that you want to grow.'],
		['Who would I work with most closely?', 'This helps you understand your daily team.'],
		['Why is this position open?', 'This helps you learn if it is new or if someone left.'],
		['What would you like the new person to achieve in the first 90 days?', 'This shows that you plan to start well.'],
		['How does the team give feedback?', 'This shows that you value feedback and want to learn how it works here.'],
		['Is there anything about my background that gives you doubts?', 'This gives you a chance to answer worries before the interview ends.'],
	],
};

export const QUESTIONS: readonly Question[] = (Object.keys(RAW) as QuestionType[]).flatMap((type) => RAW[type].map(([q, tip]) => ({ type, q, tip }))).map((x, i) => ({ id: i + 1, ...x }));

export type Filter = QuestionType | 'all';

export function filterQuestions(filter: Filter, list: readonly Question[] = QUESTIONS): Question[] {
	return filter === 'all' ? [...list] : list.filter((q) => q.type === filter);
}

export function typeLabel(type: QuestionType): string {
	return TYPES.find((t) => t.value === type)?.label ?? type;
}

/** Picks a random question from the list. Returns undefined for an empty list. Avoids the current one when possible. */
export function randomQuestion(list: readonly Question[], currentId?: number, rand: () => number = Math.random): Question | undefined {
	if (list.length === 0) return undefined;
	const pool = list.length > 1 ? list.filter((q) => q.id !== currentId) : list;
	return pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))];
}

/** The next question in the list, wrapping to the first. Falls back to the first when the current one is not in the list. */
export function nextQuestion(list: readonly Question[], currentId?: number): Question | undefined {
	if (list.length === 0) return undefined;
	const i = list.findIndex((q) => q.id === currentId);
	return list[(i + 1) % list.length];
}

export const TIMER_MINUTES = [1, 2, 3] as const;

/** 90 -> "1:30". Negative and invalid values show "0:00". */
export function formatClock(seconds: number): string {
	const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
