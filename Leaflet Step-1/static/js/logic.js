console.log("logic.js loaded");

// API geojson endpoint
//var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// perform GET request to queryUrl
d3.json(queryUrl).then(function (data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><p>" + feature.properties.mag + " magnitude</p><p>" + new Date(feature.properties.time) + "</p>");
    }

    // set colorfor markers
    function getColor(d) {
        return d < 10 ? "#00FF00" : 
            d >= 10 ? "#9acd32" : 
                d >= 30 ? "#FFFF00" : 
                    d >= 50 ? "f8d568" : 
                        d >= 70 ? "FFA500" : 
                            d >= 90 ? "#FF0000" :
                                "DC143C"; 
    }

    // create geojson layer containing features array
    // run onEachFeature once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return new L.circleMarker(latlng, {
                radius: feature.properties.mag,
                color: "black",
                weight: .5,
                fill: true,
                fillColor: getColor(feature.geometry.coordinates[2]),
                fillOpacity: 1
            })
        },
        onEachFeature: onEachFeature
    });


    createMap(earthquakes);
}

function createMap(earthquakes) {

    // define map layers
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Light Map": lightmap
    };

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("mapid", {
        center: [37.09, -95.71],
        zoom: 4.5,
        layers: [lightmap, earthquakes]
    });

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
            labels = ["<strong>Depth</strong>"],
            grades = [-10, 10, 30, 50, 70, 90],
            legendColor = ["#00FF00", "9acd32", "FFFF00", "f8d568", "FFA500", "FF0000"];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                labels.push(
                    '<i style="background:' + legendColor[i] + '"></i> ' +
                    grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+"));
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(myMap);
}