import {Store} from "./Store";

interface CurrentSession extends Object {
    isLoggedIn: boolean,
    isInitialized: boolean
}

export class Session extends Store<CurrentSession> {
    private static instance: Session | null = null
    private configuration: object | null = null
    private settings: object | null = null

    public async data(): Promise<CurrentSession> {
        return {
            isLoggedIn: await this.isLoggedIn(),
            isInitialized: await this.isInitialized()
        };
    }

    public async getConfigurationPin(): Promise<string|false> {
        let config = await this.getConfiguration()
        if (!config) {
            return false
        }

        // @ts-ignore
        return config.Pin;
    }

    private async isInitialized(): Promise<boolean> {
        let config = await this.getConfiguration()
        return config !== null
    }

    private async isLoggedIn(): Promise<boolean> {
        let config = await this.getConfiguration()
        if (!config) {
            return false
        }

        // @ts-ignore
        return config.Pin !== null && config.Pin !== ''
    }

    // @ts-ignore
    private async getSettings(): Promise<object> {
        if (this.settings === null) {
            // Get globals from window to avoid circular dependency
            const globals = (window as any).__VUE_APP_GLOBALS__;
            if (globals && globals.$command) {
                this.settings = await globals.$command.settings.getOne()
            } else {
                return {};
            }
        }

        return this.settings
    }

    private async getConfiguration(): Promise<object> {
        if (this.configuration === null) {
            // Get globals from window to avoid circular dependency
            const globals = (window as any).__VUE_APP_GLOBALS__;
            if (globals && globals.$command) {
                this.configuration = await globals.$command.Configuration.getOne()
            } else {
                return null;
            }
        }

        return this.configuration
    }

    public dissolve(): void {
        Session.dissolve()
        this.configuration = null
    }

    public static dissolve(): void {
        this.instance = null
    }

    public static getInstance(): Session {
        if (this.instance === null) {
            this.instance = new Session()
        }

        return this.instance
    }
}
const session: () => Session = () => {
    return Session.getInstance()
}

export {session}
