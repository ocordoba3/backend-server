var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAuth = require('../middlewares/auth');

var app = express();

var Usuario = require('../models/usuario');



//===========================
// Obtener (get) todos los usuarios
//===========================

app.get('/', (req, resp, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                if (err) {
                    // 500 internal server error
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                // 200 recurso OK
                resp.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });

            })

});





//=====================================
// Actualizar (put | patch) un usuario
//=====================================

app.put('/:id', mdAuth.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error obteniendo usuario',
                errors: err
            });
        }

        if (!usuario) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'El usuario con este id, NO EXISTE!',
                errors: { message: 'No hay usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            resp.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });


    });

});




//===========================
// Crear (post) un nuevo usuario
//===========================

app.post('/', mdAuth.verificaToken, (req, resp) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            // 400 Bad request
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error guardando usuario',
                errors: err
            });
        }

        // 201 recurso creado
        resp.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario

        });


    });

});



//==============================
// Eliminar (delete) un usuario
//==============================

app.delete('/:id', mdAuth.verificaToken, (req, resp) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario',
                errors: { message: 'No existe el usuario' }
            });
        }

        // 201 recurso creado
        resp.status(200).json({
            ok: true,
            usuario: usuarioBorrado

        });

    });

});



module.exports = app;