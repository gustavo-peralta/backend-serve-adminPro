var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config.js').SEED;

var app = express();
var Usuario = require('../models/usuario');

// Google
// Las llaves que engloban OAuth2Client
// es una "deestructuración sencilla" de la libreria 'google-auth-library'
// extrae OAuth2Client de la libreria
var CLIENT_ID = require('../config/config.js').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// ------------------------------------------
// Autenticación google
// -------------------------------------------
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.img,
        google: true,
        //payload
    };
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(err => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación nomal'
                });
            } else {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    token: token,
                    usuario: usuarioDB,
                    id: usuarioDB._id
                });

            }
        } else {
            // El usuario no existe, hay que crearlo

            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                return res.status(500).json({
                    ok: true,
                    token: token,
                    usuario: usuarioDB,
                    id: usuarioDB._id
                });
            });
        }

    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!!',
    //     googleUser
    // });
});

// ------------------------------------------
// Autenticación normal
// -------------------------------------------
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