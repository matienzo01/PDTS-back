
function checkRol(roles) {
    return function(req, res, next) {
        if (roles.some(rol => rol === req.rol)) {
            res.status(403).json({ error: 'You do not have the necessary permissions to perform this action.'})
        } else {
            next();
        }
    }
}

module.exports = checkRol;