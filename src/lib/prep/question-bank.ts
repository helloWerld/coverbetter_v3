import type { InterviewRound } from '@/lib/applications/types';

export const JOB_FAMILIES = [
	{ id: 'general', label: 'General' },
	{ id: 'software', label: 'Software' },
	{ id: 'data', label: 'Data and analytics' },
	{ id: 'product', label: 'Product management' },
	{ id: 'design', label: 'Design' },
	{ id: 'marketing', label: 'Marketing' },
	{ id: 'sales', label: 'Sales' },
	{ id: 'customer_support', label: 'Customer support' },
	{ id: 'operations', label: 'Operations' },
	{ id: 'finance', label: 'Finance and accounting' },
	{ id: 'hr', label: 'HR and recruiting' },
	{ id: 'healthcare', label: 'Healthcare' },
	{ id: 'education', label: 'Education' },
	{ id: 'project_management', label: 'Project management' },
	{ id: 'administrative', label: 'Administrative' },
	{ id: 'engineering', label: 'Engineering (non-software)' },
	{ id: 'legal', label: 'Legal and compliance' },
	{ id: 'hospitality_retail', label: 'Hospitality and retail' },
] as const;

export type QuestionType = 'about_you' | 'behavioral' | 'situational' | 'role' | 'company' | 'closing';

export interface Question {
	id: string;
	text: string;
	type: QuestionType;
	/** ['general'] means every family. */
	families: string[];
	tip: string;
	/** True when a STAR story is the right shape for the answer. */
	star: boolean;
}

type Row = readonly [text: string, tip: string];

function build(prefix: string, type: QuestionType, family: string, rows: readonly Row[], star = false): Question[] {
	return rows.map(([text, tip], i) => ({
		id: `${prefix}-${String(i + 1).padStart(3, '0')}`,
		text,
		type,
		families: [family],
		tip,
		star,
	}));
}

// Numbering is continuous inside one prefix, so general questions of mixed type share the "gen" counter.
function buildGeneral(): Question[] {
	const groups: [QuestionType, readonly Row[], boolean][] = [
		['about_you', ABOUT_YOU, false],
		['company', COMPANY, false],
		['situational', SITUATIONAL, false],
		['closing', CLOSING, false],
	];
	const out: Question[] = [];
	for (const [type, rows, star] of groups) {
		for (const [text, tip] of rows) {
			out.push({
				id: `gen-${String(out.length + 1).padStart(3, '0')}`,
				text,
				type,
				families: ['general'],
				tip,
				star,
			});
		}
	}
	return out;
}

const ABOUT_YOU: readonly Row[] = [
	['Tell me about yourself.', 'Give a short story of your work: where you are now, what you did before, and why this role is next.'],
	['Walk me through your resume.', 'Pick three or four steps in order and say what each one taught you.'],
	['Why are you looking for a new job?', 'Talk about what you want to move toward, and keep it free of blame for your last employer.'],
	['Why did you leave your last role?', 'Give a short, honest, neutral reason and move to what you want next.'],
	['What are you looking for in your next role?', 'Name two or three real needs, and show that this job offers them.'],
	['What are your greatest strengths?', 'Choose one or two strengths that the job needs and back each with a short example.'],
	['What is your biggest weakness?', 'Name a real weakness that is not core to the job and say what you do to improve it.'],
	['What motivates you at work?', 'Give a specific motivator and an example of a time it showed in your work.'],
	['Where do you see yourself in five years?', 'Describe growth in skill and scope that fits this company, without naming a rigid job title.'],
	['What are you most proud of in your career so far?', 'Choose one achievement, say your part in it, and give its result.'],
	['How would your last manager describe you?', 'Quote or paraphrase real feedback and give one example that backs it.'],
	['How would your colleagues describe you?', 'Pick two traits, and give one short example for each.'],
	['What kind of work environment helps you do your best work?', 'Be honest, but show that you can also adapt to different settings.'],
	['What kind of manager do you work best with?', 'Describe what helps you, such as clear goals or regular feedback, without criticizing past managers.'],
	['What do you do outside work that makes you better at your job?', 'Link one interest to a work skill, and keep the answer short.'],
	['What skills do you want to build in this role?', 'Name skills that grow your value for this employer, not just for yourself.'],
	['Which part of your background is most relevant to this job?', 'Match one or two parts of your experience directly to the job post.'],
	['What would you say is missing from your background for this role?', 'Name the gap honestly and show a plan or a close skill that covers it.'],
	['Describe your ideal first year in this role.', 'Show a realistic path: learn, deliver a first result, then take on more.'],
	['What makes you different from other candidates for this role?', 'Name one strength that is specific and provable, and avoid claims that you cannot back.'],
	['Why should we hire you?', 'Connect your best two skills to the main needs of the job and finish with a clear result you can deliver.'],
	['What is the best compliment you received at work?', 'Share a real quote, say who gave it, and say what you did to earn it.'],
	['What would you want us to know that is not on your resume?', 'Add one useful fact, such as a skill, a project, or a trait, with a short example.'],
	['How do you stay current in your field?', 'Name two or three specific habits or sources and one recent thing you learned.'],
	['What are your salary expectations?', 'Give a researched range, link it to the job scope, and show that you are open to talk.'],
	['When could you start?', 'Give a clear date or range and mention any notice period.'],
	['How do you handle a gap in your resume?', 'State the reason in one calm sentence and show what you did or learned in that time.'],
	['How do you describe your working style?', 'Give two or three clear traits with one example of how they help a team.'],
	['What does success look like for you in a job?', 'Define success with outcomes and growth, not only with titles or pay.'],
	['Have you applied to other jobs, and what are you looking for in them?', 'Be honest that you are active, and say what links the roles you chose.'],
];

const COMPANY: readonly Row[] = [
	['Why do you want to work here?', 'Name two specific things about the company or team, and tie them to your own goals.'],
	['What do you know about our company?', 'Show real research: the product, a recent news item, and how your skills fit.'],
	['Why are you interested in this role?', 'Link the main duties of the job to what you do best and enjoy.'],
	['What attracted you to our company over our competitors?', 'Give one honest contrast that is based on research and not on rumor.'],
	['What do you think our company does well?', 'Praise something specific and add one thoughtful idea you would like to learn more about.'],
	['What would you change about our product or service?', 'Give one respectful and well-reasoned idea, and ask a question about the context.'],
	['How do our values fit with yours?', 'Choose one stated company value and give a real example of how you live it.'],
	['What do you know about our industry and where it is going?', 'Name one or two trends and say how they affect the role.'],
	['Who do you think our customers are?', 'Describe the customer group with care and say what they need most.'],
	['What do you think are the biggest challenges for our team right now?', 'Give an informed guess and say how you could help with it.'],
	['How did you hear about this position?', 'Answer briefly and, if it was a referral, name the person and what they said.'],
	['What would make you choose us if you had two offers?', 'Be honest about your priorities and show how this company meets them.'],
	['What do you expect from a company as an employer?', 'Name fair, specific expectations such as clear goals, growth, and respect.'],
	['What culture helps you do your best work?', 'Describe a real culture you have thrived in, and link it to what you learned about this company.'],
	['Have you used our product or service?', 'Describe real use, one thing you liked, and one thoughtful observation.'],
	['What do you hope to learn from working with us?', 'Name skills or domains that this company is strong in, and say how you will give back.'],
];

