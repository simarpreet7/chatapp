var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    User = require("./models/user"),
    friend = require("./models/friends"),
    message = require("./models/message");
const Socket = require("dgram");
const user = require("./models/user");
LocalStrategy = require("passport-local"),
    http = require("http"),
    socketio = require("socket.io"),
    Filters = require('bad-words'),

    passportLocalMongoose = require("passport-local-mongoose");
require('dotenv').config();
const { createCipheriv, randomBytes, createDecipheriv } = require('crypto');
const key =Buffer.from(process.env.key)// randomBytes(32);
const iv =Buffer.from(process.env.iv)//randomBytes(16);

const { encrypt, decrypt } = require('./lib/encrypt')

var filter = new Filters();
var app = express();
var _ = require("lodash");
const server = http.createServer(app);
const io = socketio(server);
// set the port of our application
// process.env.PORT lets the port be set by Heroku

var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/chatdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
mongoose.Promise = global.Promise;
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Rusty is the best og in the worldpassport ",
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
//
app.use(passport.initialize());
app.use(passport.session());
// 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/public", express.static("public"));


//socket
var users = {};
var susers = {};
var online = {};
io.on('connection', function (socket) {

    online[socket.handshake.query.loggeduser] = 1
    users[socket.handshake.query.loggeduser] = socket.id
    susers[socket.id] = socket.handshake.query.loggeduser
    console.log(users);
    socket.on('disconnect', () => {
        online[socket.handshake.query.loggeduser] = 0
        delete users[socket.handshake.query.loggeduser];
        delete susers[socket.id];

        console.log(users);


    });

    socket.on('msg', function (data) {
        if (users[data.send_to] && socket.handshake.query.talking_to == data.send_to) {//user is online

            io.to(users[data.send_to]).emit('msg_rcv', {
                s_by: susers[socket.id],
                message: filter.clean(data.msg),
                r_by: data.send_to
            })


        }
        socket.emit('msg_rcv_own', {
            message: filter.clean(data.msg),
            sender: data.send_by
        })
        var newmessage = new message({
            text: encrypt(filter.clean(data.msg), key, iv),
            s_by: susers[socket.id],
            r_by: data.send_to,

        });

        newmessage.save(function (err) {
            if (err) {
                return res.send(err);
            }




        });


    })


})










app.get("/", function (req, res) {
    res.render("signup");
});

app.get("/chat/:id", isLoggedIn, function (req, res) {

    friend.find({ user_name: req.user.username }, function (err, friend_list) {
        if (err) {
            return res.send(err)
        }
        else {
            message.find({
                $or: [
                    { $and: [{ s_by: req.params.id }, { r_by: req.user.username }] },
                    { $and: [{ r_by: req.params.id }, { s_by: req.user.username }] }
                ]
            }, (err, message_list) => {
                if (err) {
                    console.log(err)
                    return res.send(err)
                }
                else if (_.isEmpty(message_list)) {
                    return res.render("chat", { myname: req.user.username, friend: friend_list[0], message: [], chat_with: req.params.id, isonline: online[req.params.id] });
                }
                for (var i = 0; i < message_list.length; ++i) {
                    message_list[i].text = decrypt(message_list[i].text, key, iv)
                }
                res.render("chat", { myname: req.user.username, friend: friend_list[0], message: message_list, chat_with: req.params.id, isonline: online[req.params.id] });

            });
        }
    });

});

app.post("/chat/addname", isLoggedIn, function (req, res) {

    friend.findOne({ user_name: req.user.username }, function (err, doc) {
        if (err)
            console.log(err)//no error possible
        User.findOne({ username: req.body._name }, function (err1, doc1) {
            if (_.isEmpty(doc1)) res.send(doc1)
            else if (err1) res.send(err1)
            else {
                var x = doc.friends;
                x.push(req.body._name)
                friend.updateOne({ user_name: req.user.username }, { friends: x }, function (err2, doc2) {
                    if (err2) res.send(err2)
                    else {
                        friend.findOne({ user_name: req.body._name }, function (err4, doc4) {
                            if (err4)
                                res.send(err4)
                            else {
                                var z = doc4.friends;
                                z.push(req.user.username)
                                friend.updateOne({ user_name: req.body._name }, { friends: z }, function (err5, doc5) {
                                    if (err5) res.send(err5)
                                    else {
                                        res.redirect('/chat/' + req.body._name)
                                    }
                                })

                            }
                        })
                    }
                })

            }

        })
    });

})






app.delete("/chat/delete", isLoggedIn, function (req, res) {

    friend.findOne({ user_name: req.user.username }, function (err, doc) {
        if (err)
            console.log(err)//no error possible
        User.findOne({ username: req.body._bname }, function (err1, doc1) {
            if (_.isEmpty(doc1)) res.send(doc1)
            else if (err1) res.send(err1)
            else {
                var x = doc.friends;
                for (var i = 0; i < x.length; i++) { if (x[i] === req.body._bname) { x.splice(i, 1); i--; } }
                friend.updateOne({ user_name: req.user.username }, { friends: x }, function (err2, doc2) {
                    if (err2) res.send(err2)
                    else {
                        friend.findOne({ user_name: req.body._bname }, function (err4, doc4) {
                            if (err4)
                                res.send(err4)
                            else {
                                var z = doc4.friends;
                                for (var i = 0; i < z.length; i++) { if (z[i] == req.user.username) { z.splice(i, 1); i--; } }
                                friend.updateOne({ user_name: req.body._bname }, { friends: z }, function (err5, doc5) {
                                    if (err5) res.send(err5)
                                    else {
                                        res.send(req.body)
                                    }
                                })

                            }
                        })
                    }
                })

            }

        })
    });

})

// Auth Routes


//handling user sign up
app.post("/", function (req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('signup');
        } //user stragety
        passport.authenticate("local")(req, res, function () {


            var newfriend = new friend({
                user_name: req.user.username,
                friends: ["bot"]
            });

            newfriend.save(function (err) {
                if (err) {
                    return res.send(err);
                }

                //   return res.redirect("/chat"); //once the user sign up
                else {
                    var newmessage = new message({
                        text: encrypt("welcome to chat app", key, iv),
                        s_by: "bot",
                        r_by: req.user.username,

                    });

                    newmessage.save(function (err) {
                        if (err) {
                            return res.send(err);
                        }

                        return res.redirect("/chat/bot"); //once the user sign up


                    });
                }


            });

        });
    });
});

// Login Routes

app.get("/login", function (req, res) {
    res.render("login");
})

// middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/chat/bot",
    failureRedirect: "/login"
}), function (req, res) {
    res.redirect("/chat/bot");
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

server.listen(port, function () {
    console.log("connected to port : ", port);
});