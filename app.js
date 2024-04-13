const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require('dotenv');

const sequelize = require("./utils/database");
const expenseRoute = require("./routes/expense");
const userRoute = require("./routes/user");
const purchaseRoute = require("./routes/purchase");
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");

const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

app.use('/expense', expenseRoute);
app.use('/user', userRoute);
app.use('/purchase', purchaseRoute);

Expense.belongsTo(User);
User.hasMany(Expense);

Order.belongsTo(User);
User.hasMany(Order);

sequelize
    // .sync({ force: true })
    .sync()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server running on port 3000");
        })
    })
    .catch(err => console.log(err))
