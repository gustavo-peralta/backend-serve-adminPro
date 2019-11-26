var express = require('express');
var bcrypt = require('bcryptjs');
//var jwt = require('jsonwebtoken');
//var SEED = require('../config/config.js').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// =========================================
// Obtener todos los hospitales
// =========================================
app.get('/', (req, res, next) => {

    Medico.find({}, 'hospital nombre usuario')
        .exec((err, medicos) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medicos
            });
        });
});

// =========================================
// Crear un nuevo hospital
// =========================================
// Voy a recivir la información como parametro de un HTTTP POST
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body; // Esto solo funciona si tenemos instalado el body-parser

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicoToken: req.medico
        });
    });

});

// =========================================
// Actualizar un nuevo usuario
// =========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el ' + id + ' no existe',
                errors: { message: 'No existe ningún medico con este ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = body.usuario;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            //medicoGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// =========================================
// Eliminar un usuario
// =========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con este id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }


        res.status(200).json({
            ok: true,
            usuario: medicoBorrado
        });
    });
});

module.exports = app;