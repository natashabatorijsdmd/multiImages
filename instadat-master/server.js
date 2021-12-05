var express = require('express');
var app = express();
var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
// Handlebars is used to generate HTML on the server
var handlebars = require('express-handlebars');

//App Settings for Hanblebars Template engine. It tells handlebars were the files are kept that are used to create the HTML (The Views Folder)
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}))

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
})

var upload = multer({ storage: storage });

var Image = require('./models/Image.js');

var port = process.env.PORT || 3000;
var dbURL = process.env.mongoURL || 'mongodb://localhost:27017/fileUploads';

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use(express.static('www'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.render('index', { layout: 'main' }); //Using res.render here instead of res.SendFile as we are creating HTML, using the main.hbs from views/layouts/main and index from views/
});

app.get('/gallery/:id', (req, res) => {
    var id = req.params.id;
    console.log(id);
    Image.findOne({ _id: id }).lean().exec((err, doc) => {
        if (err) throw err;
        console.log(doc);
        res.render('gallery', { layout: 'main', doc: doc }); //Uss of res.render again, this time we are adding the Doc object that contains our data from the Database
    });
});

app.post('/addAlbum', upload.array('images', 10), function (req, res, next) {
    const { title, desc } = req.body;
    var imagePathsArray = [];
    req.files.forEach((image) => {
        imagePathsArray.push(image.path);//Pushes to the array to be save in the DB for the filepaths
    });

    var imageUpload = new Image({
        title,
        desc,
        paths: imagePathsArray
    })
    imageUpload.save();
    res.redirect('/');
})

// Push new images to existing album
app.post('/addPhoto/:id', upload.array('images', 10), (req, res, next)=>{
    var id = req.params.id;
    Image.findOne({_id: id }, (err, doc)=>{
        if (err) throw err;
        req.files.forEach((image) => {
            doc.paths.push(image.path);
        });
        doc.save();
        res.redirect(`/gallery/${id}`);
    })
})

app.get('/getImages', (req, res) => {
    Image.find({}, (err, docs) => {
        if (err) throw err;
        res.send(docs);
    })
})

mongoose.connect(dbURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log('connected to DB');
}).catch((err) => {
    console.log(err.message);
});

app.listen(port, () => {
    console.log(`Listening on Port ${port}`)
});