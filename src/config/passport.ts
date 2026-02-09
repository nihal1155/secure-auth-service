import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {query} from './database';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${process.env.CALLBACK_URL}/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;

                if(!email) {
                    return done(new Error("No email found in google profile"));
                }

                //Check if user exists
                let result = await query(
                    'SELECT id, email, name, provider FROM users WHERE email = $1',
                    [email]
                )

                let user;
                
                if(result.rows.length === 0 ) {
                    result = await query(
                        `INSERT INTO users (email, name, provider, provider_id)
                        VALUES ($1, $2, 'google', $3)
                        RETURNING id, email, name, provider`,
                        [email, profile.displayName || email.split('@')[0], profile.id]
                    );
                    user = result.rows[0];
                } else {
                    user = result.rows[0];
                }

                done(null, user);
            } catch (error: any) {
                done(error);
            }
        }
    )
)

export default passport;