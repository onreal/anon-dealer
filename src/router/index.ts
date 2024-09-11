import { createWebHistory, createRouter } from "vue-router";
// @ts-ignore
import Registration from "../pages/Registration.vue";
// @ts-ignore
import Dashboard from "../pages/Dashboard.vue";
// @ts-ignore
import Login from "../pages/Login.vue";
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
        if (to.path !== '/') {
            next('/')
            return
        }
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
