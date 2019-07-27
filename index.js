'use strict';

const apiKey = 'a2abe20515614ec78c50f36ed75ae4ee';
const weatherKey = '33e3423da0904e1da3f4de0f590e53e7';
const searchNewsURL = 'https://newsapi.org/v2/everything';
const weatherURL = `https://api.darksky.net/forecast/`
const getLatLngURL = 'https://get.geojs.io/v1/ip/geo.json';


const weatherData = {
    lat: "",
    lng: "",
    city: "",
    state: "",
    country: "",
    pressure: "",
    humidity: "",
    currentTemp: "",
    summary: "",
    ozone: "",
    lowTemp: "",
    highTemp: "",
    visibility: "",
    precipIntensity: "",
    windSpeed: "",
    uvIndex: ""

}

function getLatLong() {
    console.log('getLatLong ran')
    console.log(getLatLngURL);
    fetch(getLatLngURL)
        .then(response => {
            return response.json();
        })
        .then(responseJson => {
            displayLatLng(responseJson)
            getLocalWeather()
        });
}

function displayLatLng(responseJson) {

    weatherData.lat = responseJson.latitude;
    weatherData.lng = responseJson.longitude;
    weatherData.city = responseJson.city;
    weatherData.state = responseJson.region;
    weatherData.country = responseJson.country;
    console.log(weatherData.lat, weatherData.lng, weatherData.city, weatherData.state, weatherData.country);
}

function getLocalWeather() {
    console.log('local weather ran');
    console.log('latitude', weatherData.lat);
    console.log('longitude', weatherData.lng);

    const url = 'https://cors-anywhere.herokuapp.com/' + weatherURL + weatherKey + '/' + weatherData.lat + ',' + weatherData.lng;

    console.log(url);
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayWeather(responseJson))
        .catch(err => {
            $('.js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function displayWeather(responseJson) {
    weatherData.currentTemp = responseJson.currently.apparentTemperature;
    weatherData.humidity = responseJson.currently.humidity;
    weatherData.summary = responseJson.daily.summary;
    weatherData.ozone = responseJson.currently.ozone;
    weatherData.highTemp = responseJson.daily.data["0"].temperatureHigh;
    weatherData.lowTemp = responseJson.daily.data["0"].temperatureLow;
    weatherData.pressure = responseJson.currently.pressure;
    weatherData.visibility = responseJson.currently.visibility;
    weatherData.precipIntensity = responseJson.currently.precipIntensity;
    weatherData.windSpeed = responseJson.currently.windSpeed;
    weatherData.uvIndex = responseJson.currently.uvIndex;
    console.log(weatherData);

    $('#weather').html(
        `
    <div class="weather-box">
        <ul>
            <p>Today in ${weatherData.city}, ${weatherData.state} </p>
            <li class=" temperature">${weatherData.currentTemp}<span> &#8457;</span></li>
              
                <li class="info temp">High: ${weatherData.highTemp}<span> &#8457;</span></li>
                <li class="info temp">Low: ${weatherData.lowTemp}<span> &#8457;</span></li>
                <li class="info extra">Humidity ${weatherData.humidity}%</li>
                <li class="info extra">
                ${weatherData.windSpeed} mph</li>
                <li class="info extra">Precipitation: ${weatherData.precipIntensity}%</li>     
                <li>${weatherData.summary}</li>
            </div>

        </ul>
    </div>`)
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function displayResults(responseJson, maxResults) {
    // if there are previous results, remove them
    console.log(responseJson);
    $('.results-list').empty();
    // iterate through the articles array, stopping at the max number of results
    for (let i = 0; i < responseJson.articles.length & i < maxResults; i++) {

        $('.results-list').append(
            `<li class="box"><h3><a href="${responseJson.articles[i].url}">${responseJson.articles[i].title}</a></h3>
        <p>Source: ${responseJson.articles[i].source.name}</p>
        <p>${responseJson.articles[i].description}</p>
        <img src='${responseJson.articles[i].urlToImage}'>
      </li>`)
    };
    //display the results section  
    $('#results').removeClass('hidden');
};

function getNews(query, maxResults = 100) {
    console.log('query', query);
    const params = {
        q: query,
        language: "en",
    };
    const queryString = formatQueryParams(params)
    const url = searchNewsURL + '?' + queryString;

    // console.log(url);

    const options = {
        headers: new Headers({
            "X-Api-Key": apiKey
        })
    };

    fetch(url, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson, maxResults))
        .catch(err => {
            $('.js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-search-term').val();
        const maxResults = $('#js-max-results').val();
        getNews(searchTerm, maxResults);
    });
}


function navEvent() {
    $('#menuToggle').on('click', '.nav-li', function (event) {
        console.log('nav-li clicked')
        const searchTerm = $(this)[0].innerText;
        console.log('attr', searchTerm);
        getNews(searchTerm, 10)

        if (searchTerm == 'Local news'){
            const searchTerm = weatherData.city;
            console.log('attr', searchTerm);
            getNews(searchTerm, 10)
        }
    })

}


function bindEventListeners() {
    navEvent();
    watchForm();
    getLatLong();
    getNews('environmental news', 10);
}


$(bindEventListeners);
