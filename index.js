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

    "newmessage"      : new_message,
    "newmessage.html" : new_message,

    /* TODO: Add functions for these routes.
    "ajaxmessage"       : ajax_message(),
    "ajaxmessage.html"  : ajax_message(),
    */
};

/* Functionality Functions. */
// json_into_html : parses JSON given as a parameter into HTML tables.
function json_into_html(data) {
    if (data == undefined) { return undefined; }

    let json_data = JSON.parse(data)

    let html_generated = "<table border='1'>"
    html_generated += `
        <tr><th> Username. </th>
            <th> Message.  </th>
            <th> Country.  </th>
            <th> Date.  </th></tr>\n`

    for (let i = 0; i < json_data.length; i++) {
        let book_insert = json_data[i];

        let insert_id       = book_insert["id"]      || "null"; // ID is ugly.
        let insert_msg      = book_insert["message"] || "null";
        let insert_date     = book_insert["date"]    || "null";
        let insert_uname    = book_insert["username"]|| "null";
        let insert_country  = book_insert["country"] || "null";
        
        // TODO: Template rest of data into the table.
        html_generated += `
        <tr><th> ${insert_uname}    </th>
            <th> ${insert_msg}      </th>
            <th> ${insert_country}  </th>
            <th> ${insert_date}     </th></tr>\n`
    }

    html_generated += "</table>"
    return html_generated
};

// get_file : read and return a file and it's contents. Return undefined upon error.
function get_file(file) {
    let content = undefined
    
    try {
        let data = fs.readFileSync(file, "utf8") 
        if (data == undefined | data == null) 
            { throw error; }

        content = data

    } catch (error) {
        console.log(`!!! Error:  ${error.code} while fetching a file ${file}`); 
    }

    return content
};


/* Route Functions: */
function index() {
    return get_file("templates/index.html", "utf8") || ERROR_RESPONSES["500"];
};

function guestbook() {   
    return json_into_html(get_file("./data/sample.json")) || ERROR_RESPONSES["500"]
};

// new_message : render an input / show input.html
function new_message() {
    return get_file("templates/new_message.html", "utf8") || ERROR_RESPONSES["500"]
};


/* Routing via express: */
app.get("/", function(request, response) {
    response.send(index()); console.log("> GET '/'");
    return; 
});

app.get("/:route", function(request, response) {
    let route = `${request.params.route}`;
    let http_response = ERROR_RESPONSES["404"]
    
    console.log("> GET '" + route + "'");

    if (route in ROUTES) {
        http_response = ROUTES[ route ](request);
    }

    response.send(http_response);
    return; 
});


// Main flow.
app.listen(PORT, function() { console.log("Server starting on http://" + HOST + ":" + PORT) });