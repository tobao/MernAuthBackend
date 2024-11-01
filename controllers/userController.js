const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { generateToken } = require('../utils')
const parser = require('ua-parser-js')

//=======================Register User=====================================
const registerUser = asyncHandler(async (req, res) => {
  //Lấy các thông tin cần thiết từ body của request. Đây là các thông tin được người dùng cung cấp khi đăng ký.
  const { name, email, password } = req.body

  //Validation
  if (!name || !email || !password) {
    //Kiểm tra xem tất cả các trường name, email, và password có được cung cấp hay không. Nếu thiếu trường nào, trả về lỗi 400.
    res.status(400)
    throw new Error('Please fill in all the required fields ')
  }

  if (password.length < 6) {
    //Kiểm tra độ dài của mật khẩu phải ít nhất là 6 ký tự.
    res.status(400)
    throw new Error('Password mush be up to 6 characters')
  }

  //CHeck if user exists - Tìm kiếm người dùng với email đã cung cấp. Nếu người dùng đã tồn tại, trả về lỗi 400.
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('Email already in use')
  }

  //Get UserAgent
  const ua = parser(req.headers['user-agent'])
  // console.log(ua)
  const userAgent = [ua.ua]

  //Create new user
  const user = await User.create({
    name,
    email,
    password,
    userAgent,
  })

  //Generate Token - Gọi hàm generateToken để tạo token xác thực cho người dùng mới.
  const token = generateToken(user._id)

  //Send HTTP  - only cookie --> Gửi cookie HTTP-only chứa token đến client. Cookie này sẽ được bảo vệ và không thể truy cập bởi JavaScript phía client.
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //1 day
    sameSite: 'none',
    secure: true,
  })

  if (user) {
    const { _id, name, email, phone, bio, photo, role, isVerified } = user
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      token,
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

//=======================Login User=====================================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  //Validation
  if (!email || !password) {
    //Kiểm tra xem tất cả các trường  email, và password có được cung cấp hay không. Nếu thiếu trường nào, trả về lỗi 400.
    res.status(400)
    throw new Error('Please add email or password ')
  }

  const user = await User.findOne({ email })
  if (!user) {
    res.status(400)
    throw new Error('User not found. Please Signup!')
  }

  const passwordIsConrrect = await bcrypt.compare(password, user.password)
  if (!passwordIsConrrect) {
    res.status(400)
    throw new Error('Invalid email or password')
  }

  //Generate Token - Gọi hàm generateToken để tạo token xác thực cho người dùng mới.
  const token = generateToken(user._id)

  if (user && passwordIsConrrect) {
    //Send HTTP  - only cookie
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), //1 day
      sameSite: 'none',
      secure: true,
    })

    const { _id, name, email, phone, bio, photo, role, isVerified } = user
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
      token,
    })
  } else {
    res.status(500)
    throw new Error('Something went wrong, please try again!')
  }
})

//=======================Logout User=====================================
const logoutUser = asyncHandler(async (req, res) => {
  // res.send('Logout')
  //Send HTTP  - only cookie
  res.cookie('token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: true,
  })
  return res.status(200).json({ message: 'Logout successfull' })
})

//=======================Get User=====================================
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    const { _id, name, email, phone, bio, photo, role, isVerified } = user
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      bio,
      photo,
      role,
      isVerified,
    })
  } else {
    res.status(404)
    throw new Error('User not found...')
  }
})

//=======================Update User=====================================
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    const { name, email, phone, bio, photo, role, isVerified } = user

    user.email = req.body.email || email
    user.name = req.body.name || name
    user.phone = req.body.phone || phone
    user.bio = req.body.bio || bio
    user.photo = req.body.photo || photo

    const updatedUser = await user.save()

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      photo: updatedUser.photo,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    })
  } else {
    res.status(404)
    throw new Error('User not found...')
  }
})

//=======================Delete User=====================================
const deleteUser = asyncHandler(async (req, res) => {
  const user = User.findById(req.params.id) //Khi bạn gọi User.findById(req.params.id), nó trả về một tài liệu MongoDB.
  // Có thể dùng trực tiếp : const user = await User.findByIdAndDelete(req.params.id)
  if(!user){
    res.status(404)
    throw new Error('User not found...')
  }
  // await user.remove() --> Giá trị của user được gán trả về 1 tài liệu MongoDB. Ta dùng remove() để thực hiện xóa tài liệu. Tuy nhiên nó đã bị loại bỏ trong phiên bản mới
  await User.deleteOne({ _id: req.params.id }) // Vì deleteOne() là phương thức của mô hình (model method) nên ta phải dùng User
  res.status(200).json({
    message:'User deleted successfully'
  })
})

//=======================Get Users=====================================
const getUsers = asyncHandler(async (req,res) => {
  // res.send('Get User')
  const users = await User.find().sort('-createdAt').select('-password')
  if(!users){
    res.status(500)
    throw new Error('Something went wrong...')
  }
  res.status(200).json(users)
})


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers
}
