
import {reactive, readonly} from 'vue';

export abstract class Store<T extends Object> {
    // @ts-ignore
    protected state: T;

    constructor() {
        this.data().then(async (data) => {
            // @ts-ignore
            await this.setup(data).then(r => this.state = reactive(r) as T);
        });
    }

    protected abstract data(): Promise<T>

    // @ts-ignore
    protected async setup(data: T): Promise<void> {}

    public async getState(): Promise<T> {
        return await readonly(this.state) as T
    }
}
