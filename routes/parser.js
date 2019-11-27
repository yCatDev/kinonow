var needle = require('needle');
const cheerio = require('cheerio');
const request = require('request');
var cyrillicToTranslit = require('cyrillic-to-translit-js');
const baseurl = 'http://kino.i.ua/afisha/?city=12201&date=';
let url = '';
const https = require('https');
var data = [];
let names = [];
let namesIndexes = [];
let theatres = [];
let prices = [];
let dates = [];
let pictures = [];
let links = [];
let current_date = "";
let htmlFilms = "";
let buyLinks = "";
var dateFormat = require('dateformat');

async function getTitleListData() {
    let res;
    await new Promise((resolve, reject) => {
        needle.get(url, function (err, res) {
            if (err)
                reject(err);
            const $ = cheerio.load(res.body);
            cheerioTableparser = require('cheerio-tableparser');
            cheerioTableparser($);
            resolve($("#timeTable").parsetable(true, true, true))
        });

    }).then(res1 => {
        res = res1;
    });
    return res;
}

function getTitleNames() {

    for (let i = 0; i < data[4].length; i++) {
        if (data[4][i][0] != undefined && !data[4][i].includes("грн.")) {
            
            names.push(data[4][i]);
            namesIndexes.push(i);
        }

    }
    namesIndexes.push(data[4].length);
}

function composeFilmButtonData() {
    let d = [];

    for (let i = 0; i < names.length; i++) {
        let buyLink = findLink(names[i]);                
        if (prices[i]!=0 && buyLink!=undefined)
        d.push(
            [names[i], mathMiddle(prices[i]), theatres[i].length,
            Array.from(new Set(dates[i])).slice(0, 3).join(',') + "...", buyLink]
        );
    }

    return d;
}
function findLink(name) {

   // console.log(' ');
    for (let j = 0; j < buyLinks.length; j++) {
       // console.log(`${buyLinks[j].split('@')[0]} = ${name}`);
        if (equals(buyLinks[j].split('@')[0], name) || buyLinks[j].split('@')[0].includes(name))
        {
            //console.log("Finded "+`https://vkino.ua${buyLinks[j].split('@')[1]}`);
            let res = `https://vkino.ua${buyLinks[j].split('@')[1]}`
            buyLinks.splice(j,1);
           return res;
        }
    }
}


async function getPicUrl(name) {
    let link = "http://kino.i.ua" + (links.find(a => a.includes(name)).split('@')[1]);

    await new Promise((resolve, reject) => {
        needle.get(link, function (err, res) {
            if (err)
                reject(err);
            const $ = cheerio.load(res.body);
            resolve($('.preview').find('img').attr('src'));
        });

    }).then(res1 => {
        link = res1;
    });
    return link;
}

function Contains(element, index, array) {
    if (array[index].includes(element))
        return true;
    else
        return false;
}

function mathMiddle(arr) {
    let res = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].length > 0)
            res += parseInt(arr[i].split(' ')[0]);
    }
    return Math.floor(res / arr.length);
}

function cleanup() {
    for (let i = 0; i < names.length; i++) {
        let check = names[i] != 'На сегодня показ фильма завершен' && prices[i] != undefined;

        if (!check) {

            names.splice(i, 1);
            dates.splice(i, 1);
            prices.splice(i, 1);
            theatres.splice(i, 1);

        }
    }
}

function reset() {
    data = [];
    names = [];
    namesIndexes = [];
    theatres = [];
    prices = [];
    dates = [];
    pictures = [];
    links = [];
    buyLinks = [];
}
function parallel(middlewares) {
    return function (req, res, next) {
        async.each(middlewares, function (mw, cb) {
            mw(req, res, cb);
        }, next);
    };
}
async function Initialize(date) {
    url += baseurl + date;
    current_date = date;
    //console.log(current_date);
    reset();
    console.log("Step 1: getting data");
    await getTitleListData().then(res => {
        data = res
    });

    console.log("Step 2: proccesing data");
    parallel([
        getTitleNames(),
        getTheatres(),
        getPrices(),
        getDates()
    ]);
    cleanup();
    console.log("Step 3: getting links");
    await getLinks().then(res => {
        links = res
    });
    if (buyLinks.length==0)
    await getBuyLink()
        .then(res => {
            buyLinks = res;
        });
        
    console.log("Step 4: returning films");
    htmlFilms = await composeFilmButtonHTML(composeFilmButtonData());
    return htmlFilms;
}

