import {DATA_TYPE} from "jsstore"
import {Repository} from "./Repository";

export class InventorySaleRepository extends Repository{

    public static tableName: string = 'InventorySale'
    public static primaryKey: string = 'InventorySaleId'

    protected static repository: object = {
        name: this.tableName,
        key: this.primaryKey,
        columns: {
            InventorySaleId: {
                primaryKey: true,
                autoIncrement: true
            },
            InventoryId: {
                dataType: DATA_TYPE.Number,
                notNull: true
            },
            CustomerId: {
                dataType: DATA_TYPE.Number,
                notNull: true
            },
            ItemId: {
                dataType: DATA_TYPE.Number,
                notNull: true
            },
            Cost: {
                dataType: DATA_TYPE.Number,
                notNull: true,
                encrypt: true
            },
            Amount: {
                dataType: DATA_TYPE.Number,
                notNull: true,
                encrypt: true
            },
            Position: {
                dataType: DATA_TYPE.Object
            },
            CreatedOn: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            ModifiedOn: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            }
        }
    };
}
