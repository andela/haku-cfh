/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

/**
 * User authorizations routing middleware
 */
exports.user = {
    hasAuthorization: function(req, res, next) {
        if (req.profile.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};


// exports.verifyUserToken = (req, res, next) => {
//   /** check if api route string starts with the characters auth */
//   if (req.url.startsWith('/auth')) return next();

//   /** get token from local storage */
//   const token = localStorage.getItem('token');

//   if (token) {
//     /** verify user token */
//     jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
//       if (error) {
//         return res.redirect('/signout');
//       }
//       // request user detail for other routes
//       req.decoded = decoded;
//       next();
//     });
//   } else {
//     // return an error if no token
//     return res.redirect('/signout');
//   }
// };

/**
 * Article authorizations routing middleware
 */
// exports.article = {
//     hasAuthorization: function(req, res, next) {
//         if (req.article.user.id != req.user.id) {
//             return res.send(401, 'User is not authorized');
//         }
//         next();
//     }
// };