import {Connection} from "jsstore";

export class Command {

    protected static instances: Record<string, Command> = {};

    protected connection: any
    protected tableName: string
    protected primaryKey: string
    protected app

    constructor(primaryKey: string, tableName: string, app: any, connection: Connection | null = null) {
        this.app = app
        this.tableName = tableName
        this.primaryKey = primaryKey

        if (!this.connection && connection === null) {
            this.connection = this.app.config.globalProperties.$anon
        }
        else if (connection !== null) {
            this.connection = connection
        }
    }

    public static getInstance(tableName: string, connection: Connection, app: any): Command {
        if (!this.instances[tableName]) {
            // @ts-ignore
            this.instances[tableName] = new this(app, connection);
        }

        return this.instances[tableName];
    }

    protected getConnection() {
        return this.connection
    }

    public async getOne(order: string = 'asc') {
        const entity = await this.connection.select({
            from: this.tableName,
            order: {
                by: this.primaryKey,
                type: order
            },
            limit: 1
        })

        if (!entity) {
            return null
        }

        return entity[0]
    }

    public async getById(entityId: any) {
        const condition: Record<string, any> = {};
        condition[this.primaryKey] = entityId;

        const entity = await this.connection.select({
            from: this.tableName,
            where: condition,
            limit: 1
        })

        if (!entity) {
            return null
        }

        return entity[0]
    }

    public async delete(entityId: any) {
        const condition: Record<string, any> = {};
        condition[this.primaryKey] = entityId;

        return this.connection.remove({
            from: this.tableName,
            where: condition
        })
    }

    public async add(entity: any) {
        return this.connection.insert({
            into: this.tableName,
            values: [entity],
            return: true
        })
    }

    async list(limit: number = 10, order: string = 'asc') {
        const entities = await this.connection.select({
            from: this.tableName,
            limit,
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
    }

    async getAll(order: string = 'asc') {
        try {
            // Temporarily disable decryption to avoid Malformed UTF-8 data errors
            
            const entities = await this.connection.select({
                from: this.tableName,
                order: {
                    by: this.primaryKey,
                    type: order
                }
                // No decrypt: true to avoid the Malformed UTF-8 data error
            })

            if (!entities) {
                return []
            }

            return entities
        } catch (error) {
            console.error(`Command.getAll: Failed to load ${this.tableName}:`, error)
            return []
        }
    }
}
