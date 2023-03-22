/* TODO: Add global functionalities where needed (if, needed?) */

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const sidebar_text = "@ G U E S T B O O K"

var sidebar = document.querySelector(".sidebar");

document.querySelector(".vertical-border").addEventListener("mouseover", function() {
    let interval = 0
    const id = setInterval( function() {
        if (interval > sidebar_text.length) {
            clearInterval(id)
        }

        interval += 1;

        let parse = ""
        parse += sidebar_text.slice(0, interval)
        parse += generateRandom(sidebar_text.slice(interval, sidebar_text.length))
        sidebar.innerText = parse        
    }, 42);
    sidebar.innerText = sidebar_text;
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRandom(text) {
    let randomized = ""

    for (let i = 0; i < text.length; i++) {
        randomized += letters[Math.floor(Math.random() * 26)]
    }

    return randomized
}
