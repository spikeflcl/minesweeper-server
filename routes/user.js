const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const nodemailer = require('nodemailer');

// POST /api/user/{user.id}/sendDeleteEmail - 
// wysłanie mail z linkiem 
// http://localhost:8080/jsExercismCourse/deleteUser?token={user.deleteToken} 204


router.post('/:id/sendDeleteEmail', (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({errors: ['Błędne dane']});
    }

    const userID = req.params.id;

    Player.findOne({ _id: userID }, (err, obj) => {
        if (err) return console.log(err);
        if (!obj) return res.status(400).send({errors: ['Bledne dane/zle id']});

        const token = Math.random().toString(36).substr(2);
        obj.deleteToken = token;
        
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
              to: "dupa@dupa.com", 
              subject: "Delete User Account - Minesweeper",
              text: `Enter link below to delete account \n http://localhost:8080/jsExercismCourse/deleteUser?token=${token}`, // plain text body
              html: `<p> Enter <a href="http://localhost:8080/jsExercismCourse/deleteUser?token=${token}">this link</a> to delete account.</p>`, 
            });
          
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          }
          
        main().catch(console.error);
        
        obj.save();

        res.status(200).send('Wyslano mail');
        
    });
});

// DELETE /api/user/{user.id}?token={user.token}&deleteToken={user.deleteToken} - 204

router.delete('/:id', (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({errors: ['Błędne dane']});
    }
    
    const id = req.params.id;

    Player.findOne({ _id: id }, (err, obj) => {
        if (err) return console.log(err);

        if (!req.query.token || !req.query.deleteToken) return res.status(400).send({errors: ['Bledne dane']});

        const token = req.query.token;
        const deleteToken = req.query.deleteToken;

        if ( obj.token === token && obj.deleteToken === deleteToken) {
            Player.remove({ _id: id }, (err) => {
                if (err) return console.log(err);
                res.status(204).send('Successful deletion');
            });
        }
    })
});

module.exports = router;