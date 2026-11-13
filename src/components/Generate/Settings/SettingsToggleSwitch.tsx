import React from 'react';

const SettingsToggleSwitch = () => {
	return (
		<div className="form-control w-full !bg-black rounded-lg px-3 py-1 mt-4">
			<label className="label cursor-pointer ">
				<span className="label-text text-neutral-content">Bullet Points</span>
				<input
					type="checkbox"
					className="toggle toggle-primary"
					defaultChecked
				/>
			</label>
		</div>
	);
};

export default SettingsToggleSwitch;
