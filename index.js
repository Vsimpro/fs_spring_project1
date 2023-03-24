/*  Libraries  */
// npm
const fs      = require("fs");
const cors    = require("cors") // TODO: Remove from prod, use only for testing.
const express = require("express");

// modules
const Ratelimiter = require("./modules/Api.js")
const Guestbook   = require("./modules/Guestbook.js")


// Global variables:
const PORT = 8181;
const HOST = "localhost";

var GUESTBOOK   = new Guestbook();
var RATELIMITER = new Ratelimiter();

const app = express();
      app.use(cors()) // TODO: Remove from prod.
      app.use(express.json());
      app.use(express.static(__dirname + "/templates/static"))
      app.use(express.urlencoded( {extended: true} )) // Might end up not needing this?


/* Objects & Classes. */
// Standardised HTTP responses:
const ERROR_RESPONSES = {
    "429" : "<strong>429</strong><br>Too many requests.",
    "404" : "<strong>404</strong><br>Sorry (ツ)",
    "418" : "<strong>418</strong><br>I'm a teapot, I can't handle your request.",
    "500" : "<strong>500</strong><brINTERNAL SERVER ERROR."
};

// All of the routes correspond to a function: 
const ROUTES = {
    "index.html"  : index,
    "guestbook"   : guestbook,
    "newmessage"  : new_message,
    "ajaxmessage" : ajax_message,
};

// Components : their name + their file path.
const COMPONENTS = {
    "navbar"          : "templates/components/navbar.html",
    "canvas"          : "templates/components/canvas.html",
    "welcome"         : "templates/components/welcome.html",
    "ajax_form"       : "templates/components/ajax_form.html",
    "ajax_script"     : "templates/components/ajax_script.html",
    "newmessage_form" : "templates/components/newmessage_form.html",
}


/* Functionality Functions. */
// check_permissions : check if user is allowed to send in an API request.
function check_permissions(ip) {
    let split_ip = ip.split(":")
    let ipv4 = split_ip[split_ip.length - 1]

    return RATELIMITER.check(ipv4);
}

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

    return content;
};

// Render a template upon request. By default components are empty.
function render_template(base="", navbar="", site="", script="") {
    console.log(" ~ rendering.. ")
    let rendered_html = 
            base
             .replace("{{ navbar }}", navbar) // add navbar
             .replace("{{ site }}",   site)   // add site
             + script
            || ERROR_RESPONSES["500"];

    return rendered_html
}


/**  Route Functions: **/
/* TODO: Render function? */
function ajax_message() {
    return render_template(
        get_file(COMPONENTS["canvas"]), 
        get_file(COMPONENTS["navbar"]), 
        get_file(COMPONENTS["ajax_form"]),
        get_file(COMPONENTS["ajax_script"])
    );
}

function guestbook() {   
    return render_template(
        get_file(COMPONENTS["canvas"]), 
        get_file(COMPONENTS["navbar"]), 
        GUESTBOOK.generate_table(),
    );
};

function index() {
    return render_template(
        get_file(COMPONENTS["canvas"]), 
        get_file(COMPONENTS["navbar"]), 
        get_file(COMPONENTS["welcome"]),
    );
};

// new_message : render an input / show input.html
function new_message() {
    return render_template(
        get_file(COMPONENTS["canvas"]), 
        get_file(COMPONENTS["navbar"]), 
        get_file(COMPONENTS["newmessage_form"]),
    );
};


/** Routing via express: **/
// Handle GET.

app.get("/", function(request, response) {
    console.log("> GET '/'");
    response.send(index()); 
    return; 
});

app.get("/:route", function(request, response) {
    let route = `${request.params.route}`;
    let server_response = ERROR_RESPONSES["404"]
    
    console.log("> GET '" + route + "'");

    if (route in ROUTES) {
        server_response = ROUTES[ route ](request);
    }

    response.send(server_response);
    return; 
});

// Handle POST.
app.post("/ajaxmessage", function(request, response) {
    console.log("> POST 'ajaxmessage'");     

    if (check_permissions(request.ip) != true) {
        console.log(`\t ! ${request.ip} ratelimited!`)
        response.send( ERROR_RESPONSES["429"])
        return;
    } 

    GUESTBOOK.write(request.body)  
    response.send( GUESTBOOK.generate_table() )    
    return; 
});

app.post("/newmessage", function(request, response) {
    console.log("> POST 'newmessage'")
    
    if (check_permissions(request.ip) != true) {
        console.log(`\t${request.ip} ratelimited!`)
        response.send("429")
        return;
    }
    
    try { 
        GUESTBOOK.write(request.body)    

        response.set("location", "/guestbook");
        response.status(301).send()
        console.log("> REDIRECT TO 'guestbook'");

    } catch (error) {
        console.log("Error: '" + error + "' while handling the request.")
        response.send(ERROR_RESPONSES["418"])
    }
    
    console.log("\n + JSON: " + JSON.stringify(request.body))      
    return; 
});

app.get("/*", function(request, response) {
    console.log("> GET '/'");
    response.send(ERROR_RESPONSES["404"]); 
    return; 
});

/** Main flow. **/
app.listen(PORT, function() { 
    console.log("Server starting on http://" + HOST + ":" + PORT) 
});