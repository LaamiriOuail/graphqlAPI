const mongoose = require('mongoose');

// Define the MongoDB schema and model
const cardPaymentSchema = new mongoose.Schema({
    idFreelancer: String,
    cardNumber: String,
    nameCard: String,
    ExpiryDate: String,
    cvv: String
});

const Card = mongoose.model('Card', cardPaymentSchema);

module.exports = Card;