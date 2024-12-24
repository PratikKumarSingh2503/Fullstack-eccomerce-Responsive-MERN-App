// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv").config();
// const Stripe = require("stripe")

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: "10mb" }));

// const PORT = process.env.PORT || 5555;

// //mongodb connection
// mongoose.set("strictQuery", false);
// mongoose
//   .connect(process.env.MONGODB_URL)
//   .then(() => console.log("Connect to Database"))
//   .catch((err) => console.log(err));

// //schema 
// const userSchema = mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   email: {
//     type: String,
//     unique: true,
//   },
//   password: String,
//   confirmPassword: String,
//   image: String,
// });

// //
// const userModel = mongoose.model("user", userSchema);

// // api
// app.get("/", (req, res) => {
//   res.send("Server is running");
// });

// // sign up
// app.post("/signup", async (req, res) => {
//   // console.log(req.body);
//   const { email } = req.body;

//   userModel.findOne({ email: email }, (err, result) => {
//     // console.log(result);
//     console.log(err);
//     if (result) {
//       res.send({ message: "Email id is already register", alert: false });
//     } else {
//       const data = userModel(req.body);
//       const save = data.save();
//       res.send({ message: "Successfully sign up", alert: true });
//     }
//   });
// });

// //api login
// app.post("/login", (req, res) => {
//   // console.log(req.body);
//   const { email } = req.body;
//   userModel.findOne({ email: email }, (err, result) => {
//     if (result) {
//       const dataSend = {
//         _id: result._id,
//         firstName: result.firstName,
//         lastName: result.lastName,
//         email: result.email,
//         image: result.image,
//       };
//       console.log(dataSend);
//       res.send({
//         message: "Login is successfully",
//         alert: true,
//         data: dataSend,
//       });
//     } else {
//       res.send({
//         message: "Email is not available, please sign up",
//         alert: false,
//       });
//     }
//   });
// });


// // product section
// const schemaProduct = mongoose.Schema({
//   name: String,
//   brand: String,
//   category: String,
//   image: String,
//   price: String,
//   description: String,
// });
// const productModel = mongoose.model("product", schemaProduct)

// // save product in data
// // api
// app.post("/uploadProduct", async (req, res) => {
//   // console.log(req.body)
//   const data = await productModel(req.body)
//   const datasave = await data.save()
//   res.send({ message: "Upload successfully " })
// })


// // 
// app.get("/product", async (req, res) => {
//   const data = await productModel.find({})
//   res.send(JSON.stringify(data))
// })

// /****** payment getway */

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// app.post("/create-checkout-session", async(req, res) => {

//   try {
//     const params = {
//       submit_type: 'pay',
//       mode: 'payment',
//       payment_method_types: ['card'],
//       billing_address_collection: "auto",
//       shipping_options: [{ shipping_rate: "shr_1O2zSlSIOYJFMlEZgca1o8n9" }],

//       line_items: req.body.map((item) => {
//         return {
//           price_data: {
//             currency: "inr",
//             product_data: {
//               name: item.name,
//               // image: [item.image]
//             },
//             unit_amount: item.price * 100,
//           },
//           adjustable_quantity: {
//             enabled: true,
//             minimum: 1,
//           },
//           quantity: item.qty
//         }
//       }),

//       success_url : `${process.env.FRONTEND_URL}/success`,
//       cancel_url : `${process.env.FRONTEND_URL}/cancel`,
//     }

//     const session = await stripe.checkout.sessions.create(params)
//     res.status(200).json(session.id)

//   }
//   catch (err) {
//     res.status(err.statusCode || 500).json(err.message)
//   }

// })

// // server is running
// app.listen(PORT, () => console.log("server is running at port : " + PORT))







const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const Stripe = require("stripe");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 5555;

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.error("Database connection error:", err));

// User Schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});

const userModel = mongoose.model("user", userSchema);

// API Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Sign Up
app.post("/signup", async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.send({ message: "Email is already registered", alert: false });
    }

    const newUser = new userModel(req.body);
    await newUser.save();
    res.send({ message: "Successfully signed up", alert: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Sign-up failed", alert: false });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const dataToSend = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
      };
      res.send({ message: "Login successful", alert: true, data: dataToSend });
    } else {
      res.send({ message: "Email not found, please sign up", alert: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Login failed", alert: false });
  }
});

// Product Schema
const productSchema = mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
});

const productModel = mongoose.model("product", productSchema);

// Save Product API
app.post("/uploadProduct", async (req, res) => {
  try {
    const newProduct = new productModel(req.body);
    await newProduct.save();
    res.send({ message: "Product uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to upload product" });
  }
});

// Get Products API
app.get("/product", async (req, res) => {
  try {
    const products = await productModel.find({});
    res.send(products);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to fetch products" });
  }
});

// Stripe Payment Gateway
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      shipping_options: [{ shipping_rate: "shr_1N0qDnSAq8kJSdzMvlVkJdua" }],
      line_items: req.body.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
        quantity: item.qty,
      })),
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    const session = await stripe.checkout.sessions.create(params);
    res.status(200).json(session.id);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

// Server Start
app.listen(PORT, () => console.log(`Server is running at port: ${PORT}`));