import {Command} from "./Command"
import {ItemRepository} from "../repository/ItemRepository";
import {Connection} from "jsstore";

export class ItemCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(ItemRepository.getPrimaryKey(),
            ItemRepository.getTableName(),
            app, connection);
    }

    async get(itemId: number) {
        const item = await this.connection.select({
            from: this.tableName,
            where: {
                ItemId: itemId
            },
        })
        if (!item) {
            return null
        }

        return item[0]
    }

    public async update(inventorySale: any) {
        return this.connection.update({
            in: this.tableName,
            set: {
                CustomerId: inventorySale.CustomerId,
                ItemId: inventorySale.ItemId,
                Cost: inventorySale.Cost,
                Amount: inventorySale.Amount,
                Position: inventorySale.Position
            },
            where: {
                InventoryId: inventorySale.InventoryId
            },
            encrypt:true
        })
    }
}
