// imports
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
// const config = require(__dirname + "/config");
const _ = require("lodash");

// import Mongoose Models
const Item = require(__dirname + "/item.js");
const List = require(__dirname + "/list.js");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

let itemArray = [];
let defaultItems = [];


// --------------------------------------------------------
// Main

main().catch(err => console.log(`main() error: ${err}`));
async function main(){

		// Local Connection/DB
		// const todoConnection =  await mongoose.connect('mongodb://localhost:27017/todolistDB');

		// Use for heroku deployment
		const userName = process.env.USERNAME;
		const escapePassword = process.env.ESCAPE_PASSWORD;

		// User for local deployment with config import
		// const userName = config.userName;
		// const escapePassword = config.escapePassword;

		const uri = "mongodb+srv://" + userName + ":" + escapePassword + "@cluster0.c6xf1.mongodb.net/todolistDB?retryWrites=true&w=majority";
		const todoConnection =  await mongoose.connect(uri);

		// Data
		const item1 = new Item({name: "Welcome to your To-Do List"});
		const item2 = new Item({name: "Hit the + button to add a new item"});
		const item3 = new Item({name: "<--- Hit this to delete an item"});

		defaultItems = [item1, item2, item3];

}


// --------------------------------------------------------
// Functions

// Insert Data into MongoDB
async function insertData(data){
	return await Item.insertMany(data, function(err){
		if(!err){
			// console.log(`Inserted into DB: ${data}`);
		} else{
			console.log(`insertData(): ${err}`);
		}
	});
}

// Query All
async function getQueryAll(){
	return await Item.find({}, (err, results) => {
		if(err){
			console.log(`getQueryAll(): ${err}`);
		}
	}).clone().catch(err => console.log(`Item.find().clone() error: ${err}`));
}

// --------------------------------------------------------
// GET Requests


// GET request, home route
app.get("/", async function(req, res){

		let queryAll = await getQueryAll();

		if(itemArray.length != queryAll.length){
				itemArray = [];
				for(let i = 0; i < queryAll.length; i++){
					itemArray.push(queryAll[i]);
				}
		}

		let day = date.getWeekDate();
		let listTitle = "Every-Day";
		res.render("list", {kindOfDay: day, newItems: itemArray, kindOfList: "Every-Day"});
});


// GET request, custom list
app.get("/:customListType", async function(req, res){

	const listType = req.params.customListType;
	const customListType = _.startCase(_.toLower(listType));

	await List.findOne({name: customListType}, async (err, result) => {
		if(!err){
			// console.log(`Result: ${result}`);
			if(result){
				// Render Existing List
				// console.log(`Render Existing List: ${customListType}`);

				let day = date.getWeekDate();
				res.render("list", {kindOfDay: day, newItems: result.items, kindOfList: customListType});

			} else{
				// Create New List
				// console.log(`Create New List: ${customListType}`);

				const list = new List({
					name: customListType,
					items: []
				});
				await list.save();
				res.redirect("/" + customListType);
			}
		} else{
			console.log(`List.find(): ${err}`);
		}
	}).clone().catch(err => console.log(`List.find().clone() error: ${err}`));


});

// --------------------------------------------------------
// POST Requests

// POST request, home route
app.post("/", async function(req, res){

	let listTypeRecieved = req.body.button;
	let newItem = new Item({name: req.body.newItem});

	if(listTypeRecieved == "Every-Day"){

		await newItem.save();
		res.redirect("/");
	} else{

		await List.findOne({name: listTypeRecieved}, async (err, result) => {
			if(!err){
				await result.items.push(newItem);
				await result.save();

				itemArray = [];

				result.items.forEach((item) =>{
					itemArray.push(item.name);
				});

				res.redirect("/" + listTypeRecieved);

			} else{
				console.log(`List.findOne(): ${err}`);
			}
		}).clone().catch(err => console.log(`List.find().clone() error: ${err}`));

	}
});


// POST request, deleting items
app.post("/delete", async function(req, res){
	
	let itemId = req.body.checkbox;
	let customListType = req.body.listName;

	if(customListType == "Every-Day"){
		await Item.deleteOne({ _id: itemId });
		res.redirect("/");
	} else{
		// Remove item from "items" array from List doc

		await List.findOneAndUpdate({ name: customListType }, {
			$pull: {
				"items": {_id: itemId }
			}},
			async (err, results) => {
				if(err){
					console.log(`List.findOneAndUpdate(): ${err}`);
				}
			}
		).clone().catch(err => console.log(`List.findOneAndUpdate().clone() error: ${err}`));

		res.redirect("/" + customListType);
	}

});

// --------------------------------------------------------
// Server

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

// "process.env.PORT" = dynamic port heroku choosses on the go
app.listen(port || 3000, function(){
	console.log("Server has started!");
});
