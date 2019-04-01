import datepicker from './src/date-picker';

// 为组件提供 install 安装方法，供按需引入
datepicker.install = function (Vue) {
    Vue.component(datepicker.name, datepicker);
};

// 默认导出组件
export default datepicker;

