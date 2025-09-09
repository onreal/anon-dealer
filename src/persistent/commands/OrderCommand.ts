import {Command} from "./Command"
import {OrderRepository} from "../repository/OrderRepository";
import {Connection} from "jsstore";

export class OrderCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(OrderRepository.getPrimaryKey(),
            OrderRepository.getTableName(),
            app, connection);
    }

    public async add(order: any) {
        return this.connection.insert({
            into: this.tableName,
            values: [order],
            return: true,
            encrypt: true
        })
    }

    public async update(order: any) {
        return this.connection.update({
            in: this.tableName,
            set: {
                Cost: order.Cost,
                Quantity: order.Quantity,
                IsPaid: order.IsPaid,
                Notes: order.Notes,
                ModifiedOn: order.ModifiedOn
            },
            where: {
                OrderId: order.OrderId
            },
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
            console.warn('OrderCommand.getAll: Decryption failed, loading raw data:', error.message)
            
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
                console.error('OrderCommand.getAll: Both decrypted and raw queries failed:', rawError)
                return []
            }
        }
    }
}
