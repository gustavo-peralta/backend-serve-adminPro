var express = require('express');

var busqueda = express();

var Hospital = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuarios = require('../models/usuario');

// -------------------------------------------------------------------
// Busqueda por colección
// -------------------------------------------------------------------
busqueda.get('/coleccion/:tabla/:busqueda', (req, resp) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        default:
            return resp.status(400).json({
                ok: false,
                mensaje: 'Lo tipos de busqueda: solo son usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no valida' }
            });
    }

    promesa.then(data => {
        resp.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});

// -------------------------------------------------------------------
// Busqueda general
// -------------------------------------------------------------------
busqueda.get('/todo/:busqueda', (request, response, next) => {

    var busqueda = request.params.busqueda;

    // Para que no afecten las mayucuslas a la busqueda (Case sensitive) creamos un expresión regular que conviera el parametro introducido
    var regExp = new RegExp(busqueda, 'i'); // i para indicar que es insensible

    Promise.all([
            buscarHospitales(busqueda, regExp),
            buscarMedicos(busqueda, regExp),
            buscarUsuarios(busqueda, regExp)
        ])
        .then(respuestas => {
            response.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medicos.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuarios.find({}, 'nombre email role')
            .or([{ 'usuario': regex }, { 'email': regex }])
            .exec((error, usuarios) => {
                if (error) {
                    reject('Error al cargar usuarios', error);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = busqueda;