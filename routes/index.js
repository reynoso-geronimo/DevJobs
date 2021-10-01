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
  router.post("/vacantes/nueva",authController.verificarUsuario,  vacantesController.agregarVacante);

  //mostrar vacante
  router.get("/vacantes/:url", vacantesController.mostrarVacante);

  router.get("/vacantes/editar/:url",authController.verificarUsuario,  vacantesController.formEditarVacante);
  router.post("/vacantes/editar/:url",authController.verificarUsuario,  vacantesController.editarVacante);

  router.get("/crear-cuenta", usuariosController.formCrearCuenta);
  router.post(
    "/crear-cuenta",
    usuariosController.validarResgistro,
    usuariosController.crearUsuario
  );
  //autenticar usuario
  router.get("/iniciar-sesion", usuariosController.formIniciarSesion);
  router.post("/iniciar-sesion", authController.autenticarUsuario);
  //panel de administracinh
  router.get("/administracion", authController.verificarUsuario, authController.mostrarPanel);

  return router;
};
