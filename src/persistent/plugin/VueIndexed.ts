import {Connection} from "jsstore";
import {IDataBase} from "jsstore/dist/ts/common";
import {getDatabase} from "../database";
import {Global} from "../../global";
import {ConfigurationCommand} from "../commands/ConfigurationCommand";
import {CustomerCommand} from "../commands/CustomerCommand";
import {InventoryCommand} from "../commands/InventoryCommand";
import {InventorySaleCommand} from "../commands/InventorySaleCommand";
import {ItemCommand} from "../commands/ItemCommand";
import {OrderCommand} from "../commands/OrderCommand";
import {SettingsCommand} from "../commands/SettingsCommand";
import { encryptPlugin } from "jsstore-encrypt";
import {Command} from "../commands/Command";
import {InstanceLoader} from "../InstanceLoader";
import {ItemAttributeCommand} from "../commands/ItemAttributeCommand";
import {AttributeCommand} from "../commands/AttributeCommand";


export default {
    install: async (app: any, options: object) => {
        const indexedDBConn = new Connection(new Worker("jsstore.worker.js"))
        const logStatus = ('log' in options) && options.log

        indexedDBConn.logStatus = Boolean(logStatus);

        app.config.globalProperties.$anon = indexedDBConn

        const commandClasses = {
            AttributeCommand,
            ConfigurationCommand,
            CustomerCommand,
            InventoryCommand,
            InventorySaleCommand,
            ItemCommand,
            ItemAttributeCommand,
            OrderCommand,
            SettingsCommand
        };

        const commands: Record<string, Command> = {};
        const database: { tables: object[]; name: string } = getDatabase();

        for (const table of Object.values(database.tables)) {
            // @ts-ignore
            const commandName = `${table.name}Command`;
            const loader = new InstanceLoader<Command>(commandClasses, app);
            // @ts-ignore
            commands[table.name] = loader.getInstance(commandName, table);
        }

        // Register our schema to use along vue
        app.config.globalProperties.$command = commands;

        // Add function to send PIN to worker
        app.config.globalProperties.$sendPinToWorker = (pin: string) => {
            console.log('Sending PIN to worker via $sendPinToWorker:', pin);
            if (indexedDBConn.worker) {
                indexedDBConn.worker.postMessage({
                    type: 'SET_PIN',
                    pin: pin
                });
            } else {
                console.warn('Worker not available yet, PIN will be sent on next initialization');
            }
        };

        app.provide('commands', commands)

        // Add global reset function for manual database clearing
        // @ts-ignore
        window.resetAnonDatabase = async () => {
            try {
                // Close any existing connections
                if (database.connection) {
                    await database.connection.close();
                }
                
                const dbName = database.name;
                
                // Delete the database
                const deleteRequest = indexedDB.deleteDatabase(dbName);
                
                return new Promise((resolve) => {
                    deleteRequest.onsuccess = () => {
                        console.log('Database reset successfully! Please refresh the page.');
                        
                        // Also clear localStorage and sessionStorage
                        localStorage.clear();
                        sessionStorage.clear();
                        
                        resolve(true);
                    };
                    
                    deleteRequest.onerror = () => {
                        console.error('Failed to reset database');
                        resolve(false);
                    };
                    
                    deleteRequest.onblocked = () => {
                        console.log('Database deletion blocked, trying again...');
                        setTimeout(() => {
                            indexedDB.deleteDatabase(dbName);
                        }, 100);
                    };
                });
            } catch (error) {
                console.error('Error resetting database:', error);
                return false;
            }
        };

        const initDb = async () => {
            const result = await Promise.all([
                indexedDBConn.initDb(database as IDataBase),
                indexedDBConn.addPlugin(encryptPlugin, "anon.js")
            ]);
            
            // Send PIN to worker if available in localStorage (after worker is initialized)
            const pin = localStorage.getItem('anon_pin');
            console.log('Checking for PIN in localStorage:', pin);
            console.log('Worker available:', !!indexedDBConn.worker);
            if (pin && indexedDBConn.worker) {
                console.log('Sending PIN to worker after initialization:', pin);
                indexedDBConn.worker.postMessage({
                    type: 'SET_PIN',
                    pin: pin
                });
            } else if (pin && !indexedDBConn.worker) {
                console.log('PIN available but worker not ready yet');
            } else if (!pin) {
                console.log('No PIN found in localStorage');
            }
            
            return result;
        }

        const clearDatabaseAndRetry = async () => {
            try {
                // Clear the existing database by deleting it from IndexedDB
                const dbName = database.name;
                const deleteRequest = indexedDB.deleteDatabase(dbName);
                
                return new Promise((resolve) => {
                    deleteRequest.onsuccess = async () => {
                        console.log('Database cleared due to schema mismatch');
                        
                        // Wait a bit for the database to be fully deleted
                        setTimeout(async () => {
                            try {
                                // Reinitialize with new schema
                                await initDb();
                                console.log('Database reinitialized with new schema');
                                resolve(true);
                            } catch (retryEx) {
                                console.error('Failed to reinitialize database:', retryEx);
                                resolve(false);
                            }
                        }, 100);
                    };
                    
                    deleteRequest.onerror = () => {
                        console.error('Failed to delete database');
                        resolve(false);
                    };
                });
            } catch (retryEx) {
                console.error('Failed to clear and reinitialize database:', retryEx);
                return false;
            }
        }

        try {
            const isDbCreated = await initDb();
            if (isDbCreated) {
                console.log('Database initialized successfully');
            } else {
                console.log('Database already exists');
            }
        } catch (ex) {
            console.error('Database initialization failed:', ex);
            // @ts-ignore
            alert('Database initialization failed. Please clear your browser data and refresh:\n\n1. Open Developer Tools (F12)\n2. Go to Application tab → Storage → IndexedDB\n3. Delete the "AnonInstance" database\n4. Refresh the page');
            Global.isIndexedDbSupported = false;
        }
    },
};
