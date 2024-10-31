const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { generateToken } = require('../utils')

const registerUser = asyncHandler(async (req, res) => {
  //Lấy các thông tin cần thiết từ body của request. Đây là các thông tin được người dùng cung cấp khi đăng ký.
  const { name, email, password } = req.body

  //Validation 
  if (!name || !email || !password) {
    //Kiểm tra xem tất cả các trường name, email, và password có được cung cấp hay không. Nếu thiếu trường nào, trả về lỗi 400.
    res.status(400)
    throw new Error('Please fill in all the required fields ')
  }

  if(password.length <6){
    //Kiểm tra độ dài của mật khẩu phải ít nhất là 6 ký tự.
    res.status(400)
    throw new Error('Password mush be up to 6 characters')
  }

  //CHeck if user exists - Tìm kiếm người dùng với email đã cung cấp. Nếu người dùng đã tồn tại, trả về lỗi 400.
  const userExists = await User.findOne({email})

  if(userExists){
    res.status(400)
    throw new Error('Email already in use')
  }

  //Create new user
  const user = await User.create({
    name,
    email,
    password,
  })

  //Generate Token - Gọi hàm generateToken để tạo token xác thực cho người dùng mới.
  const token = generateToken(user._id)

  //Send HTTP  - only cookie --> Gửi cookie HTTP-only chứa token đến client. Cookie này sẽ được bảo vệ và không thể truy cập bởi JavaScript phía client.
  res.cookie('token',token,{
    path:'/',
    httpOnly:true,
    expires: new Date(Date.now() + 1000 * 86400), //1 day
    sameSite: 'none',
    secure: true,
  })

  if (user) {
    const {_id, name, email, phone, bio, photo, role, isVerified} = user
    res.status(201).json({
      _id, name, email, phone, bio, photo, role, isVerified, token 
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }


})

module.exports = {
  registerUser
}
