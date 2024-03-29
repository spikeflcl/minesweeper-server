const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    
    if (!req.query.token) {
        return res.status(401).send({errors: ['Brak tokena']});
    }

    const _id = req.query.id;

    Player.findOne({ _id }, (err,obj) => {
        if (err) return console.log(err);
        
        if (!obj) { 
            return res.status(400).send({errors: ['Brak id/złe dane']});
        }
        
        bcrypt.compare(req.query.token, obj.token, (err, result) => {
            if (err) console.log(err);
            if (!result) return res.status(403).send({errors: ['Nieaktualny token']});
                
            return res.status(200).send({avgWinTime: obj.getAvgTime, wins: obj.wins, losses: obj.losses});
        });
    });
});

router.post('/countGame', (req, res) => {
    if (!req.body.token) {
        return res.status(401).send({errors: ['Brak tokena']});
    }

    const won = req.body.won;
    const time = req.body.time;
    const id = req.body.id;
    const token = req.body.token;


    Player.findOne({ _id: id }, (err, obj) => {
        if (err) return console.log(err);
        
        if (!obj) {
            return res.status(400).send({errors: ['Błędne id']});
        }
        bcrypt.compare(token, obj.token, (err, result) => {
            if (err) console.log(err);
            if (!result) return res.status(403).send({errors: ['Nieaktualny token']});
           
            if (won) {
                ++obj.wins;
                obj.gameTimes.push(time);
            } else {
                ++obj.losses;
            }
            obj.save();

            return res.sendStatus(200);
        });

    });
    
});

module.exports = router;