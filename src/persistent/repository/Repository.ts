
export class Repository{

    protected static primaryKey: string
    protected static tableName: string
    protected static repository: object

    public static getTableName(): string {
        return this.tableName;
    }

    public static getRepository(): object {
        return this.repository
    }

    public static getPrimaryKey(): string {
        return this.primaryKey;
    }
}
