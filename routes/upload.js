var express = require('express');

var fileUpload = require('express-fileupload');

// Libreria File System para poder borrar ficheros
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipoImagen/:id', (request, response, next) => {

    var tipoImagen = request.params.tipoImagen;
    var id = request.params.id;

    // Tipos de coleccion validos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipoImagen) < 0) {
        response.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valido',
            errors: { message: 'Tipo de coleccion no es valido' }
        });
    }

    // Validación de si se ha enviado un archivo
    if (!request.files) {

        response.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre de archivo para validar si es una imagen
    var archivo = request.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        response.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo}`;

    // Mover el archivo del temporal a una ruta especifica.
    var path = `./uploads/${ tipoImagen }/${ nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            response.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        // Actualizo el registro de la Bd con la imagen
        subirPorTipoImagen(tipoImagen, id, nombreArchivo, response);

        // response.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });
    });

});

function subirPorTipoImagen(tipoImagen, id, nombreArchivo, response) {

    switch (tipoImagen) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {

                if (!usuario) {
                    return response.status(400).json({
                        ok: true,
                        mensaje: 'Usuario no existe',
                        errors: { message: 'Usuario no existe' }
                    });
                }

                var pathViejo = './uploads/usuarios/' + usuario.img;

                // Si la imagen existe ya en el path se borra
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                // Subir la imagen nueva o actual
                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {

                    usuarioActualizado.password = ':)';

                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });
            });
            return;
        case 'medicos':
            Medico.findById(id, (err, medico) => {

                if (!medico) {
                    return response.status(400).json({
                        ok: true,
                        mensaje: 'Médico no existe',
                        errors: { message: 'Médico no existe' }
                    });
                }

                var pathViejo = './uploads/medicos/' + medico.img;

                // Si la imagen existe ya en el path se borra
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                // Subir la imagen nueva o actual
                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {

                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });
                });
            });
            return;

        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {

                if (!hospital) {
                    return response.status(400).json({
                        ok: true,
                        mensaje: 'Hospital no existe',
                        errors: { message: 'Hospital no existe' }
                    });
                }

                var pathViejo = './uploads/hospitales/' + hospital.img;

                // Si la imagen existe ya en el path se borra
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                // Subir la imagen nueva o actual
                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {
                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });
                });
            });
            return;
        default:
            break;
    }

}

module.exports = app;