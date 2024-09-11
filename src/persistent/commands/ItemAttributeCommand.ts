import {Command} from "./Command"
import {Connection} from "jsstore";
import {ItemAttributeRepository} from "../repository/ItemAttributeRepository";

export class ItemAttributeCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(ItemAttributeRepository.getPrimaryKey(),
            ItemAttributeRepository.getTableName(),
            app, connection);
    }
}
