import React from 'react';
import { auth } from '@/auth';
import { getUserDocument } from '../../../actions/db';
import Image from 'next/image';

const Dashboard = async () => {
	const session = await auth();
	const user = await getUserDocument(session);
	const { name, email, image, date_created, status } = user;
	const details = [
		{ title: 'Name', value: name },
		{ title: 'Email', value: email },
		{ title: 'Date Created', value: date_created.toLocaleDateString() },
	];

	return (
		<div className="dashboard">
			<div className="dashboard-section">
				<h1 className="text-3xl font-semibold mb-6">User Details</h1>
				<div className="flex flex-row w-full gap-12">
					<div className="w-fit">
						<Image
							src={image}
							width={100}
							height={100}
							className="size-24 rounded-full"
							alt={`${name} profile image`}
						/>
					</div>
					<div className="flex flex-col grow">
						{details.map((detail) => (
							<p
								key={detail.title}
								className="flex flex-row items-center gap-2 font-light"
							>
								<span className="font-semibold text-lg">{detail.title}: </span>
								{detail.value}
							</p>
						))}
					</div>
				</div>
				<h2 className="text-3xl font-semibold my-6">Credits Available</h2>
				<div className="flex flex-row flex-wrap gap-4 mb-4">
					<div className="flex flex-row items-center justify-between bg-transparent border border-primary-content/50 rounded-xl grow min-w-64 p-6">
						<p>Free Credits</p>
						<p>{status?.free_credits}</p>
					</div>
					<div className="flex flex-row items-center justify-between bg-transparent border border-primary-content/50 rounded-xl grow min-w-64 p-6">
						<p>Paid Credits</p>
						<p>{status?.paid_credits}</p>
					</div>
					<div className="flex flex-row items-center justify-between bg-transparent border border-primary-content/50 rounded-xl grow min-w-64 p-6">
						<p>Subscription</p>
						<p>{status.subscription ? status.subscription : 'N/A'}</p>
					</div>
				</div>
				<div className="flex flex-row gap-4 w-full">
					<button className="btn btn-primary grow">Buy Credits</button>
					<button className="btn btn-secondary grow">
						Subscribe to Premium
					</button>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
