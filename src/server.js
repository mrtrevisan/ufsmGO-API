const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

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
    var {nome, senha} = req.query

    var query1 = "SELECT * FROM player WHERE nome like '" + nome + "'";
    const { rows } = await client.query(query1);

    if (rows.length > 0) {
        res.json('Não foi possível criar o usuário: Nome já existe')
    } else {
        var query2 = "INSERT INTO player (nome, senha, pontos) VALUES ('" + nome + "', '" + senha + "', 0)";
        client.query(query2, function(err, result){
            if(err) {
                return console.error('error running query', err);
            }
            res.json('Post request: new player, nome = ' + nome + ', senha = ' + senha)
        })
    }
    client.release();  
})

app.delete('/player', async function(req, res){
    var client = await connect();
    var {nome, senha} = req.query

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
                res.json('Delete request: player, nome = ' + nome)
            })
        } else {
            res.json('Não foi possível excluir o jogador: ' + nome + '- senha incorreta');
        }
    }
    client.release();
})

app.get('/player/:nome', async function(req, res){
    var client = await connect();
    var {nome} = req.params

    var query = "SELECT * FROM player WHERE nome like '" + nome + "'";
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.send(result.rows);
    })
})

app.get('/player/:nome/pontos', async function(req, res){
    var client = await connect();
    var {nome} = req.params

    var query = "SELECT pontos FROM player WHERE nome like '" + nome + "'";
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
    var {value} = req.query

    var query = "UPDATE player SET pontos = '" + value + "' WHERE nome like '" + nome + "'";
    client.query(query, function(err, result){
        if(err) {
            return console.error('error running query', err);
        }
        client.release();
        res.json('Put request: player: ' + nome + '-> pontos = ' + value)
    })
})

