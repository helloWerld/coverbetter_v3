import React from 'react';
import { FaFaceAngry } from 'react-icons/fa6';

const Loading = () => {
	return (
		<div className="w-full min-h-screen flex items-center justify-center">
			<FaFaceAngry className="animate-spin" />
		</div>
	);
};

export default Loading;
