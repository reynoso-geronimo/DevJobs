import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener("DOMContentLoaded", () => {
  const skills = document.querySelector(".lista-conocimientos");

  //limpiar alertas 
  let alertas = document.querySelector('.alertas')
  if(alertas){
    limpiarAlertas()
  }


  if (skills) {
    skills.addEventListener("click", agregarSkills);
    //unca vez que estamos en editar llamar la funcion
    skillsSeleccionados();

  }

  const vacantesListado = document.querySelector('.panel-administracion');
  if(vacantesListado){
    vacantesListado.addEventListener("click", accionesListado)
  }

});
const skills= new Set()
const agregarSkills = (e) => {
  if (e.target.tagName === 'LI') {
    if(e.target.classList.contains('activo')){
        //quitarlo del set y la clase
        skills.delete(e.target.textContent)
        e.target.classList.remove('activo')

    }else{
        skills.add(e.target.textContent)
        e.target.classList.add('activo')
    }
    
  
  }
  console.log(skills)
  const skillsArray= [...skills]
  document.querySelector('#skills').value = skillsArray
};
const skillsSeleccionados=()=>{
  const seleccionadas=Array.from(document.querySelectorAll('.lista-conocimientos .activo'))

  seleccionadas.forEach(seleccionada=>{
    skills.add(seleccionada.textContent)
  })
  //inyectarlo en el hidden
  const skillsArray= [...skills]
  document.querySelector('#skills').value = skillsArray

}
const limpiarAlertas=()=>{
    const alertas = document.querySelector('.alertas')
    const interval = setInterval(() => {
      if(alertas.children.length>0){
        alertas.removeChild(alertas.children[0])
      }else if(alertas.children.length===0){
        alertas.parentElement.removeChild(alertas)
        clearInterval(interval)
      }
    }, 2000);
}

const accionesListado=e=>{
  e.preventDefault()
  if(e.target.dataset.eliminar){

    //eliminar por axios


    Swal.fire({
      title: 'Estas Seguro?',
      text: "Este cambio no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText:'Cancelar',
      confirmButtonText: 'Si, Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`
        
        axios.delete(url, {params:{url}})
              .then(function(respuesta){
               if(respuesta.status===200){
                Swal.fire(
                  'Eliminado',
                  respuesta.data,
                  'success'
                )
               }
              })
              .catch(()=>{
                Swal.fire({
                  type:'error',
                  title:'Hubo un Error',
                  text:'No se Pudo Eliminar'
                })
              })

        e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
      }
    })
  }else if(e.target.tagName==='A'){
    window.location.href = e.target.href;
  }
}