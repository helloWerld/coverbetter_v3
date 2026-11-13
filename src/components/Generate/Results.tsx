import LoadingSpinner from '../ui/LoadingSpinner';

const Results = ({
	coverLetter,
	isLoading,
}: {
	coverLetter: string;
	isLoading: boolean;
}) => {
	if (coverLetter) {
		return (
			<>
				<div className="divider divider-primary opacity-50"></div>
				<textarea
					readOnly
					value={coverLetter}
					className="textarea w-full border border-neutral-content/50 focus:border-primary rounded-xl p-6 bg-transparent"
				></textarea>
			</>
		);
	} else if (isLoading) {
		return (
			<>
				<div className="divider divider-primary opacity-50"></div>
				<div className="flex flex-row items-center justify-center gap-4 textarea w-full border border-neutral-content/50 focus:border-primary rounded-xl p-6 bg-transparent">
					<LoadingSpinner />
					<p>Generating Cover Letter, please wait...</p>
				</div>
			</>
		);
	}
};

export default Results;
