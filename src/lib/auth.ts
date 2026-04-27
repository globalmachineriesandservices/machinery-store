import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { Role } from '@/generated/prisma/enums'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )

        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: Role }).role ?? Role.CUSTOMER
      }
      // Handle session update trigger
      if (trigger === 'update' && session) {
        token.name = session.name ?? token.name
        token.image = session.image ?? token.image
        token.role = session.role ?? token.role
      }
      // Always refresh role from DB on each token refresh
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, name: true, image: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.name = dbUser.name
          token.image = dbUser.image
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.name = token.name
        session.user.image = token.image as string
      }
      return session
    },
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true
      if (!user.email) return false
      return true
    },
  },
  events: {
    async createUser({ user }) {
      // Check if this is the first user — make them admin
      const count = await prisma.user.count()
      if (count === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: Role.ADMIN },
        })
      }
    },
  },
})
