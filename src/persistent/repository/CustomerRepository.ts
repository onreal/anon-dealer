
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
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            Email: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            Phone: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            Mobile: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            Telegram: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            Address: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            Notes: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            Status: {
                dataType: DATA_TYPE.String,
                notNull: true,
                default: 'active',
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
            },
            DeletedOn: {
                dataType: DATA_TYPE.DateTime,
                encrypt: true
            }
        }
    };
}
