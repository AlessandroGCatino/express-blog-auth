const jwt = require("jsonwebtoken");
require("dotenv").config();
const users = require('../db/users.json');

const login = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if(!user){
        return res.status(404).send('Credenziali errate.');
    }
    const token = generateToken(user);
    res.send(token);
} 

const generateToken = user => jwt.sign(user, process.env.SECRET_KEY, {expiresIn: "1h"});

const tryAuth = (req, res, next) => {
    const {authorization} = req.headers;

    if(!authorization){
        return res.status(401).send('Hai bisogno di autenticarti.');
    }
    const token = authorization.split(" ")[1];

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if(err){
            return res.status(403).send(err);
        }
        req.user = user;
        next();
    });

}


module.exports = {
    login,
    generateToken,
    tryAuth
}