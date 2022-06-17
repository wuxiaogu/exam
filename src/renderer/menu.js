import Goods from './pages/menu/Goods.vue';
import DetailList from './pages/menu/DetailList.vue';

import Setting from './pages/menu/Setting.vue';
import New from './pages/menu/New.vue';
import Tpl from './pages/menu/Tpl.vue';
import Location from './pages/menu/Location.vue';
import History from './pages/menu/History.vue';
import User from './pages/menu/User.vue';
import CheckList from './pages/menu/CheckList.vue';
import Table from './pages/menu/Table.vue';
import Door from './pages/menu/Door.vue';

const menu = [
  {
    icon: 'cube',
    title: '新建考试',
    path: '/new',
    component: New,
    show: true,
  },

  {
    icon: 'cube',
    title: '历史考试',
    path: '/history',
    component: History,
    show: true,
  },

  {
    icon: 'cube',
    title: '考试设置',
    path: '/setting',
    component: Setting,
    show: false,
  },

  {
    icon: 'cube',
    title: '模板管理',
    path: '/tpl',
    component: Tpl,
    show: false,
  },

  {
    icon: 'cube',
    title: '考点管理',
    path: '/location',
    component: Location,
    show: true,
  },

  {
    icon: 'cube',
    title: '考生列表',
    path: '/user',
    component: User,
    show: false,
  },

  {
    icon: 'cube',
    title: '核验列表',
    path: '/checklist',
    component: CheckList,
    show: false,
  },

  {
    icon: 'cube',
    title: '桌贴',
    path: '/table',
    component: Table,
    show: false,
  },

  {
    icon: 'cube',
    title: '门贴',
    path: '/door',
    component: Door,
    show: false,
  },

  {
    icon: 'cube',
    title: '物品管理',
    path: '/goods',
    component: Goods,
    show: false,
  },
  {
    icon: 'clipboard',
    title: '进出明细',
    path: '/detailList',
    component: DetailList,
    show: false,
  },

];
export default menu;
