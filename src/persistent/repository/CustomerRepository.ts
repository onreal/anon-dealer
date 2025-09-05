
import {DATA_TYPE} from "jsstore"
import {Repository} from "./Repository";

export class CustomerRepository extends Repository{

    public static tableName: string = 'Customer'
    public static primaryKey: string = 'CustomerId'

    protected static repository: object = {
        name: this.tableName,
        key: this.primaryKey,
        columns: {
            CustomerId: {
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                dataType: DATA_TYPE.String
            },
            Mobile: {
                dataType: DATA_TYPE.String,
            },
            Email: {
                dataType: DATA_TYPE.String
            },
            Telegram: {
                dataType: DATA_TYPE.String
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
