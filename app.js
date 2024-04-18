const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require('dotenv');
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

const sequelize = require("./utils/database");
const expenseRoute = require("./routes/expense");
const userRoute = require("./routes/user");
const purchaseRoute = require("./routes/purchase");
const premiumRoute = require("./routes/premium");
const passwordRoute = require("./routes/password");
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
const Report = require("./models/report");
const ForgotPasswordRequests = require("./models/forgotPassword");

app.use('/expense', expenseRoute);
app.use('/user', userRoute);
app.use('/purchase', purchaseRoute);
app.use('/premium', premiumRoute);
app.use('/password', passwordRoute);

app.use((req, res, next) => {
    res.status(200).sendFile(path.join(__dirname, `public/${req.url}`));
});

Expense.belongsTo(User);
User.hasMany(Expense);

Order.belongsTo(User);
User.hasMany(Order);

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

User.hasMany(Report);
Report.belongsTo(User);

sequelize
    // .sync({ force: true })
    .sync()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log("Server running on port 3000");
        })
    })
    .catch(err => console.log(err))
