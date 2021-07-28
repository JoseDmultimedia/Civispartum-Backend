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
                    json1 = {"id_Estudiante":resultado[i].id_Estudiante,"nombreEst":resultado[i].nombreEst, "correoEst":resultado[i].correoEst, "fotoEst":resultado[i], "contrasenaEst":resultado[i].contrasenaEst};
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
                tempConn.query('INSERT INTO estudiante VALUES (null, ?, ?, null, ?)', [json1.nombreEst, json1.correoEst, json1.contrasenaEst], function(error, result){
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
        var json1 = req.body; // Se alamacenan datos en variable json1

        connection.getConnection(function(error, tempConn){//Se realiza la conexión a la bd 
            if(error){
                throw error;
            }else{
                console.log('Primera conexión'); 
                tempConn.query('SELECT * FROM estudiante WHERE nombreEst = ?', [json1.nombreEst], function(error, result){  //Se realiza query para verificar repitencia en el nombre
                    
                    var resultado = result;
                    console.log(resultado.length);
                    var paso = resultado.length == 0 ? false : true; 

                    if(error){
                        throw error;
                        res.send("Error al ejecutar el query");
                    }else{
                        tempConn.release(); //Se desconecta la bd para el primer query

                        if(paso == true ){ //Condicional que recibe el dato de comparte que verifica que el nombre no sea igual
                            res.send("Nombre de usuario ultilizado, cambia el nombre");
                        }else{

                        connection.getConnection(function(error, tempConn){ //Se realiza otra vez la conexion a la base de datos
                            if(error){
                                throw error;
                            }else{
                                console.log('conexion correcta');
                                tempConn.query('INSERT INTO estudiante VALUES(NULL, ?, ?, NULL, ?)',[json1.nombreEst, json1.correoEst, hashedPassword], function(error, result){
                                    if(error){
                                        throw error;
                                        res.send("Error al ejecutar el query");
                                    }else{
                                        tempConn.release();
                                        res.send("Ok");
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
                        res.send("Usuario no encontrado");
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
                                                res.send("Constraseña invalida");
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
            tempConn.query('SELECT id_Estudiante FROM estudiante WHERE nombreEst = ?', [json1.nombreEst], function(error, result){
                if(error){
                    throw error;
                    res.send("Error al ejecutar el query");
                }else{
                    tempConn.release(); // Se suelta la conexion
                    var paso = Object.values(result);
                    for (let index = 0; index < paso.length; index++) {
                             var respuesta = result[index].id_Estudiante;
                        }
                    //console.log(respuesta);
                    connection.getConnection(function(error, tempConn){ //Se realiza la conexion
                        if(error){
                            throw error;
                        }else{ //Query
                            console.log('Conexion correcta');
                            tempConn.query('INSERT INTO registro VALUES (NULL, ?, ?, ?)', [json1.fechaRegistro, json1.actividad, respuesta], function(error, result){
                                if(error){
                                    throw error;
                                    res.send("Error al ejecutar el query");
                                }else{
                                    tempConn.release(); // Se suelta la conexion
                                    res.send("Ok");
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

//Peticion GET para consultar los registros de un usuario

router.get('/usuario/registro/:nombreEst', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada json de datos 
    var arreglo = []; //Variable para llenar el arreglo de json a los multiples datos
    var id = req.params.nombreEst; //Se obtiene la variable recibida a trves de url

    connection.getConnection(function(error, tempConn){ //Se realiza la conection a la bd
        if(error){
            throw error;
        }else{
            console.log('Conexion correcta');
            tempConn.query('SELECT fechaRegistro, actividad FROM registro r, estudiante e WHERE e.id_Estudiante=r.id_RegistroEst AND e.nombreEst = ?', [id], function(error, result){ //Se realiza query
                var registro = result; //Se almacena los datos en variable regisstro
                if(error){
                    throw error;
                }else{
                    tempConn.release(); //Se suelta la conexion a la bd 
                    for(j=0; j<registro.length;j++){
                        json1 = {"fechaRegistro": registro[j].fechaRegistro, "actividad":registro[j].actividad};
                        arreglo.push(json1); //Se organizan los datos y se pushean al arreglo
                    }
                    res.send(arreglo);//Se envia el arreglo como respuesta
                }
            });
        }
    });
});

//Peticion GET para consultar el ultimo registro de un usuario

router.get('/usuario/registro/ultimo/:nombreEst', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada json de datos 
    var arreglo = []; //Variable para llenar el arreglo de json a los multiples datos
    var id = req.params.nombreEst; //Se obtiene la variable recibida a trves de url

    connection.getConnection(function(error, tempConn){ //Se realiza la conection a la bd
        if(error){
            throw error;
        }else{
            console.log('Conexion correcta');
            tempConn.query('SELECT fechaRegistro, actividad FROM registro r, estudiante e WHERE e.id_Estudiante=r.id_RegistroEst and e.nombreEst= ? ORDER BY r.id_RegistroEst DESC LIMIT 1', [id], function(error, result){ //Se realiza query
                var registro = result; //Se almacena los datos en variable regisstro
                if(error){
                    throw error;
                }else{
                    tempConn.release(); //Se suelta la conexion a la bd 
                    for(j=0; j<registro.length;j++){
                        json1 = {"fechaRegistro": registro[j].fechaRegistro, "actividad":registro[j].actividad};
                        arreglo.push(json1); //Se organizan los datos y se pushean al arreglo
                    }
                    res.send(arreglo);//Se envia el arreglo como respuesta
                    console.log(arreglo);
                }
            });
        }
    });
});


//Peticion GET para consultar los ultimos tres registros de un usuario

router.get('/usuario/registro/tres/:nombreEst', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada json de datos 
    var arreglo = []; //Variable para llenar el arreglo de json a los multiples datos
    var id = req.params.nombreEst; //Se obtiene la variable recibida a trves de url

    connection.getConnection(function(error, tempConn){ //Se realiza la conection a la bd
        if(error){
            throw error;
        }else{
            console.log('Conexion correcta');
            tempConn.query('SELECT id_Registro, fechaRegistro, actividad FROM registro r, estudiante e WHERE e.id_Estudiante=r.id_RegistroEst and e.nombreEst= ? ORDER BY r.id_Registro DESC LIMIT 3', [id], function(error, result){ //Se realiza query
                var registro = result; //Se almacena los datos en variable regisstro
                if(error){
                    throw error;
                }else{
                    tempConn.release(); //Se suelta la conexion a la bd 
                    for(j=0; j<registro.length;j++){
                        json1 = {"id_Registro": registro[j].id_Registro, "fechaRegistro": registro[j].fechaRegistro, "actividad":registro[j].actividad};
                        arreglo.push(json1); //Se organizan los datos y se pushean al arreglo
                    }
                    res.send(arreglo);//Se envia el arreglo como respuesta
                    console.log(arreglo);
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
            tempConn.query('SELECT id_Estudiante FROM estudiante WHERE nombreEst = ?', [json1.nombreEst], function(error, result){
                if(error){
                    throw error;
                    res.send("Error al ejecutar el query");
                }else{
                    tempConn.release(); //Se suelta conexion
                    var paso = Object.values(result);
                    for (let index = 0; index < paso.length; index++) {
                             var respuesta = result[index].id_Estudiante;
                        }
                    //console.log(respuesta);
                    connection.getConnection(function(error, tempConn){ //Conexion a la bd
                        if(error){
                            throw error;
                        }else{
                            console.log('Conexion correcta');//query abajo
                            tempConn.query('INSERT INTO puntaje VALUES (NULL, ?, ?, ?)', [json1.puntaje, json1.descripcionPuntaje, respuesta], function(error, result){
                                if(error){
                                    throw error;
                                    res.send("Error al ejecutar el query");
                                }else{
                                    tempConn.release(); //Se suelta conexion
                                    res.send("Ok");
                                }
                            });
                        }
                    });
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

//Peticion GET para obtener los puntajes de un estudiante

router.get('/usuario/puntaje/:nombreEst', (req, res) =>{

    var json1 = {}; //Variable para almacenar cada json de datos 
    var arreglo = []; //Variable para llenar el arreglo de json a los multiples datos
    var id = req.params.nombreEst; //Se obtiene la variable recibida a trves de url

    connection.getConnection(function(error, tempConn){ //Se realiza la conection a la bd
        if(error){
            throw error;
        }else{
            console.log('Conexion correcta');
            tempConn.query('SELECT puntaje, descripcionPuntaje FROM puntaje p, estudiante e WHERE e.id_Estudiante=p.id_PuntajeEst and e.nombreEst = ?', [id], function(error, result){ //Se realiza query
                var puntaje = result; //Se almacena los datos en variable regisstro
                console.log(puntaje);
                if(error){
                    throw error;
                }else{
                    tempConn.release(); //Se suelta la conexion a la bd 
                    for(j=0; j<puntaje.length;j++){
                        json1 = {"puntaje":puntaje[j].puntaje, "descripcionPuntaje":puntaje[j].descripcionPuntaje};
                        arreglo.push(json1); //Se organizan los datos y se pushean al arreglo
                    }
                    console.log(arreglo);
                    res.send(arreglo);//Se envia el arreglo como respuesta
                    
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
            tempConn.query('INSERT INTO foro VALUES (NULL, ?, ?, ?)', [json1.comentario,  json1.nombreUser, json1.numeroLikes], function(error, result){
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
                                                            res.status(200);
                                                            res.send("Ok");
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

//Peticion GET para obtener todos los ultimos comentarios del foro

router.get('/usuario/foro/comentarios/ultimo', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada registro que se lea, en formato json
    var arreglo = []; // Variable para almacenar todos los datos, en formato arreglo json

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log('Conexion Correcta');
        tempConn.query('SELECT * FROM foro ORDER BY id_Foro DESC LIMIT 3', function(error, result){
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


router.get('/usuario/primer/premio/:nombreEst', (req, res) => {
    var json1 = {};
    var arreglo = [];
    var id = req.params.nombreEst;
    var pre1 = false;
    var pre2 = false;
    var pre3 = false;
    var premio = 0;
    var contador1 = 0;
    var contador2 = 0;
    var contador3 = 0;

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log("Conexión Correcta");
        tempConn.query('SELECT * FROM puntaje p, estudiante e WHERE e.id_Estudiante = p.id_PuntajeEst and e.nombreEst = ?',[id], function(error, result){
            var resultado = result;
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"descripcionPuntaje":resultado[i].descripcionPuntaje};
                    //console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                for(j=0; j<arreglo.length; j++){
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 1 Voto'){
                        contador1+= 1;
                    }
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 2 Voto'){
                        contador2+= 1;
                    }
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 3 Voto'){
                        contador3+= 1;
                    }
                }
                //console.log(contador1, contador2, contador3);

                pre1 = contador1 > 0 ? true : false; 
                pre2 = contador2 > 0 ? true : false; 
                pre3 = contador3 > 0 ? true : false; 

                //console.log(pre1, pre2, pre3);

                if(pre1 === true){
                    premio = 33;
                }
                if(pre1 === true && pre2 === true){
                    premio = 66;
                }
                if(pre1 === true && pre2 === true && pre3 === true){
                    premio = 100;
                }
                
                /*
                premio = pre1 === true ? 33 : 0;
                Premio = pre1 === true && pre2 === true ? 66 : 0;
                premio = pre1 === true && pre2 === true && pre3 === true ? 100 : 0;
                */

                res.json(premio); //Se retorna la respuesta
            }
        })
    }
})
});

router.get('/usuario/segundo/premio/:nombreEst', (req, res) => {
    var json1 = {};
    var arreglo = [];
    var id = req.params.nombreEst;
    var pre1 = false;
    var pre2 = false;
    var pre3 = false;
    var pre4 = false;
    var pre5 = false;
    var pre6 = false;
    var pre7 = false;
    var premio = 0;
    var contador1 = 0;
    var contador2 = 0;
    var contador3 = 0;
    var contador4 = 0;
    var contador5 = 0;
    var contador6 = 0;
    var contador7 = 0;

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log("Conexión Correcta");
        tempConn.query('SELECT * FROM puntaje p, estudiante e WHERE e.id_Estudiante = p.id_PuntajeEst and e.nombreEst = ?',[id], function(error, result){
            var resultado = result;
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"descripcionPuntaje":resultado[i].descripcionPuntaje};
                    //console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                for(j=0; j<arreglo.length; j++){
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 1 Voto'){
                        contador1+= 1;
                    }
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 2 Voto'){
                        contador2+= 1;
                    }
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 3 Voto'){
                        contador3+= 1;
                    }
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 1 Referendo'){
                        contador4+= 1;
                    }
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 2 Referendo'){
                        contador5+= 1;
                    }
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 3 Referendo'){
                        contador6+= 1;
                    }
                    if(arreglo[j].descripcionPuntaje === 'Pregunta 4 Referendo'){
                        contador7+= 1;
                    }
                }
                //console.log(contador1, contador2, contador3);

                pre1 = contador1 > 0 ? true : false; 
                pre2 = contador2 > 0 ? true : false; 
                pre3 = contador3 > 0 ? true : false; 
                pre4 = contador4 > 0 ? true : false; 
                pre5 = contador5 > 0 ? true : false; 
                pre6 = contador6 > 0 ? true : false; 
                pre7 = contador7 > 0 ? true : false; 

                //console.log(pre1, pre2, pre3);

                if(pre1 === true && pre2 === true && pre3 === true){
                    premio = 50;
                }
                if(pre1 === true && pre2 === true && pre3 === true && pre4 === true && pre5 === true && pre6 === true && pre7 === true  ){
                    premio = 100;
                }

                res.json(premio); //Se retorna la respuesta
            }
        })
    }
})
});


module.exports = router;