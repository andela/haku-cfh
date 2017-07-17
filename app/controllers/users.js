/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User');
var avatars = require('./avatars').all();
const helper = require('sendgrid').mail;
const sg = require('sendgrid') (process.env.SENDGRID_API_KEY);

/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = function (req, res) {
  res.redirect('/');
};

/** 
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 */
exports.checkAvatar = function(req, res) {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
    .exec(function(err, user) {
      if (user.avatar !== undefined) {
        res.redirect('/#!/');
      } else {
        res.redirect('/#!/choose-avatar');
      }
    });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }

};

/**
 * Create user
 */
exports.create = function(req, res) {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec(function(err,existingUser) {
      if (!existingUser) {
        var user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save(function(err) {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user: user
            });
          }
          req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
};

/**
 * Assign avatar to user
 */
exports.avatars = function(req, res) {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
    .exec(function(err, user) {
      user.avatar = avatars[req.body.avatar];
      user.save();
    });
  }
  return res.redirect('/#!/app');
};

exports.addDonation = function(req, res) {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
      .exec(function(err, user) {
        // Confirm that this object hasn't already been entered
        var duplicate = false;
        for (var i = 0; i < user.donations.length; i++ ) {
          if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
            duplicate = true;
          }
        }
        if (!duplicate) {
          console.log('Validated donation');
          user.donations.push(req.body);
          user.premium = 1;
          user.save();
        }
      });
    }
  }
  res.send();
};

/**
 *  Show profile
 */
exports.show = function(req, res) {
  var user = req.profile;

  res.render('users/show', {
    title: user.name,
    user: user
  });
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};

exports.search = (req, res) => {
  User.find().exec((err, user) => {
    res.jsonp(user);
  });
};


// Search for a user by name
exports.searchUser = (req, res) => {
  req.params.playerData = JSON.parse(req.params.playerData);
  const searchTerm = req.params.playerData.searchTerm;
  const username = req.params.playerData.name;
  User.find({
    name: { $regex: `^${searchTerm}`, $options: 'i' }
  }).exec((err, user) => {
    if (err) return res.jsonp({ error: '403' });
    if (!user) return res.jsonp({ error: '404' });
    res.jsonp(user);
  }
  );
};

// Send mail to selected users
exports.sendMail = (req, res) => {
  const email = JSON.parse(req.params.email);
  const fromEmail = new helper.Email('haku-cfh@andela.com');
  const toEmail = new helper.Email(email.email);
  const subject = `You've been served!`;
  const url = decodeURIComponent(email.url);
  const html = `
    <h5>Wad Up?</h5>
    <p>One of your horrible friends desperately trying to do good has invited you to play Card For Humanity (CFH). </p>
    <p>Cards for Humanity is a fast-paced online version of the popular card game, Cards Against Humanity, that gives you the opportunity to donate to children in need - all while remaining as despicable and awkward as you naturally are.</p><br />
    <p>Your friends are waiting! <a href="${url}">
      Get in the game now.</a></p>
      <p>Copyright &copy; 2017
      <a href="https://haku-cfh-staging.herokuapp.com">HAKU CFH</a>
  `;
  const content = new helper.Content('text/html', html);
  const mail = new helper.Mail(fromEmail, subject, toEmail, content);
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, (error, response) => {
    if (error) return res.jsonp(error);
    return res.jsonp({ invited: true });  
  });
};

exports.saveRegion = (req, res) => {
  localStorage.setItem('region', req.body.player_region);
};

