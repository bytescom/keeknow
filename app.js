const express = require('express');
const app = express();
const PORT = 3001;
const User = require('./models/User');
const Posts = require('./models/Posts');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get('/profile', isLogginIn, (req, res) => {
    res.send(`Welcome, ${req.user.name}`);
});

app.post('/register', async (req, res) => {
    let { name, username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(500).send("User already registered");

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            let user = await User.create({
                name,
                username,
                email,
                password: hash,
            })

            let token = jwt.sign({ email: email, userid: user._id }, "mrpk");
            res.cookie("token", token);
            res.send("registed");
        });
    });
});

app.post('/login', async (req, res) => {
    let { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(401).send("User not found. Please check your email or password.");

    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, "mrpk");
            res.cookie("token", token);
            res.status(200).send("Hey, Login");
        }
        else res.redirect("/login");
    });
});

app.get("/logout", (req, res) => {
    res.cookie("token", "")
    res.redirect("/login");
});

function isLogginIn(req, res, next) {
    if (req.cookies.token === "") return res.redirect('/login');
    else {
        let data = jwt.verify(req.cookies.token, "mrpk");
        req.user = data;
    }
    next();
}

app.listen(PORT);