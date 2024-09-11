import {Command} from "./Command"
import {OrderRepository} from "../repository/OrderRepository";
import {Connection} from "jsstore";

export class OrderCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(OrderRepository.getPrimaryKey(),
            OrderRepository.getTableName(),
            app, connection);
    }
}
