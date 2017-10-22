const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mysys');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  const userSchema = mongoose.Schema({
    	name: String,
    	img: String,
    	
	});
  const playerSchema = mongoose.Schema({
    	name: String
	});
  const itemSchema = mongoose.Schema({
    	name: String
	});
  const gameSchema = mongoose.Schema({
    	name: String
	});


}); 