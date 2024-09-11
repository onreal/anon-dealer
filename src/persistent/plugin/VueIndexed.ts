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

        app.provide('commands', commands)

        const initDb = async () => {
            return Promise.all([
                indexedDBConn.initDb(database as IDataBase),
                indexedDBConn.addPlugin(encryptPlugin, "anon.js")
            ]);
        }

        try {
            const isDbCreated = await initDb();
            if (isDbCreated) {} else {}
        } catch (ex) {
            // @ts-ignore
            alert(ex.message);
            Global.isIndexedDbSupported = false;
        }
    },
};
