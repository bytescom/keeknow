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

app.get("/signup", (req, res) => {
    res.render("signup", { error: null, formData: {} });
});

app.get("/login", (req, res) => {
    res.render("login", { error: null, formData: {} });

});

app.get('/dashboard', async (req, res) => {
    // let user = await User.findOne({ email: req.user.email });
    // user.populate('posts');
    // console.log(user);

    // res.render("dashboard", { user });
});

// app.post('/posts', isLogginIn, async (req, res) => {
//     let user = await User.findOne({ email: req.user.email });
//     console.log(user);
    
//     let { content } = req.body;
//     let post = await Posts.create({
//         user: user._id,
//         content: content,
//     });

//     user.posts.push(post._id);
//     await user.save();
//     res.redirect("/dashboard");
// });

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

app.get("/logout", (req, res) => {
    res.cookie("token", "")
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



// app.post("/login", async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     // 1. Find user
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res
//         .status(401)
//         .render("login", { error: "Invalid email or password" });
//     }

//     // 2. Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res
//         .status(401)
//         .render("login", { error: "Invalid email or password" });
//     }

//     // 3. Create token
//     let token = jwt.sign(
//       { email: user.email, userid: user._id },
//       process.env.JWT_SECRET || "XXXX",
//       { expiresIn: "1h" } // good practice: expire tokens
//     );

//     // 4. Set cookie
//     res.cookie("token", token, {
//       httpOnly: true, // prevents JS access (security)
//       secure: process.env.NODE_ENV === "production", // only https in prod
//       maxAge: 3600000, // 1h
//     });

//     // 5. Redirect
//     res.status(200).redirect("/dashboard");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Something went wrong. Please try again.");
//   }
// });
