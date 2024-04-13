const nodemailer = require('nodemailer')
const enlace = 'http://localhost:3001/login'
import knex from '../database/knex';
import { CustomError } from '../types/CustomError';
import { Evaluador } from '../types/Evaluador';
import { InstitucionCyT } from '../types/InstitucionCyT';
import { Proyecto } from '../types/Proyecto';

const transporter = nodemailer.createTransport({
    service: 'gmail',
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

const sendNewUser = async(user: Evaluador, oldpass: string) => {
    const subject = '¡Bienvenido/a a SEva-PDTS! Tu cuenta ha sido creada con éxito.'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

¡Nos complace darte la bienvenida a SEva-PDTS! Te informamos que tu cuenta ha sido creada con éxito.
    
A continuación, encontrarás algunos detalles importantes sobre tu nueva cuenta:
    
Correo electrónico asociado: ${user.email}
Contraseña provisional: ${oldpass}
    
Te recordamos que tu seguridad es nuestra prioridad. Por favor, asegúrate de mantener tus credenciales de inicio de sesión de forma segura y no compartirlas con terceros. Recomendamos encarecidamente que actualices tu contraseña en tu primera sesión por razones de seguridad. Puedes hacerlo accediendo a la sección de configuración de tu cuenta una vez que inicies sesión. Podrás hacerlo desde ${enlace}


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}

const sendNewEval = async(user: Evaluador, titulo: string) => {
    const subject = 'Evaluación de proyectos'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

Ha sido seleccionado para llevar adelante la evaluacion del proyecto ${titulo}.


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}

const linkUser = async (user: Evaluador, inst: InstitucionCyT) => {
    const subject = 'Vinculación a Insitutción de Ciencia y Tecnología'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

Ha sido vinculado a una institución (${inst.nombre}) de modo tal de poder ser elegido para llevar adelante la evaluación de PDTS


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}

const notifyReviewer = async(titulo: string, user: Evaluador) => {
    const subject = 'Asignacion a la evaluacion de un proyecto'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

Ha sido escogido para realizar la evaluacion del proyecto ${titulo}.

Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
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
        throw error
    }
    
}


export default{
    sendMail,
    sendNewUser,
    sendNewEval,
    linkUser,
    notifyReviewer,
    checkEmail
};