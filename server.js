require("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const userRoute = require('./routes/userRoute');
const errorHandle = require("./middleware/errorMiddleware");

const app = express();

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://btn-authz.vercel.app'],
    //Sau này đổi auth-app.ver… thành dịa chỉ ta sẽ deloy frontend trên Vercal
    credentials: true
  })
)

//Routes
app.use("/api/users", userRoute)
//Sử dụng app.use("/api/users", userRoute) để gắn các tuyến đường từ userRoute vào dưới đường dẫn /api/users.

app.get("/", (req, res) => {
  res.send("Home Page")
})

//Error Handler
app.use(errorHandle)

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`)
    })
  })
  .catch((err) => console.log(err))

