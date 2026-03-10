import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../config/database';
import { generateTokenPair } from '../utils/jwt';
import { config } from '../config';
import slugify from 'slugify';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'));

        let user = await prisma.user.findFirst({
          where: { OR: [{ googleId: profile.id }, { email }] },
          include: { organization: { include: { subscription: true } } },
        });

        if (!user) {
          // Create new user + org
          const name = profile.displayName || email.split('@')[0];
          user = await prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
              data: {
                name: `${name}'s Workspace`,
                slug: slugify(`${name}-${Date.now()}`, { lower: true, strict: true }),
                owner: { connect: { id: 'placeholder' } },
              },
            });

            const newUser = await tx.user.create({
              data: {
                name,
                email,
                googleId: profile.id,
                emailVerified: true,
                avatarUrl: profile.photos?.[0]?.value,
                organizationId: org.id,
              },
              include: { organization: { include: { subscription: true } } },
            });

            await tx.organization.update({ where: { id: org.id }, data: { ownerId: newUser.id } });
            await tx.subscription.create({
              data: {
                organizationId: org.id,
                stripeCustomerId: `pending_${newUser.id}`,
                plan: 'FREE',
                status: 'ACTIVE',
              },
            });

            return newUser;
          });
        } else if (!user.googleId) {
          await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id } });
        }

        const tokens = generateTokenPair({ userId: user.id, email: user.email });
        done(null, tokens as any);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

export default passport;
