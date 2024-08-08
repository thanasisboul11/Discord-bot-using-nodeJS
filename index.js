const {Client,GatewayIntentBits} = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent]
});

const token = process.env.DISCORD_TOKEN;
const weatherApiKey = process.env.OPENWEATHER_API_KEY;
const omdbApiKey = process.env.OMDB_API_KEY;
const googleApiKey = process.env.GOOGLE_BOOKS_API_KEY;

client.once('ready', ()=>{
    console.log('Bot is online !');
});

client.on('messageCreate',async message =>{
    if(message.author.bot) return;
    
    const weatherPrefix = '!weather';
    const moviePrefix = '!movies';
    const bookPrefix = '!book';

    if(message.content.startsWith(weatherPrefix)){
        const args = message.content.slice(weatherPrefix.length).trim().split(' ');
        if(args.length !==2){
            return message.reply('Usage: !weather <city> <YYYY-MM-DD>');
        }
        const city = args[0];
        const date = args[1]

        try{
            const weatherData = await getWeatherData(city,date);
            message.reply(weatherData);
        }catch(error){
            message.reply('Sorry, I could not retrieve the weather data.');
            console.error(error);
        }
    }else if (message.content.startsWith(moviePrefix)){
        const args = message.content.slice(moviePrefix.length).trim().split(' ');
        if(args.length < 1){
            return message.reply('Usage: !movies <movie name>');
        }
        const movieName = args.join(' ');

        try{
            const movieData = await getMovieData(movieName);
            message.reply(movieData);
        }catch(error){
            message.reply('Sorry, I could not retrieve the movie data');
            console.log(error);
        }
    }else if(message.content ==='!pef'){
        message.reply('POG');
    }else if(message.content.startsWith(bookPrefix)){
        const args = message.content.slice(bookPrefix.length).trim().split(' ');
        if(args <1){
            return message.reply('Usage: !book <book title>');
        }
        const bookName = args.join(' ');

        try{
            const bookData = await getBookData(bookName);
            message.reply(bookData);
        }catch(error){
            message.reply('Sorry I could not retrieve the movie data');
            console.log(error);
        }
    }
});

async function getMovieData(movieName){
    const url = `http://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=${omdbApiKey}`;
    const response = await axios.get(url);
    const data = response.data;

    if(data.Response ==='False'){
        throw new Error('No movie data available !')
    }
    return `Movie Details:
    -Title: ${data.Title}
    -Actors: ${data.Actors}
    -Year: ${data.Year}
    -Rated: ${data.Rated}
    -Runtime: ${data.Runtime}
    -Director: ${data.Director}
    -Writer: ${data.Writer}
    -Language: ${data.Language}
    -Plot: ${data.Plot}
    -Website: ${data.Website}
    -Awards: ${data.Awards}
    `
}


async function getWeatherData(city,date){
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;
    const forecast = data.list.find(entry => entry.dt_txt.startsWith(date));

    if(!forecast){
        throw new Error('no weather data available for this date !');
    }

    const weatherDescription = forecast.weather[0].weatherDescription
    const temperature = forecast.main.temp;
    const humidity = forecast.main.humidity;
    const windSpeed = forecast.wind.speed;

    return `Weather in ${city} on date ${date}:
    -Description: ${weatherDescription}
    -Temperature: ${temperature} °C
    -Humidity: ${humidity}
    -Wind speed: ${windSpeed} m/s`;
}




async function getBookData(bookName) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookName)}&key=${googleApiKey}`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data.items || data.items.length === 0) {
        throw new Error('No book data available!');
    }

    const maxBooks = 5;
    let bookDetails = 'Books found:\n';
    data.items.slice(0, maxBooks).forEach((book, index) => {
        const bookId = book.id;
        bookDetails += `\n${index + 1}. Book details:
        - Link: http://localhost:3000/book/${bookId}
        - Title: ${book.volumeInfo.title}
        - Author(s): ${book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'N/A'}
        - Publisher: ${book.volumeInfo.publisher}
        - Published date: ${book.volumeInfo.publishedDate}
        - Pages: ${book.volumeInfo.pageCount}
        `;
    });

    return bookDetails;
}



client.login(token);