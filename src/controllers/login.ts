import { Request, Response } from 'express';
import service from '../services/login';
import { CustomError } from '../types/CustomError';

const login = async (req: Request, res: Response) => {
    const { mail, password } = req.body

    if (!mail || !password) {
        return res.status(400).json({ error: 'mail or passord missing'})
    }

    try {
        res.status(200).json(await service.login(mail, password))
    } catch (error) {
        const statusCode = (error as CustomError).status || 500
        res.status(statusCode).json({ error: (error as CustomError).message })
    }
}

export default {
    login
};