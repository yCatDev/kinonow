var express = require('express');
var router = express.Router();
var parser = require('./parser');
var dateFormat = require('dateformat');




var days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятниця', 'Суббота'];






function generatePage() {

  console.log("Init");

  router.get('/:date?', async function (req, res, next) {
    let htmlCode = '';
    if (req.params.date == undefined)
      req.params.date = dateFormat(new Date(), "dd-mm-yyyy");
    await parser.Parse(req.params.date).then((htmlFilms) => {
      htmlCode = htmlFilms;
    });
    var calendardates = [];
    var calendarnames = [];
    var date = new Date();
    for (let i = 0; i < 7; i++) {
      
      calendardates[i] = dateFormat(date, "dd-mm-yyyy");
      calendarnames[i] = days[date.getDay()];
      date.setDate(date.getDate() + 1);
    }
    console.log("Drawing");
    res.render('index', { cdates: calendardates, cnames: calendarnames, html: htmlCode, seldate: req.params.date });
  });
  console.log("Ready");



}
generatePage();


module.exports = router;
