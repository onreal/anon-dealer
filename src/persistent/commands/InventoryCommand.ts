import {Command} from "./Command"
import {InventoryRepository} from "../repository/InventoryRepository";
import {Connection} from "jsstore";

export class InventoryCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(InventoryRepository.getPrimaryKey(),
            InventoryRepository.getTableName(),
            app, connection);
    }

    async get(entityId: number) {
        const entity = await this.connection.select({
            from: this.tableName,
            where: {
                InventoryId: entityId
            },
        })
        if (!entity) {
            return null
        }

        return entity[0]
    }

    public async update(entity: any) {
        return this.connection.update({
            in: this.tableName,
            set: {
                Name: entity.Name
            },
            where: {
                InventoryId: entity.InventoryId
            },
            encrypt:true
        })
    }
}
