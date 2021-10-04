const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const vacantesController = require("../controllers/vacantesController");
const usuariosController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");

module.exports = () => {
  router.get("/", homeController.mostrarTrabajos);

  //crear vacantes
  router.get("/vacantes/nueva",authController.verificarUsuario, vacantesController.formularioNuevaVacante);
  router.post("/vacantes/nueva",authController.verificarUsuario, vacantesController.validarVacante, vacantesController.agregarVacante);

  //mostrar vacante
  router.get("/vacantes/:url", vacantesController.mostrarVacante);

  router.get("/vacantes/editar/:url",authController.verificarUsuario,  vacantesController.formEditarVacante);
  router.post("/vacantes/editar/:url",authController.verificarUsuario, vacantesController.validarVacante,  vacantesController.editarVacante);
  
  router.delete('/vacantes/eliminar/:id', 
      vacantesController.eliminarVacante
  )

  router.get("/crear-cuenta", usuariosController.formCrearCuenta);
  router.post(
    "/crear-cuenta",
    usuariosController.validarResgistro,
    usuariosController.crearUsuario
  );
  //autenticar usuario
  router.get("/iniciar-sesion", usuariosController.formIniciarSesion);
  router.post("/iniciar-sesion", authController.autenticarUsuario);
  //cerrar sesion
  router.get('/cerrar-sesion',authController.verificarUsuario, authController.cerrarSesion)


  router.get('/reestablecer-password', authController.formReestablecerPassword)

  router.post('/reestablecer-password', authController.enviarToken)

  //resetear el password (almacenar en la db)
  router.get('/reestablecer-password/:token', authController.reestablecerPassword)
  router.post('/reestablecer-password/:token',authController.guardarPassword)
  //panel de administracinh
  router.get("/administracion", authController.verificarUsuario, authController.mostrarPanel);
  
  //editar perfil
  router.get("/editar-perfil",authController.verificarUsuario, usuariosController.formEditarPerfil);
  router.post("/editar-perfil",
   authController.verificarUsuario,
   usuariosController.validarPerfil,
   usuariosController.subirImagen,
   usuariosController.editarPerfil)

   //recibidr mensajes de candidatos
   router.post('/vacantes/:url',vacantesController.subirCV, vacantesController.contactar 
     )
  
    router.get("/candidatos/:id", authController.verificarUsuario, vacantesController.mostrarCandidatos)



  return router;
};
