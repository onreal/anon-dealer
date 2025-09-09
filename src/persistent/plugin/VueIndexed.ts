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

        // Check if PIN is available
        const pin = localStorage.getItem('anon_pin');
        if (pin) {
        } else {
        }

        app.config.globalProperties.$anon = indexedDBConn
        
        // Add global PIN handler for when plugin runs in worker context
        app.config.globalProperties.$sendPinToWorker = async (pin: string) => {
            await sendPinToWorker(pin);
        }
        
        // Add message listener for PIN requests from worker context
        if (typeof window !== 'undefined') {
            window.addEventListener('message', async (event) => {
                if (event.data && event.data.type === 'SEND_PIN_TO_WORKER') {
                    await sendPinToWorker(event.data.pin);
                }
            });
        }

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

        // Initialize commands but don't set them as global properties yet
        for (const table of Object.values(database.tables)) {
            // @ts-ignore
            const commandName = `${table.name}Command`;
            const loader = new InstanceLoader<Command>(commandClasses, app);
            // @ts-ignore
            commands[table.name] = loader.getInstance(commandName, table);
        }

        // Add function to send PIN to worker
        app.config.globalProperties.$sendPinToWorker = (pin: string) => {
            // @ts-ignore - worker property exists but not in types
            const worker = indexedDBConn.worker;
            if (worker) {
                worker.postMessage({
                    type: 'SET_PIN',
                    pin: pin
                });
            } else {
                console.warn('Worker not available yet, PIN will be sent on next initialization');
            }
        };

        // Add function to restore PIN from localStorage
        app.config.globalProperties.$restorePinFromStorage = () => {
            const pin = localStorage.getItem('anon_pin');
            if (pin) {
                app.config.globalProperties.$sendPinToWorker(pin);
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
            
            // Initialize database first to ensure worker is available
            const result = await Promise.all([
                indexedDBConn.initDb(database as IDataBase),
                indexedDBConn.addPlugin(encryptPlugin, "anon.js")
            ]);
            
            // Wait for the encrypt plugin to be fully loaded
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Handle PIN sending based on context
            if (pin) {
                
                if (indexedDBConn.isWorker) {
                    // In worker context, we can't send PIN to ourselves
                    // The main thread needs to handle this
                    
                    // Try to trigger PIN sending from main thread
                    if (typeof window !== 'undefined' && window.postMessage) {
                        window.postMessage({
                            type: 'SEND_PIN_TO_WORKER',
                            pin: pin
                        }, '*');
                    }
                    
                    // Also try to get PIN from alternative sources
                    
                    let currentPin = pin; // Use a mutable variable
                    
                    // Check window global variable
                    if (typeof window !== 'undefined' && (window as any).__ANON_PIN__) {
                        const altPin = (window as any).__ANON_PIN__;
                        currentPin = altPin;
                    }
                    
                    // Check localStorage backup
                    const tempPin = localStorage.getItem('anon_pin_temp');
                    if (tempPin) {
                        currentPin = tempPin;
                        // Clean up the temp storage
                        localStorage.removeItem('anon_pin_temp');
                    }
                    
                    // If we found a PIN, try to send it directly to the worker
                    if (currentPin) {
                        // Try to send PIN using the worker's own postMessage
                        if (typeof self !== 'undefined' && self.postMessage) {
                            self.postMessage({
                                name: 'middleware',
                                query: 'jsstoreEncryptMiddleware',
                                pin: currentPin
                            });
                        }
                        
                        // Also try to set the PIN in the worker's global scope
                        if (typeof self !== 'undefined') {
                            (self as any).__ANON_PIN__ = currentPin;
                        }
                    }
                    
                    // Set up a periodic check for PIN updates
                    const pinCheckInterval = setInterval(() => {
                        // Check for PIN in window global
                        if (typeof window !== 'undefined' && (window as any).__ANON_PIN__) {
                            const newPin = (window as any).__ANON_PIN__;
                            
                            // Send PIN to worker
                            if (typeof self !== 'undefined' && self.postMessage) {
                                self.postMessage({
                                    name: 'middleware',
                                    query: 'jsstoreEncryptMiddleware',
                                    pin: newPin
                                });
                            }
                            
                            // Clear the interval after successful PIN send
                            clearInterval(pinCheckInterval);
                        }
                    }, 100); // Check every 100ms
                    
                    // Clear interval after 5 seconds to avoid infinite checking
                    setTimeout(() => {
                        clearInterval(pinCheckInterval);
                    }, 5000);
                } else {
                    await sendPinToWorker(pin);
                }
            } else {
            }
            
            return result;
        }
        
        const sendPinToWorker = async (pin: string) => {
            
            // Try to access the worker
            // @ts-ignore - worker property exists but not in types
            let worker = indexedDBConn.worker;
            
            // If worker is not available, try alternative access methods
            if (!worker) {
                // @ts-ignore - trying to access worker through different properties
                worker = indexedDBConn._worker || indexedDBConn.workerInstance || indexedDBConn.workerRef;
            }
            
            if (worker) {
                
                // Add message listener to see responses
                const originalOnMessage = worker.onmessage;
                worker.onmessage = function(event) {
                    if (originalOnMessage) {
                        originalOnMessage.call(this, event);
                    }
                };
                
                // Send PIN with multiple formats
                const pinMessages = [
                    { name: 'middleware', query: 'jsstoreEncryptMiddleware', pin: pin },
                    { type: 'SET_PIN', pin: pin },
                    { action: 'encrypt', pin: pin }
                ];
                
                for (let i = 0; i < pinMessages.length; i++) {
                    worker.postMessage(pinMessages[i]);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Restore original message handler
                worker.onmessage = originalOnMessage;
            } else {
                
                // Since we can't access the worker directly, let's try a different approach
                // We'll store the PIN in a way that the worker can access it
                
                // Try to store PIN in a global variable that the worker can access
                if (typeof window !== 'undefined') {
                    (window as any).__ANON_PIN__ = pin;
                }
                
                // Also try localStorage as a backup
                localStorage.setItem('anon_pin_temp', pin);
                
                // Try to trigger a custom event that the worker might listen to
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                    const event = new CustomEvent('anon-pin-ready', { detail: { pin } });
                    window.dispatchEvent(event);
                }
            }
        }

        const clearDatabaseAndRetry = async () => {
            try {
                // Clear the existing database by deleting it from IndexedDB
                const dbName = database.name;
                const deleteRequest = indexedDB.deleteDatabase(dbName);
                
                return new Promise((resolve) => {
                    deleteRequest.onsuccess = async () => {
                        
                        // Wait a bit for the database to be fully deleted
                        setTimeout(async () => {
                            try {
                                // Reinitialize with new schema
                                await initDb();
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
            } else {
            }
            
            // Now that database is initialized, set up commands
            app.config.globalProperties.$command = commands;
            
        } catch (ex) {
            console.error('Database initialization failed:', ex);
            // @ts-ignore
            alert('Database initialization failed. Please clear your browser data and refresh:\n\n1. Open Developer Tools (F12)\n2. Go to Application tab → Storage → IndexedDB\n3. Delete the "AnonInstance" database\n4. Refresh the page');
            Global.isIndexedDbSupported = false;
        }
    },
};
