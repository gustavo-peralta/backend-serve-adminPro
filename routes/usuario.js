var express = require('express');

var app = express();

var Usuario = require('../models/usuario');

// =========================================
// Obtener todos los usuarios
// =========================================
app.get('/', (request, response, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }
                response.status(200).json({
                    ok: true,
                    usuarios
                });
            });


    // response.status(200).json({
    //     ok: true,
    //     mensaje: 'Get de usuarios'
    // });
});

// =========================================
// Crear un nuevo usuario
// =========================================
// Voy a recivir la información como parametro de un HTTTP POST
app.post('/', (req, res) => {

    var body = req.body; // Esto solo funciona si tenemos instalado el body-parser

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password,
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al crar usuario',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });

    });

});


module.exports = app;