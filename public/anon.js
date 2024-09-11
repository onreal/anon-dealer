importScripts("as/crypt.min.js")

let THE_SECRET = null;

async function getSecret () {
    if (THE_SECRET !== null)
        return THE_SECRET;
    let pin = await fetchConfiguration()
        .then((data) => {
            if (data && data.length > 0 && data[0].Pin !== '') {
                return data[0].Pin
            } else {
                console.log('Register first in order to set the secret key.')
                return false
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            return false
        });
    console.log('Pin:', pin);
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


