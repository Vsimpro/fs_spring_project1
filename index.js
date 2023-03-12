// Libraries
const fs      = require("fs");
const cors    = require("cors") // Remove from prod, use only for testing.
const express = require("express");


// Global variables:
const PORT = 8181;
const HOST = "localhost";

const app = express();
      app.use(cors())
      app.use(express.json());
      app.use(express.static("./static"))
      app.use(express.urlencoded( {extended: true} )) // Might end up not needing this?


// Objects & Classes.
const ERROR_RESPONSES = {
    "401" : "<strong>401</strong><br>You're not allowed to make this request. Try again later.",
    "404" : "<strong>404</strong><br>Sorry (ツ)",
    "418" : "<strong>418</strong><br>I'm a teapot, I can't handle your request.",
    "500" : "<strong>500</strong><brINTERNAL SERVER ERROR."
};

const ROUTES = {
    "index.html"  : index,
    "guestbook"   : guestbook,
    "newmessage"  : new_message,
    "ajaxmessage" : ajax_message,
};

class Ratelimiter {
    constructor() {
        this.blacklist = {}
    }

    check(ip_address) {
        let now = Date.now() / 1000
        if (ip_address in this.blacklist) {
            if ((now - this.blacklist[ip_address]) >= 5) {
                this.blacklist[ip_address] = now
                return true; 
            }
            
            return false;
        }
        this.blacklist[ip_address] = now
        return true;
    }
}

class Guestbook {
    constructor() {
        this.book = [];

        try {
            this.book = JSON.parse(get_file("./data/sample.json"))
            console.log(" + Previous data read succesfully.")
        } catch (error) {
            console.log(" !! Error when reading previous data. Details;")
            console.log(error)
        }
    }

    read() {
        return this.book;
    }

    // Write & Validate new data.
    write(data) {
        // TODO: Write into the file aswell.
        this.book.push( this.validate( data ) ); return;
    }

    // Standardise the JSON data. If somethings undefined, make it "null."
    // Exception being the date and ID. If empty -> assing values.
    validate(user_insert) {
        let timestamp = new Date();
        let id = this.book.length + ((this.book[-1] != user_insert) * 1);
                                    // Because validation happens before insertation, up the ID if
                                    // last JSON in store is not the one we're validating.   

        user_insert["id"]       = user_insert["id"]       || id; 
        user_insert["date"]     = user_insert["date"]     || timestamp.toString();
        user_insert["country"]  = user_insert["country"]  || "null";
        user_insert["message"]  = user_insert["message"]  || "null";
        user_insert["username"] = user_insert["username"] || "null";
        
        return user_insert
    }

    // Generate a HTML table from the data.
    generate_table() {
        if (this.book == undefined) { return undefined; }
        
        let json_data = this.book;
        if (typeof data == "string") {
            json_data = JSON.parse(data)
        }
        
        let table = "<table border='1'>"
        table += `
            <tr><th> ID.       </th>
            <th> Username. </th>
            <th> Message.  </th>
            <th> Country.  </th>
            <th> Date.  </th></tr>\n`
        
        for (let i = 0; i < json_data.length; i++) {
            // TODO: Remove this;
            let book_row = this.validate(json_data[i]);
                
            // TODO: Template rest of data into the table.
            table+= `
            <tr><th> ${book_row["id"]} </th>
                <th> ${book_row["username"]} </th>
                <th> ${book_row["message"]}  </th>
                <th> ${book_row["country"]}  </th>
                <th> ${book_row["date"]}     </th></tr>\n`
        }
        
        table += "</table>"
        return table
    }
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

    return content
};


/**  Route Functions: **/
function index() {
    return get_file("templates/index.html", "utf8") || ERROR_RESPONSES["500"];
};

function ajax_message() {
    return get_file("templates/ajax_message.html")
}

function guestbook() {   
    return GUESTBOOK.generate_table() || ERROR_RESPONSES["500"]
};

// new_message : render an input / show input.html
function new_message() {
    return get_file("templates/new_message.html", "utf8") || ERROR_RESPONSES["500"]
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
        response.send( ERROR_RESPONSES["401"])
        return;
    } 

    GUESTBOOK.write(request.body)  
    response.send( GUESTBOOK.generate_table() )    
    return; 
});

app.post("/newmessage", function(request, response) {
    console.log("> POST 'newmessage'\n")
    
    if (check_permissions(request.ip) != true) {
        console.log(`\t${request.ip} ratelimited!`)
        response.send("401")
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
    
    console.log(request.body)      
    return; 
});


/** Main flow. **/
var GUESTBOOK = new Guestbook();
var RATELIMITER = new Ratelimiter();

app.listen(PORT, function() { 
    console.log("Server starting on http://" + HOST + ":" + PORT) 
});