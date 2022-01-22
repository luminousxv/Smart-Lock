const express = require("express");
const router = express.Router();
const connection = require("../database/dbconnection");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const session = require("express-session");
const FileStore = require('session-file-store') (session);
var bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const app = express();

//Email Configuration
const smtpTransport = nodemailer.createTransport({
    service : "gmail",
    port: 465,
    secure: true,
    auth : {
        user: "gmail_id",
        pass: "gmail_pw"
    }
});

//Session Configuration
router.use(session ({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    stroe: new FileStore()
}));

// Join API

router.post('/user/email-verification', function (req, res) {
    var userEmail = req.body.userEmail;
    var userPwd = req.body.userPwd;
    var userName = req.body.userName;
    var userBirth = req.body.userBirth;

    var resultCode;
    var message;

    //Repetition Check SQL Query
    var sql2 = 'SELECT * FROM Users WHERE UserEmail = ?';

    connection.query(sql2, userEmail, function(err, result){
        if(err) {
            resultCode = 404;
            message = '에러가 발생했습니다.';
            console.log(err);
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
        }

        //Form Check
        else if(formSearch(userPwd, userName, userEmail, userBirth)) {
            resultCode = 400;
            message = '이메일/이름/비밀번호의 양식이 틀렸습니다. 다시 입력해주세요!';
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
        }

        //Sending Verification Email
        else if(result.length === 0) {
            //Encryption: using salt as a key to encrypt the password
            const salt = crypto.randomBytes(32).toString('base64');
            const hashedPw = crypto.pbkdf2Sync(userPwd, salt, 1, 32, 'sha512').toString('base64');

            //Verification Number
            let authNum = Math.random().toString().substr(2, 6);
            
            //Define 'user' session
            req.session.user = {
                Email: userEmail,
                Password: hashedPw,
                Name: userName,
                Birthday: userBirth,
                Salt: salt,
                Auth: authNum
            };

            //Email
            const mailOptions = {
                from: "Smart_Key_KPU <noreply.drgvyhn@gmail.com>",
                to: req.session.user.Email,
                subject: "Smart Key 회원가입 인증 번호 메일입니다.",
                text: "인증번호는 " + authNum + " 입니다."
            };

            //Send Email
            smtpTransport.sendMail(mailOptions, (err, res) => {
                if(err) {
                    console.log(err);
                } else{
                    console.log('success');
                }
            })

            resultCode = 200;
            message = req.session.user.Email + ' 로 인증 이메일을 보냈습니다. 확인해주세요!';
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
        } 

        //Account Exists
        else if (userEmail === result[0].UserEmail) {
            resultCode = 400;
            message = '존재하는 회원입니다.';
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
        }
    });
});

//After verification
router.post('/user/join_success', function (req, res) {
    var inputAuth = req.body.inputAuth;

    //compare with input and session's verification number
    if (inputAuth !== req.session.user.Auth) {
        var resultCode = 400;
        var message = '인증번호가 틀렸습니다. 재인증 부탁드립니다.';
        
        res.status(resultCode).json({
            'code': resultCode,
            'message': message
        });
        req.session.destroy(function(err){
            if (err) throw err;
        });
    } else{
        //DB Write Query
        var sql = 'INSERT INTO Users (UserEmail, UserPwd, UserName, UserBirth, Salt) VALUES(?, ?, ?, ?, ?)';
        var params = [req.session.user.Email, req.session.user.Password, req.session.user.Name, req.session.user.Birthday, req.session.user.Salt];
        
        connection.query(sql, params, function(err2, result2) {
            if (err2) {
                console.log(err);
                var resultCode = 404;
                var message = '에러가 발생했습니다.';
            } else{
                resultCode = 200;
                message = '회원가입에 성공했습니다.';
            }
            res.status(resultCode).json({
                'code': resultCode,
                'message': message
            });
            //delete session
            req.session.destroy(function(err){
                if (err) throw err;
            });
        });
    }
})

//Form Checking function
function formSearch(pw, name, email, birth) {
    if (pw.length < 8 || email.length < 8 || name.length < 2|| birth.length !== 10) {
        return true;
    } else {
        return false;
    }
}

app.use('/', router);
module.exports = router;