const SITUATIONAL: readonly Row[] = [
	['What would you do in your first 30 days in this role?', 'Describe how you would learn the work, meet people, and pick one small win.'],
	['How would you handle a task that you do not know how to do?', 'Show how you break it down, use resources, ask for help early, and learn.'],
	['What would you do if you disagreed with your manager about an approach?', 'Describe a respectful discussion with data, then a commitment to the final decision.'],
	['What would you do if two senior people gave you conflicting priorities?', 'Show that you would surface the conflict, ask for a joint decision, and keep both sides informed.'],
	['How would you handle a deadline that you know you will miss?', 'Say that you would warn people early, propose options, and protect the most important part.'],
	['What would you do if you found a mistake in your own work after you shared it?', 'Describe quick disclosure, a fix, and a change in process to prevent it again.'],
	['How would you handle a coworker who is not pulling their weight?', 'Start with a private and kind conversation, then escalate only when it is needed.'],
	['What would you do if you were given unclear instructions?', 'Show how you ask clarifying questions, state your assumptions, and confirm the goal.'],
	['How would you handle a heavy workload with many urgent tasks?', 'Describe how you rank by impact and deadline, communicate, and ask for help if needed.'],
	['What would you do if a customer or client was unhappy with your work?', 'Listen first, own the problem, offer a fix, and follow up.'],
	['How would you handle receiving feedback that you disagree with?', 'Show that you listen, ask for examples, think about it, and then act on what is useful.'],
	['What would you do if you saw a colleague break a company rule?', 'Show care for the rule and the person, and describe the right channel to use.'],
	['How would you approach working with a team member who has a very different style?', 'Describe curiosity, a clear agreement on how to work together, and focus on the shared goal.'],
	['What would you do if your project lost its budget halfway through?', 'Show how you would re-scope, rank the work, and talk with stakeholders about trade-offs.'],
	['How would you handle being asked to do something outside your job description?', 'Show flexibility, ask about priorities, and note how it fits your growth.'],
	['What would you do if you did not agree with a company decision that affected you?', 'Describe how you voice a concern in the right way and then support the decision.'],
	['How would you handle a situation where you had no manager available to approve a decision?', 'Explain how you weigh risk, use past guidance, decide, and report back fast.'],
	['What would you do on your first day if no one gave you any work?', 'Show initiative: read, ask questions, offer help, and set up a plan with your manager.'],
];

const CLOSING: readonly Row[] = [
	['Do you have any questions for us?', 'Prepare three questions that show research and care about the work, not only about pay or perks.'],
	['Is there anything about your experience that you would like to add?', 'Use this to mention one strength you did not cover, in two or three sentences.'],
	['Is there anything that makes you doubt that you are a fit for this role?', 'Say it with confidence, name any gap, and show how you would close it.'],
	['What questions do you have about the role or the team?', 'Ask about real work: goals, challenges, and how people collaborate.'],
	['What other concerns would you like to talk about?', 'Raise any real concern calmly, such as hours or location, and show that you want to solve it.'],
	['What would you like to know about our process from here?', 'Ask about timing and next steps, and thank the interviewer for the answer.'],
	['Do you have other offers or interviews right now?', 'Be honest without pressure, and state clearly that this role is a strong interest.'],
	['How soon could you make a decision if we gave you an offer?', 'Give a realistic time and show that you take the decision seriously.'],
	['Is there someone who could speak about your work?', 'Name references who know your work, and say that you have told them to expect a call.'],
	['What else should we know before we finish today?', 'Close with a short summary of why you fit and a clear statement of interest.'],
	['How do you feel about the role after our conversation?', 'Be warm and honest: say what excites you and ask about any open point.'],
	['What would be your biggest concern about joining this team?', 'Show maturity: name a fair concern, such as ramp-up time, and how you would handle it.'],
	['If you were in my seat, what would you ask a candidate?', 'Give a thoughtful question and a short answer that shows your values.'],
	['What did you think of this interview?', 'Be positive and specific about something you learned from the conversation.'],
	['Would you be open to a different role in the company?', 'Say yes if it is true, and name the kind of work you would still want.'],
	['Are you willing to relocate or travel for this job?', 'Answer plainly and give any limit now so there is no surprise later.'],
];

