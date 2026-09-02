// Example NextAuth configuration (pages/api/auth/[...nextauth].js)
// Replace providers and callbacks for your production needs.

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials){
        // Demo: accept any non-empty credentials as admin for local dev
        if(credentials && credentials.email){
          return { id: 'admin', name: 'Studio Admin', email: credentials.email, role: 'admin' };
        }
        return null;
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }){ if(user) token.role = user.role || 'admin'; return token; },
    async session({ session, token }){ session.user.role = token.role; return session; }
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret'
});
