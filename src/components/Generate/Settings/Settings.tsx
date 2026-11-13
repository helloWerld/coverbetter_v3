import { auth } from '@/auth';
import React, { useState } from 'react';
import SettingsToggleSwitch from './SettingsToggleSwitch';

const Settings = ({
	credits,
	activeSubscription,
}: {
	credits: number;
	activeSubscription: boolean;
}) => {
	const [basicSettings, setBasicSettings] = useState([
		{
			id: 0,
			name: 'tone',
			selected: false,
			options: ['professional', 'persuasive'],
		},
		{
			id: 1,
			name: 'Style',
			selected: false,
			options: ['Casual', 'Persuasive', 'Argumentative', 'Complimentative'],
		},
		{
			id: 2,
			name: 'Writing Level',
			selected: false,
			options: ['Average', 'High School', 'College', 'Expert Copywriter'],
		},
	]);

	return (
		<>
			<div className="flex flex-col gap-4 px-6 pb-6">
				<div className="flex flex-col lg:flex-row gap-4">
					<div className=" w-full lg:w-1/2 bg-neutral rounded-xl p-3">
						<h3 className="font-semibold">Basic</h3>
						<div className="flex flex-row flex-wrap gap-3 my-2">
							{basicSettings.map((setting) => (
								<details key={setting.id} className="dropdown grow min-w-64">
									<summary className="btn btn-sm btn-secondary w-full capitalize">
										{setting.selected
											? `${setting.name}: ${setting.selected}`
											: setting.name}
									</summary>
									<ul className="menu dropdown-content bg-base-300 border border-neutral-content/30 rounded-box z-[1] w-full mt-2 p-2 shadow">
										{setting.options.map((option) => (
											<li key={option} className="capitalize">
												<a>{option}</a>
											</li>
										))}
									</ul>
								</details>
							))}
						</div>
						<SettingsToggleSwitch />
					</div>
					<div className="w-full lg:w-1/2 bg-neutral rounded-xl p-3">
						<h3 className="font-semibold">Advanced</h3>
					</div>
				</div>
				<div className="w-full bg-neutral rounded-xl p-3">
					<h3 className="font-semibold">Premium</h3>
				</div>
			</div>
		</>
	);
};

export default Settings;
