const { send } = require('express/lib/response');
const nodemailer = require('nodemailer')
const enlace = 'http://localhost:3001/login'
const knex = require('../database/knex')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

const checkEmail = async(email, trx = null) => {
    const querybuilder = trx || knex
    const tables = ['evaluadores', 'admins_cyt', 'admin']
    for (let i = 0; i < 3; i++ ){
      const user = await querybuilder(tables[i]).select().where({email})
      if( user.length > 0){
        const _error = new Error('The email entered is already registered in the system')
        _error.status = 409
        throw _error
      }
    }
}

const sendNewUser = async(user, oldpass) => {
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

const sendNewEval = async(user, proyecto) => {
    const subject = 'Evaluación de proyectos'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

Ha sido seleccionado para llevar adelante la evaluacion del proyecto ${proyecto.nombre}.


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}

const linkUser = async (user, inst) => {
    const subject = 'Vinculación a Insitutción de Ciencia y Tecnología'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

Ha sido vinculado a una institución (${inst.nombre}) de modo tal de poder ser elegido para llevar adelante la evaluación de PDTS


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}

const notifyReviewer = async(titulo, user) => {
    const subject = 'Asignacion a la evaluacion de un proyecto'
    const text = `Estimado/a ${user.nombre} ${user.apellido},

Ha sido escogido para realizar la evaluacion del proyecto ${titulo}.


Equipo de SEva-PDTS.`
    sendMail(user.email, subject, text)
}

async function sendMail(to, subject, text) {
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


module.exports = {
    sendMail,
    sendNewUser,
    sendNewEval,
    linkUser,
    notifyReviewer,
    checkEmail
};