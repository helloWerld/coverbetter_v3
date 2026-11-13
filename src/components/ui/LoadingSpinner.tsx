import React from 'react';
import { FaSpinner } from 'react-icons/fa6';

const LoadingSpinner = () => {
	return (
		<div className="bg-transparent flex items-center justify-center animate-spin text-primary text-4xl">
			<FaSpinner />
		</div>
	);
};

export default LoadingSpinner;
