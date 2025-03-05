// import mongoose
const mongoose = require('mongoose');
//  create variable to store schema or structure of user data
const UserDetailSchema = new mongoose.Schema(
  {
    name: String,
    lastName: String,
    email: {type: String, unique: true},
    phoneNumber: {type: String, unique: true},
    password: String,
    image: String,
    gender: String,
    address: String,
    dob: String,
    resetPasswordToken : String,
    resetPasswordExpires :Date,
  },
  {
    // for export schema give collation name
    collection: 'UserInfo',
    // collection
  },
);
//  here we export schema
mongoose.model('UserInfo', UserDetailSchema);
// schema for farmhouse create
const FarmhouseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    address: {
      houseNumber: String,
      areaName: String,
      city: String,
      state: String,
      pinCode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    basicDetails: {
      guests: Number,
      bedrooms: Number,
      beds: Number,
      bathrooms: Number,
    },
    amenities: [String],
    images: [
      {
        uri: String,
      },
    ],
    description: {
      title: String,
      body: String,
    },
    pricing: [
      {
        type: {
          type: String, // e.g., 'dayFare', 'nightFare', 'fullDayFare'
          enum: ['dayFare', 'nightFare', 'fullDayFare'], // Restrict to valid types
        },
        fare: Number, // Price for this type
      },
    ],
    // pricing: {
    //   dayFare: Number,
    //   nightFare: Number,
    //   fullDayFare: Number,
    // },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    approved: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'FarmHouses',
  },
);
module.exports = mongoose.model('FarmHouses', FarmhouseSchema);

// order code schema

const OrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'},
  farmhouse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmhouse',
  },
  farmhouse_name: {type: String, },
  location: {type: String, },
  price_per_night: {type: Number, },
  total_price: {type: Number, },
  check_in_date: {type: Date, },
  check_out_date: {type: Date, },
  number_of_guests: {type: Number, },
  special_requests: {type: String},
  payment: {
    razorpay_payment_id: {type: String, },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
    },
    amount_paid: {type: Number, },
    payment_date: {type: Date, },
  },
  booking_status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
  },
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
}
,
{
  // timestamps: true,
  collection: 'Order',
},
);

module.exports = mongoose.model('Order', OrderSchema);
