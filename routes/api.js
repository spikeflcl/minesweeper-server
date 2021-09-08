const express = require('express');
const router = express.Router();
const statsRouter = require('./stats');
const userRouter = require('./user');
const Player = require('../models/player');
const bcrypt = require('bcrypt');

router.use('/stats', statsRouter);
router.use('/user', userRouter);

router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    Player.findOne({ username }, (err, obj) => {
        if (err) return console.log(err);
    
        if (obj) {
            return res.status(400).send({errors: ['Nazwa już zajęta.']});
        }

        if (password.length < 8 || !/\d/.test(password)) {
            return res.status(400).send({errors: ["Hasło musi mieć minimum 8 znaków i 1 cyfrę."]})
        }
        bcrypt.hash(password, 12, (err, password) => {
            if (err) return console.log(err);

            const player = new Player({username, password});
            player.save();
            return res.status(201).send({id: player._id});                    
        })
    });
})


router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    Player.findOne({ username }, (err, obj) => {
        if (err) return console.log(err);

        if (!obj || obj.username !== username) {
            return res.status(400).send({errors: ['Błędny login lub hasło']});
        }

        bcrypt.compare(password, obj.password, (err, result) => {
            if (err) console.log(err);

            if (!result) return res.status(400).send({errors: ['Błędny login lub hasło']});
                
            const token1 = Math.random().toString(36).substr(2);
            const token2 = Math.random().toString(36).substr(2);
            const token = token1 + token2;

            bcrypt.hash(token, 12, (err, hash) => {
                if (err) return console.log(err);
                obj.token = hash;
                
                obj.save();

                return res.status(200).send({id: obj._id, token, username: obj.username});
            });

            // setTimeout( () => {
            //     obj.token = null;
            //     obj.save();
            // }, 10000);
            
        });
    });
});

module.exports = router;
