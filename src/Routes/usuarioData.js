/*
Archivo de las rutas para las diferentes peticiones 
post y get sobre la bd de usuario
*/

const {Router} = require('express'); //Se crea una constante router que usa express
const router = Router(); // se asigna el llamado a una constante
const mysql = require('mysql'); // Se crea una constante que llama a mysql

//Se crea la conexion a mysql

const connection = mysql.createPool({
    connectionLimit:500,
    host:'localhost',
    user:'root',
    password:'', //Passwword por default de mi maquina
    database:'usuario',
    port:3306
});

router.get('/usuario', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada registro que se lea, en formato json
    var arreglo = []; // Variable para almacenar todos los datos, en formato arreglo json

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log('Conexion Correcta');
        tempConn.query('SELECT * FROM estudiante', function(error, result){
            var resultado = result; // Se almace el resultado de la consulta en la variable resultado
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"id_Estudiante":resultado[i].id_Estudiante,"nombreEst":resultado[i].nombreEst, "correoEst":resultado[i].correoEst, "contrasenaEst":resultado[i].contrasenaEst};
                    console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                res.json(arreglo); //Se retorna la respuesta, la cual es el arreglo de json
            }
        });
    }
});
});
