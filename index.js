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
const bodyParser= require('body-parser')

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

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

app.use('/',router())

app.listen(process.env.PUERTO)

console.log(`Funcionando en port ${process.env.PUERTO}`)