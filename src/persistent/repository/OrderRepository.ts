import {DATA_TYPE} from "jsstore"
import {Repository} from "./Repository";

export class OrderRepository extends Repository{

    public static tableName: string = 'Order'
    public static primaryKey: string = 'OrderId'

    protected static repository: object = {
        name: this.tableName,
        key: this.primaryKey,
        columns: {
            OrderId: {
                primaryKey: true,
                autoIncrement: true
            },
            CustomerId: {
                dataType: DATA_TYPE.Number,
                notNull: true
            },
            InventoryItemId: {
                dataType: DATA_TYPE.Number,
                notNull: true
            },
            InventoryId: {
                dataType: DATA_TYPE.Number,
                notNull: true
            },
            Cost: {
                dataType: DATA_TYPE.Number,
                notNull: true,
                encrypt: true
            },
            Quantity: {
                dataType: DATA_TYPE.Number,
                notNull: true,
                encrypt: true
            },
            IsPaid: {
                dataType: DATA_TYPE.Boolean,
                default: false,
                notNull: true,
                encrypt: true
            },
            Notes: {
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
