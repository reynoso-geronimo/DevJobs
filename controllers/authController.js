const passport = require('passport')
const mongoose=require('mongoose')
const Vacante = mongoose.model('Vacante')

exports.autenticarUsuario =  passport.authenticate('local',{
    successRedirect:'/administracion',
    failureRedirect:'/iniciar-sesion',
    failureFlash:true,
    badRequestMessage:'Ambos campos son obligatorios'
})

//revisar si el usuario esta autendicado o no

exports.verificarUsuario= (req,res,next)=>{
    //revisar el usuario
    if(req.isAuthenticated()){
   
        return next()//estan autenticados
    }
    //caso contrario redireccionar
    res.redirect('/iniciar-sesion')
}

exports.mostrarPanel=async (req,res,next)=>{

    //consultar el usuario autenticado
    const vacantes = await Vacante.find({autor:req.user._id}).lean();


    res.render('administracion',{
        nombrePagina: 'Panel de Administracion',
        tagline:'Crea y administra tus vacantes desde aqui',
        vacantes,
        cerrarSesion:true,
        nombre:req.user.nombre
    })
}