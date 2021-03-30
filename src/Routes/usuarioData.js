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

//Petición para loguearse en la aplicación atraves de un POST 

router.post('/usuario/login', async (req, res) => {
    console.log(req.body);
    json1 = req.body; //Se reciben los datos mandados
    connection.getConnection(function(error, tempConn){ //Realizar conexion
        if(error){
            throw error;
        }else{
            console.log('primera conexion');
            tempConn.query('SELECT * FROM estudiante WHERE nombreEst = ?', [json1.nombreEst], function(error, result){ //Realizar query
                if(error){
                    throw error;
                }else{
                    tempConn.release(); //Soltar conexion
                    const cons = result;
                    if(cons.length === 0){
                        res.send("No ingresar, Usuario no encontrado");
                    }else{
                        try{
                            connection.getConnection(function(error, tempConn){ //Se realiza la conexion con la bd
                                if(error){
                                    throw error;
                                }else{
                                    console.log('Conexion correcta');
                                    tempConn.query('SELECT * FROM estudiante WHERE nombreEst = ?', [json1.nombreEst], function(error, result){ //Se realiza el query
                                        if(error){
                                            throw error;
                                        }else{
                                            tempConn.release(); 
                                            //console.log(result);
                                            for(j=0; j<result.length; j++){ //For para obtener el/los datos del query y definir la var
                                               var obtain = {"nombreEst":result[j].nombreEst, "contrasenaEst":result[j].contrasenaEst};
                                            }
                                            const verify = bcrypt.compareSync(json1.contrasenaEst, obtain.contrasenaEst); //Se compara los datos para verificar la contrasena
                                            if(verify == true){
                                                res.status(200);
                                                res.send("Ingresa");
                                                console.log('Ingreso');
                                            }else{
                                                //res.status(403);
                                                res.send("Noingresar constraseña invalidad");
                                                console.log('NoIngreso');
                                            }
                                        }
                                    });
                                }
                            });
                
                        } catch{
                
                        }
                    }
                }
            });
        }
    });
});

//Peticion POST para añadir un nuevo registro en la bd usuario bajo la tabla registro

router.post('/usuario/registro/new', (req, res) =>{
    //Log en consola y almacenamiento de datos en variable json
    console.log(req.body);
    json1 = req.body;
    connection.getConnection(function(error, tempConn){ //Se realiza la conexion
        if(error){
            throw error;
        }else{ //Query
            console.log('Conexion correcta');
            tempConn.query('INSERT INTO registro VALUES (NULL, ?, ?, ?)', [json1.fechaRegistro, json1.actividad, json1.id_RegistroEst], function(error, result){
                if(error){
                    throw error;
                    res.send("Error al ejecutar el query");
                }else{
                    tempConn.release(); // Se suelta la conexion
                    res.send("Datos almacenados");
                }
            });
        }
    });
});

//Peticion GET para consultar los registros de un usuario

router.get('/usuario/registro/:id_RegistroEst', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada json de datos 
    var arreglo = []; //Variable para llenar el arreglo de json a los multiples datos
    var id = req.params.id_RegistroEst; //Se obtiene la variable recibida a trves de url

    connection.getConnection(function(error, tempConn){ //Se realiza la conection a la bd
        if(error){
            throw error;
        }else{
            console.log('Conexion correcta');
            tempConn.query('SELECT * FROM registro WHERE id_RegistroEst = ?', [id], function(error, result){ //Se realiza query
                var registro = result; //Se almacena los datos en variable regisstro
                if(error){
                    throw error;
                }else{
                    tempConn.release(); //Se suelta la conexion a la bd 
                    for(j=0; j<registro.length;j++){
                        json1 = {"fechaRegistro": registro[j].fechaRegistro, "actividad":registro[j].actividad, "id_RegistroEst":registro[j].id_RegistroEst};
                        arreglo.push(json1); //Se organizan los datos y se pushean al arreglo
                    }
                    res.send(arreglo);//Se envia el arreglo como respuesta
                }
            });
        }
    });
});


//Peticion POST para añadir un puntaje 

router.post('/usuario/puntaje/new', (req, res) =>{
    //Log de console y llegada de datos almacenados en var json
    console.log(req.body);
    json1 = req.body;
    connection.getConnection(function(error, tempConn){ //Conexion a la bd
        if(error){
            throw error;
        }else{
            console.log('Conexion correcta');//query abajo
            tempConn.query('INSERT INTO puntaje VALUES (NULL, ?, ?, ?)', [json1.puntaje, json1.descripcionPuntaje, json1.id_PuntajeEst], function(error, result){
                if(error){
                    throw error;
                    res.send("Error al ejecutar el query");
                }else{
                    tempConn.release(); //Se suelta conexion
                    res.send("Datos almacenados");
                }
            });
        }
    });
});


