import {Command} from "./Command"
import {SettingsRepository} from "../repository/SettingsRepository";
import {Connection} from "jsstore";

// noinspection TypeScriptValidateTypes
export class SettingsCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(SettingsRepository.getPrimaryKey(),
            SettingsRepository.getTableName(),
            app, connection);
    }

    async get() {
        const settings = await this.connection.select({
            from: this.tableName
        })
        if (!settings) {
            return []
        }
        return settings[0]
    }

    public async add(settings: object) {
        return this.connection.insert({
            into: this.tableName,
            values: [settings],
            encrypt:true,
            return: true,
        })
    }
}
