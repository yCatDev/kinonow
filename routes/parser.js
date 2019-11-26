var needle = require('needle');
const cheerio = require('cheerio')
var cyrillicToTranslit = require('cyrillic-to-translit-js');
const baseurl = 'http://kino.i.ua/afisha/?city=12201&date=';
let url = '';

var data = [];
let names = [];
let namesIndexes = [];
let theatres = [];
let prices = [];
let dates = [];
let pictures = [];
let links = [];

let htmlFilms = "";

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
        if (isNaN(parseInt(data[4][i][0])) && data[4][i][0] != undefined) {
            names.push(data[4][i]);
            namesIndexes.push(i);
        }

    }
    namesIndexes.push(data[4].length);
}

function composeFilmButtonData() {
    let d = [];

    for (let i = 0; i < names.length; i++) {

        d.push(
            [names[i], mathMiddle(prices[i]), theatres[i].length,
            Array.from(new Set(dates[i])).slice(0, 5).join(',') + "..."
            ]
        );

    }

    return d;
}
function composeFilmWindowData() {
    let d = [];

    for (let i = 0; i < names.length; i++) {

        d.push(
            [names[i], mathMiddle(prices[i]), theatres[i].length,
            Array.from(new Set(dates[i])).slice(0, 5).join(',') + "...",
            theatres[i], prices[i]]
        );

    }

    return d;
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



async function composeFilmButtonHTML(data) {
    let html = "";

    for (let i = 0; i < data.length; i++) {
        let img_link = "";
        
        let moreLink = "https://vkino.ua/ua/show/"+cyrillicToTranslit()
        .transform(
            data[i][0]).replace(' ','-')+"/kharkov";

        await getPicUrl(data[i][0]).then(res => { img_link = res; });
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
        string.push(`    <a href='${moreLink}' class="more"> Детальніше...</a>`);
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
 