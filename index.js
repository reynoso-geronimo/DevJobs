const mongoose=require('mongoose')
require('./config/db')

const express = require('express')
const exphbs= require('express-handlebars')
const router = require ('./routes')
const path= require ('path')
const cookieParser= require ('cookie-parser')
const session=  require('express-session')
const MongoStore = require ('connect-mongo')
require('dotenv').config({path:'variables.env'})
const flash = require ('connect-flash')

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))





console.log(`iniciando...`)
//habilitar handlebars como view
app.engine('handlebars',
exphbs({
    defaultLayout:'layout',
    helpers: require('./helpers/handlebars')
})
)
app.set('view engine', 'handlebars')
//static files

app.use(express.static(path.join(__dirname,'public')))

app.use(cookieParser())

app.use(session({
    secret:process.env.SECRETO,
    key:process.env.KEY,
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({
        mongoUrl:process.env.DATABASE
    })
}))

//alertas y flash messages

app.use(flash())

//crear nuestro middleware
app.use((req,res,next)=>{
    res.locals.mensajes =  req.flash()
    next()
})

app.use('/',router())


app.listen(process.env.PUERTO)

console.log(`Funcionando en port ${process.env.PUERTO}`)