const nodemailer = require('nodemailer')
const enlace = 'https://seva-pdts.ar/'
import knex from '../database/knex';
import { CustomError } from '../types/CustomError';
import { Evaluador } from '../types/Evaluador';
import { InstitucionCyT } from '../types/InstitucionCyT';

const marcoDoctoral = `En el marco de su trabajo de tesis doctoral, el Ing. Roberto Giordano Lerena (bajo la dirección del Dr. Armando Fernández Guillermet) ha diseñado un Sistema de Evaluación Ex Post de PDTS basado en dos instancias (Entidad y Propósito) y una serie de dimensiones (Aspectos generales a considerar en una evaluación ex post de PDTS) e indicadores (Propiedades o condiciones para evaluar una dimensión en el proceso de evaluación ex post de PDTS).

A efectos de su validación, se ha desarrollado el sistema informático SEva-PDTS.Ar, que permite a las instituciones de C&T que tengan PDTS terminados, registrarlos y someterlos a la evaluación por parte del propio director del PDTS y otros evaluadores convocados al efecto (en representación de la demanda, del adoptante y externos al proyecto). 

El sistema propuesto permite disponer de un instrumento homogéneo de evaluación ex post de PDTS, que aporta transparencia y equitatividad, pretendiendo ser una contribución al fortalecimiento del instrumento PDTS.`

const seguridad = `Le recordamos que su seguridad es nuestra prioridad. Por favor, asegúrese de mantener sus credenciales de inicio de sesión de forma segura y no compartirlas con terceros. Recomendamos encarecidamente que actualice su contraseña en la primera sesión por razones de seguridad. Puede hacerlo accediendo a la sección de configuración de su cuenta una vez que inicie sesión. Podrá hacerlo desde ${enlace}`

const transporter = nodemailer.createTransport({
    host: 'vps-4116920-x.dattaweb.com',
    port: 465, 
    secure: true, 
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

const checkEmail = async(email: string, trx: any = null) => {
    const querybuilder = trx || knex
    const tables = ['evaluadores', 'admins_cyt', 'admin']
    for (let i = 0; i < 3; i++ ){
      const user = await querybuilder(tables[i]).select().where({email})
      if( user.length > 0){
        throw new CustomError('The email entered is already registered in the system', 409)
      }
    }
}

const sendNewUser = async(user: Evaluador) => {
    const subject = '¡Bienvenido/a a SEva-PDTS! Su cuenta ha sido creada con éxito.'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

¡Nos complace darle la bienvenida a SEva-PDTS! Le informamos que su cuenta de usuario ha sido creada con éxito. 

${marcoDoctoral}

Usted podrá acceder al sistema usando el correo electrónico asociado a su usario (${user.email}) y su DNI como contraseña.
    
${seguridad}


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}

const linkUser = async (user: Evaluador, inst: InstitucionCyT) => {
    const subject = 'Vinculación a Institutción de Ciencia y Tecnología'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

¡Nos complace darle la bienvenida a SEva-PDTS! 
Le informamos que su cuenta de usuario ha sido creada con éxito, vinculado a la institución (${inst.nombre}) como usuario habilitado para llevar adelante la evaluación de PDTS con SEva-PDTS.Ar.

${marcoDoctoral}

Usted podrá acceder al sistema usando el correo electrónico asociado a su usario (${user.email}) y su DNI como contraseña.

${seguridad}


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}

const notifyReviewer = async(proyecto: any, user: Evaluador, inst: any) => {
    const subject = 'Asignación a la evaluacion de un proyecto'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

¡Nos complace darle la bienvenida a SEva-PDTS! 
Le informamos que ha sido convocado para realizar la evaluación del proyecto: "${proyecto}" perteneciente a la institución: "${inst.nombre}". Si usted no es quien dirige el proyecto, deberá esperar a que esté complete su evaluación.

${marcoDoctoral}

Usted podrá acceder al sistema usando el correo electrónico asociado a su usario (${user.email}) y su DNI como contraseña.

${seguridad}


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}

const ReadyToEvaluate = async(proyecto: any, user: Evaluador, inst: any) => {
    const subject = 'Evaluacion lista para completar'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

Ya se encuentra disponible el formulario de evaluación del proyecto: "${proyecto}" perteneciente a la institución: "${inst.nombre}". Podrá completarlo desde ${enlace}


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}


async function sendNewInst(newAdmin: any, newInst: any) {
    const subject = 'Registro de Institución'
    const text = `Estimado/a ${newAdmin.nombre} ${newAdmin.apellido},

¡Nos complace darle la bienvenida a SEva-PDTS! 
Le informamos que su cuenta de usuario ha sido creada con éxito como administrador de la institución: "${newInst.nombre}" ha sido creada con éxito. 

${marcoDoctoral}

Usted podrá acceder al sistema usando el correo electrónico asociado a su usuario (${newAdmin.email}) y su DNI como contraseña.

${seguridad}


Equipo de SEva-PDTS.`
    sendMail(newAdmin.email, subject, text)
}

async function finalizacionEval (admin: any, proyecto: any, user: any) {
    const {usuario} = user
    const subject = 'Evaluación de usuario'
    const text = `Estimado/a ${admin.nombre} ${admin.apellido},

Ya se encuentra disponible para su visualización la evaluación del usuario ${usuario.nombre} ${usuario.apellido} (DNI: ${usuario.dni}) sobre el proyecto: ${proyecto.titulo}.
    

Equipo de SEva-PDTS.`
    sendMail(admin.email, subject, text)
}

async function sendMail(to: string, subject: string, text: string) {
    let mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        text: text
    };

    try {
        transporter.sendMail(mailOptions)
    } catch(error) {
        throw error;
    }
    
}

export default{
    checkEmail,
    sendNewUser,
    linkUser,
    notifyReviewer,
    sendNewInst,
    finalizacionEval,
    ReadyToEvaluate
};