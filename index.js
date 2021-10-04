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
const createError = require('http-errors')
const passport= require('./config/passport')

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))





console.log(`iniciando...`)
//habilitar handlebars como view engine
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
//inicializar passport 
app.use(passport.initialize())
app.use(passport.session())

//alertas y flash messages

app.use(flash())

//crear nuestro middleware
app.use((req,res,next)=>{
    res.locals.mensajes =  req.flash()
    next()
})

app.use('/',router())

//404 pagina no existente
app.use((req,res,next)=>{
    next(createError(404, 'No encontrado'))
})
//administracion de los errores
app.use( (error,req, res,/*!!!!*/next/*!!!*/) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
 });
 //dejar que herokku asigne el puerto


const PORT = process.env.PORT || 5000;
 
app.listen(PORT,()=>{
    console.log(`iniciando`)
})

console.log(`Funcionando en port ${PORT}`)