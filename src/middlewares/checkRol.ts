import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/CustomError';

function checkRol(roles: string[]) {
    return function(req: Request, res: Response, next: NextFunction) {
        // @ts-ignore
        if (roles.some(rol => rol === req.body.userData.rol)) {
            next();
        } else {
            next(new CustomError('You do not have the necessary permissions to perform this action.', 403))
        }
    }
}

export default checkRol