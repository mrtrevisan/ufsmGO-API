import connect from '../db/dbConnect'
import { ensureUserExists } from '../middlewares/ensureUserExists';

import { Router } from 'express';

const authController = Router();

//authenticate user
authController.post('/login', ensureUserExists, async (req, res) => {
    var client = await connect();
    var {nome, senha} = req.body

    var query = "SELECT * FROM player WHERE nome like '" + nome + "'";

    client.query(query, (err, result) => {
        if(err) {
            console.error('error running query', err);
            client.release();
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            })
        } else {
            const usuario = result.rows[0];
            client.release();  
        }
    })
    
    // verifica se a senha está correta
    const passwordMatch = await compare(senha, usuario.senha);

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