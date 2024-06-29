import "react-native-url-polyfill/auto";
import { Account, Avatars, Client, Databases, ID, Query } from "appwrite";
export const config = {
	endpoint: "https://cloud.appwrite.io/v1",
	platform: "com.zipzap.aora",
	projectId: "667fe7460019ba608c41",
	databaseId: "667fe87600349ea650f8",
	userCollectionId: "667fe8a8000b003abf45",
	videoCollectionId: "667fe8ee001fab80fffd",
	storageId: "667fea7200108e87061c",
};

// Init your React Native SDK
const client = new Client();

client
	.setEndpoint(config.endpoint) // Your Appwrite Endpoint
	.setProject(config.projectId); // Your project ID

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
	try {
		const newAccount = await account.create(
			ID.unique(),
			email,
			password,
			username
		);

		if (!newAccount) throw Error;
		const avatarUrl = avatars.getInitials(username);

		await signIn(email, password);

		const newUser = await databases.createDocument(
			config.databaseId,
			config.userCollectionId,
			ID.unique(),
			{
				accountId: newAccount.$id,
				email,
				username,
				avatar: avatarUrl,
			}
		);
		return newUser;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

export const signIn = async (email, password) => {
	try {
		// const sessions = await account.listSessions();
		// if (sessions.total > 0) {
		// 	// Delete all active sessions
		// 	for (const session of sessions.sessions) {
		// 		await account.deleteSession(session.$id);
		// 	}
		// }
		const session = await account.createEmailPasswordSession(email, password);
		return session;
	} catch (error) {
		console.error("Error during sign-in:", error);
		if (error.response) {
			console.error("Response data:", error.response);
		}
		if (error.request) {
			console.error("Request data:", error.request);
		}
		throw new Error(error.message);
	}
};

export const getCurrentUser = async () => {
	try {
		const currentAccount = await account.get();
		if (!currentAccount) throw Error;
		const currentUser = await databases.listDocuments(
			config.databaseId,
			config.userCollectionId,
			[Query.equal("accountId", currentAccount.$id)]
		);
		if (!currentUser) throw Error;
		return currentUser.documents[0];
	} catch (error) {
		console.log(error);
	}
};
