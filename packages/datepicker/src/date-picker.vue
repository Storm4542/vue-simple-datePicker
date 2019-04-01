<template>
    <div ref="wrapper">
        <g-popover ref="popover" position="bottom" :container="wrapper" @open="onOpen">
            <g-input :value="formattedValue" readonly type="text"/>
            <template slot="content">
                <div class="g-date-picker-pop" @selectstart.prevent>
                    <div class="g-date-picker-nav">
                        <span @click="preYear" :class="c('preYear','navItem')"> <g-icon
                                iconname="leftleft"></g-icon></span>
                        <span @click="preMonth" :class="c('preMonth','navItem')"><g-icon
                                iconname="left"></g-icon></span>
                        <span @click="onClickMonths" :class="c('yearAndMonth')">
                            <span>{{display.year}}年</span>
                            <span>{{display.month+1}}月</span>
                        </span>
                        <span @click="nextMonth" :class="c('nextMonth','navItem')"> <g-icon
                                iconname='right'></g-icon></span>
                        <span @click="nextYear" :class="c('nextYear','navItem')"><g-icon iconname='rightright'></g-icon></span>
                    </div>
                    <div class="g-date-picker-panels">
                        <template v-if="mode === 'months'">
                            <div :class="c('selectMonth')">
                                <div :class="c('selects')">
                                    <label>
                                        <select @change="onSelectYear" :value="display.year">
                                            <option v-for="year in years" :value="year">{{year}}</option>
                                        </select>年
                                    </label>
                                    <label>
                                        <select @change="onSelectMonth" :value="display.month">
                                            <option value="0">1</option>
                                            <option value="1">2</option>
                                            <option value="2">3</option>
                                            <option value="3">4</option>
                                            <option value="4">5</option>
                                            <option value="5">6</option>
                                            <option value="6">7</option>
                                            <option value="7">8</option>
                                            <option value="8">9</option>
                                            <option value="9">10</option>
                                            <option value="10">11</option>
                                            <option value="11">12</option>
                                        </select>月
                                    </label>
                                </div>
                            </div>
                        </template>
                        <template v-else-if="mode === 'days'">
                            <div :class="c('weekdays')">
                                <span :class="c('weekday')" v-for="n in [1,2,3,4,5,6,0]" :key="n">
                                    {{weekdays[n]}}
                                </span>
                            </div>
                            <!--6个 DIV 代表 6 行（6周） -->
                            <div :class="c('row')" v-for="i in helper.range(1,6)" :key="i">
                                <!--7个span 代表 7列（7天）-->
                                <span @click="onClickCell(getVisibleDay(i,j))"
                                      :class="[c('cell'),
                                      {currentMonth:isCurrentMonth(getVisibleDay(i,j)),
                                      selected:isSelected(getVisibleDay(i,j)),
                                      today:isToady(getVisibleDay(i,j))}
                                      ]"
                                      v-for="j in helper.range(1,7)" :key="j">
                                    <!--二元数组-->
                                 {{getVisibleDay(i,j).getDate()}}
                             </span>
                            </div>
                        </template>
                        <template v-else>
                            <label>
                                <select @change="onSelectTime" :value="display.isAfternoon">
                                    <option value="0">上午</option>
                                    <option value="1">下午</option>

                                </select>
                            </label>
                            <label>
                                <select @change="onSelectHour" :value="display.hour">
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                </select>时
                            </label>
                            <label>
                                <select @change="onSelectMinutes" :value="display.minutes">
                                    <option value="0">0</option>
                                    <option value="15">15</option>
                                    <option value="30">30</option>
                                    <option value="45">45</option>
                                </select>分
                            </label>
                        </template>
                    </div>
                    <div :class="c('actions')">
                        <g-button @click="nextMode">确定</g-button>
                        <g-button v-show="mode!=='time'" @click="onClickToday">今天</g-button>
                        <g-button @click="onClickClear">清除</g-button>
                    </div>
                </div>
            </template>
        </g-popover>


    </div>
</template>

