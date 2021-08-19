const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

router.post('/:id/sendDeleteEmail', (req, res) => {
    if (!req.params.id) return res.status(400).send({errors: ['Błędne dane']});
    
    const _id = req.params.id;

    Player.findOne({ _id }, (err, obj) => {
        if (err) return console.log(err);
        if (!obj) return res.status(400).send({errors: ['Bledne dane/zle id']});

        const token = Math.random().toString(36).substr(2);

        bcrypt.hash(token, 12, (err, token) => {
            if (err) return console.log(err);

            obj.deleteToken = token;
            obj.save();
        });
        
        async function main() {
          
            let testAccount = await nodemailer.createTestAccount();

            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            
            let info = await transporter.sendMail({
                from: '"Spike" <lukasz.piwowar1@protonmail.com>',
                to: "elo@elo.com", 
                subject: "Delete User Account - Minesweeper",
                text: `Enter link below to delete account \n http://localhost:8080/jsExercismCourse/deleteUser?token=${token}`, // plain text body
                html: `<p> Enter <a href="http://localhost:8080/jsExercismCourse/deleteUser?token=${token}">this link</a> to delete account.</p>`, 
            });
          
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
          
        main().catch(console.error);

        res.status(200).send('Wyslano mail');
        
    });
});

router.delete('/:id', (req, res) => {
    if (!req.params.id) return res.status(400).send({errors: ['Błędne dane']});
    
    const _id = req.params.id;

    Player.findOne({ _id }, (err, obj) => {
        if (err) return console.log(err);

        if (!req.query.token || !req.query.deleteToken) return res.status(400).send({errors: ['Bledne dane']});

        const token = req.query.token;
        const deleteToken = req.query.deleteToken;

        bcrypt.compare(token, obj.token, (err, result) => {
            if (err) return console.log(err);
            if (!result) return res.status(403).send({errors: ['Bledny token']});

            bcrypt.compare(deleteToken, obj.deleteToken, (err, result) => {
                if (err) return console.log(err);
                if (!result) return res.status(403).send({errors: ['Bledny token']});
    
                Player.remove({ _id }, (err) => {
                    if (err) return console.log(err);
                    return res.sendStatus(204);
                });
            });  
        });    
    });
});

module.exports = router;