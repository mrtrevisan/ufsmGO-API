import { NextFunction, Request, Response } from 'express';
import {connect} from '../db/dbConnect.js';

export const ensureNameNotUsed = async (req, res, next) => {
    const client = await connect();
    const {nome} = req.body

    const query = "SELECT * FROM player WHERE nome like '" + nome + "'";
    const { rows } = await client.query(query);

    if (rows.length > 0) {
        client.release();  
        return res.status(400).json('Não foi possível criar o usuário: Nome já em uso');
    } else {
        client.release();
        return next();
    }
}