//Jai Shri Ganesh Ji
//JAI AMBE MAA 
//JAI BHOLENATH JI
//JAI IDANA MAA
//JAI SIYA RAM JI
//JAI HANUMAN JI
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const {MONGOURI} = require('./config/keys');
const PORT = 5000 || process.env.PORT;
 
mongoose.connect(MONGOURI,{useNewUrlParser:true})
mongoose.connection.on("connected",()=>{
    console.log("database connected"); 
})

mongoose.connection.on("error",()=>{
    console.log("database not connected");
})

require('./models/user');
require('./models/post');

app.use(express.json());
app.use(require('./routes/auth'))
app.use(require('./routes/post'))  
app.use(require('./routes/user')) 


// if(process.env.NODE_ENV=="production")
// {
//     app.use(express.static('build'))
//     const path = require('path')
    
//     app.get("*",(req,res)=>{
//         res.sendFile(path.resolve(__dirname,'build','index.html'))
//     })
// }

app.listen(PORT,()=>{
    console.log(`App is listening on ${PORT}`);
})


//OR we can use cors (cross origin resource sharing)
