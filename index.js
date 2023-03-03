// Libraries
const fs = require("fs");
const express = require("express");


// Global variables:
const app = express();
      app.use(express.json());

const PORT = 8181;
const HOST = "localhost";

const ERROR_RESPONSES = {
    "418" : "<strong>418</strong><br>I'm a teapot, I can't handle your request.",
    "404" : "<strong>404</strong><br>Sorry (ツ)",
    "500" : "<strong>500</strong><brINTERNAL SERVER ERROR."
};

const ROUTES = {
    "index"       : index,
    "index.html"  : index,

    "guestbook"       : guestbook,
    "guestbook.html"  : guestbook,  

    "newmessage"      : new_message,
    "newmessage.html" : new_message,

    "ajaxmessage"       : ajax_message,
    "ajaxmessage.html"  : ajax_message
};

// Databank. TODO: Write into file (?)
var JSON_DATA = [];


/* Functionality Functions. */

// Standardise the JSON data. If somethings undefined, make it "null."
function json_validation(user_insert) {
    // Exception being the date and ID. If empty -> assing values.
    user_insert["id"]       = user_insert["id"]       || JSON_DATA.length; 
    user_insert["message"]  = user_insert["message"]  || "null";
    user_insert["date"]     = user_insert["date"]     || "today"; // TODO: Get date.
    user_insert["username"] = user_insert["username"] || "null";
    user_insert["country"]  = user_insert["country"]  || "null";

    return user_insert
}

// json_into_table : parses JSON given as a parameter into HTML tables.
function json_into_table(data) {
    if (data == undefined) { return undefined; }

    let json_data = data;
    
    if (typeof data == "string") {
        json_data = JSON.parse(data)
    }

    console.log(json_data)
    let html_generated = "<table border='1'>"
    html_generated += `
        <tr><th> Username. </th>
            <th> Message.  </th>
            <th> Country.  </th>
            <th> Date.  </th></tr>\n`

    for (let i = 0; i < json_data.length; i++) {
        let book_insert = json_validation(json_data[i]);
        
        // TODO: Template rest of data into the table.
        html_generated += `
        <tr><th> ${book_insert["username"]} </th>
            <th> ${book_insert["message"]}  </th>
            <th> ${book_insert["country"]}  </th>
            <th> ${book_insert["date"]}     </th></tr>\n`
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

function ajax_message() {
    return get_file("templates/ajax_message.html")
}

function guestbook() {   
    return json_into_table(JSON_DATA) || ERROR_RESPONSES["500"]
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

// Handle GET.
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


// Handle POST.
app.post("/ajaxmessage", function(request, response) {
    console.log(request.body);      // your JSON
    JSON_DATA.push(json_validation(request.body))    
    response.send(json_into_table(JSON_DATA))
    return; 
});

app.post("/newmessage", function(request, response) {
    let data = "";
    let http_response = ERROR_RESPONSES["418"]
    console.log("> POST 'newmessage'");

    request.on('data', chunk => { data += chunk; });
    req.on('end', () => {
        console.log(data);
        res.send('User added successfully');
      });
    console.log(data)
    
       
    response.send(http_response);
    return; 
});

/* Main flow. */
try {
    JSON_DATA = JSON.parse(get_file("./data/sample.json"))
    console.log(" + Previous data read succesfully.")
} catch (error) {
    console.log(" !! Error when reading previous data. Details;")
    console.log(error)
}
// Start the server.
app.listen(PORT, function() { console.log("Server starting on http://" + HOST + ":" + PORT) });