const BEHAVIORAL: readonly Row[] = [
	['Tell me about a time you had a conflict with a coworker. How did you resolve it?', 'Show that you listened, found the real issue, and reached a fair result.'],
	['Describe a time you disagreed with your manager.', 'Show a respectful challenge with facts and a positive outcome.'],
	['Tell me about a time you worked with someone who was hard to work with.', 'Describe how you adjusted your approach and focused on the shared goal.'],
	['Describe a disagreement within a team that you helped settle.', 'Show how you gave everyone a voice and helped the group commit to a path.'],
	['Tell me about a time you had to give difficult feedback to a peer.', 'Describe preparation, a calm and specific message, and the change that followed.'],
	['Describe a time you had to work with a team member you did not like.', 'Keep it professional and show how you built a working relationship.'],
	['Tell me about a time you made a mistake at work.', 'Own the mistake, explain the fix, and say what you changed after.'],
	['Describe a project that did not go as planned.', 'Describe what went wrong, how you responded, and what you learned.'],
	['Tell me about your biggest professional failure.', 'Choose a real failure, take responsibility, and show growth that you can prove.'],
	['Describe a time you missed a goal or a target.', 'Show honest analysis, the actions you took after, and what changed next time.'],
	['Tell me about a time you let a teammate or customer down.', 'Own it, say how you made it right, and describe what you do differently now.'],
	['Describe a time you took a risk that did not pay off.', 'Explain your reasoning at that time, the result, and what you would keep or change.'],
	['Tell me about a time you led a team or a project.', 'Show how you set a direction, shared the work, and measured the result.'],
	['Describe a time you led without formal authority.', 'Show influence through trust, clear communication, and shared goals.'],
	['Tell me about a time you motivated a team during a difficult period.', 'Describe specific actions, such as clear goals and recognition, and the effect on results.'],
	['Describe a time you mentored or trained someone.', 'Show how you adapted to the person and what they achieved after.'],
	['Tell me about a time you had to make a decision without all the information.', 'Show how you weighed the risks, decided, and checked the result.'],
	['Describe a time you delegated a task. How did you choose the person?', 'Explain how you matched the task to the person and kept track of the progress.'],
	['Tell me about a time you had to meet a tight deadline.', 'Describe how you planned, ranked tasks, and delivered, with a clear result.'],
	['Describe a time you had too many tasks to finish. How did you handle it?', 'Show a clear method for ranking, plus communication with the people affected.'],
	['Tell me about a time you worked under a lot of pressure.', 'Show calm actions and specific results rather than a general statement about stress.'],
	['Describe a time you finished a project ahead of schedule.', 'Explain what you did differently and how you kept quality high.'],
	['Tell me about a time you had to change your plan at the last minute.', 'Show quick thinking, clear communication, and a good outcome.'],
	['Describe a time you balanced two competing deadlines.', 'Explain how you decided what came first and how you kept both sides informed.'],
	['Tell me about a time you persuaded someone to accept your idea.', 'Show that you understood their concerns and used evidence to build support.'],
	['Describe a time you influenced a decision without having authority.', 'Describe the relationships and facts you used, and the decision that resulted.'],
	['Tell me about a time you had to convince a skeptical stakeholder.', 'Show how you listened first, met their worry with data, and earned their trust.'],
	['Describe a time you changed someone\'s mind with data.', 'Name the data, how you presented it, and the change that followed.'],
	['Tell me about a time you sold an idea to your team.', 'Show how you framed the benefit and handled the questions.'],
	['Describe a time you worked in an unclear situation.', 'Show how you found structure, asked questions, and made progress step by step.'],
	['Tell me about a time your priorities changed in the middle of a project.', 'Show flexibility, quick re-planning, and a clear message to the team.'],
	['Describe a time you had to learn something new very quickly.', 'Describe your learning method and how you applied it to a real result.'],
	['Tell me about a time you had to adapt to a big change at work.', 'Show a positive and practical response and what you gained from it.'],
	['Describe a time you started a task with no clear direction.', 'Show how you defined the goal, made assumptions, and checked them with others.'],
	['Tell me about a time you received critical feedback.', 'Show that you listened without defense and made a visible change.'],
	['Describe a time you asked for feedback and what you did with it.', 'Show that you seek feedback on purpose and act on it.'],
	['Tell me about a time you improved because of a mentor or manager.', 'Name the lesson, what you changed, and the effect on your work.'],
	['Describe a time you received feedback that surprised you.', 'Show humility, curiosity, and the steps you took.'],
	['Tell me about a time you had to deal with an ethical problem at work.', 'Explain the principle you used, the action you took, and the outcome.'],
	['Describe a time you were asked to do something you thought was wrong.', 'Show a calm, respectful refusal or escalation and the result.'],
	['Tell me about a time you kept something confidential under pressure.', 'Show good judgment and respect for trust.'],
	['Describe a time you reported a problem that others ignored.', 'Show care, evidence, and the way you chose to raise the issue.'],
	['Tell me about a time you put the customer first, even when it was hard.', 'Give a real trade-off and show how you served the customer without harming the team.'],
	['Describe a time you went beyond what was asked of you.', 'Choose an example with real impact, not just extra hours.'],
	['Tell me about a time you solved a hard problem.', 'Describe your steps, the options you rejected, and the measured result.'],
	['Describe a time you found a better way to do a task.', 'Quantify the improvement and say how you got others to adopt it.'],
	['Tell me about a time you used data to make a decision.', 'Name the data, what it showed, and what you did because of it.'],
	['Describe a time you took initiative without being asked.', 'Show that you saw a need, acted, and delivered a result.'],
	['Tell me about a time you identified a problem before others did.', 'Show how you noticed it, raised it, and helped to fix it.'],
	['Describe a time you saved time or money for your team.', 'Use real numbers, and say what you did to make it last.'],
	['Tell me about a time you worked on a team that achieved a goal together.', 'Describe your own part clearly and the team result.'],
	['Describe a time you helped a teammate who was struggling.', 'Show empathy and practical help, and the effect on the team.'],
	['Tell me about a time you worked with people from other departments.', 'Show how you built shared goals and cleared up different priorities.'],
	['Describe a time you worked with a remote or distributed team.', 'Show how you kept communication clear and trust high.'],
	['Tell me about a time you had to build a relationship quickly.', 'Describe a few simple actions that created trust fast.'],
	['Describe a time you shared credit with others.', 'Show that you recognize contributions and keep the team first.'],
	['Tell me about a time you managed a difficult customer or client.', 'Show empathy, boundaries, and a fix that kept the relationship.'],
	['Describe a time you said no to a request.', 'Explain your reason, how you said it, and any alternative you offered.'],
	['Tell me about a time you handled a very stressful day at work.', 'Show calm priorities and what you did to recover afterward.'],
	['Describe a time you had to deliver bad news.', 'Show directness, empathy, and a clear plan for what comes next.'],
	['Tell me about a time you managed a budget or limited resources.', 'Describe the trade-offs you made and the result.'],
	['Describe a time you had to learn from a coworker.', 'Show humility and how you used the new skill.'],
	['Tell me about a time you had to rebuild trust.', 'Describe honest actions over time and how trust returned.'],
	['Describe a time you took ownership of a problem that was not yours.', 'Show how you stepped up, what you did, and the result.'],
	['Tell me about a time you set a goal and reached it.', 'Show a clear goal, your plan, the obstacles, and the measured result.'],
	['Describe a time you had to manage several stakeholders with different needs.', 'Show how you gathered needs, found common ground, and kept everyone informed.'],
	['Tell me about a time you worked on something that was boring or repetitive.', 'Show professionalism, a way to stay accurate, and any improvement you added.'],
	['Describe a time you made a decision that was unpopular.', 'Explain your reasoning, how you communicated, and the result.'],
	['Tell me about a time you had to work with limited guidance.', 'Show independence and the check-ins you used to stay on track.'],
	['Describe a time you turned around a poor result.', 'Show diagnosis, action, and the improvement you measured.'],
	['Tell me about a time you were new to a team and had to earn respect.', 'Show listening, small early wins, and steady follow-through.'],
	['Describe a time you managed your own time well on a long project.', 'Show planning, milestones, and how you handled slips.'],
];

