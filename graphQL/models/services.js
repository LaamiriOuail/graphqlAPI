const mongoose = require('mongoose');

// Define the MongoDB schema and model
const serviceSchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    description: String,
    subdescription: String,
    category: String,
    delevrytime: String,
    price: String,
    idfreelancer: String
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;