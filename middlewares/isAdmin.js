const users = require('../db/users.json');

const isAdmin = (req, res, next) => {
    const {username, password} = req.user;
    const user = users.find(u => u.username === username && u.password === password);
    if(!user || !user.admin){
        return res.status(403).send('Admin-only view.');
    }
    next();
}

module.exports = {
    isAdmin
}