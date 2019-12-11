var express = require('express');
var bcrypt = require('bcryptjs');
//var jwt = require('jsonwebtoken');
//var SEED = require('../config/config.js').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// =========================================
// Obtener todos los usuarios
// =========================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5) // funciones de mongoose
        .exec((err, usuarios) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            // Contar el numero de resgistros
            Usuario.countDocuments({}, (err, count) => {

                response.status(200).json({
                    ok: true,
                    usuarios,
                    total: count
                });

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
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});

// =========================================
// Actualizar un nuevo usuario
// =========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el ' + id + ' no existe',
                errors: { message: 'No existe ningún usuario con este ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.rol = body.rol;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// =========================================
// Eliminar un usuario
// =========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con este id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }


        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;