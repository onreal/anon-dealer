import {Store} from "./Store";
import {globals} from "../main";

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
        if (!config) {
            return false
        }

        return true;
    }

    private async isLoggedIn(): Promise<boolean> {
        let configPin = await this.getConfigurationPin()
        if (!configPin || configPin === '' || configPin === null) {
            return false
        }

        return true;
    }

    // @ts-ignore
    private async getSettings(): Promise<object> {
        if (this.settings === null) {
            this.settings = await globals.$command.settings.getOne()
        }

        return this.settings as object
    }

    private async getConfiguration(): Promise<object> {
        this.configuration = await globals.$command.Configuration.getOne()

        return this.configuration as object
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
