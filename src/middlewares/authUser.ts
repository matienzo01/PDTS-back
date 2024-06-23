import { Request, Response, NextFunction } from 'express';
import { DecodedToken } from '../types/DecodedToken';
import jwt from 'jsonwebtoken';

const authUser = (req: Request, res: Response, next: NextFunction) => {
    const authorization: string | undefined = req.headers.authorization;
    
    if (!authorization || !authorization.toLowerCase().startsWith('bearer')) {
        return res.status(401).json({ error: 'Token missing or invalid' });
    }

    const token = authorization.substring(7);

    if (!process.env.SECRET) {
        return res.status(500).json({ error: 'Internal server error' });
    }

    try {
        const dt: any = jwt.verify(token, process.env.SECRET)
        const decodedToken: DecodedToken = {
            id: dt.id,
            rol: dt.rol,
            email: dt.email,
            iat: dt.iat,
            institutionId: dt.institutionId,
            nombre: dt.nombre,
            apellido: dt.apellido
        };
        req.body.userData = decodedToken; 
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token missing or invalid' });
    }
};

export default authUser;