//css for the weather deatails .. i ahve changed the bottom to -10 instead of 30 or 40 px

const container = document.querySelector('.container');
const search = document.querySelector('.searchBox button');
const weatherBox = document.querySelector('.weatherBox');
const weatherDetails = document.querySelector('.weatherDetails');
const error404 = document.querySelector('.notFound');
const cityHide = document.querySelector('.cityHide');




search.addEventListener('click', () => {

    //api key
    const APIKey = '4fce85a429d333f9fd2e03ecc47c5c04';
    const city = document.querySelector('.searchBox input').value;




    //if satement 
    if (city == '')
        return;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`).then(response => response.json()).then(json => {
        

        if (json.cod == '404'){
            cityHide.textContent = city;
            container.style.height = '400px';
            weatherBox.classList.remove('active');
            weatherDetails.classList.remove('active');
            error404.classList.add('active');
            return;
        }

       

        const image = document.querySelector('.weatherBox img');
        const temperature = document.querySelector('.weatherBox .temperature');
        const description = document.querySelector('.weatherBox .description');
        const humidity = document.querySelector('.weatherDetails .info-humidity span');
        const wind = document.querySelector('.weatherDetails .info-wind span');

        if(cityHide.textContent == city){
            return
        }
        else{
            cityHide.textContent = city;

            container.style.height = '555px';
            container.classList.add('active');
            weatherBox.classList.add('active');
            weatherDetails.classList.add('active');
            error404.classList.remove('active');

            setTimeout(() => {
                container.classList.remove('active');
            }, 2500);



            switch (json.weather[0].main) {
                case 'Clear':
                    image.src = 'images/clear.png';
                    break;
    
                case 'Rain':
                    image.src = 'images/rain.png';
                    break;
    
                case 'Snow':
                    image.src = 'images/snow.png';
                    break;
    
                case 'Clouds':
                    image.src = 'images/cloud.png';
                    break;
    
                case 'Mist':
                    image.src = 'images/mist.png';
                    break;
    
                case 'Haze':
                    image.src = 'images/mist.png';
                    break;
                default:
                    image.src = 'images/cloud.png';
            }
    
    
            temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
    
            // make sure to uncomment the below line of code and check why it is not working
            //description.innerHTML = `${json.weather[0].description}`;
            humidity.innerHTML = `${json.main.humidity}%`;
            wind.innerHTML = `${parseInt(json.wind.speed)}Km/h`;


            const infoWeather = document.querySelector('.infoWeather');
            const infoHumidity = document.querySelector('.infoHumidity');
            const infoWind = document.querySelector('.infoWind');

            const elCloneInfoWeather = infoWeather.cloneNode(true);
            const elCloneInfoHumidity = infoHumidity.cloneNode(true);
            const elCloneInfoWind = infoWind.cloneNode(true);

            elCloneInfoWeather.id = 'cloneInfoWeather';
            elCloneInfoWeather.classList.add('activeClone');

            elCloneInfoHumidity.id = 'cloneInfoHumidty';
            elCloneInfoHumidity.classList.add('activeClone');

            elCloneInfoWind.id = 'cloneInfoWind';
            elCloneInfoWind.classList.add('activeClone');


            setTimeout(() => {
                infoWeather.insertAdjacentElement("afterend", elCloneInfoWeather);
                infoHumidity.insertAdjacentElement("afterend", elCloneInfoHumidity);
                infoWind.insertAdjacentElement("afterend", elCloneInfoWind);
            }, 2200);


        

            


            description.innerHTML = `${json.weather[0].description}`;//what I did is to bring it downward and let it run if it works
    
        }



        


    });
});