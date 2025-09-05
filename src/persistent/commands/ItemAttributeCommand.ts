import {Command} from "./Command"
import {Connection} from "jsstore";
import {ItemAttributeRepository} from "../repository/ItemAttributeRepository";

export class ItemAttributeCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(ItemAttributeRepository.getPrimaryKey(),
            ItemAttributeRepository.getTableName(),
            app, connection);
    }

    public async add(itemAttribute: any) {
        return this.connection.insert({
            into: this.tableName,
            values: [itemAttribute],
            return: true,
            encrypt: true
        })
    }

    public async update(itemAttribute: any) {
        return this.connection.update({
            in: this.tableName,
            set: {
                Key: itemAttribute.Key,
                Value: itemAttribute.Value
            },
            where: {
                ItemAttributeId: itemAttribute.ItemAttributeId
            },
            encrypt: true
        })
    }
}
