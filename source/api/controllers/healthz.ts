import { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    return res.status(200).end();
}