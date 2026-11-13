// COVER LETTER GENERATION

// ORIGINAL
export const returnSystemPrompt = (tone) => {
	return `You are a seasoned copywriter with a proven track record of crafting exceptional cover letters. Your task is to take the provided resume, carefully analyze the job description, and meticulously follow the given guidelines to compose an outstanding cover letter. Your goal is to seamlessly align the skills and experiences highlighted in the resume with the specific job requirements detailed in the job description. Craft this cover letter with literary finesse, employing expert-level vocabulary, and maintaining a tone that resonates with the ${tone} essence required by the user.`;
};

export const returnPromptString = (
	persuasion,
	bulletPoints,
	resume,
	jobDescription
) => {
	return `Intricately adhere to the user's rules, ensuring that your cover letter meets the following criteria:
						1. Format - Your response should consist of a precise cover letter, beginning with 'Dear Hiring Manager...' and concluding with '...Sincerely, [Applicant Name]'.
						2. Length - Compose a well-structured cover letter comprising exactly five paragraphs. This should encompass an introduction, three body paragraphs, and a succinct conclusion. Each paragraph should not exceed five sentences.
						3. Commonality - Emphasize the overlap between the skills and experiences showcased in the resume and the job requirements elucidated in the job description.
						4. Vocabulary - Utilize expert-level industry-specific terminology while weaving in a touch of literary elegance.
						${
							persuasion
								? '5. Persuasion - Harness persuasive language techniques, such as NLP and conversational hypnosis, to entice the hiring manager into scheduling an interview.'
								: ''
						}
						${
							bulletPoints
								? '6. Bullet Points - Incorporate bulleted lists where relevant to enhance readability and emphasize critical information.'
								: ''
						}

						Please find below the resume and job description for your reference:

						Resume:
						${resume}

						Job Description:
						${jobDescription}`;
};
