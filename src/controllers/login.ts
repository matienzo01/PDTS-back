import { Request, Response, NextFunction  } from 'express';
import service from '../services/login';

const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'email o contraseña faltantes'})
    }

    try {
        res.status(200).json(await service.login(email, password))
    } catch (error) {
        next(error)
    }
}

export default {
    login
};