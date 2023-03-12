/* TODO: Change name to API, maybe move 'db' (loosely named) handling here? */
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

module.exports = Ratelimiter;