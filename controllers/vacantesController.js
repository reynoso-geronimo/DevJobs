const { body, validationResult } = require("express-validator")
const mongoose  = require("mongoose")
const multer = require("multer")
const Vacante = mongoose.model('Vacante')
const shortid = require('shortid')

exports.formularioNuevaVacante=(req,res)=>{
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'LLena el formulario y publica tu vacante',
        cerrarSesion:true,
        nombre:req.user.nombre,
        imagen:req.user.imagen
    })

}

exports.agregarVacante= async(req,res)=>{

    const vacante = new Vacante(req.body)
    //usuario autor de la vacante
    vacante.autor = req.user._id;
    //crear arreglo de habilidades

    vacante.skills= req.body.skills.split(',')
    //console.log(vacante)
    const nuevaVacante = await vacante.save()

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)
}

exports.mostrarVacante= async(req,res,next)=>{
    const vacante=await Vacante.findOne({url:req.params.url}).populate('autor').lean()
    //console.log(vacante)
    if(!vacante)return next()
    res.render('vacante',{
        vacante,
        nombrePagina : vacante.titulo,
        barra:true
    })
}

exports.formEditarVacante= async(req,res,next)=>{
    const vacante=await Vacante.findOne({url:req.params.url}).lean()
    //console.log(vacante)
    if(!vacante)return next()
    res.render('editar-vacante',{
        vacante,
        nombrePagina : `Editar - ${vacante.titulo}`,
        cerrarSesion:true,
        nombre:req.user.nombre,
        imagen:req.user.imagen
        
    })
}
exports.editarVacante=async(req,res,next)=>{
    const vacanteActiaulizada=req.body;
    vacanteActiaulizada.skills= req.body.skills.split(',')
    
    const vacante= await Vacante.findOneAndUpdate({url:req.params.url}, vacanteActiaulizada,{
        new:true,
        runValidators:true
    })
    res.redirect(`/vacantes/${vacante.url}`)
}

//validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante=async(req,res,next)=>{
    //sanitizar los campos
         
    rules=[
    body('titulo').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
    body('empresa').not().isEmpty().withMessage('la Empresa es obligatoria').escape(),
    body('ubicacion').not().isEmpty().withMessage('La Ubicacion es obligatoria').escape(),
    body('contrato').not().isEmpty().withMessage('El Contrato es obligatorio').escape(),
    body('skills').not().isEmpty().withMessage('Agrega al menos una habilidad').escape(),
    body('salario').escape(),
    ]
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'LLena el formulario y publica tu vacante',
            cerrarSesion:true,
            nombre:req.user.nombre,
            mensajes:req.flash()
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}
exports.eliminarVacante=async(req,res,next)=>{
    const {id} = req.params
    
    const vacante = await Vacante.findById(id)
  
    if(verificarAutor(vacante, req.user)){
        vacante.remove();
        res.status(200).send('Vacante Eliminada')
    }else{
        res.status(403).send('Error')
    }

}
const verificarAutor= (vacante={}, usuario={})=>{
    if(!vacante.autor.equals(usuario._id)){
        return false
    }
    return true;
}

exports.subirCV=(req,res,next)=>{
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
            res.redirect('back')
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
            cb(null, __dirname+"../../public/uploads/cv")
        },
        filename: (req,file,cb)=>{
            //cb(null, file)
            const extension = file.mimetype.split('/')[1]
            cb(null,`${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req,file,cb){
        if(file.mimetype==='application/pdf'){
            //el callback se ejecuta como true o flase : true cuando la imagen se acepta
            cb(null,true)
        }else{
            cb(new Error('Formato no Valido'),false)
        }
    },
    
}
const upload =multer(configuracionMulter).single('cv');

//almacenar los candidatos en la base de datos
exports.contactar= async (req,res,next)=>{
    const vacante = await Vacante.findOne({url: req.params.url})
    
    if(!vacante){
        return next ()
    }
    const nuevoCandidato =  {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }
    //almacenar la vacante
    vacante.candidatos.push(nuevoCandidato)
    await vacante.save();

    //mensaje flash y redireccion
    req.flash('correcto', 'Se envio tu CV')
    res.redirect('/');
}

exports.mostrarCandidatos=async(req,res,next)=>{
    
    const vacante = await Vacante.findById(req.params.id).lean()

    if(vacante.autor != req.user.id.toString()){
        res.send('prohibido')
    }else{
        res.render('candidatos',
    {
        nombrePagina: `Candidatos - ${vacante.titulo}`,
        tagline: 'Listado de Postulantes',
        cerrarSesion:true,
        nombre:req.user.nombre,
        imagen:req.user.imagen,
        candidatos:vacante.candidatos,
       
    }
    )
   
    }

    
}
exports.buscarBacantes=async(req,res)=>{
    const vacantes = await Vacante.find({
        $text: {
            $search:req.body.q
        }
    }).lean()
    //mostrar las vacantes
    res.render('home',{
        nombrePagina:`Resultados para la busqueda : ${req.body.q}`,
        barra:true,
        boton:true,
        vacantes
    })
}