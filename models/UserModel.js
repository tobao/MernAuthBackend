const mongoose = require("mongoose")

const userSchema =  mongoose.Schema(
  {
    name:{
      type:String,
      required: [true, 'Please add a name'] //Bắt buộc phải có trường này
    },
    email:{
      type:String,
      required: [true, 'Please add an email'],
      unique:true, //Giá trị email phải là duy nhất trong cơ sở dữ liệu.
      trim: true, //Xóa khoảng trắng ở đầu và cuối của chuỗi.
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid emaial",
      ] //Sử dụng biểu thức chính quy (regex) để kiểm tra định dạng email
    },
    password:{
      type:String,
      required: [true, 'Please add a password']
    },
    photo:{
      type:String,
      required: [true, 'Please add a photo'],
      default:'https://raw.githubusercontent.com/zinotrust/auth-app-styles/master/assets/avatarr.png' //Giá trị mặc định là URL ảnh đại diện.
    },
    phone:{
      type:String,
      default:'(+84)'
    },
    bio:{
      type:String,
      default:'bio'
    },
    role:{
      type:String,
      required:true,
      default:'subscriber'
      // subcribber, author, admin (subpended)

    },
    isVerified:{
      type:Boolean,
      default:false
    },
    userAgent:{
      type:Array,
      required:true,
      default:[]
    },
  },
  {
    timestamps:true, //Tự động thêm các trường createdAt và updatedAt vào mỗi document.
    minimize:false //Lưu tất cả các trường, kể cả các trường trống.
  }
)

const User = mongoose.model('User', userSchema) //Tạo một model User từ schema userSchema đã định nghĩa.
module.exports = User //xuất model User để có thể sử dụng ở các file khác trong dự án.