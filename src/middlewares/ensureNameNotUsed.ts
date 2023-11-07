import { NextFunction, Request, Response } from 'express';
import {connect} from '../db/dbConnect.mjs';

export const ensureNameNotUsed = async (req : Request, res : Response, next : NextFunction) => {
    const client = await connect();
    const {nome} = req.body

    const query = "SELECT * FROM player WHERE nome like '" + nome + "'";
    const { rows } = await client.query(query);

    if (rows.length > 0) {
        client.release();  
        return res.status(401).json('Não foi possível criar o usuário: Nome já existe');
    } else {
        client.release();
        return next();
    }
}