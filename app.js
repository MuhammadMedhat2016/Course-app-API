const path = require('path');
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const courseRouter = require("./Routers/courseRouter");
const userRouter = require("./Routers/userRouter");
const registerRouter = require("./Routers/registerationRouter");
const reviewRouter = require("./Routers/reviewRouter");
dotenv.config({ path: "config.env" });

const APIError = require("./utils/apiError");
const errorController = require("./Controllers/errorController");

let DB = process.env.DATABASE_URI.replace("<USER>", process.env.DATABASE_USERNAME)
  .replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
  .replace("<DATABASENAME>", process.env.DATABASE_NAME);
mongoose
  .connect(DB)
  .then((conn) => {
    console.log(`Connected to ${conn.connection.host} successfully`);
  })
  .catch((err) => {
    console.log(`Database Error: ${err}`);
    process.exit(1);
  });

const app = express();

app.use(express.static(path.join(__dirname, 'public/img/course')));
app.use(express.static(path.join(__dirname, 'public/img/user')));
app.use(express.json());

app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/register", registerRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new APIError(`This ${req.originalUrl} is no where to be found on server`, 404));
});

app.use(errorController);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
