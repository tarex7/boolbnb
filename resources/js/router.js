// IMPORT VUE E VUE ROUTER
import Vue from "vue";
import VueRouter from "vue-router";

// IMPORTO I COMPONENTI DELLLE PAGINE
import HomePage from "./components/pages/HomePage.vue";
import AboutPage from "./components/pages/AboutPage.vue";
import ContactsPage from "./components/pages/ContactsPage.vue";
import FlatDetail from "./components/pages/FlatDetail.vue";
import SearchPage from "./components/pages/SearchPage.vue";

// //IMPORT PAGE ERROR SOTTO A TUTTO
// import NotFoundPage from './components/pages/NotFoundPage.vue'

//DICO A VUE DI USARE VUEROUTER
Vue.use(VueRouter);

//DEFINZIONE DELLE ROTTE
const routes = new VueRouter({
    mode: "history",
    linkExactActiveClass: "active",
    routes: [
        { path: "/", component: HomePage, name: "home" },
        { path: "/about", component: AboutPage, name: "about" },
        { path: "/contacts", component: ContactsPage, name: "contacts" },
        { path: "/flats/:id", component: FlatDetail, name: "flat-detail" },
        {
            path: "/search",
            component: SearchPage,
            name: "search",
            meta: {
                auth: true,
            },
        },

        // { path: '*', component: NotFoundPage, name: 'not_found' },
    ],
});

export default routes;
