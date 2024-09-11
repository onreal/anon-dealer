import {Command} from "./Command"
import {Connection} from "jsstore";
import {AttributeRepository} from "../repository/AttributeRepository";

export class AttributeCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(AttributeRepository.getPrimaryKey(),
            AttributeRepository.getTableName(),
            app, connection);
    }
}
