const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const sequelize = require("./utils/database");
const expenseRoute = require("./routes/expense");
const userRoute = require("./routes/user");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/expense', expenseRoute);
app.use('/user', userRoute);

sequelize
    .sync()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server running on port 3000");
        })
    })
    .catch(err => console.log(err))
