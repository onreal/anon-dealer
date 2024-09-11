import {DATA_TYPE} from "jsstore"
import {Repository} from "./Repository";

export class SettingsRepository extends Repository{

    public static tableName: string = 'Settings'
    public static primaryKey: string = 'SettingId'

    protected static repository: object = {
        name: this.tableName,
        key: this.primaryKey,
        columns: {
            SettingId: {
                primaryKey: true,
                autoIncrement: true
            },
            Profession: {
                dataType: DATA_TYPE.String,
                encrypt: true,
                notNull: true
            },
            IsAFriendOfMine: {
                dataType: DATA_TYPE.Boolean,
                default: false,
                notNull: true
            },
            Country: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            Currency: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            Language: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            Timezone: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            TelegramToken: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            IsBackend: {
                dataType: DATA_TYPE.Boolean,
                default: false,
                notNull: true
            },
            ServerUrl: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            ServerToken: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            CreatedOn: {
                dataType: DATA_TYPE.DateTime,
                notNull: true,
                encrypt: true
            },
            ModifiedOn: {
                dataType: DATA_TYPE.DateTime,
                notNull: true,
                encrypt: true
            }
        }
    };
}
