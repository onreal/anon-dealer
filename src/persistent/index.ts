// @ts-ignore
import { require } from "node:path";
import { Connection } from "jsstore";

const getWorkerPath = () => {
    // return dev build when env is development
    if (import.meta.env.NODE_ENV === 'development') {
        return require("file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.js");
    }
    else { // return prod build when env is production
        return require("file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.min.js");
    }
};

const workerPath = getWorkerPath().default;

const indexedDBConn = new Connection(new Worker(workerPath));

indexedDBConn.logStatus = true;

export default indexedDBConn;
