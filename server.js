/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aryan Rakeshbhai Rathod Student ID:129796215 Date: 17-02-2023
*
*  Cyclic Web App URL:
*
*  GitHub Repository URL: 
*
********************************************************************************/ 
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require('path');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
var blogService = require(__dirname + "/blog-service.js");
const upload = multer();
onHttpStart = () => {
    console.log('Express http server listening on port ' + HTTP_PORT);
}

app.use(express.static('public'));
cloudinary.config({
    cloud_name: "dyh9n1mmv",
    api_key: "882875188383543",
    api_secret: "-GG2N_SVOZ-tEmNOJMMxJjsSfY8",
    secure: true,
  });

app.get('/', (req, res) => {
    res.redirect('/about')
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/blog", (req, res) => {
    blogService.getPublishedPosts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get("/posts", (req, res) => {
    if(req.query.category) {
        blogService.getPostsByCategory(req.query.category).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
    else if(req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
    else {
        blogService.getAllPosts().then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message: err});
        })
    }
});

app.get("/post/:value", (req, res) => {
    blogService.getPostById(req.params.value).then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});
app.get("/categories", (req, res) => {
    blogService.getCategories().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});
app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname + "/views/addPost.html"));
  })
  app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
  
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
  
    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }
    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;
        let post = {};
        post.body = req.body.body;
        post.title = req.body.title;
        post.postDate = (new Date()).toISOString().slice(0,10);
        post.category = req.body.category;
        post.featureImage = req.body.featureImage;
        post.published = req.body.published;
        
        if (post.title) {
            blogService.addPost(post);
        }
        res.redirect("/posts");
    }
    upload(req).then((uploaded)=> {
        processPost(uploaded.url);
    })
    .catch((err) => {
          res.send(err);
    });
  });
  
app.use((req, res) => {
    res.status(404).end('404 PAGE NOT FOUND');
});

blogService.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch ((err) => {
    console.log(err);
});