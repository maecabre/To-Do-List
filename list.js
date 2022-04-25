const mongoose = require('mongoose');
const Item = require(__dirname + "/item.js");

// Schema
const listSchema = new mongoose.Schema({
	name: String,
	items: [Item.schema]
});

// Model/Collection
const List = new mongoose.model("List", listSchema);

module.exports = List;