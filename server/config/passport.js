const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googlePhotoUrl = profile.photos[0]?.value;

        // Check if user already exists by googleId
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // Check if user exists by email (link googleId to existing account)
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          // Set profile pic from Google if user hasn't set a custom one
          if (!user.profilePic || !user.profilePic.url) {
            user.profilePic = { url: googlePhotoUrl, public_id: '' };
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          profilePic: { url: googlePhotoUrl, public_id: '' },
          role: 'participant',
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
