import express from 'express'
const router = express.Router()
import institution_controller from '../controllers/institutionCYT'
import project_controller from '../controllers/project'
import user_controller from '../controllers/user'
import authUser from '../middlewares/authUser'
import checkRol from '../middlewares/checkRol'
import renameFile from '../middlewares/renameFile'

import { uploadInforme } from '../services/Files';
import { getInforme } from '../controllers/uploadFiles';

router
  .get('/', authUser, checkRol(['admin', 'admin general']), institution_controller.getAllInstitucionesCYT)                                          // tested
  .get('/:id_institucion', authUser, checkRol(['evaluador','admin', 'admin general']), institution_controller.getOneInstitucionCYT)                 // tested
  .get('/:id_institucion/proyectos', authUser, checkRol(['admin', 'admin general']), project_controller.getAllInstitutionProjects)                  // tested 
  .get('/:id_institucion/proyectos/:id_proyecto', authUser, checkRol(['evaluador', 'admin', 'admin general']), project_controller.getOneProject)    // tested
  .get('/:id_institucion/proyectos/:id_proyecto/informe', authUser, checkRol(['evaluador', 'admin', 'admin general']), getInforme)
  .get('/:id_institucion/proyectos/:id_proyecto/evaluadores', authUser, checkRol(['admin', 'admin general']), project_controller.getParticipants)   // tested
  .get('/:id_institucion/usuarios', authUser, checkRol(['admin', 'admin general']), user_controller.getAllInstitutionUsers)                         // tested
  .get('/:id_institucion/admins', authUser, checkRol(['admin', 'admin general']), user_controller.getAllInstitutionAdmins)
  .post('/', authUser, checkRol(['admin general']), institution_controller.createInstitucionCYT)                                                    // tested
  .post('/:id_institucion/proyectos', (req, res, next) => {
    uploadInforme.single('file')(req, res, (err) => {
        if (err) {
          return res.status(400).send({ error: err.message });
        }
        next();
    });
  }, authUser, checkRol(['admin']), renameFile.renameFileInforme , project_controller.createProject)                                                // tested
  .post('/:id_institucion/proyectos/:id_proyecto/evaluadores', authUser, checkRol(['admin']), project_controller.assignEvaluador)                   // tested
  .post('/:id_institucion/usuarios', authUser, checkRol(['admin']), user_controller.createUser)                                                     // tested
  .post('/:id_institucion/admins', authUser, checkRol(['admin', 'admin general']), user_controller.createAdmin)
  .post('/:id_institucion/usuarios/vincular_usuario', authUser, checkRol(['admin', 'admin general']), user_controller.linkUserToInstitution)        // tested 

  .put('/:id_institucion/admins/:id_admin', authUser, checkRol(['admin', 'admin general']), user_controller.updateAdminCYT)
  .put('/:id_institucion', authUser, checkRol(['admin', 'admin general']), institution_controller.updateInstitucionCYT)
  .put('/:id_institucion/proyectos/:id_proyecto', authUser, checkRol(['admin', 'admin general']), project_controller.updateProject)

  .delete('/:id_institucion', authUser, checkRol(['admin general']), institution_controller.deleteInstitucionCYT)                                   // tested
  .delete('/:id_institucion/proyectos/:id_proyecto', authUser, checkRol(['admin']), project_controller.deleteProject)                               // tested
  .delete('/:id_institucion/admins/:id_admin', authUser, checkRol(['admin', 'admin general']), user_controller.deleteAdminCyT)
  .delete('/:id_institucion/proyectos/:id_proyecto/evaluadores/:id_evaluador', authUser, checkRol(['admin']), project_controller.unassignEvaluador) // tested

export default router