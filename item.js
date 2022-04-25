const mongoose = require('mongoose');

// Schema
const itemsSchema = new mongoose.Schema({
	name: String
});

// Model/Collection
const Item = new mongoose.model("Item", itemsSchema);

module.exports = Item;
// module.exports = itemsSchema;