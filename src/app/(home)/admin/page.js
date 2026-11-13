import React from 'react';
import {
	createNewUserDocument,
	getCoverLetters,
	getUserDocument,
} from '../../../actions/db';
import { auth } from '@/auth';
import { toast } from 'react-toastify';

const Admin = async () => {
	const session = await auth();
	if (!session) {
		redirect('/login');
	}
	console.log(session?.user);
	const { id, name, email, image } = session?.user;
	return (
		<div className="min-h-screen w-full flex items-center justify-center flex-col gap-4">
			{/* // ADD NEW USER */}
			<form
				action={async () => {
					'use server';
					console.log('click');
					const status = {
						free_credits: 1,
						paid_credits: 0,
						subscription: 0,
					};
					const response = await createNewUserDocument(
						id,
						name,
						email,
						image,
						status
					);
					console.log('Response', response);
				}}
			>
				<button className="btn btn-secondary" type="submit">
					Add New User
				</button>
			</form>
			{/* // GET USER DOCUMENT */}
			<form
				action={async () => {
					'use server';

					const response = await getUserDocument(session);
					console.log('User Doc Response', response);
				}}
			>
				<button className="btn btn-secondary">Get User Doc</button>
			</form>
			{/* // GET COVER LETTERS */}
			<form
				action={async () => {
					'use server';
					const response = await getCoverLetters(session);
					console.log('Cover Letters Response', response);
				}}
			>
				<button className="btn btn-secondary">Get Cover Letters</button>
			</form>
		</div>
	);
};

export default Admin;
