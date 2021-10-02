const mongoose  = require("mongoose")
const Usuario = mongoose.model('Usuario')
const { body, validationResult } = require('express-validator');
const multer = require("multer");
const shortid= require('shortid')

exports.subirImagen=(req,res,next)=>{
    upload(req,res,function(error){
        if(error){
           
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande: Maximo 100kb')
                }else{
                    req.flash('error', error.message)
                }
            }else{
                req.flash('error', error.message)
            }
            res.redirect('/administracion')
            return
        }else{
            return next()
        }
        
    })
 

}
//opciones de multer
const configuracionMulter={
    limits:{ fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,cb)=>{
            cb(null, __dirname+"../../public/uploads/perfiles")
        },
        filename: (req,file,cb)=>{
            //cb(null, file)
            const extension = file.mimetype.split('/')[1]
            cb(null,`${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req,file,cb){
        if(file.mimetype==='image/jpeg'|| file.mimetype==='image/png'){
            //el callback se ejecuta como true o flase : true cuando la imagen se acepta
            cb(null,true)
        }else{
            cb(new Error('Formato no Valido'),false)
        }
    },
    
}
const upload =multer(configuracionMulter).single('imagen');




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
        //console.log(error)
        req.flash('error', error)
       
        res.redirect('/crear-cuenta')
    }

   
}
exports.formIniciarSesion=(req,res,next)=>{
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar-Sesion devJobs',
        
    })
}
exports.formEditarPerfil=(req,res)=>{
    res.render('editar-perfil',{
        nombrePagina:'Edita tu Perfil en devJobs',
        usuario: req.user.toObject(),
        cerrarSesion:true,
        nombre:req.user.nombre,
        imagen:req.user.imagen
    })
}
//guardar cambios en el perfil

exports.editarPerfil=async(req,res,next)=>{
    const usuario = await Usuario.findById(req.user._id)
    //console.log(usuario)
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){
        usuario.password = req.body.password;
    }
        
    if(req.file){
        usuario.imagen = req.file.filename;
    }
    await usuario.save();
    req.flash('correcto', 'Cambios Guardados correctamente')
    //redirect
    res.redirect('/administracion')
}
//sanitizar y validar el formulario de editar usuario

exports.validarPerfil=async(req,res,next)=>{
    rules=[
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        body('password').escape(),
      
    ]
    
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('editar-perfil', {
            nombrePagina:'Edita tu Perfil en devJobs',
            usuario: req.user.toObject(),
            cerrarSesion:true,
            nombre:req.user.nombre,
            imagen:req.user.imagen,
            mensajes: req.flash()
        })
        return;
    }
    next();
}