function getTheatres() {
    for (let i = 0; i < names.length - 1; i++) {
        theatres.push(data[1].slice(namesIndexes[i] + 1, namesIndexes[i + 1]));
    }

}

function getPrices() {

    for (let i = 0; i < names.length - 1; i++) {
        prices.push(data[4].slice(namesIndexes[i] + 1, namesIndexes[i + 1]));
    }
}

function getDates() {
    for (let i = 0; i < names.length - 1; i++) {
        dates.push(data[3].slice(namesIndexes[i] + 1, namesIndexes[i + 1]));
    }
}

async function getLinks() {
    let result = [];
    await new Promise((resolve, reject) => {
        needle.get(url, function (err, res) {
            if (err)
                reject(err);
            var $ = cheerio.load(res.body);
            cheerioTableparser = require('cheerio-tableparser');
            var links = $('a');
            let r = [];
            $(links).each(function (i, link) {
                if ($(link).attr('href') != undefined)
                    if ($(link).attr('href').includes("cinema")
                        || ($(link).attr('href').includes("film") && !$(link).attr('href').includes("people"))) {
                        r.push($(link).text() + '@' + $(link).attr('href').toString());
                        resolve(r);
                    }
            });
        });
    }).then(res1 => {
        result = res1;
    });
    return result;
}

async function getBuyLink() {
    let result = [];
    let url = `https://vkino.ua/ru/afisha/kharkov?date=${current_date}#`;
    await new Promise((resolve, reject) => {
        request(url, async function (err, res, body) {
            if (err)
                reject(err);
            //console.log(url);
            var $ = cheerio.load(body);
            let spans = $('span');
            let r = [];

            await $(spans).each(function (i, span) {
                
                if ($(span).parent().attr('class') == 'film-title')
                {                    
                    //console.log($(span).text());
                    r.push($(span).text() + '@' + $(span).parent().attr('href'));}
                
            });
        
            resolve(r);
        });
    }).then(res1 => {
        result = res1;
    });
   // console.log(result);
    return result;
}

function equals(str1, str2) {
    let c = 0;
    for (let i = 0; i < str2.length; i++) {

        if (str1[i] == str2[i])
            c++;
    }
    if (c >= str2.length / 2)
        return true;
    else{
        c = 0;
        for (let i = 0; i < str1.split(' ').length; i++) {
            if (str2.includes(str1.split(' ')[i]))
                c++;
        }
        return c >= str1.split(' ').length / 2;
    }
}

async function composeFilmButtonHTML(data) {
    let html = "";

    for (let i = 0; i < data.length; i++) {

        let img_link = "";

        let moreLink = "";


        await getPicUrl(data[i][0]).then(res => { img_link = res; });
        //console.log(data[i]);
        let string = [];
        string.push(`<div class="film-button">`);
        string.push(` <img src="${img_link}">`);
        string.push(`<div class="text">`);
        string.push(`   <div class="group">`);
        string.push(`        <p class="fb_desc_value">${data[i][0]}</p>`);
        string.push(`    </div>`);
        string.push(`    <br>`);
        string.push(`    <br>`);
        string.push(`    <div class="group">`);
        string.push(`        <p class="fb_desc">Середня ціна квитка: </p>`);
        string.push(`        <p class="fb_desc_value">${data[i][1]}</p>`);
        string.push(`    </div>`);
        string.push(`    <div class="group">`);
        string.push(`        <p class="fb_desc">Доступні кінотеатри: </p>`);
        string.push(`        <p class="fb_desc_value">${data[i][2]}</p>`);
        string.push(`    </div>`);
        string.push(`    <div class="group">`);
        string.push(`        <p class="fb_desc">Доступні кіносеанси: </p>`);
        string.push(`        <p class="fb_desc_value">${data[i][3]}</p>`);
        string.push(`    </div>`);
        string.push(`    <a href='${data[i][4]}' class="more"> Детальніше...</a>`);
        string.push(`</div>`);
        string.push(`</div>`);
        string.push(`<br>`);


        html += string.join('');
    }
    return html;
}



module.exports.Initialize = Initialize;
module.exports.htmlFilms = htmlFilms;
module.exports.composeFilmButtonData = composeFilmButtonData;
