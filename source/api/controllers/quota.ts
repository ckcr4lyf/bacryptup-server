import { Request, Response } from 'express';
import { TOTAL_SPACE } from '../../config';
import redis from '../../redis/redis';


export default async (req: Request, res: Response) => {

    let spaceUsed = 0;

    try {
        spaceUsed = parseInt(await redis.get('SPACE_USED'));        
    } catch {
        return res.status(500).json({
            "error": "REDIS_QUERY_FAILED"
        });
    }

    if (isNaN(spaceUsed)){
        spaceUsed = 0;
    }

    return res.status(200).json({
        "used": spaceUsed,
        "total": TOTAL_SPACE
    });

}