/*
Archivo de las rutas para las diferentes peticiones 
post y get sobre la bd audiovisual
*/
const {Router} = require('express');
const router = Router();
const mysql = require('mysql');

const connection = mysql.createPool({
    connectionLimit: 500,
    host:'localhost',
    user:'root',
    password:'',
    database:'audiovisual',
    port:3306
});

//Peticion POST para ingresar un video

router.post('/audiovisual/video/new',(req, res) =>{
    console.log(req.body); // Muestra en consola los datos en formato jsoon que llego
    json1 = req.body; // Se almacena el json recibido en la variable json1
    connection.getConnection(function(error, tempConn){ //Conexión a mysql
        if(error){
            throw error;// En caso de error en la conexión
        } else{
            console.log('conexión correcta');
            tempConn.query('INSERT INTO video VALUES (NULL, ?, ?, ?, ?)', [json1.videoUrl, json1.nombreVideo, json1.imagenVideo, json1.descripcionVideo], function(error, result){
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

//Peticion GET para obtener todos los videos

router.get('/audiovisual/video', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada registro que se lea, en formato json
    var arreglo = []; // Variable para almacenar todos los datos, en formato arreglo json

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log('Conexion Correcta');
        tempConn.query('SELECT * FROM video', function(error, result){
            var resultado = result; // Se almace el resultado de la consulta en la variable resultado
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"videoUrl":resultado[i].videoUrl,"nombreVideo":resultado[i].nombreVideo, "imagenVideo":resultado[i].imagenVideo, "descripcionVideo":resultado[i].descripcionVideo};
                    console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                res.json(arreglo); //Se retorna la respuesta, la cual es el arreglo de json
            }
        });
    }
});
});

//Peticion GET para obtener un video en especifico

router.get('/audiovisual/video/:id_Video', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada registro que se lea, en formato json
    var arreglo = []; // Variable para almacenar todos los datos, en formato arreglo json
    var search =req.params.id_Video;

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log('Conexion Correcta');
        tempConn.query('SELECT * FROM video WHERE id_Video = ?', [search], function(error, result){
            var resultado = result; // Se almace el resultado de la consulta en la variable resultado
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"videoUrl":resultado[i].videoUrl,"nombreVideo":resultado[i].nombreVideo, "imagenVideo":resultado[i].imagenVideo, "descripcionVideo":resultado[i].descripcionVideo};
                    console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                res.json(arreglo); //Se retorna la respuesta, la cual es el arreglo de json
            }
        });
    }
});
});


// Peticion POST para ingresar una pregunta
router.post('/audiovisual/pregunta/new',(req, res) =>{
    console.log(req.body); // Muestra en consola los datos en formato jsoon que llego
    json1 = req.body; // Se almacena el json recibido en la variable json1
    connection.getConnection(function(error, tempConn){ //Conexión a mysql
        if(error){
            throw error;// En caso de error en la conexión
        } else{
            console.log('conexión correcta');
            tempConn.query('INSERT INTO pregunta VALUES (NULL, ?, ?, ?, ?, ?)', [json1.descripcionPreg, json1.opcionesPreg, json1.marcaTiempo, json1.opcionCorrecta, json1.id_PreguntaVid], function(error, result){
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


//Peticion GET para obtener todas las preguntas
router.get('/audiovisual/pregunta', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada registro que se lea, en formato json
    var arreglo = []; // Variable para almacenar todos los datos, en formato arreglo json

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log('Conexion Correcta');
        tempConn.query('SELECT * FROM pregunta', function(error, result){
            var resultado = result; // Se almace el resultado de la consulta en la variable resultado
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"descripcionPreg":resultado[i].descripcionPreg,"opcionesPreg":resultado[i].opcionesPreg, "marcaTiempo":resultado[i].marcaTiempo, "opcionCorrecta":resultado[i].opcionCorrecta, "id_PreguntaVid":resultado[i.id_PreguntaVid]};
                    console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                res.json(arreglo); //Se retorna la respuesta, la cual es el arreglo de json
            }
        });
    }
});
});

//Peticion GET para obtener las preguntas de acuerdo al id_Video

router.get('/audiovisual/pregunta/:id_PreguntaVid', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada registro que se lea, en formato json
    var arreglo = []; // Variable para almacenar todos los datos, en formato arreglo json
    var search = req.params.id_PreguntaVid;

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log('Conexion Correcta');
        tempConn.query('SELECT * FROM pregunta WHERE id_PreguntaVid = ?',[search], function(error, result){
            var resultado = result; // Se almace el resultado de la consulta en la variable resultado
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"descripcionPreg":resultado[i].descripcionPreg,"opcionesPreg":resultado[i].opcionesPreg, "marcaTiempo":resultado[i].marcaTiempo, "opcionCorrecta":resultado[i].opcionCorrecta, "id_PreguntaVid":resultado[i.id_PreguntaVid]};
                    console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                res.json(arreglo); //Se retorna la respuesta, la cual es el arreglo de json
            }
        });
    }
});
});


//Peticion POST para ingresar un concepto 


router.post('/audiovisual/concepto/new',(req, res) =>{
    console.log(req.body); // Muestra en consola los datos en formato jsoon que llego
    json1 = req.body; // Se almacena el json recibido en la variable json1
    connection.getConnection(function(error, tempConn){ //Conexión a mysql
        if(error){
            throw error;// En caso de error en la conexión
        } else{
            console.log('conexión correcta');
            tempConn.query('INSERT INTO concepto VALUES (NULL, ?, ?, ?)', [json1.descripcionConcepto, json1.imagenConcepto, json1.id_ConceptoVid], function(error, result){
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

//Peticion GET para obtener todas las conceptos

router.get('/audiovisual/concepto', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada registro que se lea, en formato json
    var arreglo = []; // Variable para almacenar todos los datos, en formato arreglo json

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log('Conexion Correcta');
        tempConn.query('SELECT * FROM concepto', function(error, result){
            var resultado = result; // Se almace el resultado de la consulta en la variable resultado
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"descripcionConcepto":resultado[i].descripcionConcepto,"imagenConcepto":resultado[i].imagenConcepto, "id_ConceptoVid":resultado[i].id_ConceptoVid};
                    console.log(json1); //Se muestra en consola el json
                    arreglo.push(json1); //Se añade el json al arreglo
                }
                res.json(arreglo); //Se retorna la respuesta, la cual es el arreglo de json
            }
        });
    }
});
});

//Peticion GET para obtener los conceptos referentes a un video

router.get('/audiovisual/concepto/:id_ConceptoVid', (req, res) =>{
    var json1 = {}; //Variable para almacenar cada registro que se lea, en formato json
    var arreglo = []; // Variable para almacenar todos los datos, en formato arreglo json
    var search = req.params.id_ConceptoVid

connection.getConnection(function(error, tempConn){
    if (error){
        throw error;
    }else{
        console.log('Conexion Correcta');
        tempConn.query('SELECT * FROM concepto WHERE id_ConceptoVid = ?',[search], function(error, result){
            var resultado = result; // Se almace el resultado de la consulta en la variable resultado
            if(error){
                throw error;
                res.send("error en la ejecucion del query");
            } else{
                tempConn.release(); //Se libera la conexion
                for(i=0; i<resultado.length; i++){
                    json1 = {"descripcionConcepto":resultado[i].descripcionConcepto,"imagenConcepto":resultado[i].imagenConcepto, "id_ConceptoVid":resultado[i].id_ConceptoVid};
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