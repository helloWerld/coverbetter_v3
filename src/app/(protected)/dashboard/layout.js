import React from 'react';
import Sidebar from '../../../components/Dashboard/Sidebar';

const layout = ({ children }) => {
	return (
		<div className="flex flex-row relative">
			<Sidebar />
			{children}
		</div>
	);
};

export default layout;
