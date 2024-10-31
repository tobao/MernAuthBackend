const asyncHandler = require('express-async-handler') 
const User = require('../models/userModel')           
const jwt = require('jsonwebtoken')

const protect = asyncHandler (async (req,res,next) =>{
  try {
    const token = req.cookies.token|| req.headers.authorization?.split(' ')[1];
    //Token được lấy từ cookie của yêu cầu (request)
    if(!token){
      res.status(401)
      throw new Error('Invalid email or password')
    }

    //Verify token
    const verified = jwt.verify(token,process.env.JWT_SECRET) //jwt.verify để xác thực token với khóa bí mật (JWT_SECRET). Nếu token hợp lệ, nó sẽ trả về đối tượng đã giải mã (decoded object).
    //Get user id from token
    const user = await User.findById(verified.id)
    .select('-password')
      /*Từ đối tượng đã giải mã, lấy ID người dùng và tìm người dùng trong cơ sở dữ liệu bằng User.findById. 
      Đồng thời cũng loại bỏ trường mật khẩu (-password) khỏi kết quả trả về. */

    if(!user){
      res.status(404)
      throw new Error('User not found')
    }
    if(user.role==='suspended'){
      res.status(400)
      throw new Error('User suspended, please contract support')
    }

    req.user = user
    next()
    //Lưu thông tin người dùng vào thuộc tính user của đối tượng req để các middleware và route handler khác có thể truy cập. Sau đó gọi hàm next() để tiếp tục xử lý yêu cầu.
  } catch (error) {
    res.status(401)
    throw new Error('Not Authorized. Please login')
  }
})

module.exports = {
  protect
}