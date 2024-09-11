import {DATA_TYPE} from "jsstore"
import {Repository} from "./Repository";

export class InventoryRepository extends Repository{

    public static tableName: string = 'Inventory'
    public static primaryKey: string = 'InventoryId'

    protected static repository: object = {
        name: this.tableName,
        key: this.primaryKey,
        columns: {
            InventoryId: {
                primaryKey: true,
                autoIncrement: true
            },
            ItemId: {
                dataType: DATA_TYPE.Number,
                notNull: true,
            },
            Name: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            Amount: {
                dataType: DATA_TYPE.Number,
                notNull: true,
                encrypt: true
            },
            Cost: {
                dataType: DATA_TYPE.Number,
                notNull: true,
                encrypt: true
            },
            CostPerAmount: {
                dataType: DATA_TYPE.Number,
                notNull: true,
                encrypt: true
            },
            AmountForCost: {
                dataType: DATA_TYPE.Number,
                notNull: true,
                encrypt: true
            },
            Multiplier: {
                dataType: DATA_TYPE.Number,
                notNull: true,
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
