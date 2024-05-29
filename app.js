const express = require("express");
const app = express();

const path = require("path");

const routerPost = require("./routers/posts.js");
const middlewarePost = require('./middlewares/posts.js');
const handleErrors = require("./middlewares/handleErrors.js");
const auth = require("./controllers/auth.js");


const users = require('./db/users.json');

app.use(express.static('./public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.post('/login', auth.login);


app.get("/", (req, res) => {
    const homepage = path.join(__dirname, "./index.html")
    res.sendFile(homepage);
})

app.use("/posts", routerPost)

app.use(handleErrors)

app.listen(3000, () => {
    console.log('Server attivo sulla porta http://localhost:3000.');
});