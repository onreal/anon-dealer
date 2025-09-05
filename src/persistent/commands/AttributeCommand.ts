import {Command} from "./Command"
import {Connection} from "jsstore";
import {AttributeRepository} from "../repository/AttributeRepository";

export class AttributeCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(AttributeRepository.getPrimaryKey(),
            AttributeRepository.getTableName(),
            app, connection);
    }

    public async add(attribute: any) {
        return this.connection.insert({
            into: this.tableName,
            values: [attribute],
            return: true,
            encrypt: true
        })
    }

    public async update(attribute: any) {
        return this.connection.update({
            in: this.tableName,
            set: {
                Name: attribute.Name,
                CreatedOn: attribute.CreatedOn
            },
            where: {
                AttributeId: attribute.AttributeId
            },
            encrypt: true
        })
    }
}
