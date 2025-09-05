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
        try {
            // Try with decryption first
            const entity = await this.connection.select({
                from: this.tableName,
                where: {
                    InventoryId: entityId
                },
                decrypt: true
            })
            if (!entity || entity.length === 0) {
                return null
            }
            return entity[0]
        } catch (error) {
            console.warn('InventoryCommand.get: Decryption failed, loading raw data:', error.message)
            
            // Fallback to raw data if decryption fails
            try {
                const rawEntity = await this.connection.select({
                    from: this.tableName,
                    where: {
                        InventoryId: entityId
                    }
                })
                if (!rawEntity || rawEntity.length === 0) {
                    return null
                }
                return rawEntity[0]
            } catch (rawError) {
                console.error('InventoryCommand.get: Both decrypted and raw queries failed:', rawError)
                return null
            }
        }
    }

    public async add(inventory: any) {
        return this.connection.insert({
            into: this.tableName,
            values: [inventory],
            return: true,
            encrypt: true
        })
    }

    public async getAll(order: string = 'asc') {
        try {
            // Try with decryption first
            console.log('InventoryCommand.getAll: Attempting to load inventories with decryption...')
            
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

            console.log('InventoryCommand.getAll: Successfully loaded', entities.length, 'decrypted inventories')
            return entities
        } catch (error) {
            console.warn('InventoryCommand.getAll: Decryption failed, loading raw data:', error.message)
            
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

                console.log('InventoryCommand.getAll: Loaded', rawEntities.length, 'raw encrypted inventories')
                return rawEntities
            } catch (rawError) {
                console.error('InventoryCommand.getAll: Both decrypted and raw queries failed:', rawError)
                return []
            }
        }
    }

    public async update(entity: any) {
        return this.connection.update({
            in: this.tableName,
            set: {
                Name: entity.Name,
                ItemId: entity.ItemId,
                Amount: entity.Amount,
                Cost: entity.Cost,
                CostPerAmount: entity.CostPerAmount,
                AmountForCost: entity.AmountForCost,
                Multiplier: entity.Multiplier,
                ModifiedOn: entity.ModifiedOn
            },
            where: {
                InventoryId: entity.InventoryId
            },
            encrypt: true
        })
    }

    public async delete(entityId: number) {
        return this.connection.remove({
            from: this.tableName,
            where: {
                InventoryId: entityId
            }
        })
    }

    public async reduceQuantity(inventoryId: number, quantityToReduce: number) {
        // First get the current inventory to check available quantity
        const currentInventory = await this.get(inventoryId)
        if (!currentInventory) {
            throw new Error('Inventory not found')
        }

        const currentAmount = Number(currentInventory.Amount) || 0
        const newAmount = currentAmount - quantityToReduce

        if (newAmount < 0) {
            throw new Error(`Insufficient inventory. Available: ${currentAmount}, Requested: ${quantityToReduce}`)
        }

        // Update the inventory with new amount
        return this.connection.update({
            in: this.tableName,
            set: {
                Amount: newAmount,
                ModifiedOn: new Date()
            },
            where: {
                InventoryId: inventoryId
            },
            encrypt: true
        })
    }
}
