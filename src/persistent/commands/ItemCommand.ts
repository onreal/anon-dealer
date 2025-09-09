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

    public async add(item: any) {
        return this.connection.insert({
            into: this.tableName,
            values: [item],
            return: true,
            encrypt: true
        })
    }

    public async getAll(order: string = 'asc') {
        try {
            // Try with decryption first
            
            const entities = await this.connection.select({
                from: this.tableName,
                order: {
                    by: this.primaryKey,
                    type: order
                },
                decrypt: true
            })

            if (!entities) {
                return []
            }

            return entities
        } catch (error) {
            console.warn('ItemCommand.getAll: Decryption failed, loading raw data:', error.message)
            
            // Fallback to raw data if decryption fails
            try {
                const rawEntities = await this.connection.select({
                    from: this.tableName,
                    order: {
                        by: this.primaryKey,
                        type: order
                    }
                })

                if (!rawEntities) {
                    return []
                }

                return rawEntities
            } catch (rawError) {
                console.error('ItemCommand.getAll: Both decrypted and raw queries failed:', rawError)
                return []
            }
        }
    }

    public async updateItem(item: any) {
        return this.connection.update({
            in: this.tableName,
            set: {
                Name: item.Name,
                Description: item.Description,
                Type: item.Type,
                Image: item.Image
            },
            where: {
                ItemId: item.ItemId
            },
            encrypt: true
        })
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
