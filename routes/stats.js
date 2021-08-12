var express = require('express');
var router = express.Router();
const Player = require('../models/player');

router.get('/', function(req, res) {
    const id = req.query.id;
    const token = req.query.token;

    if (token === null) {
        return res.status(401).send({errors: ['Brak tokena']});
    }
    
    Player.findOne({ _id: id }, function(err,obj) {
        if (err) console.log(err);
        
        if (obj === null) { 
            return res.status(400).send({errors: ['Brak id/złe dane']});
        }
        if (obj.token !== token) {
            return res.status(403).send({errors: ['Nieaktualny token']});
        } else {
            return res.status(200).send({avgWinTime: obj.getAvgTime, wins: obj.wins, losses: obj.losses})
        }
    });
});

router.post('/countGame', function(req, res) {
    const won = req.body.won;
    const time = req.body.time;
    const id = req.body.id;
    const token = req.body.token;

    if (req.query.token === null) {
        return res.status(401).send({errors: ['Brak tokena']});
    }

    Player.findOne({ _id: id }, function(err, obj) {
        if (err) console.log(err);
        
        if (obj === null) {
            return res.status(400).send({errors: ['Błędne id']});
        }
        if (obj.token !== token) {
            return res.status(403).send({errors: ['Nieaktualny token']});
        }

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

module.exports = router;