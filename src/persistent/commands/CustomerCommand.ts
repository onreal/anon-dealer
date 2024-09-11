import {Command} from "./Command"
import {CustomerRepository} from "../repository/CustomerRepository"
import {Connection} from "jsstore";

export class CustomerCommand extends Command {
    constructor(app: any, connection: Connection | null = null) {
        super(CustomerRepository.getPrimaryKey(),
            CustomerRepository.getTableName(),
            app, connection);
    }
}
