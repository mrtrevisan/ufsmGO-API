import { connect } from '../db/dbConnect.mjs'
import { ensureUserExists } from '../middlewares/ensureUserExists.ts';

import { Router } from 'express';

const authController = Router();

//authenticate user
authController.post('/login', ensureUserExists, async (req, res) => {
    const client = await connect();
    const {nome, senha} = req.body

    const query = "SELECT * FROM player WHERE nome like '" + nome + "'";
    const { rows } = await client.query(query);
    
    // verifica se a senha está correta
    const passwordMatch = (senha === rows[0].senha);

    if (!passwordMatch) {
        res.status(401).json({
            status: 'error',
            message: 'Password incorrect',
        })
    } else {
        res.status(200).json('User logged in');
    }
})

export {authController};