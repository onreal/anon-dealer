import {Command} from "./Command"
import {CustomerRepository} from "../repository/CustomerRepository"
import {Connection} from "jsstore";

export class CustomerCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(CustomerRepository.getPrimaryKey(),
            CustomerRepository.getTableName(),
            app, connection);
    }

    public async add(customer: any) {
        return this.connection.insert({
            into: this.tableName,
            values: [customer],
            return: true,
            encrypt: true
        })
    }

    public async create(customer: any) {
        const customerData = {
            ...customer,
            Phone: customer.Phone || customer.Mobile, // Keep Phone for backward compatibility
            Address: customer.Address || '',
            Notes: customer.Notes || '',
            Status: 'active',
            CreatedOn: new Date(),
            ModifiedOn: new Date()
        }
        return this.add(customerData)
    }

    public async update(customer: any) {
        return this.connection.update({
            in: this.tableName,
            set: {
                Name: customer.Name,
                Email: customer.Email,
                Mobile: customer.Mobile,
                Telegram: customer.Telegram,
                Phone: customer.Phone || customer.Mobile, // Keep Phone for backward compatibility
                Address: customer.Address || '',
                Notes: customer.Notes || '',
                ModifiedOn: new Date()
            },
            where: {
                CustomerId: customer.CustomerId
            }
        })
    }

    public async delete(customerId: number) {
        // Check if customer has orders before soft delete
        const orders = await this.connection.select({
            from: 'Order',
            where: {
                CustomerId: customerId
            }
        })
        
        if (orders && orders.length > 0) {
            // Soft delete - mark as deleted but keep data for order history
            return this.connection.update({
                in: this.tableName,
                set: {
                    Status: 'deleted',
                    DeletedOn: new Date(),
                    ModifiedOn: new Date()
                },
                where: {
                    CustomerId: customerId
                }
            })
        } else {
            // Hard delete - no orders, safe to remove completely
            return this.connection.remove({
                from: this.tableName,
                where: {
                    CustomerId: customerId
                }
            })
        }
    }

    public async softDelete(customerId: number) {
        return this.connection.update({
            in: this.tableName,
            set: {
                Status: 'deleted',
                DeletedOn: new Date(),
                ModifiedOn: new Date()
            },
            where: {
                CustomerId: customerId
            }
        })
    }

    public async restore(customerId: number) {
        return this.connection.update({
            in: this.tableName,
            set: {
                Status: 'active',
                DeletedOn: null,
                ModifiedOn: new Date()
            },
            where: {
                CustomerId: customerId
            }
        })
    }

    public async getAll(order: string = 'asc', includeDeleted: boolean = false) {
        try {
            // Try with decryption first
            
            const query: any = {
                from: this.tableName,
                order: {
                    by: this.primaryKey,
                    type: order
                },
                decrypt: true
            }

            // Note: Status filtering will be handled in application logic
            // to avoid issues with legacy data that doesn't have Status field
            
            const entities = await this.connection.select(query)

            if (!entities) {
                return []
            }

            
            // Filter out deleted customers in application logic
            if (!includeDeleted) {
                const activeCustomers = entities.filter(customer => 
                    !customer.Status || customer.Status === 'active'
                )
                return activeCustomers
            }
            
            return entities
        } catch (error) {
            console.warn('CustomerCommand.getAll: Decryption failed, loading raw data:', error.message)
            
            // Fallback to raw data if decryption fails
            try {
                const query: any = {
                    from: this.tableName,
                    order: {
                        by: this.primaryKey,
                        type: order
                    }
                }

                // Note: Status filtering will be handled in application logic
                // to avoid issues with legacy data that doesn't have Status field

                const rawEntities = await this.connection.select(query)

                if (!rawEntities) {
                    return []
                }

                
                // Filter out deleted customers in application logic
                if (!includeDeleted) {
                    const activeCustomers = rawEntities.filter(customer => 
                        !customer.Status || customer.Status === 'active'
                    )
                    return activeCustomers
                }
                
                return rawEntities
            } catch (rawError) {
                console.error('CustomerCommand.getAll: Both decrypted and raw queries failed:', rawError)
                return []
            }
        }
    }

    public async getDeleted() {
        return this.getAll('asc', true).then(customers => 
            customers.filter(customer => customer.Status === 'deleted')
        )
    }

}
