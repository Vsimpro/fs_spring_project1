const express = require("express");


// Global variables:
const PORT = 8080
const HOST = "localhost"
const app = express()


// Routing:
app.get("/", function(request, response) {
    response.send("Hello World!")
});



// main.
app.listen(PORT, function() { console.log("Server starting on http://" + HOST + ":" + PORT) });