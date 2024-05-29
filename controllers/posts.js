const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

let allPosts = require("../db/db.json")

//esercizio 27/05

const index = (req, res) => {
    let html = "<ul class='bigUl'>"
    allPosts.forEach(el => {
        let encodedSlug = encodeURIComponent(el.slug)
        html += `<li>
                    <h2>${el.title}</h2>
                    <a href='/posts/${encodedSlug}' ><img src="/imgs/posts/${el.image}" width="300px"/></a>
                    <p>${el.content}</p>
                    <div>
                        <ul class="tagList">`

            el.tags.forEach(tag => {
                    html += `<li>${tag}</li>`
            })
            html += `   </ul>
                    </div>
                </li>`
    })
    html += `</ul>
    <style>
        .bigUl{
            text-align: center;
            list-style-type: none;
            padding-inline-start: 0;
        }
        .tagList{
            display: flex;
            justify-content: center;
            gap: 20px;
            list-style-type: none;
            padding-inline-start: 0;
        }
        .taglist li {
            padding: 5px 10px;
            background-color: lime;
        }
     
    </style>
    `
    res.send(html)
}

const show = (req, res) => {
    let requestedPostSlug = req.params.slug;
    let outputPost = allPosts.find(post => post.slug === requestedPostSlug);
    let encodedSlug = encodeURIComponent(outputPost.slug)

    res.format({
        json: () => {
            if (outputPost){
                res.json({...outputPost, image_url: `${req.header.host}/imgs/posts/${outputPost.image}`, image_download_url: `/posts/${encodedSlug}/download`})
            }
        },
        html: () => {
            let html = `<h2 class="bigUl">${outputPost.title}</h2>
                        <div>
                        <a href='/posts/${encodedSlug}/download'><img src="/imgs/posts/${outputPost.image}" width="300px"/></a>
                        </div>
                        <p>${outputPost.content}</p>
                        <div>
                            <ul class="tagList">`
                        outputPost.tags.forEach(tag => {
                        html += `<li>${tag}</li>`
                        })
                html += `   </ul>
                        </div>
                        <style>
                            div{
                                display: flex;
                                justify-content:center;
                            }
                            .bigUl{
                                text-align: center;
                                list-style-type: none;
                            }
                            .tagList{
                                display: flex;
                                justify-content: center;
                                gap: 20px;
                                list-style-type: none;
                            }
                            .taglist li {
                                padding: 5px 10px;
                                background-color: lime;
                            }
                        
                        </style>`
            res.send(html)
        }

    })
}

const create = (req, res) => {
    res.format({
        html: () => {
            let html = `<h1> Creazione nuovo post </h1>`;
            res.send(html);
        },
        default: () => {
            res.status(406).send("Error. Not Acceptable.")
        }
    })

}

const download = (req, res) => {
    const requestedPost = req.params.slug
    const selectedPost = allPosts.find(post => requestedPost === post.slug);
    const filePath = path.join(__dirname, `../public/imgs/posts/${selectedPost.image}`)
    if (selectedPost && fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send("Image not found")
    }
}

//esercizio 28/05

const store = (req, res) => {
    const {title, content, tags} = req.body;
    //controllo se tutti i campi sono stati compilati, elimino il file salvato se manca qualcosa
    if (!title || !content || !tags){
        req.file?.filename && deletePublicFile(req.file.filename)
        return res.status(400).send("Compila tutti i campi")
    }
    //verifico che il file sia stato caricato e che sia un'immagine 
    else if (!req.file || !req.file.mimetype.includes("image")) {

        req.file?.filename && deletePublicFile(req.file.filename)
        return res.status(400).send("Non hai inserito un'immagine.")
    }

    let allSlugs = allPosts.map(post => post.slug)
    const takenslug = slugify(title, {lower: true, remove: "/"})
    let counter = 1
    let slug = takenslug
    while (allSlugs.includes(slug)){
        slug = `${slug}-${counter}`;
        counter++
    }

    const newPost = {
        title,
        content,
        tags,
        image: req.file.filename,
        slug
    }

    updatePosts([...allPosts, newPost])

    res.format({
        html: () => {
            res.redirect("/posts")
        },
        default: () => {
            res.json(newPost)
        }
    })

}

const destroy = (req, res) => {

    const {slug} = req.params
    const postDeleted = allPosts.find(post => post.slug === slug)
    if(!postDeleted){
        return res.status(404).send(`No posts to delete. (Missing ${slug})`)
    }

    deletePublicFile(postDeleted.image)
    updatePosts(allPosts.filter(post => post.slug != postDeleted.slug))
    res.format({
        html: () => {
            res.redirect("/posts")
        },
        default: () => {
            res.send("Post eliminato")
        }
    })
}

const deletePublicFile = (fileName) => {
    const filePath = path.join(__dirname, '../public/imgs/posts', fileName);
    fs.unlinkSync(filePath);
}

const updatePosts = (newPost) => {
    const filePath = path.join(__dirname, '../db/db.json');
    fs.writeFileSync(filePath, JSON.stringify(newPost));
    allPosts = newPost;
}


module.exports = {
    index,
    show,
    download,
    create,
    store,
    destroy
}
