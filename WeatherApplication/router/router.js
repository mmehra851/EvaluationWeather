const bcrypt = require("bcrypt")

const express = require("express")

const jwt = require("jsonwebtoken")
const { userModel } = require("../model/model")
const fs=require("fs")
const Routes = express.Router()
const bodyParser=require("body-parser")
Routes.use(bodyParser.urlencoded({extended:true}))

const {authenticator}=require("../authenticatemiddle/authenticate")

const http=require("http")

Routes.post("/signup", async (req, res) => {
  try {
    const { email, password, name} = req.body

     const AlreadyPresent= await userModel.findOne({email})

     if(AlreadyPresent){
      return  res.send("user is already signed in ")
      
     }
    bcrypt.hash(password, 4, async (err, hash) => {
      if (err) {
        res.send(err.message)
      }

      const user = new userModel({ name, email, password: hash })
       await user.save()
      res.send("User Registered")
      
    })

  } catch (err) {
    res.send(err)
  }
})

Routes.post("/login", async (req, res) => {
  const { email, password } = (req.body)
  try {
    const user = await userModel.find({ email })
  
    if (user) {
      bcrypt.compare(password, user[0].password, (error, result) => {
        if (result) {
          let token = jwt.sign({ userId: user._id }, process.env.SECRETKEY, {expiresIn:"50s"})
          let  refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '5m' });

          res.send({ "msg": "login successfull", "token": token ,"refresh_token":refreshToken})
        } else {
          res.send("Wrong data")
        }
      })
    }else{
      res.send("please signup first")
    }
  } catch (error) {
    res.send(error)
  }
})



Routes.post("/", authenticator,(req,res)=>{
  const visits=req.body.cityName
  const KEY='10bf62c058fee6b74357583b994935d7'
  const url='https://api.openweathermap.org/data/2.5/weather?q='+ visits+ '&appid='+KEY+'&units=metric'
  http.get=(url,(response)=>{
   response.on("data",(data)=>{

     const WeatherData=JSON.parse(data)
     const description=WeatherData.weather[0].description
     const temp=WeatherData.main.temp
     res.write('the weather in' + visits+ "for today is " + description )
     res.write('the temp in' + visits+ "is" + temp +'degree celcius')
    })
  })
   
 })




Routes.get("/logout",(req,res)=>{
  
  const token=req.headers.authorization.split(' ')[1]

  try {
    if(token){
      const file=JSON.parse(
        fs.readFileSync("./blacklisted.json","utf-8")
      
      )
      console.log(file)
      file.push(token)
     fs.writeFileSync("./blacklisted.json",JSON.stringify(file))
     console.log(file)
     res.send("Logout Done")
    }
  } catch (error) {
    res.send(error)
  }
})

module.exports = {
  Routes
}