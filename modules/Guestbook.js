const fs = require("fs");

class Guestbook {
    constructor() {
        this.book = [];
        this.storage_location = "./data/sample.json";

        try {
            let data = fs.readFileSync(this.storage_location, "utf8") 
            if (data == undefined | data == null) {
                throw error;
            }

            this.book = JSON.parse(data)

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
    // TODO: Write this out clearer.
    write(data) { 
        let new_data = this.validate( data );

        try {
            let previous_data = fs.readFileSync(this.storage_location, "utf8") 
            if (data == undefined | data == null) {
                throw error;
            }

            let previous_json = JSON.parse(previous_data)
                previous_json.push( new_data )
            let string_data = JSON.stringify( previous_json )

            // Commented out for the dev process. TODO: Uncomment before prod.
            //fs.writeFileSync(this.storage_location, string_data)
            
            this.book.push( new_data );
            
        } catch (error) {
            console.log(" !! Could not store data. Details:")
            console.log(error)
            return false;
        }

        return true;
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

module.exports = Guestbook;