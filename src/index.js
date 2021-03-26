/*
Archivo principal con llamado a las rutas de los servicios
Backend de los servicios de Civispartum
Version 1.0.0
*/
const express = require('express'); //Se indica que se requiere express
const app = express(); //Se inicia express y se indica en una constante llamada app
const morgan = require('morgan'); //Se indica que se requiere morgan

//Settings 

app.set('port', 3000); //Se define el puerto por el cual va a funcionar el servicio


//Utilities

app.use(morgan('dev')); //Se indica que se ultilizara morgan en modo dev
app.use(express.json()); //Se indica que se va a usar la funcionalidad para manejo de json de express


//Routes



//Start Server 

app.listen(app.get('port'), ()=> {
	console.log("Servidor funcionando");
}); //se inicia el servidor en el puerto definido y se pone un mensaje en la consola.