const SOFTWARE: readonly Row[] = [
	['Explain the difference between a process and a thread.', 'Cover memory, scheduling, and communication, and give one use for each.'],
	['How do you decide between a SQL and a NoSQL database for a new feature?', 'Compare data shape, consistency needs, query patterns, and scale, and name a trade-off.'],
	['Walk me through how you would design a URL shortener.', 'Cover requirements, the data model, key generation, caching, and scale.'],
	['How do you approach debugging a bug you cannot reproduce?', 'Describe logs, narrowing the cause, and tests that capture the case.'],
	['What makes a code review useful?', 'Cover clarity, tests, small changes, and kind and specific comments.'],
	['Tell me about a time you reduced technical debt. How did you justify the time?', 'Link the cleanup to a business or speed result and show how you measured it.'],
	['How do you decide what to test and what not to test?', 'Talk about risk, the test pyramid, and the cost of slow or flaky tests.'],
	['Explain how HTTP caching works.', 'Cover cache headers, validation, and when to bust a cache.'],
	['How would you make a slow API endpoint faster?', 'Describe measuring first, then queries, indexes, caching, and payload size.'],
	['What is the difference between authentication and authorization?', 'Define both clearly and give a simple example of each.'],
	['How do you handle a production incident?', 'Cover triage, communication, a fix or rollback, and a blameless review.'],
	['Describe how you would design a rate limiter.', 'Discuss algorithms such as token bucket, storage, and fairness across users.'],
	['How do you keep a large codebase easy to change?', 'Mention clear boundaries, tests, naming, and small steps of refactoring.'],
	['When would you choose a monolith over microservices?', 'Weigh team size, deployment, complexity, and the cost of distributed systems.'],
	['What is your approach to writing a database migration with no downtime?', 'Describe safe steps such as adding before removing, backfills, and rollbacks.'],
	['How do you think about the security of a web application?', 'Cover input validation, secrets, least access, and common risks such as injection.'],
	['Explain what happens when you type a URL into a browser.', 'Walk through DNS, connection, request, response, and rendering in order.'],
];

const DATA: readonly Row[] = [
	['How do you check the quality of a new dataset before you use it?', 'Cover missing values, duplicates, ranges, joins, and a comparison to a known source.'],
	['Explain the difference between a left join and an inner join.', 'Give a short example with rows that appear or disappear.'],
	['How would you explain a p-value to a non-technical manager?', 'Use plain words and an example, and note what a p-value does not tell you.'],
	['Tell me about an analysis that changed a business decision.', 'Name the question, the method, the finding, and the decision that followed.'],
	['How do you choose the right metric for a new product feature?', 'Link the metric to the goal, and mention guardrail metrics and known biases.'],
	['What would you do if two dashboards showed different numbers for the same metric?', 'Describe tracing definitions, filters, and sources, then fixing the shared definition.'],
	['How do you design an A/B test?', 'Cover the hypothesis, sample size, randomization, duration, and the decision rule.'],
	['What is overfitting and how do you prevent it?', 'Explain it simply and name methods such as validation, regularization, and more data.'],
	['How do you deal with missing data?', 'Compare removing, filling, and modeling the gaps, and say how you decide.'],
	['Describe how you would build a model to predict customer churn.', 'Cover the definition of churn, features, a baseline, evaluation, and how the team will use it.'],
	['How do you present a complex finding to executives?', 'Lead with the answer, show one clear chart, and state the action you recommend.'],
	['What SQL techniques do you use for a slow query?', 'Mention reading the query plan, indexes, filters, and avoiding needless scans.'],
	['How do you keep a data pipeline reliable?', 'Cover tests, monitoring, alerts, retries, and clear ownership.'],
	['What is the difference between correlation and causation, and how do you test for causation?', 'Give an example and name experiments or methods that support a causal claim.'],
	['Describe a time that your data told a different story than people expected.', 'Show how you checked your work and shared the result with tact.'],
];

const PRODUCT: readonly Row[] = [
	['How do you decide what to build next?', 'Describe a framework, input from users and data, and how you handle trade-offs.'],
	['Tell me about a product you improved. What did you change and why?', 'Name the problem, the evidence, the change, and the measured effect.'],
	['How do you work with engineers who push back on a plan?', 'Show respect, a shared view of the goal, and a willingness to change the scope.'],
	['How do you define success for a new feature?', 'Name a primary metric, guardrails, and a time to review.'],
	['Describe how you would run user research for a new idea.', 'Cover who you ask, the questions, how many people, and how you use the results.'],
	['How would you handle a stakeholder who wants a feature that you think is wrong?', 'Show how you find the need behind the request and test the idea with evidence.'],
	['Walk me through how you write a product requirements document.', 'Cover the problem, the users, the goals, the scope, and open questions.'],
	['How do you prioritize when everything seems urgent?', 'Explain a clear method and how you explain a "not now" to others.'],
	['Tell me about a launch that did not go well.', 'Show honest review, the cause, and what changed in your process.'],
	['How do you use data in product decisions?', 'Mix quantitative data and user feedback, and name a decision that data changed.'],
	['How would you improve a product that you use every day?', 'Choose a real user problem, give evidence, and propose a small first step.'],
	['How do you say no to a feature request?', 'Show care for the requester, a clear reason, and an alternative when possible.'],
	['What is your approach to a product roadmap?', 'Describe themes, flexible time frames, and how you share and update it.'],
	['How do you work with design and engineering at the start of a project?', 'Show early joint discovery, shared goals, and clear roles.'],
];

const DESIGN: readonly Row[] = [
	['Walk me through a project from the first brief to the final result.', 'Show your process, key decisions, and the effect on users or the business.'],
	['How do you respond when a stakeholder dislikes your design?', 'Show that you ask for the real concern, link to user needs, and stay open.'],
	['How do you decide when a design is done?', 'Link done to goals and testing, and accept that you improve it over time.'],
	['Tell me about a design decision that you changed after user testing.', 'Describe what you saw, what you changed, and the result.'],
	['How do you balance user needs with business goals?', 'Give an example that shows a real trade-off and how you reached a fair result.'],
	['How do you make a design accessible?', 'Mention contrast, keyboard use, labels, text size, and testing with real tools.'],
	['How do you work with developers during hand-off?', 'Show early talks, clear specs, a shared system, and review of the built result.'],
	['What does your process for user research look like?', 'Cover methods, how you choose them, and how you turn findings into design.'],
	['How do you build or maintain a design system?', 'Describe tokens, components, documentation, and how teams adopt it.'],
	['Show me an example of a project where you worked within strict limits.', 'Explain the limits, your creative choices, and the outcome.'],
	['How do you give and receive design critique?', 'Show a method that is specific, kind, and tied to the goal.'],
	['What do you do when you have no time for research?', 'Describe low-cost methods such as quick tests, support data, and clear assumptions.'],
	['How do you measure whether a design worked?', 'Link design to metrics and to user feedback, and name a real example.'],
	['How do you stay inspired and keep your skills fresh?', 'Name real sources and one thing you learned and used recently.'],
];

