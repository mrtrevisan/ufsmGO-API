import { connect } from '../db/dbConnect.js'
import { ensureUserExists } from '../middlewares/ensureUserExists.js';
import { ensureNameNotUsed } from '../middlewares/ensureNameNotUsed.js';

import bcrypt from 'bcryptjs';
const { hash, compare } = bcrypt;

import { Router } from 'express';

const userController = Router();

//list all users
userController.get('/player/all', async (req, res) => {
    var client = await connect();
    var query = "SELECT * FROM player";

    client.query(query, function(err, result){
        if(err) {
            console.error('error running query', err);
            client.release();
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            })
        } else {
            client.release();
            res.status(200).send(result.rows);
        }
    })
})

//list user by name
userController.get('/player/:nome', async (req, res) => {
    const client = await connect();
    const {nome} = req.params;

    const query = "SELECT nome, pontos FROM player WHERE nome LIKE '" + nome + "'";

    client.query(query, function(err, result){
        if(err) {
            console.error('error running query', err);
            client.release();
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            })
        } else {
            client.release();
            res.status(200).send(result.rows);
        }
    })
})

//create new user
userController.post('/player', ensureNameNotUsed, async (req, res) => {
    const client = await connect();
    const {nome, senha} = req.body;

    const senhaHash = await hash(senha, 5);

    const query = "INSERT INTO player (nome, senha, pontos) VALUES ('" + nome + "', '" + senhaHash + "', 0)";
    client.query(query, (err, result) => {
        if(err) {
            console.error('error running query', err);
            client.release();
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        } else {
            client.release();  
            res.status(200).json('Post request: new player, nome = ' + nome + ', hash = ' + senhaHash);
        }
    })
    
})

//delete user
userController.delete('/player', ensureUserExists, async (req, res) => {
    var client = await connect();
    var {nome, senha} = req.body

    const query = "SELECT * FROM player WHERE nome like '" + nome + "'";
    const { rows } = await client.query(query);

    // verifica se a senha está correta
    const passwordMatch = await compare(senha, rows[0].senha);

    if (passwordMatch) {
        var query2 = "DELETE FROM player WHERE nome like '" + nome + "'";
        client.query(query2, (err, result) => {
            if(err) {
                console.error('error running query', err);
                client.release();
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error',
                });
            } else {
                client.release();
                res.status(200).json('Delete request: player, nome = ' + nome);
            }
        })
    } else {
        res.status(401).json('Não foi possível excluir o jogador: ' + nome + ' - senha incorreta');
    }
})

//update user points
userController.put('/player/pontos', ensureUserExists, async (req, res) => {
    var client = await connect();
    var {nome, pontos} = req.body

    var query = "UPDATE player SET pontos = '" + pontos + "' WHERE nome like '" + nome + "'";
    client.query(query, (err, result) => {
        if(err) {
            console.error('error running query', err);
            client.release();
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        } else {
            client.release();
            res.status(200).json('Put request: player: ' + nome + '-> pontos = ' + pontos);
        }
    })
})

export {userController};