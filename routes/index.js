var express = require('express');
var router = express.Router();
var parser = require('./parser');



var output = "";
var calendardates = [];
var calendarnames = [];

var days = ['Неділя', 'Понеділок', 'Вторник', 'Середа', 'Четверг', 'Пятниця', 'Суббота'];
var date = new Date();





async function generatePage() {

  console.log("Init");
  await parser.Initialize().then( (htmlFilms) => {
    for (let i = 0; i < 7; i++) {
      calendardates[i] = "Дата " + date.toISOString().substring(0, 10);
      calendarnames[i] = days[date.getDay()];
      date.setDate(date.getDate() + 1);
  
    }           
    console.log("Drawing");
    router.get('/', function (req, res, next) {
      res.render('index', { title: output, cdates: calendardates, cnames: calendarnames, html: htmlFilms });
    });
    
  });
  
}
generatePage();

module.exports = router;
