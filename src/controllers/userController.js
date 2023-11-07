import connect from '../db/connect'

const {Router} = require('express');

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
            res.send(result.rows);
        }
    })
})

app.post('/player', async (req, res) => {
    var client = await connect();
    var {nome, senha} = req.body

    var query1 = "SELECT * FROM player WHERE nome like '" + nome + "'";
    const { rows } = await client.query(query1);

    if (rows.length > 0) {
        client.release();  
        res.json('Não foi possível criar o usuário: Nome já existe')
    } else {
        var query2 = "INSERT INTO player (nome, senha, pontos) VALUES ('" + nome + "', '" + senha + "', 0)";
        client.query(query2, function(err, result){
            if(err) {
                return console.error('error running query', err);
            }
            client.release();  
            res.json('Post request: new player, nome = ' + nome + ', senha = ' + senha)
        })
    }
})

export {userController};