const { send } = require('express/lib/response');
const nodemailer = require('nodemailer')

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
    
Te recordamos que tu seguridad es nuestra prioridad. Por favor, asegúrate de mantener tus credenciales de inicio de sesión de forma segura y no compartirlas con terceros. Recomendamos encarecidamente que actualices tu contraseña en tu primera sesión por razones de seguridad. Puedes hacerlo accediendo a la sección de configuración de tu cuenta una vez que inicies sesión.`
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
    sendNewUser
};