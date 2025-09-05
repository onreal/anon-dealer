import {Command} from "./Command"
import {InventorySaleRepository} from "../repository/InventorySaleRepository";
import {Connection} from "jsstore";

export class InventorySaleCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(InventorySaleRepository.getPrimaryKey(),
            InventorySaleRepository.getTableName(),
            app, connection);
    }

    async get(inventorySaleId: number) {
        const inventorySale = await this.connection.select({
            from: this.tableName,
            where: {
                InventorySaleId: inventorySaleId
            },
        })
        if (!inventorySale) {
            return null
        }

        return inventorySale[0]
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
            encrypt: true
        })
    }
}
