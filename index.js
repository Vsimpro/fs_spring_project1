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
    "index"       : index,
    "index.html"  : index,

    "guestbook"       : guestbook,
    "guestbook.html"  : guestbook,  

    /* TODO: Add functions for these routes.

    "/newmessage"      : new_message(),
    "/newmessage.html" : new_message(),

    "/ajaxmessage"       : ajax_message(),
    "/ajaxmessage.html"  : ajax_message(),
    */
};

/* Functionality Functions. */
// json_into_html : parses JSON given as a parameter into HTML tables.
function json_into_html(data) {
    let json_data = JSON.parse(data)

    let html_generated = "<table border='1'>"
    html_generated += `
        <tr><th> Username. </th>
            <th> Message.  </th></tr>\n`

    for (let i = 0; i < json_data.length; i++) {
        let book_insert = json_data[i];

        let insert_id       = book_insert["id"]      || "null";
        let insert_msg      = book_insert["message"] || "null";
        let insert_date     = book_insert["date"]    || "null";
        let insert_uname    = book_insert["username"]|| "null";
        let insert_country  = book_insert["country"] || "null";
        
        // TODO: Template rest of data into the table.
        html_generated += `
        <tr><th> ${insert_uname} </th>
            <th> ${insert_msg}   </th></tr>\n`
    }
    html_generated += "</table>"
    return html_generated
};

/* Route Functions: */
// index : returns index.html
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
};

// guestbook : returns guestbook.html
function guestbook() {
    var response_text = ERROR_RESPONSES["500"]
    try {
        data = fs.readFileSync("data/sample.json", "utf8") 
        if (data == undefined | data == null) 
            { throw error; }

        converted_json = json_into_html(data)
        response_text = converted_json

    } catch (error) {
        console.log("!!! Error: While parsing guestbook. Details\n" + error)
    }

    return response_text

};


// Routing:
app.get("/", function(request, response) {
    response.send(index()); console.log("> GET '/'");
    return; 
});

app.get("/:route", function(request, response) {
    let msg = "!!! Error 404: " + request.params.route
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