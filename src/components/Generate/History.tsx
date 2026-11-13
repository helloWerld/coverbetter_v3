import React from 'react';
import { FaPenAlt } from 'react-icons/fa';
import { FaCopy, FaEye, FaFileExport } from 'react-icons/fa6';

const History = () => {
	const data = [
		{
			id: 0,
			date: '12/7/24',
			resume: 'Resume goes here',
			job_description: 'Job description goes here',
			cover_letter: 'Cover letter goes here.',
		},
		{
			id: 1,
			date: '12/7/24',
			resume: 'Resume goes here',
			job_description: 'Job description goes here',
			cover_letter: 'Cover letter goes here.',
		},
		{
			id: 2,
			date: '12/7/24',
			resume: 'Resume goes here',
			job_description: 'Job description goes here',
			cover_letter: 'Cover letter goes here.',
		},
		{
			id: 3,
			date: '12/7/24',
			resume: 'Resume goes here',
			job_description: 'Job description goes here',
			cover_letter: 'Cover letter goes here.',
		},
	];
	return (
		<div className="max-w-screen-lg mx-auto overflow-x-auto">
			<table className="table table-zebra text-primary-content">
				{/* head */}
				<thead className="bg-primary text-primary-content">
					<tr>
						<th>Date</th>
						<th>Resume</th>
						<th>Job Description</th>
						<th>Cover Letter</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{data.map((entry) => (
						<tr key={entry.id}>
							<th>{entry.date}</th>
							<td>
								<p className="line-clamp-1">Resume goes here.</p>
							</td>
							<td>
								<p className="line-clamp-1">Job description goes here</p>
							</td>
							<td>
								<p className="line-clamp-1">Cover letter goes here.</p>
							</td>
							<td>
								<div className="flex flex-row gap-4 text-lg">
									<button>
										<FaEye />
									</button>
									<button>
										<FaPenAlt />
									</button>
									<button>
										<FaFileExport />
									</button>
									<button>
										<FaCopy />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="join grid grid-cols-2 w-40 md:mx-auto my-4 mx-2">
				<button className="join-item btn btn-sm btn-primary border border-primary-content hover:border-primary-content hover:bg-base-300">
					Previous
				</button>
				<button className="join-item btn btn-sm btn-primary border border-primary-content hover:border-primary-content hover:bg-base-300">
					Next
				</button>
			</div>
		</div>
	);
};

export default History;
