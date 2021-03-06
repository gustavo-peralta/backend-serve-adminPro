var express = require('express');
var bcrypt = require('bcryptjs');
//var jwt = require('jsonwebtoken');
//var SEED = require('../config/config.js').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// =========================================
// Obtener todos los hospitales
// =========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'hospital nombre usuario')
        .skip(desde)
        .limit(5) // funciones de mongoose
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            // Contar el numero de resgistros
            Hospital.countDocuments({}, (err, count) => {

                res.status(200).json({
                    ok: true,
                    hospitales,
                    total: count
                });

            });


        });
});

// =========================================
// Crear un nuevo hospital
// =========================================
// Voy a recivir la información como parametro de un HTTTP POST
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body; // Esto solo funciona si tenemos instalado el body-parser

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitalToken: req.hospital
        });
    });

});

// =========================================
// Actualizar un nuevo usuario
// =========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el ' + id + ' no existe',
                errors: { message: 'No existe ningún hospital con este ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = body.usuario;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            hospitalGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// =========================================
// Eliminar un usuario
// =========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con este id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }


        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });
    });
});

module.exports = app;