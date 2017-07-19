const async = require('async');
const gameDetails = require('../app/controllers/game');

module.exports = function (app, passport, auth) {
    // User Routes
  const users = require('../app/controllers/users');
  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/chooseavatars', users.checkAvatar);
  app.get('/signout', users.signout);

  app.get('/api/search/users/:playerData', users.searchUser);
  app.get('/api/sendmail/:email', users.sendMail);

    // Setting up the users api
  app.post('/users', users.create);
  app.post('/users/avatars', users.avatars);

    // Donation Routes
    app.post('/donations', users.addDonation);

    // verifies token for all route that starts with /api
    // app.use('/api', auth.verifyUserToken);

    // View Donations Route
    app.get('/api/donations', users.showDonations);

    // Game history Route
    app.get('/api/games/history', users.showGameHistory);

    // update user gane details
    app.put('/api/users/gameupdate', users.saveUserGameDetails);

    // Leaderboard Route
    app.get('/api/leaderboard', users.showLeaderboard);

    app.post('/users/session', passport.authenticate('local', {
        session: false
    }), users.session);

    app.get('/users/me', users.me);
    app.get('/users/:userId', users.show);

    //Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email'],
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the github oauth routes
    app.get('/auth/github', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/github/callback', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Finish with setting up the userId param
    app.param('userId', users.user);

    // Answer Routes
  const answers = require('../app/controllers/answers');
  app.get('/answers', answers.all);
  app.get('/answers/:answerId', answers.show);
    // Finish with setting up the answerId param
  app.param('answerId', answers.answer);

    // Question Routes
  const questions = require('../app/controllers/questions');
  app.get('/questions', questions.all);
  app.get('/questions/:questionId', questions.show);
    // Finish with setting up the questionId param
  app.param('questionId', questions.question);

    // Avatar Routes
  const avatars = require('../app/controllers/avatars');
  app.get('/avatars', avatars.allJSON);

    // Home route
  const index = require('../app/controllers/index');
  app.get('/play', index.play);
  app.get('/', index.render);

    // JWT route
  const jwtCtrl = require('../app/controllers/auth');
  app.post('/api/auth/signup', jwtCtrl.signup);
  app.post('/api/auth/login', jwtCtrl.login);
  app.post('/api/games/:id/start', gameDetails.saveGame);

  // Route to get user's region
  app.post('/region', users.saveRegion);
};
