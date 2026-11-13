import NextAuth from 'next-auth';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import LinkedIn from 'next-auth/providers/linkedin';

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Google, LinkedIn, Facebook],
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				// User is available during sign-in
				token.id = user.id;
			}
			return token;
		},
		session({ session, token }) {
			session.user.id = token.id;
			return session;
		},
	},
});
