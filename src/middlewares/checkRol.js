
function checkRol(roles) {
    return function(req, res, next) {
        //console.log(`roles aceptados: ${roles}`)
        //console.log(`rol del solicitante: ${req.body.rol}`)
        if (roles.some(rol => rol === req.body.rol)) {
            next();
        } else {
            res.status(403).json({ error: 'You do not have the necessary permissions to perform this action.'})
        }
    }
}

module.exports = checkRol;