// Libraries
const fs = require("fs");
const express = require("express");


// Global variables:
const app = express();
const PORT = 8080;
const HOST = "localhost";

const ERROR_RESPONSES = {
    "404" : "<strong>404</strong><br>Sorry (ツ)",
    "500" : "<strong>500</strong> INTERNAL SERVER ERROR."
};

const ROUTES = {
    "/"           : index,
    "index"       : index,
    "/index.html" : index,

    /* TODO: Add functions for these routes.
    "/guestbook"       : guestbook(),
    "/guestbook.html"  : guestbook(),  

    "/newmessage"      : new_message(),
    "/newmessage.html" : new_message(),

    "/ajaxmessage"       : ajax_message(),
    "/ajaxmessage.html"  : ajax_message(),
    */
};


// Route Functions:
function index(request) {
    var response_text = ERROR_RESPONSES["500"]

    try {
        response_text = fs.readFileSync("templates/index.html", "utf8") 
    } catch (error) {
        if (error.code === "ENOENT") {
            response_text = ERROR_RESPONSES["404"]
        } 
        console.log("!!! " + error);
    }

    return response_text
}


// Routing:
app.get("/:route", function(request, response) {
    let msg = "!!! Error: " + request
    let http_response = ERROR_RESPONSES["404"] // TODO: Standardise these from a dic.
    let route = `${request.params.route}`;
    
    if (route in ROUTES) {
        msg = "> GET '" + route + "'";
        http_response = ROUTES[ route ](request);
    }

    console.log(msg);
    response.send(http_response);
    return; 
});



// main.
app.listen(PORT, function() { console.log("Server starting on http://" + HOST + ":" + PORT) });