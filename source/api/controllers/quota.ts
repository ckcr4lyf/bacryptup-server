import { Request, Response } from 'express';
import { TOTAL_SPACE } from '../../config';
import redis from '../../redis/redis';


export default async (req: Request, res: Response) => {

    const spaceUsed = await redis.get('SPACE_USED');
    console.log(spaceUsed, TOTAL_SPACE);
    return res.status(200).end(spaceUsed);

}