const MARKETING: readonly Row[] = [
	['Tell me about a campaign you ran. What was the goal and the result?', 'Name the goal, the audience, the channels, and the measured result.'],
	['How do you decide where to spend a limited marketing budget?', 'Describe testing, tracking return, and moving money toward what works.'],
	['How do you define and find a target audience?', 'Cover data, interviews, segments, and how you test your assumptions.'],
	['What metrics do you track for a content program?', 'Link metrics to the goal, such as traffic, leads, and conversion, and not only vanity numbers.'],
	['How would you launch a new product with a small budget?', 'Show a clear audience, a few focused channels, and a way to learn fast.'],
	['Tell me about a campaign that failed. What did you learn?', 'Be honest about the cause and show how you used the lesson.'],
	['How do you work with sales to turn leads into customers?', 'Describe a shared definition of a good lead and a regular feedback loop.'],
	['How do you write for different audiences or channels?', 'Show how you adapt tone, length, and format while the message stays the same.'],
	['What is your approach to SEO?', 'Cover search intent, content quality, technical basics, and how you measure progress.'],
	['How do you test email subject lines or ad copy?', 'Describe a clean test with one change, enough sample size, and a clear decision rule.'],
	['How do you build a brand voice?', 'Describe research, clear principles, examples, and how you keep a team consistent.'],
	['How do you measure the return on a marketing channel?', 'Discuss attribution, its limits, and a practical way to compare channels.'],
	['Describe how you plan a content calendar.', 'Link themes to goals, set a realistic pace, and leave space for timely topics.'],
	['How do you respond to a negative comment about your brand online?', 'Show a calm, quick, honest reply and a path to fix the cause.'],
];

const SALES: readonly Row[] = [
	['Walk me through your sales process from the first contact to a close.', 'Show clear stages and the actions that move a deal forward.'],
	['Tell me about the biggest deal you closed.', 'Describe the buyer, the obstacles, your actions, and the deal size.'],
	['How do you handle the objection "your price is too high"?', 'Show how you explore value, ask questions, and avoid a quick discount.'],
	['How do you build a pipeline when you start with nothing?', 'Describe a mix of research, outreach, referrals, and a steady daily routine.'],
	['Tell me about a deal you lost. What did you learn?', 'Be honest about the reason and show what you do differently now.'],
	['How do you qualify a lead?', 'Name your criteria, such as need, budget, authority, and timeline, and how you check them.'],
	['How do you prepare for a first call with a new prospect?', 'Show research on the person and company and a plan for good questions.'],
	['How do you stay motivated after a string of rejections?', 'Show resilience through habits, learning, and a focus on controllable actions.'],
	['How do you work with a buyer who goes silent?', 'Describe helpful follow-ups, a different contact, and a respectful close of the loop.'],
	['How do you manage your time between new deals and current accounts?', 'Describe a clear system for ranking and a regular schedule.'],
	['How do you use a CRM in your daily work?', 'Show careful notes, next steps for every deal, and accurate forecasts.'],
	['Describe how you handle a customer with several decision-makers.', 'Show how you map the group, find a champion, and address each concern.'],
	['What is your sales quota history?', 'Give real numbers and context, and be honest about the years that varied.'],
	['How do you grow an existing account?', 'Describe regular value checks, listening for new needs, and timely offers.'],
];

const CUSTOMER_SUPPORT: readonly Row[] = [
	['How do you handle a customer who is angry when they contact you?', 'Show calm listening, empathy, a clear fix, and a follow-up.'],
	['Tell me about a time you solved a problem that was not in the script.', 'Show your judgment, the steps you took, and the effect on the customer.'],
	['How do you explain a technical issue to a customer who is not technical?', 'Use plain words, short steps, and a check that the customer understands.'],
	['What would you do if you did not know the answer to a customer question?', 'Say that you would be honest, find the answer, and tell the customer when to expect it.'],
	['How do you manage a long queue of tickets?', 'Describe how you rank by urgency and impact, and keep quality high.'],
	['How do you measure good customer service?', 'Mention satisfaction scores, resolution time, first contact fixes, and also feedback.'],
	['What would you do if a customer asks for something that is against policy?', 'Show kindness, a clear explanation, and any option that fits the policy.'],
	['Tell me about a time you turned an unhappy customer into a loyal one.', 'Describe what you did and what the customer did after.'],
	['How do you stay patient with the same question many times a day?', 'Show real habits and a respect for each new person.'],
	['How do you give feedback to the product team from customer conversations?', 'Describe how you group issues, add examples, and follow up.'],
	['How do you write a clear support email?', 'Cover tone, structure, one clear next step, and no jargon.'],
	['What would you do if you made an error that affected a customer account?', 'Show quick honesty, a fix, an apology, and a check for any similar issues.'],
	['How do you handle several chats at the same time?', 'Describe focus, templates used with care, and how you keep each reply personal.'],
	['How would you handle a customer who threatens to leave?', 'Show that you understand the cause, offer real solutions, and know when to involve a lead.'],
];

const OPERATIONS: readonly Row[] = [
	['Tell me about a process that you improved. What was the result?', 'Show the problem, the change, and a number such as time or cost saved.'],
	['How do you find the cause of a recurring operational problem?', 'Describe collecting facts, asking why more than once, and testing a fix.'],
	['How do you manage inventory or capacity when demand changes fast?', 'Show use of data, a buffer, and fast communication with suppliers or teams.'],
	['How do you decide which tasks to automate?', 'Compare frequency, time, risk, and cost, and start with the highest return.'],
	['What operational metrics do you watch every day?', 'Name a few that fit the job and say what action each one drives.'],
	['Describe a time when a supplier or partner failed to deliver.', 'Show your quick plan B, communication, and a change that lowered future risk.'],
	['How do you write a process so that others can follow it?', 'Describe clear steps, owners, examples, and a review on a regular schedule.'],
	['How do you balance cost, speed, and quality?', 'Give a real example of a trade-off and how you decided.'],
	['How do you manage a team during a busy peak?', 'Describe planning ahead, clear roles, and care for the team.'],
	['Tell me about a time you reduced waste or errors.', 'Name the measure, your actions, and the change in numbers.'],
	['How do you work with other departments that rely on your team?', 'Show clear service levels, regular contact, and fast fixes for problems.'],
	['How would you set up a new process from nothing?', 'Describe talking to users, a small pilot, feedback, and then a wider rollout.'],
	['What tools or systems have you used to track operations?', 'Name the tools and give one example of the insight they gave you.'],
];

const FINANCE: readonly Row[] = [
	['Walk me through the three main financial statements and how they connect.', 'Show how net income, cash, and the balance sheet link together.'],
	['How do you handle the month-end close?', 'Describe a checklist, deadlines, reviews, and how you resolve differences.'],
	['Tell me about a time you found an error in the numbers.', 'Show how you found it, who you told, and how you fixed it.'],
	['How do you build a forecast or a budget?', 'Cover drivers, assumptions, input from owners, and updates against actuals.'],
	['How would you explain a variance to a non-finance manager?', 'Use simple words, the main cause, and the action that follows.'],
	['What does a strong internal control look like?', 'Mention separation of duties, approvals, reconciliations, and documentation.'],
	['Which accounting software and tools have you used?', 'Name the tools and give one task that you did well in each.'],
	['How do you handle tight deadlines during an audit or a close?', 'Show planning, clear requests, and clean records.'],
	['What is the difference between cash and accrual accounting?', 'Explain the timing of revenue and expense and when each method fits.'],
	['How do you decide whether an expense is capital or operating?', 'Describe the rules of useful life and benefit, and when you ask for review.'],
	['Tell me about a time you saved your company money.', 'Give the finding, the action, and the amount.'],
	['How do you keep sensitive financial data safe?', 'Show careful access, clear process, and a habit of checking.'],
	['How would you analyze whether a project is worth the investment?', 'Mention cash flows, return measures, risk, and sensitivity to assumptions.'],
	['How do you reconcile an account that does not balance?', 'Describe a stepwise search: compare totals, then narrow by period and item.'],
];

