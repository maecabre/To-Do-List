
// console.log(module);

module.exports = {
	getDate,
	getWeekDate
};

function getDate(){
	// Set diplay date options
	// US English uses month-day-year order
	const options = { weekday: 'long', month: 'long', day: 'numeric' };

	// get Weekday, Month, Day
	const date = new Date();
	const day = date.toLocaleDateString('en-US', options);
	return day;
}


function getWeekDate(){
	// Set diplay date options
	// US English uses month-day-year order
	const options = {weekday: 'long'};

	// get Weekday
	const date = new Date();
	const day = date.toLocaleDateString('en-US', options);
	return day;
}


