import {DATA_TYPE} from "jsstore"
import {Repository} from "./Repository";

export class ItemRepository extends Repository{

    public static tableName: string = 'Item'
    public static primaryKey: string = 'ItemId'

    protected static repository: object = {
        name: this.tableName,
        key: this.primaryKey,
        columns: {
            ItemId: {
                primaryKey: true,
                autoIncrement: true
            },
            Name: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            Description: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            Type: {
                dataType: DATA_TYPE.String,
                notNull: true,
                encrypt: true
            },
            Image: {
                dataType: DATA_TYPE.String,
                encrypt: true
            },
            CreatedOn: {
                dataType: DATA_TYPE.DateTime,
                notNull: true,
                encrypt: true
            }
        }
    };

    public static readonly PHYSICAL_TYPE: string = 'Physical';
    public static readonly DIGITAL_TYPE: string = 'Digital';
    public static readonly CONSUMABLE_TYPE: string = 'Consumable';
    public static readonly SERVICE_TYPE: string = 'Service';
    public static readonly DOCUMENT_TYPE: string = 'Other';
    public static readonly TYPES: string[] = [
        this.PHYSICAL_TYPE,
        this.DIGITAL_TYPE,
        this.CONSUMABLE_TYPE,
        this.SERVICE_TYPE,
        this.DOCUMENT_TYPE
    ];
}