const HR: readonly Row[] = [
	['Walk me through how you fill a role from the request to the offer.', 'Show intake, sourcing, screening, interviews, and a good candidate experience.'],
	['How do you handle a hiring manager who rejects every candidate?', 'Describe a calibration talk, clear criteria, and data on the market.'],
	['Tell me about a difficult employee relations case you handled.', 'Keep details private, and show fairness, process, and the outcome.'],
	['How do you reduce bias in hiring?', 'Mention structured interviews, clear criteria, diverse sourcing, and review of the data.'],
	['How do you keep a sensitive matter confidential?', 'Show judgment on what to share, with whom, and when the law requires action.'],
	['How do you measure the success of a recruiting process?', 'Name time to hire, quality of hire, offer acceptance, and candidate feedback.'],
	['How would you handle an employee who says they are being treated unfairly?', 'Show listening, a documented process, a fair review, and follow-up.'],
	['How do you source candidates for a role that is hard to fill?', 'Describe channels, networks, and a clear and honest pitch.'],
	['What employment laws and rules do you work with most?', 'Name the rules that matter in your region and how you stay current.'],
	['How do you support managers who give poor performance feedback?', 'Describe coaching, templates, and clear records.'],
	['How do you handle an offer that the candidate declines?', 'Show curiosity about the reason, a respectful reply, and use of the lesson.'],
	['How do you build a good onboarding experience?', 'Cover pre-start contact, a clear first week, goals, and a check-in at 30 days.'],
	['Describe how you would run a pay or benefits review.', 'Describe data sources, fairness checks, and clear communication.'],
	['How do you work with leaders on a hard change such as layoffs?', 'Show planning, legal care, empathy, and clear messages.'],
];

const HEALTHCARE: readonly Row[] = [
	['Tell me about a time you cared for a patient who was very anxious or upset.', 'Show empathy, clear explanation, and a result for the patient.'],
	['How do you prioritize when several patients need you at once?', 'Describe triage by urgency, safety, and clear handoffs.'],
	['Describe a time you noticed a change in a patient condition early.', 'Show observation, quick action, and correct reporting.'],
	['How do you make sure that you follow safety protocols when you are very busy?', 'Show habits such as checklists and a refusal to take shortcuts.'],
	['Tell me about a mistake or near miss, and what you did about it.', 'Show honest reporting, a focus on patient safety, and a process change.'],
	['How do you work with a team that includes doctors, nurses, and other staff?', 'Show clear communication, respect for each role, and shared goals.'],
	['How do you protect patient privacy?', 'Mention the rules that apply, careful handling of records, and no casual talk.'],
	['How do you handle a difficult conversation with a family?', 'Show calm listening, plain words, and respect for their feelings.'],
	['What do you do to avoid burnout in a demanding job?', 'Give healthy habits and show that you ask for support when you need it.'],
	['How do you explain a treatment or instruction to a patient with limited health knowledge?', 'Use plain language, check understanding, and give written steps.'],
	['Tell me about a time you disagreed with a care plan.', 'Show respect, evidence, and the right way to raise the concern.'],
	['What electronic health record systems have you used?', 'Name the systems and describe what you did well in them.'],
	['How do you handle an emergency situation?', 'Show calm, a clear role, and quick use of your training.'],
	['What does patient-centered care mean to you?', 'Give a clear definition and a real example from your work.'],
];

const EDUCATION: readonly Row[] = [
	['How do you plan a lesson or a unit?', 'Start with goals, then activities, checks for learning, and flexible time.'],
	['How do you support a student who is falling behind?', 'Describe early signs, a personal plan, and contact with the student and family.'],
	['How do you manage a classroom with different learning needs?', 'Show varied methods, clear routines, and support for each student.'],
	['Tell me about a lesson that did not work. What did you change?', 'Show honest review of what happened and the change that helped.'],
	['How do you handle a disruptive student?', 'Show calm, clear expectations, respect, and a focus on the cause.'],
	['How do you measure whether students are learning?', 'Mix quick checks, projects, and tests, and use the results to adjust.'],
	['How do you work with parents or guardians?', 'Show regular, positive contact and a clear plan for problems.'],
	['How do you use technology in teaching?', 'Name tools that serve a goal, not tools for their own sake.'],
	['How do you keep students engaged?', 'Give specific methods and an example from your work.'],
	['How do you make your classroom inclusive?', 'Describe respect, access, and varied examples and voices.'],
	['How do you work with colleagues on a shared curriculum?', 'Show planning together, sharing resources, and open feedback.'],
	['How do you handle a conflict between students?', 'Describe listening to each side, a fair process, and a repair step.'],
	['What is your philosophy of teaching?', 'Keep it short, concrete, and linked to what you do in a lesson.'],
	['How do you give feedback that helps students improve?', 'Show feedback that is specific, timely, and kind, with a next step.'],
];

const PROJECT_MANAGEMENT: readonly Row[] = [
	['How do you build a project plan from the start?', 'Cover scope, tasks, owners, dates, risks, and how you get agreement.'],
	['Tell me about a project that went over time or budget. What did you do?', 'Show early warning, options, trade-offs, and a lesson.'],
	['How do you manage scope creep?', 'Describe a change process, clear impact on time and cost, and a decision by the right people.'],
	['How do you keep stakeholders informed?', 'Show a regular rhythm, clear status, and no surprises.'],
	['How do you identify and manage project risks?', 'Describe a risk list, owners, triggers, and plans to reduce or respond.'],
	['How do you handle a team member who misses deadlines?', 'Show early contact, support, a clear plan, and escalation if needed.'],
	['Which methods do you use, such as agile or waterfall, and how do you choose?', 'Show that you fit the method to the project and team.'],
	['How do you run a good project meeting?', 'Describe a clear goal, short time, decisions, and written actions.'],
	['What tools do you use to track project work?', 'Name the tools and explain how they help the team and the stakeholders.'],
	['How do you deal with two stakeholders who want different results?', 'Show how you bring them together on the goals and get a clear decision.'],
	['How do you decide when a project is ready to launch?', 'Describe clear criteria, testing, a rollout plan, and a way to reverse.'],
	['Tell me about a project that you closed and the lessons you collected.', 'Show a review of results and how you passed the lessons on.'],
	['How do you estimate time and effort?', 'Describe using past data, input from the doers, and a buffer for risk.'],
	['How do you manage a project when you have no direct authority over the team?', 'Show influence through clarity, trust, and a shared goal.'],
];

