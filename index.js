
const express = require("express")
const {Routes} = require("./router/router")
const {connection}=  require("./config/db")

const app = express()

app.use(express.json())

app.get("/",(req,res)=>{

    res.sendFile(__dirname + "/index.html")

})


app.use("/users",Routes)


app.listen(process.env.PORT, async () => {
    try {
        await connection
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log(error)
    }
    console.log(`server is running at  ${process.env.PORT}`)
})