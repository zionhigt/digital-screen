const express = require("express");

const config = require("./config.json");
const credential = require("./credential.json");
const app = express();

app.use("/", express.static("./public"));

const { Api } = require("./lib/api.js");
app.api = Api({
    base: "https://api.meteo-concept.com/api",
    root: config.cache_path || "./data",
    ...credential,
});

app.get("/forecast/:city", function(req, res) {
    const city = req.params.city;
    app.api.searchCity(city)
    .then(response => {
        res.status(200).json(app.api.transformForecast(response));
    })
    .catch(err => {
        console.error(err);
        res.status(500).json(err);
    })

})

module.exports = app;