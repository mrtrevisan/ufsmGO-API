import { connect } from '../db/dbConnect.js'
import { getDateHoje } from '../utils/getDate.js';

import { Router } from 'express';

const dataController = Router();

dataController.get('/healthcheck', async (req, res) => {
    var client = await connect();
    var query = "SELECT NOW() as time";

    client.query(query, function(err, result){
        if(err) {
            console.error('error running healthcheck', err);
            client.release();
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        } else {
            client.release();
            res.status(200).json('ok')
        }
    })
})

//list all events
dataController.get('/evento/all', async (req, res) =>{
    var client = await connect();
    var query = "SELECT * FROM evento";
    
    client.query(query, function(err, result){
        if(err) {
            console.error('error running query', err);
            client.release();
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        } else {
            client.release();
            res.status(200).send(result.rows);
        }
    })
})

//list events by center, sorting by attribute 
dataController.get('/evento', async (req, res) =>{
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

//list all centers
dataController.get('/centro/all', async function(req, res){
    var client = await connect();
    var query = "SELECT * FROM centro ORDER BY id";
    
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

//list center of index
dataController.get('/centro/:index', async function(req, res){
    var {index} = req.params;
    var client = await connect();
    var query = "SELECT * FROM centro WHERE sigla LIKE '" + index.toUpperCase() + "'";

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

//get leaderboard (N players with most points)
dataController.get('/leaderboard', async function(req, res){
    var client = await connect();

    var query = "SELECT nome as Jogador, pontos as Pontuação FROM player ORDER BY pontos DESC LIMIT 10";
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

export {dataController};