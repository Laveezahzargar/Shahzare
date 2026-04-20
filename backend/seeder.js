
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/product");

dotenv.config();

//connect to mongoDB
mongoose.connect(process.env.MONGO_URI);

//function to seed data

const seedData = async () => {
    try {
        //clear existing data
        await Product.deleteMany();
        await User.deleteMany();

        //create a default user admin user
        const createdUser = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "12345678",
            role: "admin",
        });

        //assign the default user ID to each product
        const userID = createdUser._id;

        const sampleProducts = products.map((product) => {
            return { ...product, user: userID };
        })

        //insert products into DB
        await Product.insertMany(sampleProducts);

        console.log("Product data seeded sucessfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding the data:", error);
        process.exit(1);
    }
};

seedData();