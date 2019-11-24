var jwt = require('jsonwebtoken');

var SEED = require('../config/config.js').SEED;



// =========================================
// Verificar token - middleware para todo pase por aqui antes
// =========================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    // Verifico la valided del token
    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
}