'use server';

import 'server-only';
import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.DB_URI) {
	throw new Error('Mongo URI not found!');
}

let client;
let clientPromise;

// Initialize the MongoDB client only once
if (!global._mongoClientPromise) {
	client = new MongoClient(process.env.DB_URI, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		},
	});
	global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

// Helper function to get the database
async function getDB(dbName) {
	const connectedClient = await clientPromise;
	return connectedClient.db(dbName);
}

// Get Collection
export async function getCollection(collectionName) {
	try {
		const db = await getDB('coverbetter');
		const data = await db.collection(collectionName).find({}).toArray();
		return data;
	} catch (error) {
		console.error('Error getting collection', error);
		return null;
	}
}

// CREATE
export async function createNewUserDocument(
	authId,
	name,
	email,
	image,
	status
) {
	try {
		const db = await getDB('coverbetter');
		const response = await db.collection('users').insertOne({
			authId,
			name,
			email,
			image,
			status,
			settings: {},
			date_created: new Date(),
			last_updated: new Date(),
		});
		console.log('Create New User Response', response);
		return response;
	} catch (error) {
		console.error('Error creating user document', error);
		return null;
	}
}

// READ
export async function getUserDocument(authSession) {
	try {
		console.log('AUTH SESSION', authSession);
		const db = await getDB('coverbetter');
		const response = await db
			.collection('users')
			.findOne({ authId: authSession?.user?.id });
		console.log('GET USER DOC RESPONSE', response);
		return response;
	} catch (error) {
		console.error('Error getting user document', error);
		return null;
	}
}

export async function getCoverLetters(authSession) {
	try {
		const db = await getDB('coverbetter');
		const response = await db
			.collection('cover_letters')
			.find({ owner: authSession?.user?.id })
			.toArray();
		console.log('Get cover letters', response);
		return response;
	} catch (error) {
		console.error('Error getting cover letters', error);
		return null;
	}
}
