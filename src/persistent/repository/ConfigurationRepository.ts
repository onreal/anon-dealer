import {DATA_TYPE} from "jsstore"
import {Repository} from "./Repository";

export class ConfigurationRepository extends Repository{

    public static tableName: string = 'Configuration'
    public static primaryKey: string = 'ConfigurationId'

    protected static repository: object = {
        name: this.tableName,
        key: this.primaryKey,
        columns: {
            ConfigurationId: {
                primaryKey: true,
                autoIncrement: true
            },
            Pin: {
                dataType: DATA_TYPE.String,
                notNull: true
            },
            State: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            CreatedOn: {
                dataType: DATA_TYPE.DateTime,
                notNull: true,
                encrypt: true
            },
            LastLogin: {
                dataType: DATA_TYPE.DateTime,
                notNull: true,
                encrypt: true
            }
        }
    };
}
