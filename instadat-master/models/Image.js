

var imageSchema = new schema({
    title: String,
    desc: String,
    paths: Array, //Using Array to store multiple paths for images
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = new mongoose.model('Image', imageSchema);