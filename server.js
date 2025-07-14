const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const Lab = require('./models/Lab');
const path = require('path');
const app = express();

mongoose.connect('mongodb://localhost:27017/labReservationSystem', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use(session({
  secret: 'ccapD3vGroup4!',     
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const hbs = require('hbs');
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});
hbs.registerHelper('formatDate', function(date) {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
});

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/reservation', (req, res) => {
  res.render('reservation');
});

app.get('/lab', (req, res) => {
  res.render('lab');
});

app.get('/edit-profile/edit', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  res.render('edit-profile', { user });
});

app.get('/dashboard', async (req, res) => {
  const user = req.session.user;
  if (!user)
    {
      return res.redirect('/login');
    } 
  try {
    let reservations;
    if (user.userType === 'student') {
  reservations = await Reservation.find({ user: user._id }).populate('lab');


} else {
  reservations = await Reservation.find().populate('user').populate('lab');
}


    const labs = await Lab.find();
      res.render('dashboard', {
      user,
      reservations,
      labs,
      isStudent: user.userType === 'student',
      isTechnician: user.userType === 'technician'
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

app.get('/walkin/new', async (req, res) => {
  const labs = await Lab.find();
  const students = await User.find({ userType: 'student' });
  res.render('walkin-new', { labs, students });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Error logging out.');
    }
    res.redirect('/login');
  });
});

app.use(express.urlencoded({ extended: true }));

//post

app.post('/walkin/new', async (req, res) => {
    const { user, lab, date, startTime, endTime, purpose } = req.body;
  console.log("Walk-in form data received:", req.body);

  try {
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    await Reservation.create({
      user,
      lab,
      date: dateOnly,
      startTime: startDateTime,
      endTime: endDateTime,
      purpose,
      status: 'Approved',
      isWalkIn: true,
      reservedByTechnician: true
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating walk-in');
  }
});


app.post('/edit-profile/edit', async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) return res.redirect('/login');

  const { firstName, lastName, email, password, idNumber, area } = req.body;

  if (!firstName || !lastName || !email ||!password || !idNumber || !area) {
    return res.render('edit-profile', { user: sessionUser, error: 'Please fill out all fields.' });
  }

  const studentPattern = /^[a-z]+_[a-z]+@dlsu\.edu\.ph$/i;
  const techPattern = /^[a-z]+\.[a-z]+@dlsu\.edu\.ph$/i;

  if (sessionUser.userType === 'student') {
    if (!/^12\d{6}$/.test(idNumber)) {
      return res.render('edit-profile', { user: sessionUser, error: 'Student ID must start with 12 and be 8 digits.' });
    }
    if (!studentPattern.test(email)) {
      return res.render('edit-profile', { user: sessionUser, error: 'Invalid student email format.' });
    }
  } else {
    if (!techPattern.test(email)) {
      return res.render('edit-profile', { user: sessionUser, error: 'Invalid technician email format.' });
    }
  }

  // Check ID uniqueness
  const idField = sessionUser.userType === 'student' ? 'studentId' : 'employeeId';
  const idFilter = { [idField]: idNumber, _id: { $ne: sessionUser._id } };
  const idExists = await User.findOne(idFilter);
  if (idExists) {
    return res.render('edit-profile', { user: sessionUser, error: 'That ID number is already in use.' });
  }

  try {
    const updatedFields = {
      firstName,
      lastName,
      email, password,
      [idField]: idNumber,
    };

    if (sessionUser.userType === 'student') {
      updatedFields.course = area;
    } else {
      updatedFields.department = area;
    }

    const updatedUser = await User.findByIdAndUpdate(sessionUser._id, updatedFields, { new: true });
    req.session.user = updatedUser;

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('edit-profile', { user: sessionUser, error: 'Server error. Try again.' });
  }
});

app.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    idNumber,
    email,
    password,
    confirmPassword,
    userType,
    area 
  } = req.body;

  if (!firstName || !lastName || !idNumber || !email || !password || !userType || !area) {
    return res.render('register', { error: 'Please fill out all fields.' });
  }

  if (!/^12\d{6}$/.test(idNumber)) {
    return res.render('register', { error: 'ID number must start with "12" and be 8 digits long.' });
  }

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match.' });
  }

  const studentEmailPattern = /^[a-z]+_[a-z]+@dlsu\.edu\.ph$/i;
  const techEmailPattern = /^[a-z]+\.[a-z]+@dlsu\.edu\.ph$/i;
  if (userType === 'student' && !studentEmailPattern.test(email)) {
    return res.render('register', { error: 'Student email must follow the firstname_lastname@dlsu.edu.ph format.' });
  }
  if (userType === 'technician' && !techEmailPattern.test(email)) {
    return res.render('register', { error: 'Technician email must follow the firstname.lastname@dlsu.edu.ph format.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'Email already registered.' });
    }

    const newUser = {
      firstName,
      lastName,
      email,
      password,
      userType
    };

    if (userType === 'student') {
      newUser.studentId = idNumber;
      newUser.course = area;
    } else {
      newUser.employeeId = idNumber;
      newUser.department = area;
    }

    await User.create(newUser);

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (user) {
      
       req.session.user = user;
      return res.redirect('/dashboard');
    } else {
      return res.render('login', { error: 'Invalid username or password.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://127.0.0.2:3000');
});