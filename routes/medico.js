var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();

var Medico = require('../models/medico');



//====================================
// Obtener (get) todos los medicos
//====================================

app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0; // PAGINACIÓN
    desde = Number(desde); // PAGINACIÓN

    Medico.find({})
        .skip(desde) // PAGINACIÓN
        .limit(5) // PAGINACIÓN
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    // 500 internal server error
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    // 200 recurso OK
                    resp.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });

            });

});





//=====================================
// Actualizar (put | patch) un medico
//=====================================

app.put('/:id', mdAuth.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error obteniendo medico',
                errors: err
            });
        }

        if (!medico) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'El medico con este id, NO EXISTE!',
                errors: { message: 'No hay medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {

            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            resp.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });


    });

});




//================================
// Crear (post) un nuevo medico
//================================

app.post('/', mdAuth.verificaToken, (req, resp) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital

    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            // 400 Bad request
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error creando medico',
                errors: err
            });
        }

        // 201 recurso creado
        resp.status(201).json({
            ok: true,
            medico: medicoGuardado
        });


    });

});



//==============================
// Eliminar (delete) un medico
//==============================

app.delete('/:id', mdAuth.verificaToken, (req, resp) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe el medico',
                errors: { message: 'No existe el medico' }
            });
        }

        // 201 recurso creado
        resp.status(200).json({
            ok: true,
            medico: medicoBorrado

        });

    });

});



module.exports = app;