const allPosts = require("../db/db.json")

const existsCheck = (req, res, next) => {

    let slug = req.params.slug;

    let firstCheck = allPosts.find(post => post.slug === slug)
    
    if (firstCheck){
        return next()
    }
    res.status(404).send("Non sono stati trovati post")

}
module.exports = {
    existsCheck
}