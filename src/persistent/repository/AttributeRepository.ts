import {DATA_TYPE} from "jsstore"
import {Repository} from "./Repository";

export class AttributeRepository extends Repository{

    public static tableName: string = 'Attribute'
    public static primaryKey: string = 'AttributeId'

    protected static repository: object = {
        name: this.tableName,
        key: this.primaryKey,
        columns: {
            AttributeId: {
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            CreatedOn: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            }
        }
    };
}
