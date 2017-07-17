const passport = require('passport'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

const avatars = require('./avatars').all();

exports.signup = (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'Incomplete user details' });
  }

  User.findOne({
    email: req.body.email
  }).exec((err, existingUser) => {
    if (err) {
      return res.status(401).json({
        message: 'An error occurred'
      });
    }

    if (!existingUser) {
      const user = new User(req.body);
      user.avatar = avatars[user.avatar - 1];
      user.provider = 'jwt';

      let token;
      try {
        token = user.generateToken();
        user.save((err) => {
          if (err) {
            return res.status(401).json({
              message: 'An error occurred'
            });
          }
          res.status(201).send({ token, user });
        });
      } catch (error) {
        return res.status(500).send({
          message: 'An error occurred'
        });
      }
    } else {
      return res.status(400).send({ message: 'User already exists' });
    }
  });
};

exports.login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(401).send({
        message: 'Error occurred'
      });
    }

    let token;
    // If user is not found
    if (!user) {
      return res.status(401).json({
        message: 'Username or Password incorrect'
      });
    }

    // If a user is found
    try {
      token = user.generateToken();
      return res.status(200).json({ token, user });
    } catch (error) {
      return res.status(500).send({
        message: 'An error occurred'
      });
    }
  })(req, res);
};
