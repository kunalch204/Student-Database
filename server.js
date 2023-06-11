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

// connecting to MongoDB 
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'student_db' 
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

// access to the public folder with HTMLs and CSS
app.use(express.static('public')); 
app.use(express.json());

const Schema = mongoose.Schema;

// make the student schema
const studentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  id: { type: String, required: true },
  gpa: { type: Number, required: true },
  address: { type: String, required: true },
  classes: { type: String, required: true }
});

// create a student model 
const Student = mongoose.model('Student', studentSchema);

// retrieve all the students
app.get('/allStudents', function(req, res) {
  Student.find({})
    .then(function(students) {
      res.json(students); 
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});

// search for students by name
app.get('/search', function(req, res) {
  const name = req.query.name; 

  Student.find({ name: name })
    .then(function(students) {
      res.json(students); 
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});

// update a student based on user input 
app.post('/update', function(req, res) {
  // Retrieve the updated student details from the request body
  const { _id, name, email, id, gpa, address, classes } = req.body;

  // Update the student in the database
  Student.findByIdAndUpdate(_id, { name, email, id, gpa, address, classes }, { new: true })
    .then(function(updatedStudent) {
      res.redirect('/list.html'); // go to all students page
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});

// delete a student from the database
app.post('/delete', function(req, res) {
  const studentId = req.body.studentId; // Retrieve the student ID from the request body

  Student.findByIdAndDelete(studentId)
    .then(function() {
      res.sendStatus(200); // successful
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); // error occurs
    });
});

// add a new student to the database
app.post('/add', function(req, res) {
  const { name, email, id, gpa, address, classes } = req.body;
  // create a new student instance
  const newStudent = new Student({
    name,
    email,
    id,
    gpa,
    address,
    classes
  });

  // Save the new student to the database
  newStudent.save()
    .then(function(savedStudent) {
      res.redirect('/list.html'); // go to student list page 
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});

// List all the students
app.get('/list', function(req, res) {
  Student.find({})
    .then(function(students) {
      // render student data
      res.render('list', { students: students });
    })
    .catch(function(error) { // catch error 
      console.error('Error:', error);
      res.sendStatus(500); 
    });
});
