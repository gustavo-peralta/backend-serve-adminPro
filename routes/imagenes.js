var express = require('express');

var app = express();

// Libreria de NodeJS para crear path de manera sencilla y valida
const path = require('path');
// Libreria para verificar si una imagen existe en un path
const fs = require('fs');

// Rutas
app.get('/:tipo/:img', (request, response, next) => {

    var tipo = request.params.tipo;
    var img = request.params.img;

    // __dirname almacena la ruta actual
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo}/${ img }`);
    console.log(pathImagen);

    // Función del fs (File system) que verifica si un path es valido
    if (fs.existsSync(pathImagen)) {
        response.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        response.sendFile(pathNoImage);
    }



});

module.exports = app;