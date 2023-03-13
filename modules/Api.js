/* TODO: Change name to API, maybe move 'db' (loosely named) handling here? */
class Ratelimiter {
    constructor() {
        this.blacklist = {}
        this.call_counter = {}
    }

    check(ip_address) {
        let now = Date.now() / 1000

        // Check if the IP has sent requests; if not, add it to the list.
        try {
            this.call_counter[ip_address] += 1;
        } catch (e) {
            this.call_counter[ip_address] = 1;
        }

        // Allow one ip to send up to 100 requests.
        if (this.call_counter[ip_address] >= 100) {
                return false;
        }

        // Allow one ip to send a new request every 5s.
        if (ip_address in this.blacklist) {
            if ((now - this.blacklist[ip_address]) >= 5) {
                this.blacklist[ip_address] = now
                return true; 
            }
            
            return false;
        }

        // Add a new timestamp for a new IP. 
        this.blacklist[ip_address] = now
        return true;
    }
}

module.exports = Ratelimiter;