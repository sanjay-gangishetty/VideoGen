/**
 * Passport Configuration
 * Google OAuth 2.0 Strategy
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../config');
const User = require('../models/User');

/**
 * Configure Google OAuth Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: config.AUTH.GOOGLE_CLIENT_ID,
      clientSecret: config.AUTH.GOOGLE_CLIENT_SECRET,
      callbackURL: config.AUTH.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract profile information
        const { id, emails, displayName, photos } = profile;
        const email = emails && emails[0] ? emails[0].value : null;
        const image = photos && photos[0] ? photos[0].value : null;

        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        // Check if user exists by Google ID
        let user = await User.findByGoogleId(id);

        if (user) {
          // Update existing user's tokens and profile info
          user = await User.update(user.id, {
            accessToken,
            refreshToken,
            name: displayName,
            image,
          });
        } else {
          // Check if user exists by email (for linking accounts)
          user = await User.findByEmail(email);

          if (user) {
            // Link Google account to existing user
            user = await User.update(user.id, {
              googleId: id,
              accessToken,
              refreshToken,
              name: displayName || user.name,
              image: image || user.image,
            });
          } else {
            // Create new user with initial credits
            user = await User.create({
              email,
              name: displayName,
              image,
              googleId: id,
              accessToken,
              refreshToken,
              initialCredits: config.CREDITS.INITIAL_CREDITS,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        console.error('Error in Google OAuth callback:', error);
        return done(error, null);
      }
    }
  )
);

/**
 * Serialize user for session
 * Store only user ID in session
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 * Fetch full user object from database
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

module.exports = passport;
