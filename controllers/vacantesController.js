const { body, validationResult } = require("express-validator")
const mongoose  = require("mongoose")
const Vacante = mongoose.model('Vacante')

exports.formularioNuevaVacante=(req,res)=>{
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'LLena el formulario y publica tu vacante',
        cerrarSesion:true,
        nombre:req.user.nombre
    })

}

exports.agregarVacante= async(req,res)=>{

    const vacante = new Vacante(req.body)
    //usuario autor de la vacante
    vacante.autor = req.user._id;
    //crear arreglo de habilidades

    vacante.skills= req.body.skills.split(',')
    console.log(vacante)
    const nuevaVacante = await vacante.save()

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)
}

exports.mostrarVacante= async(req,res,next)=>{
    const vacante=await Vacante.findOne({url:req.params.url}).lean()
    console.log(vacante)
    if(!vacante)return next()
    res.render('vacante',{
        vacante,
        nombrePagina : vacante.titulo,
        barra:true
    })
}

exports.formEditarVacante= async(req,res,next)=>{
    const vacante=await Vacante.findOne({url:req.params.url}).lean()
    console.log(vacante)
    if(!vacante)return next()
    res.render('editar-vacante',{
        vacante,
        nombrePagina : `Editar - ${vacante.titulo}`,
        cerrarSesion:true,
        nombre:req.user.nombre
        
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