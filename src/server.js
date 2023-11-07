//access to .env file
const dotenv = require('dotenv');
dotenv.config();

//express server
const express = require('express');
const app = express();

//cors policy 
const cors = require('cors');
app.use(cors());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

//receive JSON trough req body
app.use(express.json());
app.use(express.urlencoded({extended : true}));

  

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))

app.get('/', async function(req, res){
    res.json('UfsmGO');
})

app.get('/healthcheck', async function(req, res){
    var client = await connect();
    var query = "SELECT NOW() as time";
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.status(200).json('ok')
    })
})






app.delete('/player', async function(req, res){
    var client = await connect();
    var {nome, senha} = req.body

    var query1 = "SELECT * FROM player WHERE nome like '" + nome + "'";
    const { rows } = await client.query(query1);

    if (rows.length > 0) {
        const player = rows[0];
        if (senha === player.senha) {
            var query2 = "DELETE FROM player WHERE nome like '" + nome + "'";
            client.query(query2, function(err, result){
                if(err) {
                    return console.error('error running query', err);
                }
                client.release();
                res.json('Delete request: player, nome = ' + nome)
            })
        } else {
            client.release();
            res.json('Não foi possível excluir o jogador: ' + nome + ' - senha incorreta');
        }
    } else {
        res.json('Jogador não existe');
        client.release();
    }
})

app.get('/player/:nome', async function(req, res){
    var client = await connect();
    var {nome} = req.params;
    var {query} = req.query;

    if (query == 'game_info')
        var query = "SELECT nome, pontos FROM player WHERE nome LIKE '" + nome + "'";
    else if (query == 'credentials')
        var query = "SELECT nome, senha FROM player WHERE nome LIKE '" + nome + "'";
    else if (query == 'verify')
        var query = "SELECT nome FROM player WHERE nome LIKE '" + nome + "'";
    else {
        client.release();
        res.json('Invalid query for get method');
        return;
    }

    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.send(result.rows);
    })
})


app.put('/player/pontos', async function (req, res){
    var client = await connect();
    var {nome, pontos} = req.body

    var query = "UPDATE player SET pontos = '" + pontos + "' WHERE nome like '" + nome + "'";
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.json('Put request: player: ' + nome + '-> pontos = ' + pontos)
    })
})

