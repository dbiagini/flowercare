//get weather on DOM load
document.addEventListener('DOMContentLoaded', paintTab);

function paintTab(){
    const plantName =  document.getElementById('w-plantName');
    plantName.textContent =  plants[0].name;
    //this.desc.textContent = weather.weather[0].description;
    //this.string.textContent =  weather.main.temp+' °C';
    //this.details =  document.getElementById('w-details');
    
    //this.icon.setAttribute('src', "http://openweathermap.org/img/w/" + weather.weather[0].icon + ".png");
    //this.humidity =  document.getElementById('w-humidity');
    //this.humidity.textContent =  `Relative Humidity: ${weather.main.humidity} %`;
}



