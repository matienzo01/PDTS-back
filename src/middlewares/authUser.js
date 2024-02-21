const jwt = require('jsonwebtoken')

const authUser = (req, res, next) => {
    const authorization = req.get('Authorization')
    let token = null

    if (authorization && authorization.toLowerCase().startsWith('bearer')) {
        token = authorization.substring(7)
    }

    try {
        const decodedToken = jwt.verify(token,process.env.SECRET)
        if (!token || !decodedToken.id) {
            res.status(401).json({ error: 'Token missing or invalid'})
        }
    
        req.body.id = decodedToken.id
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token missing or invalid'})
    }
  };
  
module.exports = authUser;