var express = require('express');

var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// ==============================
// Obtener todos los médicos
// ==============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando médicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });
                
            }
        );
    
});

// ==============================
// Crear nuevo médico
// ==============================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    Hospital.findById( body.hospital, (err, hospital) => {

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
                mensaje: 'El hospital con el id ' + body.hospital + ' no existe',
                errors: { message: 'No existe un hospital con ese id'}
            });
        }

        var medico = new Medico({
            nombre: body.nombre,
            img: body.img,
            usuario: req.usuario,
            hospital: hospital
        });

        medico.save( ( err, medicoGuardado ) => {
            
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear médico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

// ==============================
// Actualizar médico
// ==============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, (err, medico) => {
    
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese id'}
            });
        }

        Hospital.findById( body.hospital, (err, hospital) => {

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
                    mensaje: 'El hospital con el id ' + body.hospital + ' no existe',
                    errors: { message: 'No existe un hospital con ese id'}
                });
            }

            medico.nombre = body.nombre;
            medico.hospital = hospital;

            medico.save( ( err, medicoGuardado ) => {
            
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar médico',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medico: medicoGuardado
                });
        
            });

        });

    });

});

// ==============================
// Eliminar médico
// ==============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar médico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});

module.exports = app;