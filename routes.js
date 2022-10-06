const passport = require("passport");
const bcrypt = require('bcrypt');

module.exports = function (app, myDatabase) {
    
      app.route('/').get((req, res) => {
        res.render(process.cwd() + "/views/pug/index.pug", {title: "Connected to Database", message: "Please login", showLogin: true, showRegistration: true, showSocialAuth: true});
      });
    
      app.route('/chat')
     .get(ensureAuthenticated, (req,res) => {
        res.render(process.cwd() + '/views/pug/chat.pug', {username: req.user.username});
     });
    
      app.post('/login', passport.authenticate('local', {failureRedirect: "/"}), function(req,res) {
        res.redirect('/chat')
      })
    
      app.route("/logout").get((req,res) => {
        req.logout();
        res.redirect("/")
      })

      app.route("/auth/github").get(passport.authenticate('github'));

      app.route("/auth/github/callback").get(passport.authenticate('github', {failureRedirect: "/"}), (req,res) => {
          req.session.user_id = req.user.id;
          res.redirect("/chat");
      })
    
      app.route("/register").post((req,res,next) => {
        myDatabase.findOne({username: req.body.username}, function(err,user) {
          if (err) {
            next(err)
          } else if (user) {
            res.redirect("/")
          } else {
            const hash = bcrypt.hashSync(req.body.password, 12);
            myDatabase.insertOne({username: req.body.username, password: hash}, function(err, doc) {
              if (err) {
                res.redirect("/")
              } else {
                next(null, doc.ops[0])
              }
            })
          }
        })
      },
      passport.authenticate("local", {failureRedirect: "/"}),
      (req,res,next) => {
        res.redirect("/chat")
      })  
    
      app.use((req,res,next) => {
        res.status(404).type("text").send("Not Found")
      })
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/")
  }