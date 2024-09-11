import {DATA_TYPE} from "jsstore"
import {Repository} from "./Repository";

export class ItemAttributeRepository extends Repository{

    public static tableName: string = 'ItemAttribute'
    public static primaryKey: string = 'ItemAttributeId'

    protected static repository: object = {
        name: this.tableName,
        key: this.primaryKey,
        columns: {
            ItemAttributeId: {
                primaryKey: true,
                autoIncrement: true
            },
            AttributeId: {
                dataType: DATA_TYPE.Number,
                notNull: true
            },
            ItemId: {
                dataType: DATA_TYPE.Number,
                notNull: true
            },
            Key: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            Value: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            }
        }
    };
}