<script>
    import GInput from './input';
    import GIcon from './icon';
    import GPopover from './popover';
    import GButton from './button';
    import ClickOutside from './click-outside';
    import helper from './helper';


    export default {
        name: "g-date-picker",
        components: {GInput, GIcon, GPopover, GButton},
        directives: {ClickOutside},
        props: {
            firstDayOfWeek: {
                type: Number,
                default: 1
            },
            value: {
                type: Date,
            },
            scope: {
                type: Array,//[start,end]
                default: () => [helper.addYear(new Date(), -20), helper.addYear(new Date(), 20)] //默认20年前，20年后
            },
            scopeFunction: {
                type: Function,
            },
            time: {
                type: Boolean,
                default: true
            }
        },
        mounted() {
            this.wrapper = this.$refs.wrapper;
        },
        data() {
            let [year, month, day, hour, minutes] = helper.getYearMonthDate(this.value || new Date());
            let isAfternoon = '0';
            if (hour > 12) {

                isAfternoon = '1';
                hour -= 12;
            }
            minutes = '15';
            return {
                mode: 'days', // | 'months' | 'days' | 'time'
                helper: helper,
                weekdays: ['日', '一', '二', '三', '四', '五', '六'],
                wrapper: null,
                display: {year, month, isAfternoon, hour, minutes},
                cellDate: new Date(),
            };
        },
        computed: {
            visibleDays() {
                let date = new Date(this.display.year, this.display.month, 1);
                let firstDay = helper.firstDayOfMonth(date);
                //计算
                let weekDayOfFirst = firstDay.getDay() || 7; // 一号是周几
                //计算 日历表上的第一天是哪一天
                let x = firstDay - (weekDayOfFirst - 1) * 3600 * 24 * 1000;
                let array = [];
                //根据第一天，生成总共的42天
                for (let i = 0; i < 42; i++) {
                    array.push(new Date(x + i * 3600 * 24 * 1000));
                }
                return array;
            },
            formattedValue() {
                console.log('当前', this.value);
                if (!this.value) {
                    return '';
                }
                const [year, month, day, hour, minute] = this.helper.getYearMonthDate(this.value);
                if (this.time) {
                    return `${year}年${month + 1}月${day}日${hour}时${minute}分`;
                } else {
                    return `${year}年${month + 1}月${day}日`;
                }
            },
            years() {
                return helper.range(this.scope[0].getFullYear(), this.scope[1].getFullYear());
            }

        },
        methods: {
            onOpen() {
                this.mode = 'days';
            },
            c(...classNames) {
                return classNames.map(className => `g-date-picker-${className}`);
            },
            onClickMonths() {
                if (this.mode !== 'months') {
                    this.mode = 'months';
                } else {
                    this.mode = 'days';
                }
            },
            getVisibleDay(row, col) {
                return this.visibleDays[(row - 1) * 7 + col - 1];
            },
            onClickCell(date) {
                if (this.isCurrentMonth(date)) {
                    console.log(date);
                    this.cellDate = date;
                    // let [y, m, n, hour, minute] = helper.getYearMonthDate(new Date());
                    // date.setHours(hour);
                    // date.setMinutes(minute);
                    if (!this.time) {
                        this.$emit('updateDay', date);
                        this.$refs.popover.close();
                    }
                }
            },
            nextMode() {
                if (this.mode === 'months') {
                    this.mode = 'days';
                    console.log(this.mode);
                } else if (this.mode === 'days') {
                    this.mode = 'time';
                    console.log(this.mode);
                } else {
                    console.log(this.mode);
                    console.log(this.display.isAfternoon);
                    if (parseInt(this.display.isAfternoon) === 1) {
                        this.display.hour += 12;
                    }
                    let date = this.cellDate;
                    date.setHours(this.display.hour);
                    date.setMinutes(this.display.minutes);
                    console.log(date);
                    this.$emit('updateDay', date);

                    this.$refs.popover.close();
                }
            },
            isCurrentMonth(day) {
                const [year1, month1] = this.helper.getYearMonthDate(day);
                const [year2, month2] = this.helper.getYearMonthDate(new Date(this.display.year, this.display.month, 1));
                return year1 === year2 && month1 === month2;
            },
            isSelected(date) {
                if (!this.value) return false;
                let [year, month, day] = helper.getYearMonthDate(date);
                let [year1, month1, day1] = helper.getYearMonthDate(this.value);
                return year === year1 && month === month1 && day === day1;
            },
            isToady(date) {
                let [year, month, day] = helper.getYearMonthDate(date);
                let [year1, month1, day1] = helper.getYearMonthDate(new Date());
                return year === year1 && month === month1 && day === day1;
            },
            preYear() {
                if (this.mode === 'time') return;
                const oldDate = new Date(this.display.year, this.display.month, 1);
                const newDate = helper.addYear(oldDate, -1);
                let [year, month, day, hour, minutes] = helper.getYearMonthDate(newDate);
                let isAfternoon = '0';
                if (hour > 12) {
                    isAfternoon = '1';
                    hour -= 12;
                }
                minutes = '15';
                this.display = {year, month, isAfternoon, hour, minutes};
            },
            preMonth() {
                if (this.mode === 'time') return;
                const oldDate = new Date(this.display.year, this.display.month, 1);
                const newDate = helper.addMonth(oldDate, -1);
                let [year, month, day, hour, minutes] = helper.getYearMonthDate(newDate);
                let isAfternoon = '0';
                if (hour > 12) {
                    isAfternoon = '1';
                    hour -= 12;
                }
                minutes = '15';
                this.display = {year, month, isAfternoon, hour, minutes};

            },
            nextYear() {
                if (this.mode === 'time') return;
                const oldDate = new Date(this.display.year, this.display.month, 1);
                const newDate = helper.addYear(oldDate, 1);
                let [year, month, day, hour, minutes] = helper.getYearMonthDate(newDate);
                let isAfternoon = '0';
                if (hour > 12) {
                    isAfternoon = '1';
                    hour -= 12;
                }
                minutes = '15';
                this.display = {year, month, isAfternoon, hour, minutes};
            },
            nextMonth() {
                if (this.mode === 'time') return;
                const oldDate = new Date(this.display.year, this.display.month, 1);
                const newDate = helper.addMonth(oldDate, 1);
                let [year, month, day, hour, minutes] = helper.getYearMonthDate(newDate);
                let isAfternoon = '0';
                if (hour > 12) {
                    isAfternoon = '1';
                    hour -= 12;
                }
                minutes = '15';
                this.display = {year, month, isAfternoon, hour, minutes};
            },
            onSelectYear(e) {
                const year = parseInt(e.target.value);
                const d = new Date(year, this.display.month);
                if (d >= this.scope[0] && d <= this.scope[1]) {
                    this.display.year = parseInt(e.target.value);
                } else {
                    e.target.value = this.display.year;
                    this.scopeFunction();
                }
            },
            onSelectMonth(e) {
                const month = parseInt(e.target.value);
                const d = new Date(this.display.year, month);
                if (d >= this.scope[0] && d <= this.scope[1]) {
                    this.display.month = parseInt(e.target.value);
                } else {
                    e.target.value = this.display.month;
                    this.scopeFunction();
                }

            },
            onSelectTime(e) {
                this.display.isAfternoon = parseInt(e.target.value);
                console.log(this.display.isAfternoon);
            },
            onSelectHour(e) {
                this.display.hour = parseInt(e.target.value);
            },
            onSelectMinutes(e) {
                this.display.minutes = parseInt(e.target.value);
            },
            onClickToday() {
                const date = new Date();
                const [y, m] = helper.getYearMonthDate(date);
                this.display.year = y;
                this.display.month = m;
                this.$emit('updateDay', date);
            },
            onClickClear() {
                this.$emit('updateDay', undefined);
                this.$refs.popover.close();
            }
        }
    };
</script>

<style lang="less" scoped>
    @import "./_var";

    .g-date-picker {
        &-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
        }

        &-pop {
            padding: 8px;
        }

        &-pop-wrapper {
            padding: 0;
        }

        &-cell {
            color: #ddd;
            cursor: not-allowed;
            border-radius: @border-radius;

            &.currentMonth {
                color: black;

                &:hover {
                    background-color: @blue;
                    color: #FFF;
                    cursor: pointer;
                }
            }

            &.today {
                background-color: @grey;
            }

            &.selected {
                color: #ffffff;
                background-color: @blue;
            }

        }

        &-yearAndMonth {
            width: 96px;
            text-align: center;
            cursor: pointer;
            font-weight: bolder;
        }


        &-selectMonth {
            width: 224px;
            height: 224px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        &-returnDayMode {
            padding: 10px;

            button {
                border: 1px solid @grey;
                border-radius: @border-radius;
            }
        }

        &-selects {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        &-navItem, &-cell, &-weekday {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            height: 32px;
            width: 32px;
            cursor: default;
        }

        &-actions {
            padding: 8px;
            text-align: right;
        }

    }

    /deep/ .popover-content-wrapper {
        padding: 0;
    }


</style>
