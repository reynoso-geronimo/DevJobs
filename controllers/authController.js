const passport = require('passport')

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

exports.mostrarPanel=(req,res,next)=>{
    res.render('administracion',{
        nombrePagina: 'Panel de Administracion',
        tagline:'Crea y administra tus vacantes desde aqui'
    })
}