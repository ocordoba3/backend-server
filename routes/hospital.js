var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();

var Hospital = require('../models/hospital');



//====================================
// Obtener (get) todos los hospitales
//====================================

app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0; // PAGINACIÓN
    desde = Number(desde); // PAGINACIÓN

    Hospital.find({})
        .skip(desde) // PAGINACIÓN
        .limit(5) // PAGINACIÓN
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    // 500 internal server error
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    // 200 recurso OK
                    resp.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });

            });

});





//=====================================
// Actualizar (put | patch) un hospital
//=====================================

app.put('/:id', mdAuth.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error obteniendo hospital',
                errors: err
            });
        }

        if (!hospital) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'El hospital con este id, NO EXISTE!',
                errors: { message: 'No hay hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            resp.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });


    });

});




//================================
// Crear (post) un nuevo hospital
//================================

app.post('/', mdAuth.verificaToken, (req, resp) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            // 400 Bad request
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error creando hospital',
                errors: err
            });
        }

        // 201 recurso creado
        resp.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });


    });

});



//==============================
// Eliminar (delete) un hospital
//==============================

app.delete('/:id', mdAuth.verificaToken, (req, resp) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital',
                errors: { message: 'No existe el hospital' }
            });
        }

        // 201 recurso creado
        resp.status(200).json({
            ok: true,
            hospital: hospitalBorrado

        });

    });

});



module.exports = app;