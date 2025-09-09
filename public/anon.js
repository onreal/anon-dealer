importScripts("as/crypt.min.js")

let THE_SECRET = null;

let STORED_PIN = null;

// Listen for messages from the main thread to get the PIN
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SET_PIN') {
        STORED_PIN = event.data.pin;
        // Reset THE_SECRET so it gets recalculated with the new PIN
        THE_SECRET = null;
    }
});

async function getSecret () {
    if (THE_SECRET !== null)
        return THE_SECRET;
    
    // Use the PIN from the main thread if available
    if (STORED_PIN) {
        THE_SECRET = CryptoJS.enc.Hex.parse(STORED_PIN.toString());
        return THE_SECRET;
    }
    
    // Fallback to fetching from database (for backward compatibility)
    // Note: This will get the encrypted PIN, which won't work as encryption key
    let pin = await fetchConfiguration()
        .then((data) => {
            if (data && data.length > 0 && data[0].Pin !== '') {
                return false; // Don't use encrypted PIN as key
            } else {
                return false
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            return false
        });
    
    if (!pin) {
        return false;
    }
    
    THE_SECRET = CryptoJS.enc.Hex.parse(pin.toString());
    return THE_SECRET;
}

async function fetchConfiguration() {
    return await new Promise((resolve, reject) => {
        const request = indexedDB.open('AnonInstance', 1);
        request.onerror = function (event) {
            reject(new Error('Error opening IndexedDB: ' + event.target.error));
        };
        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(['Configuration'], 'readonly');
            const objectStore = transaction.objectStore('Configuration');
            const getAllRequest = objectStore.getAll();
            getAllRequest.onsuccess = function (event) {
                const data = event.target.result;
                resolve(data);
            };
            getAllRequest.onerror = function (event) {
                reject(new Error('Error fetching data from IndexedDB: ' + event.target.error));
            };
        };
    });
}

const secret = getSecret();

const JsStoreEncrypt = {
    async encrypt(message) {
        let secrete = await secret
        message = message.toString();
        return await CryptoJS.AES.encrypt(
            message.toString(),
            secrete.toString(),
            {mode: CryptoJS.mode.ECB}
        ).toString();
    },
    async decrypt(message) {
        let secrete = await secret
        let decryptedBytes = await CryptoJS.AES.decrypt(
            message.toString(),
            secrete.toString(),
            {mode: CryptoJS.mode.ECB});
        return decryptedBytes.toString(CryptoJS.enc.Utf8)
    }
};


