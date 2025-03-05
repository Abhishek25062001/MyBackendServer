// import environment variables librarrie and give path
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

// import express library for create frame for backed using node js
const express = require('express');

// create router from Express for managing routes
const router = express.Router();

// import mongoose from library for manage mongo db and getting data
const {default: mongoose} = require('mongoose');
const Razorpay = require('razorpay');
//initiate express.js
// require('dotenv').config()
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// importing files
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const bodyParser = require('body-parser');
// pdf download start
const PDFDocument = require('pdfkit');
const cors = require('cors');
// pdf download end
const app = express();
// pdf downloader cors app
app.use(cors());
// Middleware for JSON and URL-encoded data
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));
app.use(bodyParser.json());
// import bcrypt for decript user password
const bcrypt = require('bcryptjs');
// import jsonwebtoken
const jwt = require('jsonwebtoken');
// asign an port to run server
const PORT = process.env.PORT || 5000;
// const mongoUrl = process.env.mongoUrl ;
// const JWT_SECRET = process.env.JWT_SECRET ;
// console.log(mongoUrl)
// console.log(JWT_SECRET)
app.listen(PORT, () => {
  console.log('Node.js server is started now');
  console.log(`Server running on port: ${PORT}`);
});

// importing mongoose
const mongoosen = require('mongoose');
const { Console } = require('console');
// to get data in json format data
app.use(express.json());
// mongo url to access database
const mongoUrl =
  'mongodb+srv://aj95608710:LA8h2gqxwJbmmVn1@cluster0.ksejl.mongodb.net/NoidaFarms?retryWrites=true&w=majority&appName=Cluster0';
// secret key
const JWT_SECRET =
  'hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe';
// to connect mongoose use this step
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log('database connceted');
  })
  .catch(e => {
    console.log(e, 'hey');
  });
//import database schema
require('./UserDetails');
//use database schema and use collection name , now it will fatch all the info availavle in UserInfo
const User = mongoose.model('UserInfo');
const Farmhouse = mongoose.model('FarmHouses');
const Order = mongoose.model('Order');
// used app.get that show data when someone visite port localhost:5002
app.get('/', (req, res) => {
  res.send({status: 'now it start'});
});
app.get('/ABHISHEK', (req, res) => {
  res.send({status: 'ABHISHEK BHAI HAI KYA'});
  Console.log('helobhai')
});

// creating api name:  register
app.post('/register', async (req, res) => {
  const {name, lastName, email, phoneNumber, password} = req.body;
  // checking user exists or not
  const OldUser = await User.findOne({email: email});
  if (OldUser) {
    return res.send({data: 'User Already Exists !'});
  }
  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    await User.create({
      //first indicate schema name and second indicate name from req.body
      name: name,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      password: encryptedPassword,
      // address : address,
    });
    res.send({status: 'ok', date: 'User created'});
  } catch (error) {
    res.send({status: 'error', data: error});
  }
});

// 20/12/2024
app.post('/login-user', async (req, res) => {
  const {email, password} = req.body;
  const OldUser = await User.findOne({email: email});
  // console.log(OldUser + ' old user details');
  const userDetails = OldUser;
  if (!OldUser) {
    return res.status(404).send({data: 'User not found'});
  }
  // if (OldUser.password !== password) {
  //   return res.json({ data: 'Incorrect password' });
  // }
  if (email === 'admin@gmail.com' && password === 'Admin@123') {
    // console.log('Admin login');
    const token = jwt.sign({email}, JWT_SECRET);
    return res.status(201).send({
      status: 'ok',
      data: {
        token,
        UserID: OldUser._id,
        userType: 'admin', // Explicit admin type
        UserAllDetails: userDetails,
      },
    });
  }

  if (await bcrypt.compare(password, OldUser.password)) {
    // console.log('User login');
    const token = jwt.sign({email}, JWT_SECRET);
    return res.status(201).send({
      status: 'ok',
      data: {
        token,
        UserID: OldUser._id,
        userType: 'user', // Regular user type
        UserAllDetails: userDetails,
      },
    });
  }

  return res.status(401).send({error: 'Invalid email or password!'});
});

