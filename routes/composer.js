

function composeFilmButtonHTML(data)
{
    let html = "";

    for (let i = 0; i<data.length; i++)
    {
        let string = []; 
        string.push(`<div class="film-button">`);
        string.push(` <img src="test.jpg">`);
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
        string.push(`    <br>`);        
        string.push(`    <p class="more">Натисніть для детальнішої інформації</p>`);
        string.push(`</div>`);
        string.push(`</div>`);
        string.push(`</div>`);

        html+=string.join('');
    }
    return html;
}

//module.exports.composeFilmButtonHTML = composeFilmButtonHTML;