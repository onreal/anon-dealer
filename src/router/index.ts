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
// P2P pages - lazy loaded to avoid initialization issues
// @ts-ignore
const P2PPage = () => import("../p2p/presentation/pages/P2PPage.vue");
// @ts-ignore
const P2PItemsPage = () => import("../p2p/presentation/pages/P2PItemsPage.vue");
// @ts-ignore
const P2POrdersPage = () => import("../p2p/presentation/pages/P2POrdersPage.vue");
// @ts-ignore
const P2PTestPage = () => import("../p2p/presentation/pages/P2PTestPage.vue");
// @ts-ignore
const AppInitialization = () => import("../components/Loading/AppInitialization.vue");
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
        path: "/initializing",
        name: "AppInitialization",
        component: AppInitialization,
        props: true
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
    },
    {
        path: "/p2p",
        name: "P2P",
        component: P2PPage
    },
    {
        path: "/p2p/items",
        name: "P2PItems",
        component: P2PItemsPage
    },
    {
        path: "/p2p/orders",
        name: "P2POrders",
        component: P2POrdersPage
    },
    {
        path: "/p2p/test",
        name: "P2PTest",
        component: P2PTestPage
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Router guard to handle authentication and worker initialization
router.beforeEach(async (to, from, next) => {
    try {
        // Always allow access to registration, login, and initialization screen
        if (to.path === '/register' || to.path === '/login' || to.path === '/initializing') {
            next()
            return
        }

        // Check if commands are available before trying to get session data
        const globals = (window as any).__VUE_APP_GLOBALS__;
        if (!globals || !globals.$command) {
            // Redirect to initialization screen with the target route as a query parameter
            next({
                path: '/initializing',
                query: { target: to.fullPath }
            })
            return
        }

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
    } catch (error) {
        console.error('Router guard error:', error)
        // If there's an error, redirect to initialization screen
        next({
            path: '/initializing',
            query: { target: to.fullPath }
        })
    }
})

export {router}
