import connect from '../db/dbConnect'
import { ensureUserExists } from '../middlewares/ensureUserExists';

import { Router } from 'express';

const userController = Router();

//list all users
userController.get('/player', async (req, res) => {
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
    var client = await connect();
    var {nome} = req.params;

    var query = "SELECT nome FROM player WHERE nome LIKE '" + nome + "'";

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
userController.post('/player', ensureUserExists, async (req, res) => {
    var client = await connect();
    var {nome, senha} = req.body;

    query = "INSERT INTO player (nome, senha, pontos) VALUES ('" + nome + "', '" + senha + "', 0)";
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
            res.status(200).json('Post request: new player, nome = ' + nome + ', senha = ' + senha);
        }
    })
    
})

userController.delete('/player', ensureUserExists, async (req, res) => {
    var client = await connect();
    var {nome, senha} = req.body

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