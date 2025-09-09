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
        const configuration = await this.connection.select({
            from: this.tableName,
            limit: 1,
            decrypt: true
        });

        if (!configuration || configuration.length === 0) {
            return null;
        }

        return configuration[0].Pin;
    }

    public async getOne() {
        const configuration = await this.connection.select({
            from: this.tableName,
            limit: 1,
            decrypt: true
        });

        if (!configuration || configuration.length === 0) {
            return null;
        }

        return configuration[0];
    }

    public async add(configuration: any) {
        return this.connection.insert({
            into: this.tableName,
            values: [configuration],
            return: true,
            encrypt: true
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
                State: configuration.State,
                // P2P Configuration fields
                IsP2PEnabled: configuration.IsP2PEnabled,
                SignalingServerUrl: configuration.SignalingServerUrl,
                SignalingServerWsUrl: configuration.SignalingServerWsUrl,
                P2PDefaultRoom: configuration.P2PDefaultRoom
            },
            where: {
                ConfigurationId: configuration.ConfigurationId
            },
            encrypt: true
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
            },
            encrypt: true
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
            },
            encrypt: true
        })
    }
}
