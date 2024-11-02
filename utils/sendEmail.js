const nodemailer = require('nodemailer')                  
const path = require('path')

// Hàm dynamic import cho `nodemailer-express-handlebars`
async function loadHBS() {
  const { default: hbs } = await import('nodemailer-express-handlebars')
  return hbs
}


const sendEmail = async (subject, send_to, send_from, reply_to, template, name, link) => {

  const hbs = await loadHBS();

  //Create Email Transporter
  const transporter = nodemailer.createTransport({
    service:'gmail', //nếu sử dụng gmail thì thêm vào, outlook thì không cần
    host: process.env.EMAIL_HOST,
    port: 587,
    auth:{
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_PASS
    },
    tls:{
      rejectUnauthorized: false
    }
  })

  const handleBarOption = {
    viewEngine:{
      extName: '.handlebars',
      partialsDir:  path.resolve('./views'),
      defaultLayout: false
    },
    viewPath:path.resolve('./views'),
    extName: '.handlebars'
  }

  transporter.use('compile', hbs(handleBarOption))

  //Option for sending email
  const options = {
    from: send_from,
    to: send_to,
    replyTo: reply_to,
    subject,
    template,
    context:{
      name,
      link
    }
  }

  //Send Email
  transporter.sendMail(options, function(err,info){
    if(err){
      console.log(err)
    }
    else{
      console.log(info)
    }
  })
}

module.exports = sendEmail
