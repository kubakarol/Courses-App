const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const secretKey = 'lalala123';
const app = express();
const port = 5500;

app.use(bodyParser.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const mongoURI = "mongodb+srv://admin:admin@cluster0.yntaf1q.mongodb.net/coursedb?retryWrites=true&w=majority";
mongoose.connect(mongoURI);

// SCHEMAS

const userSchema = new mongoose.Schema({
  name: String,
  lastname: String,
  email: String,
  password: String,
  type: Number,
});
const Users = mongoose.model('Users', userSchema);

const courseSchema = new mongoose.Schema({
  title: String,
  props: [String],
  description: String,
  category: String,
  imagePath: String
});
const Courses = mongoose.model('Courses', courseSchema);

const enrollmentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  userLastname: String,
  courseTitle: String,
  details: String,
});
const Enrollment = mongoose.model('Enrollments', enrollmentSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//  USERS/LOGIN/REGISTER

app.get('/coursedb/users', async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd pobierania użytkowników' });
  }
});

app.post('/coursedb/users', async (req, res) => {
  const { name, lastname, email, password, type } = req.body;

  // Check if the user already exists
  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = new Users({
    name,
    lastname,
    email,
    password,
    type
  });

  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/coursedb/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email, password });
    if (!user) {
      return res.status(404).json({ message: 'Nieprawidłowy email lub hasło.' });
    }
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    res.json({ user: user, token: token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Błąd logowania.' });
  }
});

app.get('/coursedb/currentUser', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const user = await Users.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    res.json(user);
  } catch (error) {
    console.error('Błąd pobierania danych użytkownika:', error);
    res.status(500).json({ message: 'Błąd pobierania danych użytkownika', error: error.message });
  }
});

//  COURSES

app.get('/coursedb/courses', async (req, res) => {
  let query = {};
  if (req.query.category) {
    query.category = req.query.category;
  }
  try {
    const courses = await Courses.find(query, 'title description props category imagePath');
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

app.get('/coursedb/courses/:id', async (req, res) => {
  try {
    const course = await Courses.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Kurs nie został znaleziony' });
    }
    res.json(course);
  } catch (err) {
    console.error('Błąd pobierania kursu:', err);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania kursu' });
  }
});

app.get('/coursedb/categories', async (req, res) => {
  try {
    const categories = await Courses.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

app.post('/coursedb/addCourses', upload.single('image'), async (req, res) => {
  const { title, props, description, category } = req.body;
  const propsArray = JSON.parse(props);
  let imagePath = '';

  if (req.file) {
    const filename = `course-${Date.now()}.jpg`;
    imagePath = `/uploads/${filename}`;

    await sharp(req.file.buffer)
      .resize(1024)
      .jpeg({ quality: 90 })
      .toFile(path.join(__dirname, 'uploads', filename));
  }

  try {
    const newCourse = new Courses({ title, props: propsArray, description, category, imagePath });
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).send('Error adding course');
  }
});

app.delete('/coursedb/deleteCourses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Courses.findByIdAndDelete(courseId);

    if (course) {
      // Delete the image file from the uploads folder
      if (course.imagePath) {
        const imagePath = path.join(__dirname, course.imagePath);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
          } else {
            console.log('Image file deleted successfully');
          }
        });
      }
      res.status(200).json({ message: 'Course deleted successfully' });
    } else {
      res.status(404).send('Course not found');
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).send('Error deleting course');
  }
});

//  ENROLLMENTS

app.post('/coursedb/enrollments', async (req, res) => {
  try {
    const { userId, userName, userLastname, courseTitle, details } = req.body;
    const enrollment = new Enrollment({
      userId,
      userName,
      userLastname,
      courseTitle,
      details,
    });
    await enrollment.save();
    res.status(201).json({ message: 'Enrollment added successfully' });
  } catch (error) {
    console.error('Błąd zapisu:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas zapisu' });
  }
});

app.get('/coursedb/enrollments/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const enrollments = await Enrollment.find({ userId: userId });
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ message: 'Error fetching enrollments' });
  }
});

app.delete('/coursedb/cancelEnrollment/:id', async (req, res) => {
  try {
    const enrollmentId = req.params.id;
    const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);

    if (enrollment) {
      res.status(200).json({ message: 'Enrollment cancelled successfully' });
    } else {
      res.status(404).json({ message: 'Enrollment not found' });
    }
  } catch (error) {
    console.error('Error cancelling enrollment:', error);
    res.status(500).json({ message: 'Error cancelling enrollment' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
