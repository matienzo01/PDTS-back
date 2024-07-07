import { Request, Response, NextFunction } from 'express';

function checkRol(roles: string[]) {
    return function(req: Request, res: Response, next: NextFunction) {
        // @ts-ignore
        if (roles.some(rol => rol === req.body.userData.rol)) {
            next();
        } else {
            res.status(403).json({ error: 'You do not have the necessary permissions to perform this action.'})
        }
    }
}

export default checkRol