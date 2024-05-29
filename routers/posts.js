const express = require("express"); //CommonJS Modules
const router = express.Router();
const postsController = require("../controllers/posts.js")
const {existsCheck} = require('../middlewares/posts.js');

const multer = require('multer');
const uploader = multer({dest: "public/imgs/posts"});

 

router.get("/", postsController.index)

//esercizio 28/05
//rotta che riceve dati e crea nuovo post. OUTPUT: html->redirect, DEFAULT-> Json
router.post("/", uploader.single("image"), postsController.store )

//inseriamo prima il create perchè altrimenti verrebbe letto come slug
router.get("/create", postsController.create)

router.get("/:slug", postsController.show)

router.get("/:slug/download", postsController.download)


//rotta delete/destroy
router.delete("/:slug", existsCheck, postsController.destroy)





module.exports = router;