//get weather on DOM load
document.addEventListener('DOMContentLoaded', paintTab);

function paintTab(){
    const plantName =  document.getElementById('w-plantName');
    plantName.textContent =  plants[0].name;

    const sunlight  =  document.getElementById('w-sunlight-value');
    sunlight.textContent = plants[0].sunlight[0]+'Lux';
    const moisture  =  document.getElementById('w-moisture-value');
    moisture.textContent = plants[0].moisture[0]+'%';
    const fertility  =  document.getElementById('w-fertility-value');
    fertility.textContent = plants[0].fertility[0]+'uS/cm';
    const temperature  =  document.getElementById('w-temperature-value');
    temperature.textContent = plants[0].temperature[0]+'C';
    const battery  =  document.getElementById('w-battery-value');
    battery.textContent = plants[0].battery[0]+'%';

}



