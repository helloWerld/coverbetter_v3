import React from 'react';
import History from '../../../../components/Generate/History';
import { getCollection } from '../../../../actions/db';
import { notFound } from 'next/navigation';

const DashboardSection = async ({ params }) => {
	const section = (await params).section;
	console.log('params', section);
	switch (section) {
		case 'usage':
			return <div className="dashboard">USAGE</div>;
		case 'settings':
			return <div className="dashboard">SETTINGS</div>;
		case 'billing':
			return <div className="dashboard">BILLING</div>;
		case 'history':
			return (
				<div className="dashboard">
					<History />
				</div>
			);
		case 'tutorials':
			return <div className="dashboard">TUTORIALS</div>;
		case 'support':
			return <div className="dashboard">SUPPORT</div>;
		case 'users':
			const response = await getCollection('users');
			console.log(response);
		default:
			return notFound();
	}
};

export default DashboardSection;
