const passport = require('passport')
const mongoose=require('mongoose')
const Vacante = mongoose.model('Vacante')
const Usuario =  mongoose.model('Usuario')
const crypto = require('crypto')
const enviarEmail=  require('../handlers/email')

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
        nombre:req.user.nombre,
        imagen: req.user.imagen
    })
}
exports.cerrarSesion=(req,res)=>{
    req.logout();
    req.flash('correcto', 'Cerraste Sesion Correctamente')
    return res.redirect('/iniciar-sesion')
}
exports.formReestablecerPassword=(req,res)=>{
    res.render('reestablecer-password',{
        nombrePagina:'Reestablece tu password',
        tagline:'Si ya tienes una cuenta pero olvidaste tu Password coloca tu Email'
    })
}

exports.enviarToken=async(req,res)=>{
    const usuario= await Usuario.findOne({email:req.body.email})
    if(!usuario){
        req.flash('error','Usuario no Encontrado')
        return res.redirect('/iniciar-sesion')
    }
    usuario.token= crypto.randomBytes(20).toString('hex');
    usuario.expira= Date.now() + 3600000

    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`

    console.log(resetUrl)

    // enviar notificacion por email

    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    })

    //correcto
    req.flash('correcto','revisa tu email para las indicaciones')
    res.redirect('/iniciar-sesion')
}
//valida si el token es valido y el usuario existe

exports.reestablecerPassword=async(req,res)=>{
   
    const usuario = await Usuario.findOne({
        token:req.params.token,
        expira:{
            $gt : Date.now()
        }
    })
    if(!usuario){
        req.flash('error', 'El formulario ya no es valido intenta de nuevo')
        return res.redirect('/reestablecer-password');
    }
    //correcto, mostrar el formulario
    res.render('nuevo-password',{
        nombrePagina:'nuevo password',
    })
}
exports.guardarPassword=async(req,res)=>{
    const usuario = await Usuario.findOne({
        token:req.params.token,
        expira:{
            $gt : Date.now()
        }
    })
    if(!usuario){
        req.flash('error', 'El formulario ya no es valido intenta de nuevo')
        return res.redirect('/reestablecer-password');
    }
    usuario.password = req.body.password;
    usuario.token= undefined;
    usuario.expira= undefined;

    await usuario.save()
        req.flash('correcto','Password modificado correctamente')
        return res.redirect('/iniciar-sesion')
}