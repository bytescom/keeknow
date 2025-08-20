const express = require('express');
const app = express();
const PORT = 3001;
const User = require('./models/User');
const Post = require('./models/Post');
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

app.get("/signup", (req, res) => {
    res.render("signup", { error: null, formData: {} });
});

app.get("/login", (req, res) => {
    res.render("login", { error: null, formData: {} });
});

app.get('/dashboard', isLogginIn, async (req, res) => {
    let user = await User.findOne({ email: req.user.email });
    await user.populate("posts");
    res.render("dashboard", { user });

    // or

    // let user = await User.findById(req.user._id).populate("posts");
    // console.log(user);
    // res.render("dashboard", { user });
});

app.post('/post', isLogginIn, async (req, res) => {
    let user = await User.findOne({ email: req.user.email });
    console.log(user);

    let { content } = req.body;
    let post = await Post.create({
        user: user._id,
        content: content
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/dashboard");
});

app.post('/signup', async (req, res) => {
    let { name, username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return res.render('signup', {
            error: 'User already registered. Please Login!',
            formData: req.body
        });
    }


    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            let user = await User.create({
                name,
                username,
                email,
                password: hash,
            })

            let token = jwt.sign({ email: email, userid: user._id }, "bytescom");
            res.cookie("token", token);
            // res.send("registered")

            try {
                res.redirect("/login?success=Signup successful! Please login.");
            } catch (err) {
                res.render("signup", { error: "Something went wrong. Try again." });
            }
        });
    });
});

app.post('/login', async (req, res) => {
    let { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(401).render("login", { error: "Invalid email or password" });

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).render("login", { error: "Invalid email or password" });


    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, "bytescom");
            res.cookie("token", token);
            res.status(200).redirect('/dashboard')
        }
        else res.redirect("/login");
    });
});

app.post("/logout", (req, res) => {
    res.cookie("token");
    res.redirect("/login");
});

function isLogginIn(req, res, next) {
    if (req.cookies.token === "") return res.redirect('/login');
    else {
        let data = jwt.verify(req.cookies.token, "bytescom");
        req.user = data;
    }
    next();
}

app.listen(PORT);