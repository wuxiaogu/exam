import Vue from 'vue';
import VueRouter from 'vue-router';
import iView from 'iview';
import routes from './route';
import store from './store';
import filters from './utils/util';
import db from './utils/db';
import logger from './utils/logger';
import 'iview/dist/styles/iview.css';
import './assets/less/common.less';

import plTable from 'pl-table'
import 'pl-table/themes/index.css' // 引入样式（必须引入)，vuecli3.0不需要配置，cli2.0请查看webpack是否配置了url-loader对woff，ttf文件的引用,不配置会报错哦
import 'pl-table/themes/plTableStyle.css' // 默认表格样式很丑 引入这个样式就可以好看啦（如果你不喜欢这个样式，就不要引入，不引入就跟ele表格样式一样）
Vue.use(plTable);

import App from './App.vue';
// 升级脚本
import './utils/upgrade';

Vue.use(VueRouter);

Vue.use(iView);

Object.keys(filters).forEach(k => Vue.filter(k, filters[ k ]));

const router = new VueRouter({
  routes,
});

Vue.prototype.$db = db;

Vue.prototype.$logger = logger;

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});
