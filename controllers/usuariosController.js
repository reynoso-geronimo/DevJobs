const mongoose  = require("mongoose")
const Usuario = mongoose.model('Usuario')
const { body, validationResult } = require('express-validator');


exports.formCrearCuenta=(req,res)=>{
    res.render('crear-cuenta',{
        nombrePagina:'Crea tu cuenta en devJobs',
        tagline: 'Comienza a pubicar tus vacantes gratis, solo debes crear una cuenta'

    })
}

exports.validarResgistro=async(req,res,next)=>{
     //sanitizar los campos
       
     rules=[
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        body('password').not().isEmpty().withMessage('El password es obligatorio').escape(),
        body('confirmar').not().isEmpty().withMessage('Confirmar password es obligatorio').escape(),
        body('confirmar').equals(req.body.password).withMessage('Los passwords no son iguales')]
    
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('crear-cuenta', {
            nombrePagina: 'Crea una cuenta en Devjobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash()
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}


exports.crearUsuario=async(req,res,next)=>{
    const usuario = new Usuario(req.body)
    
    try {
        await usuario.save();
         res.redirect('/iniciar-sesion ')
    } catch (error) {
        console.log(error)
        req.flash('error', error)
       
        res.redirect('/crear-cuenta')
    }

   
}
exports.formIniciarSesion=(req,res,next)=>{
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar-Sesion devJobs',
        
    })
}
