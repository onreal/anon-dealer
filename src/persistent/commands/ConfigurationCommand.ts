import {Command} from "./Command"
import {ConfigurationRepository} from "../repository/ConfigurationRepository";
import {Connection} from "jsstore";

// noinspection TypeScriptValidateTypes
export class ConfigurationCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(ConfigurationRepository.getPrimaryKey(),
            ConfigurationRepository.getTableName(),
            app, connection);
    }

    public async getPin() {
        const configuration = await this.getOne();

        // @ts-ignore
        return await configuration.Pin
    }

    public async add(configuration: any) {
        return this.connection.insert({
            into: this.tableName,
            values: [configuration],
            encrypt:true,
            return: true,
        })
    }

    public async update(configuration: any) {
        return this.connection.update({
            in: this.tableName,
            set: {
                TelegramToken: configuration.TelegramToken,
                IsBackend: configuration.IsBackend,
                ServerUrl: configuration.ServerUrl,
                ServerToken: configuration.ServerToken,
                CreatedOn: configuration.CreatedOn,
                State: configuration.State
            },
            where: {
                ConfigurationId: configuration.ConfigurationId
            },
            encrypt:true
        })
    }

    public async updatePin(configurationId: number, pin: string) {
        return await this.connection.update({
            in: this.tableName,
            set: {
                Pin: pin
            },
            where: {
                ConfigurationId: configurationId
            }
        })
    }

    public async updateLastLogin(configurationId: number, lastLogin: Date) {
        return await this.connection.update({
            in: this.tableName,
            set: {
                LastLogin: lastLogin
            },
            where: {
                ConfigurationId: configurationId
            }
        })
    }
}
