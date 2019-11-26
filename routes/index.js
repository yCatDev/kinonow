var express = require('express');
var router = express.Router();
var parser = require('./parser');
var dateFormat = require('dateformat');




var days = ['Неділя', 'Понеділок', 'Вторник', 'Середа', 'Четверг', 'Пятниця', 'Суббота'];






async function generatePage() {

  console.log("Init");

    router.get('/:date?', async function (req, res, next) {
      if (req.params.date == undefined)
        req.params.date = dateFormat(new Date(), "dd-mm-yyyy");
      await parser.Initialize(req.params.date).then( (htmlFilms) => {       
       var calendardates = [];
       var calendarnames = [];
       var date = new Date();
        for (let i = 0; i < 7; i++) {
          calendardates[i] = dateFormat(date, "dd-mm-yyyy");
          calendarnames[i] = days[date.getDay()];
          date.setDate(date.getDate() + 1);
      
        }    
        console.log("Drawing");
      res.render('index', {cdates: calendardates, cnames: calendarnames, html: htmlFilms, seldate: req.params.date });
    });
  });    
    console.log("Ready");
    
  
  
}
generatePage();

module.exports = router;
