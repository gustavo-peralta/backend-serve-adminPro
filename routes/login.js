var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config.js').SEED;

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, resp) => {

    var body = req.body;

    // Verifico si existe un usuario con ese email
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        // Validación de si viene un error
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioDB) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        // Si llegamos a este punto es que el usuario escribio bien su email

        // Con la función de bcrypt comparamos contraseñas
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token JWT (Json Web Token)
        // Libreria jsonwebtoken github

        // Quito password de la respuesta
        usuarioDB.password = ':)';

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        resp.status(200).json({
            ok: true,
            token: token,
            usuario: usuarioDB,
            id: usuarioDB._id
        });

    });

});





module.exports = app;