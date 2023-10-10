const dotenv = require('dotenv');
dotenv.config();

const {Pool} = require('pg');

async function connect(){
    if(global.connection) return global.connection.connect()
    else {
        const pool = new Pool({
            connectionString: process.env.PG_URL
        });
        global.connection = pool
        return pool.connect()
    }
}    
// retorna a string da data do dia atual no formato MM/DD/YY
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

function convertDate(StrDate){
    // Divide a string em partes: data e hora
    //console.log(`splitando data ${StrDate}` )
    var partes = StrDate.split(' ');

    // Divide a parte de data em dia, mês e ano
    var dataPartes = partes[0].split('/');

    // Obtém as partes da data
    var dia = dataPartes[0];
    var mes = dataPartes[1];
    var ano = dataPartes[2];

    if (dia.length < 2) {
        dia = '0' + dia;
    }
    if (mes.length < 2) {
        mes = '0' + mes;
    }

    // Formata a data no formato "MM/DD/YY"
    var dataFormatada = mes + '-' + dia + '-' + ano;
    return dataFormatada
}

function compareDate(dataEvento, datahoje){
    // Resultado
    var df = new Date(dataEvento);
    var dh = new Date(datahoje);
    //console.log(`comparando datas: ${df} e ${dh}`)
    if (df > dh) return true;
    else return false;
}

function checkLocal(local){
    local = local.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    if      (local.match(/online/i))        return false
    else if (local.match(/youtube/i))       return false
    else if (local.match(/a confirmar/i))   return false
    else if (local.match(/Argentina/i))     return false
    else if (local.match(/cotrijal/i))     return false
    else if (local.match(/Brasilia/i))     return false
    else return true
}

function getCentro(local){   
    local = local.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    if (local.match(/Centro de Tecnologia/i) || local.match(/CT/) || local.match(/CT-UFSM/) ) return 'CT'
    if (local.match(/Centro de Ciencias Sociais e Humanas/i) || local.match(/CCSH/) || local.match(/CCSH-UFSM/) ) return 'CCSH'
    if (local.match(/Centro de Ciencias Naturais e Exatas/i) || local.match(/CCNE/) || local.match(/CCNE-UFSM/) ) return 'CCNE'
    if (local.match(/Centro de Educacao/i) || local.match(/CE/) || local.match(/CE-UFSM/) ) return 'CE'
    if (local.match(/Centro de Ciencias Rurais/i) || local.match(/CCR/) || local.match(/CCR-UFSM/) ) return 'CCR'
    if (local.match(/Centro de Artes e Letras/i) || local.match(/CAL/) || local.match(/CAL-UFSM/) ) return 'CE'
    if (local.match(/Centro de Ciencias da Saude/i) || local.match(/CCS/) || local.match(/CCS-UFSM/) ) return 'CCS'
    if (local.match(/Centro de Educaçao Fisica e Desportos/i) || local.match(/CEFD/) || local.match(/CEFD-UFSM/) ) return 'CEFD'
    if (local.match(/Colegio Tecnico Industrial/i) || local.match(/CTISM/) || local.match(/CTISM-UFSM/) ) return 'CTISM'
    if (local.match(/Colegio Politecnico/i) || local.match(/POLI/) || local.match(/POLITECNICO/) ) return 'POLI'
    if (local.match(/Ipe Amarelo/i) || local.match(/IPE/) ) return 'IPE'
    else return ' '
}

async function saveData(data){
    var client = await connect();
    var dataHoje = getDateHoje()

    data.forEach(element => {
        // convertemos as datas para o formato MM/DD/YY
        var data_ini = convertDate(element.acf.evento_inicio)
        var local = element.acf.evento_local
        
        if (compareDate(data_ini, dataHoje) && checkLocal(local))
        {
            var data_fim = convertDate(element.acf.evento_termino) 
            var query = "INSERT INTO evento (id, data_inicio, data_termino, local, centro, nome, link)" +
            "VALUES ('" + element.id + "', '" + data_ini + "', '" + data_fim + "', '" + local + "', '" 
            + getCentro(local) + "', '" + element.acf.evento_nome + "', '" + element.link + "')";
            
            client.query(query, function(err, result) {
                if(err) {
                    console.error('error running query', err);
                }
                console.log("1 record inserted");
            })
            //return true;
        } //else return false;
    });   
    client.release(); 
}
    
function main() {
    urls = [
        process.env.CT_URL, process.env.CCNE_URL, 
        process.env.CCSH_URL, process.env.CE_URL, 
        process.env.CCR_URL, process.env.CAL_URL,
        process.env.CCS_URL, process.env.CEFD_URL,
        process.env.CTISM_URL, process.env.POLI_URL,
        process.env.IPE_URL
    ];
    urls.forEach(url => {
        fetch(url)
          .then(response => response.json())
          .then(data => saveData(data))
    });
}

main()