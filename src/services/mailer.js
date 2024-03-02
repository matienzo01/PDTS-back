const { send } = require('express/lib/response');
const nodemailer = require('nodemailer')
const enlace = 'http://localhost:3001/login'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

const sendNewUser = async(user, oldpass) => {
    const subject = '¡Bienvenido a SEva-PDTS! Tu cuenta ha sido creada con éxito.'
    const text = `Estimado ${user.nombre} ${user.apellido},

¡Nos complace darte la bienvenida a SEva-PDTS! Te informamos que tu cuenta ha sido creada con éxito.
    
A continuación, encontrarás algunos detalles importantes sobre tu nueva cuenta:
    
Correo electrónico asociado: ${user.email}
Contraseña provisional: ${oldpass}
    
Te recordamos que tu seguridad es nuestra prioridad. Por favor, asegúrate de mantener tus credenciales de inicio de sesión de forma segura y no compartirlas con terceros. Recomendamos encarecidamente que actualices tu contraseña en tu primera sesión por razones de seguridad. Puedes hacerlo accediendo a la sección de configuración de tu cuenta una vez que inicies sesión. Podrás hacerlo desde ${enlace}`
    sendMail(user.email, subject, text)
}

const sendNewEval = async(user, proyecto) => {
    const subject = 'Evaluación de proyectos'
    const text = `Estimado ${user.nombre} ${user.apellido},

Ha sido seleccionado para llevar adelante la evaluacion del proyecto ${proyecto.nombre}.`
    sendMail(user.email, subject, text)
}

const linkUser = async (user) => {
    const subject = 'Vinculación a Insitutción de Ciencia y Tecnología'
    const text = `Estimado ${user.nombre} ${user.apellido},

Ha sido vinculado a una institucion`
    sendMail(user.email, subject, text)
}

const notifyReviewer = async(titulo, user) => {
    const subject = 'Asignacion a la evaluacion de un proyecto'
    const text = `Estimado ${user.nombre} ${user.apellido},

Ha sido asignado para realizar la evaluacion del proyecto ${titulo}`
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
    notifyReviewer
};