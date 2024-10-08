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
                notNull: true
            },
            Quantity: {
                dataType: DATA_TYPE.Number,
                notNull: true
            },
            IsPaid: {
                dataType: DATA_TYPE.Boolean,
                default: false,
                notNull: true
            },
            Notes: {
                dataType: DATA_TYPE.String
            }
        }
    };
}
