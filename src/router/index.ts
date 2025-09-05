import { createWebHistory, createRouter } from "vue-router";
// @ts-ignore
import Registration from "../pages/Registration.vue";
// @ts-ignore
import Dashboard from "../pages/Dashboard.vue";
// @ts-ignore
import Login from "../pages/Login.vue";
// @ts-ignore
import Inventory from "../pages/Inventory.vue";
// @ts-ignore
import Items from "../pages/Items.vue";
// @ts-ignore
import Reports from "../pages/Reports.vue";
// @ts-ignore
import InventoryReports from "../pages/InventoryReports.vue";
// @ts-ignore
import Customers from "../pages/Customers.vue";
import {session} from "../composables/Session";

const routes = [
    {
        path: "/login",
        name: "Login",
        component: Login,
    },
    {
        path: "/register",
        name: "Registration",
        component: Registration,
    },
    {
        path: "/",
        name: "Dashboard",
        component: Dashboard
    },
    {
        path: "/inventory",
        name: "Inventory",
        component: Inventory
    },
    {
        path: "/items",
        name: "Items",
        component: Items
    },
    {
        path: "/reports",
        name: "Reports",
        component: Reports
    },
    {
        path: "/inventories/:id/reports",
        name: "InventoryReports",
        component: InventoryReports
    },
    {
        path: "/customers",
        name: "Customers",
        component: Customers
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// @ts-ignore
router.beforeEach(async (to, from, next) => {

    const sess = await session();
    const data = await sess.data()
    if (data.isLoggedIn) {
        // Allow access to all routes when logged in
        next()
        return
    } else if (data.isInitialized) {
        if (to.path !== '/login') {
            next('/login')
            return
        }
    } else {
        if (to.path !== '/register') {
            next('/register')
            return
        }
    }

    next()
})

export {router}
