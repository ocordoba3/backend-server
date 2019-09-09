var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ======================
// Busqueda general
// ======================

app.get('/todo/:busqueda', (req, resp, next) => {

    var busqueda = req.params.busqueda;
    var regExp = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regExp),
            buscarMedicos(busqueda, regExp),
            buscarUsuarios(busqueda, regExp)
        ])
        .then(respuestas => {
            resp.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

function buscarHospitales(busqueda, regExp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regExp })
            .populate('usuario', 'nombre')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error en la busqueda de hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regExp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regExp })
            .populate('usuario', 'nombre')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error en la busqueda de medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regExp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regExp }, { 'email': regExp }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error en la busqueda de usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}


// ======================
// Busqueda por medico
// ======================
app.get('/coleccion/:tabla/:busqueda', (req, resp) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regExp = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regExp);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regExp);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regExp);
            break;

        default:
            return resp.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos, hospitales',
                error: { message: 'Tipo de tabla/coleccion NO válido' }

            });
    }

    promesa.then(data => {
        resp.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});


module.exports = app;