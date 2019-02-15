var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SECRET = require('../config/config').SECRET;

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({email: body.email}, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: { message: 'Credenciales incorrectas'}
            });
        }

        if ( !bcrypt.compareSync(body.password, usuario.password) ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: { message: 'Credenciales incorrectas'}
            });
        }

        usuario.password = '';

        // Crear un token
        var token = jwt.sign({usuario: usuario}, SECRET, {expiresIn: 14400}); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            id: usuario._id
        });

    });

});

module.exports  = app;