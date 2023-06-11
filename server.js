/*
Name: Kunal Chopra
Date: 6/5/2023
Course: CS290
*/

// require basic libraries 
require("dotenv").config(); 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// we are connecting to local port 3000
const PORT = 3000;

// connecting to Mongo 
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'music_db' 
})
  .then(function() {
    console.log('Connected to MongoDB'); // success 
    app.listen(PORT, function() {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch(function(error) {
    console.error('Failed to connect to MongoDB:', error); // fail
  });

// access to the public folder with htmls and css
app.use(express.static('public')); 
app.use(express.json());

const Schema = mongoose.Schema;

// make the song schema from texbook
const songSchema = new Schema({
  title: { type: String, required: true },
  artist: String,
  popularity: { type: Number, min: 1, max: 10 },
  releaseDate: { type: Date, default: Date.now },
  genre: [String]
});

// create a song model 
const Song = mongoose.model('Song', songSchema);

// retrieve all the songs
app.get('/allSongs', function(req, res) {
  Song.find({})
    .then(function(songs) {
      res.json(songs); 
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});


// Retrieve all the available genres possible 
app.get('/genres', function(req, res) {
  Song.find().distinct('genre')
    .then(function(genres) {
      res.json(genres); 
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});

// search for the genre 
app.get('/search', function(req, res) {
  const genre = req.query.genre; 

  Song.find({ genre: genre })
    .then(function(songs) {
      res.json(songs); 
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});

// update the song based on user input 
app.post('/update', function(req, res) {
  // Retrieve the updated song details from the request body
  const { _id, title, artist, genre, released, popularity } = req.body;

  // Update the song in the database
  Song.findByIdAndUpdate(_id, { title, artist, genre, releaseDate: released, popularity }, { new: true })
    .then(function(updatedSong) {
      res.redirect('/list.html'); // go to all songs page
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});

// delete a song from database
app.post('/delete', function(req, res) {
  const songId = req.body.songId; // Retrieve the song ID from the request body

  Song.findByIdAndDelete(songId)
    .then(function() {
      res.sendStatus(200); // successful
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); // error occurs
    });
});

// add a new song to database
app.post('/add', function(req, res) {
  const { title, artist, genre, released, popularity } = req.body;
  // new song instance
  const newSong = new Song({
    title,
    artist,
    genre,
    releaseDate: new Date(released),
    popularity
  });

  // Save the new song to the database
  newSong.save()
    .then(function(savedSong) {
      res.redirect('/list.html'); // go to song list page 
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});

// List all the songs and the stats
app.get('/list', function(req, res) {
  Song.find({})
    .then(function(songs) {
      // render song datas
      res.render('list', { songs: songs });
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});
