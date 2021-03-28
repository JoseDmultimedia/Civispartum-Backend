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


module.exports = router;