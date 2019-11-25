var needle = require('needle');
const cheerio = require('cheerio')

const url = 'http://kino.i.ua/afisha/';

var data = [];
let names = [];
let namesIndexes = [];
let theatres = [];
let prices = [];
let dates = [];
let pictures = [];
let links = [];

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

async function Initialize() {
    await getTitleListData().then(res => {
        data = res
    });
    getTitleNames();
    getTheatres();
    getPrices();
    getDates();

    await getLinks().then(res => {
        links = res
    });
    console.log(links);
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
                        || ($(link).attr('href').includes("film") && !$(link).attr('href').includes("people")))
                        {
                        r.push($(link).text() + ' ' +$(link).attr('href').toString());
                        resolve(r);
                    }
            });
        });
    }).then(res1 => {
        result = res1;
    });
    return result;
}

module.exports.Initialize = Initialize;