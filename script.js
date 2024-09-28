// Initialize the date for the data summary section
const currentDate = new Date().toLocaleDateString();
document.getElementById("date-updated").innerText = currentDate;

// Chart.js setup for the COVID-19 graph
const ctx = document.getElementById('covidGraph').getContext('2d');
const covidGraph = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['2020', '2021', '2022', '2023', '2024'], // Years
        datasets: [
            {
                label: 'Confirmed Cases',
                data: [1000000, 50000000, 200000000, 500000000, 704753890], // Rising trend
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true
            },
            {
                label: 'Recovered',
                data: [500000, 25000000, 150000000, 400000000, 675619811], // Rising trend
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            },
            {
                label: 'Deaths',
                data: [50000, 1000000, 5000000, 7000000, 7010681], // Rising trend
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString(); // Format numbers with commas
                    }
                }
            }
        }
    }
});



// News carousel slide functionality
let slideIndex = 0;
const slidesPerGroup = 1; // Define the number of news cards per group

function moveSlide(n) {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.news-slide');
    const totalSlides = slides.length;

    // Calculate the total number of groups
    const totalGroups = Math.ceil(totalSlides / slidesPerGroup);

    // Update the slide index for group navigation
    slideIndex += n;
    if (slideIndex >= totalGroups) {
        slideIndex = 0;
    } else if (slideIndex < 0) {
        slideIndex = totalGroups - 1;
    }

    // Move the track to display the next group of slides
    const groupWidth = track.offsetWidth; // Get the width of the carousel track
    track.style.transform = `translateX(-${slideIndex * groupWidth}px)`;
}

// Initialize the map and set its view to a global level
var map = L.map('map').setView([20, 0], 2);

// Load map tiles from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// Fetch live COVID-19 data from disease.sh API
fetch('https://disease.sh/v3/covid-19/countries')
    .then(response => response.json())
    .then(covidData => {
        
        // Load GeoJSON data for the world (country borders)
        fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
            .then(response => response.json())
            .then(geoData => {
                // Add the GeoJSON layer to the map
                L.geoJSON(geoData, {
                    style: function(feature) {
                        return {
                            color: "#3388ff",
                            weight: 1,
                            fillOpacity: 0.3
                        };
                    },
                    onEachFeature: function(feature, layer) {
                        // Get the country name from the GeoJSON feature
                        var countryName = feature.properties.name;

                        // Find the corresponding COVID-19 data for the country
                        var countryData = covidData.find(c => c.country.toLowerCase() === countryName.toLowerCase());

                        // Default popup content for unavailable data
                        var popupContent = `<b>${countryName}</b><br>COVID-19 data not available.`;

                        // Check if COVID-19 data is available for the country
                        if (countryData) {
                            popupContent = `
                                <b>${countryName}</b><br>
                                Confirmed: ${countryData.cases.toLocaleString()}<br>
                                Deaths: ${countryData.deaths.toLocaleString()}<br>
                                Recovered: ${countryData.active.toLocaleString()}<br>
                                Active: ${countryData.recovered.toLocaleString()}<br>
                            `;
                        }

                        // Bind the popup to the country
                        layer.on('mouseover', function() {
                            layer.bindPopup(popupContent).openPopup();
                        });

                        // Add a click event for a persistent popup
                        layer.on('click', function() {
                            layer.bindPopup(popupContent).openPopup();
                        });
                    }
                }).addTo(map);
            })
            .catch(error => console.log('Error fetching GeoJSON data:', error));
    })
    .catch(error => console.log('Error fetching COVID-19 data:', error));
