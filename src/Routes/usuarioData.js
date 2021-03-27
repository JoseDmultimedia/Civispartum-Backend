/*
Archivo de las rutas para las diferentes peticiones 
post y get sobre la bd de usuario
*/

const {Router} = require('express'); //Se crea una constante router que usa express
const router = Router(); // se asigna el llamado a una constante
const mysql = require('mysql'); // Se crea una constante que llama a mysql
const bcrypt = require('bcrypt'); // Se crea una constante que llama a bcrypt

//Se crea la conexion a mysql

const connection = mysql.createPool({
    connectionLimit:500,
    host:'localhost',
    user:'root',
    password:'', //Passwword por default de mi maquina
    database:'usuario',
    port:3306
});

// Peticion GET para obtener todos los estudiantes de la bd usuario

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
                    json1 = {"id_Estudiante":resultado[i].id_Estudiante,"nombreEst":resultado[i].nombreEst, "correoEst":resultado[i].correoEst, "contrasenaEst":resultado[i].contrasenaEst, "fotoEst":resultado[i]};
                    console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                res.json(arreglo); //Se retorna la respuesta, la cual es el arreglo de json
            }
        });
    }
});
});

// Petecion POST para ingresar estudiantes en la bd usuario

router.post('/usuario',(req, res) =>{
        console.log(req.body); // Muestra en consola los datos en formato jsoon que llego
        json1 = req.body; // Se almacena el json recibido en la variable json1
        connection.getConnection(function(error, tempConn){ //Conexión a mysql
            if(error){
                throw error;// En caso de error en la conexión
            } else{
                console.log('conexión correcta');
                tempConn.query('INSERT INTO estudiante VALUES (?, ?, ?, null, null)', [json1.nombreEst, json1.correoEst, json1.contrasenaEst], function(error, result){
                    if (error){
                        throw error;
                        res.send("Error la ejecutar el query");
                    }else{
                        tempConn.release();
                        res.send("Datos almacenados")
                    }
                });
            }
        });
});

//Peticion para ingresar un nuevo estudiante, con seguridad y verificando que el nombre de usuario sea unico

router.post('/usuario/new', async(req, res) =>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.contrasenaEst,10); //Se recibe la contraseña y se encrypta usando bcrypt
        console.log(req.body); //Se muestran datos en consola 
        json1 = req.body; // Se alamacenan datos en variable json1
        
        connection.getConnection(function(error, tempConn){//Se realiza la conexión a la bd 
            if(error){
                throw error;
            }else{
                console.log('Primera conexión'); 
                tempConn.query('SELECT * FROM estudiante WHERE nombreEst = ?', [json1.nombreEst], function(error, result){  //Se realiza query para verificar repitencia en el nombre
                    for(j=0; j<result.length; j++){ //For para obtener el/los datos del query y definir la var
                        obtain = {"nombreEst":result[j].nombreEst};
                    }
                    var compare = obtain.nombreEst == json1.nombreEst ? true : false; //Comparacon de datos del query y dato mandando por post
                    /*
                    console.log(obtain.nombreEst);
                    console.log(json1.nombreEst); Verificación de datos en Dev 
                    console.log(compare);
                    */
                    if(error){
                        throw error;
                        res.send("Error al ejecutar el query");
                    }else{
                        tempConn.release(); //Se desconecta la bd para el primer query

                        if(compare == true ){ //Condicional que recibe el dato de comparte que verifica que el nombre no sea igual
                            res.send("Nombre de usuario ultilizado cambia el usuario");
                        }else{

                        connection.getConnection(function(error, tempConn){ //Se realiza otra vez la conexion a la base de datos
                            if(error){
                                throw error;
                            }else{
                                console.log('conexion correcta');
                                tempConn.query('INSERT INTO estudiante VALUES(?, ?, ?, NULL, NULL)',[json1.nombreEst, json1.correoEst, hashedPassword], function(error, result){
                                    if(error){
                                        throw error;
                                        res.send("Error al ejecutar el query");
                                    }else{
                                        tempConn.release();
                                        res.send("Datos almacenados");
                                    }
                                });
                            }
                        });
                        
                        }
                    }
                } );
            }
        });
    
    }catch{
      
    }

});




module.exports = router;