//Peticion GET para obtener la suma de los puntajes de un usuario

router.get('/usuario/puntaje/suma/:id_PuntajeEst', (req, res) =>{

    var id = req.params.id_PuntajeEst; //Se recibe la varible mandada en la url

    connection.getConnection(function(error, tempConn){ //Se realiza la conexion a la bd
        if(error){
            throw error;
        }else{
            console.log('Conexion realizada');
            tempConn.query('SELECT SUM(puntaje) FROM puntaje WHERE id_PuntajeEst = ? ', [id], function(error, result){ //Se realiza query
                if(error){
                    throw error;
                }else{
                    tempConn.release(); //Se suelta la conexion
                    var sum = result;
                    res.send(sum);// Se envia el dato obtenido
                }
            });
        }
    });
});


//Peticion POST para ingresar en Foro y comentario_foro
/* 
Este realiza un primer query donde inserta foro, luego busca el id de foro, y luego el id del estudiante
para finalmente ingresarlo en comentario_foro
*/

router.post('/usuario/foro/new', (req, res) =>{
    //Log de console y llegada de datos almacenados en var json
    console.log(req.body);
    json1 = req.body;
    connection.getConnection(function(error, tempConn){ //Conexion a la bd
        if(error){
            throw error;
        }else{
            console.log('Conexion correcta');//query abajo
            tempConn.query('INSERT INTO foro VALUES (NULL, ?, ?, ?)', [json1.comentario, json1.numeroLikes, json1.nombreUser], function(error, result){
                if(error){
                    throw error;
                    res.send("Error al ejecutar el query");
                }else{
                    //tempConn.release(); //Se suelta conexion

                    connection.getConnection(function(error, tempConn){ //Conexion a la bd
                        if(error){
                            throw error;
                        }else{
                            console.log('Conexion correcta');//query abajo
                            //res.send("Datos Foro Almacenados");
                            tempConn.query('SELECT * FROM (SELECT id_Foro FROM foro WHERE nombreUser = ?) as id_User ORDER BY id_Foro DESC LIMIT 1', [json1.nombreUser], function(error, result){
                                if(error){
                                    throw error;
                                    res.send("Error al ejecutar el query");
                                }else{
                                    var paso = Object.values(result);
                                    for (let index = 0; index < paso.length; index++) {
                                       var respuesta = result[index].id_Foro;
                                    }
                                    //tempConn.release(); //Se suelta conexion
                                    pass1 = respuesta;
                                    console.log('Query 1 realizada');
                                    tempConn.query('SELECT id_Estudiante FROM estudiante WHERE nombreEst = ?', [json1.nombreUser], function(error, result){
                                        if(error){
                                            throw error;
                                            res.send("Error al ejecutar el query");
                                        }else{
                                            var paso = Object.values(result);
                                            for (let index = 0; index < paso.length; index++) {
                                                var respuesta = result[index].id_Estudiante;
                                            }
                                            //tempConn.release(); //Se suelta conexion
                                            pass2 = respuesta;
                                            console.log('Query 2 Realizada');
                                            connection.getConnection(function(error, tempConn){
                                                if(error){
                                                    throw error;
                                                }else{
                                                    tempConn.query('INSERT INTO comentario_foro VALUES (NULL, ?, ?)', [pass1, pass2], function(error, result){
                                                        if(error){
                                                            throw error;
                                                        }else{
                                                            tempConn.release();
                                                            res.send("Todos los datos almacenados");
                                                            console.log('Insert comentario_foro');
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

//Peticion GET para obtener todos los comentarios de foro

router.get('/usuario/foro/comentarios', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada registro que se lea, en formato json
    var arreglo = []; // Variable para almacenar todos los datos, en formato arreglo json

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log('Conexion Correcta');
        tempConn.query('SELECT * FROM foro', function(error, result){
            var resultado = result; // Se almace el resultado de la consulta en la variable resultado
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"comentario":resultado[i].comentario,"numeroLikes":resultado[i].numeroLikes, "nombreUser":resultado[i].nombreUser};
                    console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                res.json(arreglo); //Se retorna la respuesta, la cual es el arreglo de json
            }
        });
    }
});
});

module.exports = router;