// code for get data 'userdata' from database and api
app.post('/userdata', async (req, res) => {
  const {token} = req.body;
  // console.log('we are inside getdata api 1');
  try {
    // console.log("we are inside try of getdata api 2")
    const user = jwt.verify(token, JWT_SECRET);
    // console.log("we are inside try of getdata api 2")
    const useremail = user.email;
    // console.log(useremail)
    User.findOne({email: useremail}).then(data => {
      // console.log(data.data)
      return res.send({status: 'ok', data: data});
      // console.log('we are inside try of getdata api 3');
    });
  } catch (error) {
    // console.log('we are inside catch of getdata api');
    return res.send({error: 'error here'});
  }
});
app.post('/update-user', async (req, res) => {
  const {name, lastName, email, phoneNumber, image, gender, address, dob} =
    req.body;
  // console.log(req.body);
  try {
    await User.updateOne(
      {email: email},
      {
        $set: {
          name,
          lastName,
          email,
          phoneNumber,
          image,
          gender,
          address,
          dob,
        },
      },
    );
    res.send({status: 'Ok', data: 'Updated'});
  } catch (error) {
    return res.send({error: error});
  }
});
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {recursive: true}); // Ensure uploads directory exists
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store images in the uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
      file.originalname
    }`;
    cb(null, uniqueSuffix); // Unique filename for every uploaded file
  },
});
const upload = multer({storage});
// Dedicated API for Image Uploads
app.post('/uploadImages', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({message: 'No files uploaded'});
    }
    // Map file paths
    const imagePaths = req.files.map(file => ({uri: file.path}));
    res.status(200).json({
      message: 'Images uploaded successfully',
      imagePaths, // Send back the uploaded image paths
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({message: 'Error uploading images', error});
  }
});
// 13/12/2024
// create a new farmhouse
app.post('/createFarmhouse', async (req, res) => {
  const {addressDetails, location, UserID} = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({message: 'Unauthorized'});
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const newFarmhouse = new Farmhouse({
      userId: UserID,
      address: {
        houseNumber: addressDetails.houseNumber,
        areaName: addressDetails.areaName,
        city: addressDetails.city,
        state: addressDetails.state,
        pinCode: addressDetails.pinCode,
        country: addressDetails.country,
        coordinates: {
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
      },
    });
    const savedFarmhouse = await newFarmhouse.save();
    res
      .status(201)
      .json({message: 'Farmhouse created', farmhouseId: savedFarmhouse._id});
  } catch (error) {
    console.error('Error creating farmhouse:', error);
    res.status(500).json({message: 'Error creating farmhouse', error});
  }
});
// update farmhouse details
app.patch('/updateFarmhouse/:id', async (req, res) => {
  const {id} = req.params;
  const updateData = req.body;
  // console.log('Update Data Received:', updateData);

  // console.log('inside axios')

  try {
    const updatedFarmhouse = await Farmhouse.findByIdAndUpdate(
      id,
      {$set: updateData},
      {new: true},
    );

    if (!updatedFarmhouse) {
      return res.status(404).json({message: 'Farmhouse not found'});
    }

    res
      .status(200)
      .json({message: 'Farmhouse updated successfully', updatedFarmhouse});
  } catch (error) {
    console.error('Error updating farmhouse:', error);
    res.status(500).json({message: 'Error updating farmhouse', error});
  }
});
// finalizing farmhouses
app.patch('/finalizeFarmhouse/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const finalizedFarmhouse = await Farmhouse.findByIdAndUpdate(
      id,
      {$set: {status: 'completed'}},
      {new: true},
    );

    if (!finalizedFarmhouse) {
      return res.status(404).json({message: 'Farmhouse not found'});
    }
    res
      .status(200)
      .json({message: 'Farmhouse finalized successfully', finalizedFarmhouse});
  } catch (error) {
    console.error('Error finalizing farmhouse:', error);
    res.status(500).json({message: 'Error finalizing farmhouse', error});
  }
});
// ====18/12/2024 this finds all the information about farmhouse and show in last at the time of cinfirmation
app.get('/farmhouse/:id', async (req, res) => {
  const {id} = req.params;
  // console.log('/farmhouse/:id');
  try {
    const farmhouse = await Farmhouse.findById(id);
    if (!farmhouse) {
      return res.status(404).json({message: 'Farmhouse not found'});
    }
    res
      .status(200)
      .json({message: 'Farmhouse retrieved successfully', farmhouse});
  } catch (error) {
    console.error('Error fetching farmhouse details:', error);
    res.status(500).json({message: 'Error fetching farmhouse details', error});
  }
});
// 23/12/2-24
// get all user accounts
app.get('/AllUsers', async (req, res) => {
  // console.log('inside Axios');
  try {
    const users = await User.find();
    console.log('Fetched users:', users);
    res
      .status(200)
      .json({message: 'Users retrieved successfully', data: users});
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({message: 'Error fetching users', error});
  }
});
// find all farmhouse in admin and home
app.get('/farmhouses', async (req, res) => {
  try {
    // console.log('farmhouses admin')
    // Fetch all farmhouses
    const farmhouses = await Farmhouse.find().sort({createdAt: -1});
    // Respond with the farmhouse data
    res.status(200).json({
      message: 'Farmhouses fetched successfully',
      data: farmhouses,
    });
  } catch (error) {
    console.error('Error fetching farmhouses:', error);
    res.status(500).json({message: 'Internal server error', error});
  }
});

// find all farmhouse in home that is appproved
app.get('/farmhousesForHome', async (req, res) => {
  try {
    // console.log('farmhouses admin')
    // Fetch all farmhouses
    const farmhouses = await Farmhouse.find({status: 'completed'}).sort({
      createdAt: -1,
    });
    // Respond with the farmhouse data
    res.status(200).json({
      message: 'Farmhouses fetched successfully',
      data: farmhouses,
    });
  } catch (error) {
    console.error('Error fetching farmhouses:', error);
    res.status(500).json({message: 'Internal server error', error});
  }
});

// 3/01/2025 get farmhouses uding user id

app.get('/farmhousesById', async (req, res) => {
  try {
    // console.log('farmhousesById');
    const {userId} = req.query;
    const query = userId ? {userId} : {};
    const farmhouses = await Farmhouse.find(query);
    res
      .status(200)
      .json({message: 'Farmhouses fetched successfully', data: farmhouses});
  } catch (error) {
    console.error('Error fetching farmhouses:', error);
    res.status(500).json({message: 'Internal server error', error});
  }
});

// 3/01/2025 farmhouse approved ?
// Update farmhouse approval status
app.patch('/updateApproval/:id', async (req, res) => {
  // console.log('Update request received');
  const {id} = req.params; // Extract the farmhouse ID from the URL
  // console.log(id + ' id');
  const {approvalStatus} = req.body; // Extract approvalStatus from the request body
  // console.log(approvalStatus + ' Update approvalStatus');

  if (!id) {
    // console.log('Update inside if');
    return res.status(400).json({message: 'Farmhouse ID is required'});
  }
  if (!approvalStatus) {
    return res.status(400).json({message: 'Approval status is required'});
  }

  try {
    // console.log('inside try');
    const updatedFarmhouse = await Farmhouse.findByIdAndUpdate(
      id,
      {$set: {approved: approvalStatus}},
      {new: true},
    );

    if (!updatedFarmhouse) {
      return res.status(404).json({message: 'Farmhouse not found'});
    }

    res.status(200).json({
      message: 'Approval status updated successfully',
      updatedFarmhouse,
    });
  } catch (error) {
    console.error('Error updating approval status:', error);
    res.status(500).json({message: 'Error updating approval status', error});
  }
});

// 13/01/2025 download invoice

app.post('/generate-pdf', (req, res) => {
  const {orderDetails ,customerDetails} = req.body;
  const doc = new PDFDocument();
  const pdfPath = path.join(__dirname, 'invoice.pdf');
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);
  // Add content to the PDF
  doc.fontSize(20).text('Booking Invoice', {align: 'center'});
  doc.moveDown();
  doc.fontSize(14).text(`Booking ID: ${orderDetails.farmhouse_id || 'N/A'}`);
  doc.fontSize(14).text(`Farmhouse Name: ${orderDetails.farmhouse_name || 'N/A'}`);
  doc.fontSize(14).text(`Location: ${orderDetails.location || 'N/A'}`);
  doc.text(`Order Date & Time: ${orderDetails.created_at || 'N/A'}`);
  doc.text(`Payment Method: ${orderDetails.paymentMethod || 'N/A'}`);
  doc.text(`Total Amount Paid: ₹${orderDetails.total_price || 'N/A'}`);
  doc.text(`Order Status: ${orderDetails.booking_status || 'N/A'}`);
  doc.moveDown();
  doc.fontSize(16).text('Customer Details');
  doc
    .fontSize(14)
    .text(
      `Name: ${customerDetails.name + '' + customerDetails.lastName || 'N/A'}`,
    );
  doc.text(`Email: ${customerDetails.email || 'N/A'}`);
  doc.text(`Phone: ${customerDetails.phoneNumber || 'N/A'}`);
  doc.moveDown();
  doc.fontSize(16).text('Stay Details');
  doc.fontSize(14).text(`Check-in: ${orderDetails.check_in_date || 'N/A'}`);
  doc.text(`Check-out: ${orderDetails.check_out_date || 'N/A'}`);
  // doc.text(`Rooms: ${orderDetails.rooms || '1'}`);
  doc.text(`Guests: ${orderDetails.number_of_guests || '1'}`);
  // Finalize the PDF and end the stream
  // console.log('in generating pdf added content');
  doc.end();
  writeStream.on('finish', () => {
    // Read the PDF and send it as raw binary
    fs.readFile(pdfPath, (err, data) => {
      if (err) {
        console.error('Error reading PDF:', err);
        res.status(500).send('Error generating PDF');
        return;
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.send(data);
    });
  });
});
// 27/01/2025 api for bookings
const razorpay = new Razorpay({
  key_id: 'rzp_test_cwICPGGLhKqFG6', 
  key_secret: 'SCZj4segvf6oE8qJGcihGmIT', 
});

app.post('/api/bookings', async (req, res) => {
  try {
    // console.log('inside booking ');
    const {
      user_id,
      farmhouse_id,
      farmhouse_name,
      location,
      price_per_night,
      check_in_date,
      check_out_date,
      number_of_guests,
      special_requests,
      total_price,
    } = req.body;

    // console.log('req done ');

    // Create new order in MongoDB
    const newOrder = new Order({
      user_id,
      farmhouse_id,
      farmhouse_name,
      location,
      price_per_night,
      total_price,
      check_in_date: new Date(check_in_date),
      check_out_date: new Date(check_out_date),
      number_of_guests,
      special_requests,
      payment: {
        razorpay_payment_id: null,
        status: 'Pending',
        amount_paid: 0,
        payment_date: null,
      },
      booking_status: 'Pending',
    });

    await newOrder.save();

    // console.log('Booking saved successfully');
    const razorpayOrder = await razorpay.orders.create({
      amount: total_price * 100, // Razorpay takes amount in paise (multiply by 100)
      currency: 'INR',
      receipt: `${newOrder._id}`, // Use MongoDB ID as receipt
      payment_capture: 1, // Auto-capture payment
    });

    console.log('Razorpay order created:', razorpayOrder);

    res.status(201).json({
      message: 'Booking created successfully',
      order_id: newOrder._id,
      razorpay_order_id: razorpayOrder.id, // Send Razorpay order ID to frontend
      total_price,
    });
  } catch (err) {
    console.error('Error during booking creation:', err.message, err.stack);
    res
      .status(500)
      .json({error: 'Failed to create booking', details: err.message});
  }
});
app.post('/api/bookings/payment/callback', async (req, res) => {
  // console.log('inside callback');
  try {
    const {razorpay_payment_id, order_id} = req.body;

    const order = await Order.findById(order_id);

    if (!order) {
      return res.status(404).json({error: 'Order not found'});
    }

    // Update payment and booking details
    order.payment.razorpay_payment_id = razorpay_payment_id;
    order.payment.status = 'Success';
    order.payment.amount_paid = order.total_price; // Assuming full payment
    order.payment.payment_date = new Date();
    order.booking_status = 'Confirmed';
    order.updated_at = new Date();

    await order.save();

    res.status(200).json({
      message: 'Payment status updated successfully',
      payment_status: 'Success',
      booking_status: 'Confirmed',
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to update payment status',
      details: err.message,
    });
  }
});
app.get('/orders/:user_id', async (req, res) => {
  try {
    const {user_id} = req.params;
    const orders = await Order.find({user_id})
      .select(
        'farmhouse_name location check_in_date check_out_date booking_status created_at total_price price_per_night',
      )
      .sort({createdAt: -1});

    res.status(200).json(orders);
  } catch (err) {
    res
      .status(500)
      .json({error: 'Failed to fetch orders', details: err.message});
  }
});
// to fetch order details from orders by using order id
app.get('/api/bookings/:order_id', async (req, res) => {
  try {
    const {order_id} = req.params;

    const order = await Order.findById(order_id);

    if (!order) {
      return res.status(404).json({error: 'Order not found'});
    }

    res.status(200).json(order);
  } catch (err) {
    res
      .status(500)
      .json({error: 'Failed to fetch order details', details: err.message});
  }
});
// code for forget password
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Common SMTP port for email services
  secure: false, // Set to true for port 465
  auth: {
    user: 'aj95608710@gmail.com',
    pass: 'evkt gwmz mafr vcex',
  },
});
app.post('/forgot-password', async (req, res) => {
  try {
    // console.log('1');
    const {email} = req.body;
    // console.log('2');
    const user = await User.findOne({email: email});
    // console.log('3');
    if (!user) {
      // console.log('4');
      console.log('user not found');
      return res.status(404).json({message: "User doesn't exist!"});
    }
    // console.log('5');
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 600000;
    await user.save();
    // console.log('6');
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text: `Enter this otp for verification: ${otp}`,
    });
    // console.log('7');
    res.json({message: 'OTP send to you registered mail.'});
    // console.log('8');
  } catch (error) {
    res.status(500).json({message: 'Server error'});
  }
});
// otp verification
app.post('/OptVerification', async (req, res) => {
  try {
    const {email, otp} = req.body;
    const user = await User.findOne({
      email: email,
      resetPasswordToken: otp,
      resetPasswordExpires: {$gt: Date.now()},
    });
    // console.log(user);
    if (!user) {
      return res.status(400).json({message: 'Invalid or expired OTP'});
    }
    res.json({message: 'OTP verified successfully'});
  } catch (error) {
    res.status(500).json({message: 'Server error'});
  }
});

// password reset
app.post('/reset-password', async (req, res) => {
  try {
    const {email, otp, newPassword} = req.body;
    const user = await User.findOne({
      email: email,
      resetPasswordToken: otp,
      resetPasswordExpires: {$gt: Date.now()},
    });
    // console.log(user);
    if (!user) {
      // console.log('323');
      return res.status(400).json({message: 'Invalid or expired OTP'});
    }
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    user.password = encryptedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({message: 'Password updated successfully'});
  } catch (error) {
    res.status(500).json({message: 'Server error'});
  }
});