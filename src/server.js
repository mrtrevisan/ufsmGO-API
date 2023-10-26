const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

app.use(express.json());
app.use(express.urlencoded({extended : true}));

const {Pool} = require('pg');

function getDateHoje(){
    var objectDate = new Date();
    var dia = objectDate.getDate();
    var mes = objectDate.getMonth() +1;
    var ano = objectDate.getFullYear();

    if (dia.length < 2) {
        dia = '0' + dia;
    }
    if (mes.length < 2) {
        mes = '0' + mes;
    }
    var datahoje = mes + '-' + dia + '-' + ano

    return datahoje
}

async function connect(){
    if(global.connection) return global.connection.connect()
    else {
        const pool = new Pool({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            database: process.env.DATABASE_DB,
            password: process.env.DATABASE_PASSWORD,
            port: process.env.DATABASE_PORT
        });
        global.connection = pool
        return pool.connect()
    }
}    

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

app.get('/evento/:index', async function(req, res){
    var client = await connect();
    var query = "SELECT * FROM evento";

    var {index} = req.params;
    if (index != 'all') query +=  " WHERE centro LIKE '" + index.toUpperCase() +"'" ;
   
    //console.log(query);
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.send(result.rows);
    })
})

app.get('/evento', async function(req, res){
    var client = await connect();
    var query = "SELECT * FROM evento";

    var {centro, sort, order} = req.query;
    var hoje = getDateHoje();

    if (centro) {
        query += " WHERE centro LIKE '" + centro.toUpperCase() +"'" ;
        query += " AND data_termino >= '" + hoje + "'";
    } 
    else {
        query += " WHERE data_termino >= '" + hoje + "'";
    }
    if (sort){
        query += " ORDER BY " + sort
        if (order) query += " " + order.toUpperCase();
    }  

    //console.log(query);
    client.query(query, function(err, result){
        if(err){
            return console.error('error running query', err);
        }
        client.release();
        res.send(result.rows);
    })
})

app.get('/centro', async function(req, res){
    var client = await connect();
    var query = "SELECT * FROM centro ORDER BY id";
    
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.send(result.rows);
    })
})

app.get('/centro/:index', async function(req, res){
    var {index} = req.params;
    var client = await connect();
    var query = "SELECT * FROM centro WHERE sigla LIKE '" + index.toUpperCase() + "'";

    client.query(query, function(err, result){
        if(err){
            return console.error('error running query', err);
        }
        client.release();
        res.send(result.rows);
    })
})

app.get('/player', async function(req, res){
    var client = await connect();
    var query = "SELECT * FROM player";
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.send(result.rows);
    })
})

app.post('/player', async function(req, res){
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
    var {nome} = req.params

    var query = "SELECT nome, pontos FROM player WHERE nome LIKE '" + nome + "'";
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.send(result.rows);
    })
})

app.put('/player/:nome/pontos', async function (req, res){
    var client = await connect();
    var {nome} = req.params
    var {value} = req.body

    var query = "UPDATE player SET pontos = '" + value + "' WHERE nome like '" + nome + "'";
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.json('Put request: player: ' + nome + '-> pontos = ' + value)
    })
})

app.get('/leaderboard', async function(req, res){
    var client = await connect();

    var query = "SELECT nome as Jogador, pontos as Pontuação FROM player ORDER BY pontos DESC LIMIT 10";
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.json(result.rows)
    })
})