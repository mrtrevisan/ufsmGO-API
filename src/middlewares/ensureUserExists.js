import {connect} from '../db/dbConnect.js';

export const ensureUserExists = async (req, res, next) => {
    const client = await connect();
    const {nome} = req.body

    const query = "SELECT * FROM player WHERE nome like '" + nome + "'";
    const { rows } = await client.query(query);

    if (rows.length > 0) {
        client.release();
        return next();
    } else {
        client.release();  
        return res.status(400).json('Usuário não encontrado');
    }
}