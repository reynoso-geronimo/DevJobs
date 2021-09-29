const mongoose  = require("mongoose")
const Vacante = mongoose.model('Vacante')

exports.formularioNuevaVacante=(req,res)=>{
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'LLena el formulario y publica tu vacante'
    })

}

exports.agregarVacante= async(req,res)=>{

    const vacante = new Vacante(req.body)

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