const ADMINISTRATIVE: readonly Row[] = [
	['How do you organize your day when many people send you requests?', 'Show a clear method of ranking and a way to keep people informed.'],
	['Tell me about a time you managed a complex calendar for a busy executive.', 'Describe how you resolved conflicts and protected key time.'],
	['How do you handle confidential information?', 'Show care, a clear habit, and an example of good judgment.'],
	['What office software and tools are you strongest in?', 'Name the tools and one task where you saved time with them.'],
	['How do you prepare for and follow up on a meeting?', 'Cover the agenda, materials, notes, and tracking of actions.'],
	['Describe a time you organized an event or a trip.', 'Show planning, budget, a backup plan, and a good result.'],
	['How do you handle a request from two managers at the same time?', 'Describe raising the conflict, asking for priorities, and staying neutral.'],
	['How do you make sure that your work has no errors?', 'Describe checklists, a second look, and learning from errors.'],
	['What would you do if you did not have the authority to answer a request?', 'Show that you know who to ask and that you follow up.'],
	['How do you keep files and records organized?', 'Describe a clear naming system and a regular review.'],
	['How do you deal with a visitor or caller who is upset?', 'Show calm, listening, and a path to help.'],
	['Tell me about a process you improved in an office.', 'Name the change and the time or errors you saved.'],
	['How do you manage a long list of small tasks?', 'Describe batching, deadlines, and a visible list.'],
];

const ENGINEERING: readonly Row[] = [
	['Walk me through a design project from requirements to a finished product.', 'Show the requirements, the options, the choice, the tests, and the result.'],
	['How do you make sure that a design is safe?', 'Mention standards, safety factors, review, and testing.'],
	['Tell me about a time a test or a prototype failed.', 'Show your analysis of the cause and the change you made.'],
	['How do you find the root cause of a failure in the field?', 'Describe data, reproduction, a structured method, and a check on the fix.'],
	['How do you balance cost, quality, and schedule on a project?', 'Give a real example of trade-offs and how you explained them.'],
	['Which engineering tools or software do you use most?', 'Name them and describe one task where they added real value.'],
	['How do you document your work so others can use it?', 'Show clear drawings, specs, and records that match the standard of the company.'],
	['How do you work with a manufacturing or field team on a design?', 'Show early contact, listening to practical limits, and a quick response to issues.'],
	['Describe a time you improved a product or a process.', 'Quantify the change in cost, quality, or time.'],
	['What standards and codes do you work with?', 'Name the standards in your area and how you keep up with changes.'],
	['How do you handle a design change late in a project?', 'Show impact analysis, a clear message, and a controlled change.'],
	['How do you check your calculations?', 'Describe independent checks, simple estimates, and peer review.'],
	['How do you deal with a safety concern that others ignore?', 'Show that you hold to safety, use evidence, and raise it in the right way.'],
	['Tell me about a project where you worked with other engineering fields.', 'Show clear interfaces, shared documents, and good communication.'],
];

const LEGAL: readonly Row[] = [
	['How do you approach a legal issue that you have not seen before?', 'Describe a clear method of research, authority, and a plan to check your view.'],
	['Tell me about a time you had to explain a legal risk to a non-lawyer.', 'Show plain language, a recommendation, and a practical result.'],
	['How do you manage many matters with different deadlines?', 'Show calendars, ranking by risk, and early communication.'],
	['How do you handle confidential or privileged information?', 'Show strict habits and an example of good judgment.'],
	['Describe your approach to reviewing a contract.', 'Cover purpose, key terms, risk, fallback positions, and clear comments.'],
	['What would you do if a business team wanted to take a legal risk that you felt was too high?', 'Show that you give clear advice, offer options, and escalate when needed.'],
	['How do you keep up with changes in the law?', 'Name specific sources and how you share what you learn.'],
	['Tell me about a time you found a compliance problem.', 'Show how you assessed it, reported it, and helped to fix it.'],
	['How do you write a clear legal memo or a policy?', 'Describe a short answer first, then reasoning, and plain wording.'],
	['How do you work with outside counsel or regulators?', 'Show clear requests, good records, and a respectful tone.'],
	['How do you balance being helpful to the business with managing risk?', 'Give a real example and show your judgment.'],
	['What does a good compliance program include?', 'Name policies, training, monitoring, reporting, and a response to issues.'],
	['Describe a time you negotiated a hard term.', 'Show preparation, interests behind positions, and the result.'],
];

const HOSPITALITY_RETAIL: readonly Row[] = [
	['Tell me about a time you helped a guest or a customer who was unhappy.', 'Show listening, a fast fix, and a good ending.'],
	['How do you stay calm and friendly during a very busy shift?', 'Give real habits, such as clear steps and teamwork.'],
	['What would you do if two customers needed help at once?', 'Describe a quick acknowledgment, a fair order, and a team call for help.'],
	['How do you handle a customer who wants a refund that policy does not allow?', 'Show kindness, a clear reason, and any alternative you can offer.'],
	['How do you work with a team during a rush?', 'Show clear communication, trust, and willingness to help in any area.'],
	['Tell me about a time you suggested an extra product or service that the customer liked.', 'Show that you listened first and that the offer matched a real need.'],
	['How do you make sure the work area stays clean and ready?', 'Describe a routine, standards, and attention to small things.'],
	['How do you deal with cash or payments carefully?', 'Show accuracy, a habit of counting twice, and honesty.'],
	['How do you handle an irregular schedule or late shifts?', 'Show reliability and a plan that works for you.'],
	['What would you do if you noticed theft or a safety problem?', 'Describe the right steps, a report to the manager, and care for people.'],
	['How do you learn a menu, a product line, or a system fast?', 'Describe study habits and asking questions during real work.'],
	['What does great service mean to you?', 'Give a clear idea and a real example.'],
	['How do you handle a guest with a special request or a complaint about food?', 'Show care, a clear process, and a quick follow-up.'],
	['How do you keep up your energy and a positive attitude on long shifts?', 'Give honest habits and show a focus on the guest.'],
];

const ROLE_GROUPS: [string, string, readonly Row[]][] = [
	['software', 'sw', SOFTWARE],
	['data', 'data', DATA],
	['product', 'prod', PRODUCT],
	['design', 'des', DESIGN],
	['marketing', 'mkt', MARKETING],
	['sales', 'sales', SALES],
	['customer_support', 'cs', CUSTOMER_SUPPORT],
	['operations', 'ops', OPERATIONS],
	['finance', 'fin', FINANCE],
	['hr', 'hr', HR],
	['healthcare', 'hc', HEALTHCARE],
	['education', 'edu', EDUCATION],
	['project_management', 'pm', PROJECT_MANAGEMENT],
	['administrative', 'adm', ADMINISTRATIVE],
	['engineering', 'eng', ENGINEERING],
	['legal', 'legal', LEGAL],
	['hospitality_retail', 'hosp', HOSPITALITY_RETAIL],
];

