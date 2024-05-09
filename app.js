const express = require("express");

const config = require("./config.json");
const app = express();


app.use("/", express.static("./public"));

const { Api } = require("./lib/api.js");
app.api = Api({
    base: "http://localhost:3000",
    root: config.cache_path || "./data",
});

app.get("/test", function(req, res) {
    
    app.api.get("/test_cache")
    .then(response => {
        console.log(response)
        res.status(200).json(response);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json(err);
    })

})
app.get("/test_cache", function(req, res) {
    res.status(200).json({
        test: "OK"
    })
})

module.exports = app;