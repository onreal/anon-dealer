import {ConfigurationRepository} from "./repository/ConfigurationRepository";
import {CustomerRepository} from "./repository/CustomerRepository";
import {InventoryRepository} from "./repository/InventoryRepository";
import {InventorySaleRepository} from "./repository/InventorySaleRepository";
import {ItemRepository} from "./repository/ItemRepository";
import {OrderRepository} from "./repository/OrderRepository";
import {SettingsRepository} from "./repository/SettingsRepository";
import {AttributeRepository} from "./repository/AttributeRepository";
import {ItemAttributeRepository} from "./repository/ItemAttributeRepository";

export const getDatabase = () => {
    return {
        name: "AnonInstance",
        tables: [
            ConfigurationRepository.getRepository(),
            CustomerRepository.getRepository(),
            InventoryRepository.getRepository(),
            InventorySaleRepository.getRepository(),
            ItemRepository.getRepository(),
            AttributeRepository.getRepository(),
            ItemAttributeRepository.getRepository(),
            OrderRepository.getRepository(),
            SettingsRepository.getRepository()
        ]
    };
};
