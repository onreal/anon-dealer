import {Connection} from "jsstore";

export class InstanceLoader<T> {
    constructor(private context: Object, app: any) {
        this.app = app
        this.connection = this.app.config.globalProperties.$anon
    }
    // @ts-ignore
    private connection: Connection
    // @ts-ignore
    private app: any

    getInstance(name: string, repository: any) : T {
        // @ts-ignore
        const method = this.context[name].getInstance
        // @ts-ignore
        const instance = method.apply(this.context[name], [repository.name, this.connection, this.app]);
        return <T> instance;
    }
}