export const QUESTIONS: Question[] = [
	...buildGeneral(),
	...build('beh', 'behavioral', 'general', BEHAVIORAL, true),
	...ROLE_GROUPS.flatMap(([family, prefix, rows]) => build(prefix, 'role', family, rows)),
];

// Title rules run in this order, and the first match wins. Specific rules come before broad ones,
// for example "data engineer" must match before "engineer".
const RULES: [string, RegExp][] = [
	['data', /\b(data (scientist|analyst|engineer|science|analytics)|analytics|business intelligence|bi (analyst|developer)|machine learning|ml engineer|statistician)\b/i],
	['project_management', /\b(project (manager|coordinator|management)|program manager|scrum master|delivery manager|pmo)\b/i],
	['product', /\bproduct (manager|owner|lead|management|director)\b/i],
	['design', /\b(designer|ux|ui\/ux|ui|graphic|creative director|illustrator|art director)\b/i],
	['software', /\b(software|developer|frontend|front-end|backend|back-end|full[- ]?stack|devops|sre|site reliability|programmer|swe|qa engineer|sdet|engineering manager|web engineer|mobile engineer|cloud engineer|platform engineer)\b/i],
	['customer_support', /\b(customer (support|service|success|care|experience)|support (specialist|agent|representative|engineer)|help ?desk|call cent(er|re)|technical support)\b/i],
	['hospitality_retail', /\b(server|bartender|barista|chef|cook|hotel|hospitality|retail|store manager|cashier|waiter|waitress|front desk|sales associate|restaurant|host(ess)?)\b/i],
	['sales', /\b(sales|account (executive|manager)|business development|sdr|bdr|inside sales|territory manager)\b/i],
	['marketing', /\b(marketing|seo|sem|content (writer|strategist|manager|creator)|copywriter|social media|brand (manager|strategist)|growth (manager|marketer)|communications|public relations|pr (manager|specialist))\b/i],
	['finance', /\b(accountant|accounting|finance|financial|auditor|controller|bookkeeper|fp&a|treasury|payroll|tax (analyst|accountant|specialist))\b/i],
	['hr', /\b(human resources|hr|recruiter|recruiting|talent (acquisition|partner)|people (partner|operations|ops)|hrbp|sourcer)\b/i],
	['healthcare', /\b(nurse|nursing|physician|doctor|clinical|medical|healthcare|health care|therapist|pharmac(y|ist)|dental|hygienist|caregiver|paramedic|radiolog\w*|patient)\b/i],
	['education', /\b(teacher|tutor|professor|instructor|educator|teaching|principal|curriculum|lecturer|school)\b/i],
	['legal', /\b(attorney|lawyer|paralegal|counsel|legal|compliance|law clerk|contracts? (manager|specialist))\b/i],
	['administrative', /\b(administrative|executive assistant|office (manager|assistant|coordinator)|receptionist|secretary|data entry|personal assistant|admin)\b/i],
	['operations', /\b(operations|supply chain|logistics|warehouse|procurement|dispatcher|fulfillment|inventory|purchasing|business operations)\b/i],
	['engineering', /\b(mechanical|electrical|civil|chemical|manufacturing|industrial|structural|hardware|process|aerospace|biomedical|environmental|field|systems) engineer(ing)?\b|\bengineer(ing)?\b/i],
];

/** Picks a job family from the job title first, then from the post text. Falls back to 'general'. */
export function detectFamily(jobTitle: string, jobPost?: string): string {
	const title = (jobTitle ?? '').trim();
	if (title) {
		for (const [family, re] of RULES) if (re.test(title)) return family;
	}
	const post = (jobPost ?? '').trim();
	if (post) {
		// A post has many words, so count matches per family and need at least two hits.
		let best = 'general';
		let bestCount = 1;
		for (const [family, re] of RULES) {
			const hits = post.match(new RegExp(re.source, 'gi'))?.length ?? 0;
			if (hits > bestCount) {
				best = family;
				bestCount = hits;
			}
		}
		return best;
	}
	return 'general';
}

/** General questions plus the questions of one family, in bank order. An unknown family gives general only. */
export function questionsFor(family: string, opts?: { limit?: number; types?: string[] }): Question[] {
	const types = opts?.types;
	let out = QUESTIONS.filter(
		(q) => (q.families.includes('general') || q.families.includes(family)) && (!types || types.includes(q.type)),
	);
	if (opts?.limit !== undefined && opts.limit >= 0) out = out.slice(0, opts.limit);
	return out;
}

export const QUESTIONS_TO_ASK: Record<InterviewRound, string[]> = {
	phone_screen: [
		'Can you tell me what the next steps in the process look like, and how long each one takes?',
		'What are the most important skills for this role, so that I can focus on them in later rounds?',
		'Is the team hiring to grow, or to replace a person who left?',
		'What is the salary range that you planned for this role?',
		'Is this role remote, hybrid, or on site, and is there any flexibility?',
		'Who would I report to, and how large is the team?',
		'How many people are you speaking with at this stage?',
		'Is there anything in my background that you would like me to explain more?',
	],
	first: [
		'What does a good first 90 days look like in this role?',
		'What are the biggest challenges the team faces right now?',
		'How do you measure success for this role after the first year?',
		'How does the team decide priorities when two projects compete?',
		'What do you enjoy most about working here, and what would you change?',
		'How does the team give feedback, and how often?',
		'Which skills would you like a new person to bring that the team does not have yet?',
		'How does this team work with other teams, and where does it get stuck?',
		'What would make someone in this role really stand out?',
	],
	second: [
		'Which goals matter most for this team in the next two quarters, and how does this role help with them?',
		'Who are the people I would work with every day, and how do they like to communicate?',
		'Can you describe a recent project that went well and one that did not?',
		'How are decisions made on this team, and who has the final say?',
		'What tools, processes, or habits would you like to improve?',
		'How has this role changed since it was created?',
		'What growth paths have people in this role taken?',
		'What support would I receive in my first weeks to get up to speed?',
	],
	final: [
		'What concerns, if any, do you have about my fit for this role, so that I can answer them now?',
		'What would you like me to achieve in the first six months?',
		'How would you describe the culture here in three words, and can you give an example?',
		'What is the timeline for a decision, and who makes it?',
		'What does leadership expect from this team over the next year?',
		'How does the company support learning and development?',
		'What do people who succeed here have in common?',
		'Is there anything else I can send to help with your decision?',
		'What are the next steps after this conversation?',
	],
	other: [
		'Can you tell me more about how this conversation fits into the hiring process?',
		'What would you like to learn about me that we have not covered?',
		'What does the team need most right now?',
		'What does a typical week look like in this role?',
		'How would you describe the team culture?',
		'What are the next steps, and when can I expect to hear from you?',
	],
};
