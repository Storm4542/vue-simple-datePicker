import Vue from 'vue';
import App from './App.vue';
import touch from 'vue-directive-touch';

Vue.config.productionTip = false;
Vue.use(touch);
new Vue({
    render: h => h(App),
}).$mount('#app');
