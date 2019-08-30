<template>
    <div v-click-outside="close" class="g-date-picker" ref="wrapper">
        <div :class="c('header')">
            <div @click="datePickerVisible = !datePickerVisible" :class="c('header-select')">
                <span :class="c('header-select-year')"> {{helper.getYearMonthDate(value)[0]}}</span>
                <span :class="c('header-select-month')">  {{helper.getYearMonthDate(value)[1]+1}}月</span>
                <span style="transform: rotate(0.75turn);"><g-icon iconname="left"></g-icon></span>
            </div>
            <div v-touch:left="onLeftTouchHeader" v-touch:right="onRightTouchHeader" :class="c('header-days')">
                <div @click="onClickCell(new Date(i))"
                     :class="[c('header-days-day')]"
                     v-for="i in getVisibleWeek() " :key="i+0">
                    <span :class="c('header-days-day-week')">{{ weekTranslate(new Date(i)) }}</span>
                    <span :class="[c('header-days-day'),{selected:isSelected(new Date(i))}]"> {{new Date(i).getDate()}}</span>

                </div>
            </div>
        </div>
        <transition name="slide">
            <div v-show="datePickerVisible" class="g-date-picker-pop" @selectstart.prevent>
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
                    <span @click="nextYear" :class="c('nextYear','navItem')"><g-icon
                            iconname='rightright'></g-icon></span>
                </div>
                <div v-touch:left="onLeftTouchPanels" v-touch:right="onRightTouchPanels" class="g-date-picker-panels">
                    <template>
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
                                    <!--一周七天-->
                                <!--二元数组-->
                                 {{getVisibleDay(i,j).getDate()}}
                             </span>
                        </div>
                    </template>
                </div>
                <div :class="c('actions')">
                    <g-button v-show="mode!=='time'" @click="onClickToday">今天</g-button>
                    <g-button @click="onClickConfirm">确定</g-button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import GIcon from './icon';
    import GButton from './button';
    import ClickOutside from './click-outside';
    import helper from './helper';


    export default {
        name: "g-calendar",
        components: {GIcon, GButton},
        directives: {ClickOutside},
        props: {
            firstDayOfWeek: {
                type: Number,
                default: 1
            },
            value: {
                type: Date,
            },
            dateScope: {
                type: Array,//[start,end]
                // default: () => [helper.addYear(new Date(), -20), helper.addYear(new Date(), 20)] //默认20年前，20年后
            },
            timeScope: {
                type: Array
            },
            dateScopeFunction: {
                type: Function,
            },
            timeScopeFunction: {
                type: Function,
            },
            time: {
                type: Boolean,
                default: true
            },
            onConfirm: {
                type: Function,
                default: () => {}
            }
        },
        mounted() {
            this.wrapper = this.$refs.wrapper;
        },
        data() {
            let [year, month, day, hour, minutes] = helper.getYearMonthDate(this.value !== undefined ? this.value : new Date());
            let isAfternoon = '0';
            if (hour > 12) {
                isAfternoon = '1';
                hour -= 12;
            }
            minutes = '15';
            return {
                mode: 'days', // | 'months' | 'days' | 'time'
                helper: helper,
                datePickerVisible: false,
                weekdays: ['日', '一', '二', '三', '四', '五', '六'],
                wrapper: null,
                display: {year, month, isAfternoon, hour, minutes},
                displayCheck: {year, month, isAfternoon, hour, minutes},
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
            years() {
                return helper.range(this.dateScope[0].getFullYear(), this.dateScope[1].getFullYear());
            }

        },
        methods: {
            onOpen() {
                this.mode = 'days';
            },
            close() {
                this.datePickerVisible = false;
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
            formattedValue() {
                if (!this.value) {
                    return '';
                }
                const [year, month, day, hour, minute] = this.helper.getYearMonthDate(this.value);
                if (this.time) {
                    return `${year}-${helper.pad2(month + 1)}-${helper.pad2(day)} ${helper.pad2(hour)}:${helper.pad2(minute)}`;
                } else {
                    return `${year}-${helper.pad2(month + 1)}-${helper.pad2(day)}`;
                }
            },
            weekTranslate(day) {
                let week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                if (this.isToady(new Date(day))) return '今天';
                return week[day.getDay()];
            },
            getVisibleDay(row, col) {
                return this.visibleDays[(row - 1) * 7 + col - 1];
            },
            getVisibleWeek() {
                let value = (this.value).getTime();
                let oneDay = 1000 * 60 * 60 * 24;
                return [value - 3 * oneDay, value - 2 * oneDay, value - oneDay, value, value + oneDay, value + 2 * oneDay, new Date(value + 3 * oneDay)];
            },
            onLeftTouchHeader() {
                this.onClickCell(new Date((this.value).getTime() + 6 * 1000 * 60 * 60 * 24));
            },
            onRightTouchHeader() {
                this.onClickCell(new Date((this.value).getTime() - 6 * 1000 * 60 * 60 * 24));
            },
            onRightTouchPanels() {
                this.preMonth();
            },
            onLeftTouchPanels() {
                this.nextMonth();
            },
            onClickCell(date) {
                let [year, month, day, hour, minutes] = helper.getYearMonthDate(date);
                this.display = {year, month, day, hour, minutes};
                this.$emit('updateDay', date);
            },
            nextMode() {
                if (this.mode === 'months') {
                    this.mode = 'days';
                } else if (this.mode === 'days') {
                    this.mode = 'time';
                } else {
                    this.updateTime();
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
                if (d >= this.dateScope[0] && d <= this.dateScope[1]) {
                    this.display.year = parseInt(e.target.value);
                } else {
                    e.target.value = this.display.year;
                    this.dateScopeFunction();
                }
            },
            onSelectMonth(e) {
                const month = parseInt(e.target.value);
                const d = new Date(this.display.year, month);
                if (d >= this.dateScope[0] && d <= this.dateScope[1]) {
                    this.display.month = parseInt(e.target.value);
                } else {
                    e.target.value = this.display.month;
                    this.dateScopeFunction();
                }

            },
            onSelectTime(e) {
                this.displayCheck.isAfternoon = parseInt(e.target.value);
            },
            onSelectHour(e) {
                this.displayCheck.hour = parseInt(e.target.value);
            },
            onSelectMinutes(e) {
                this.displayCheck.minutes = parseInt(e.target.value);
            },
            onClickToday() {
                const date = new Date();
                const [y, m] = helper.getYearMonthDate(date);
                this.display.year = y;
                this.display.month = m;
                this.$emit('updateDay', date);
            },
            onClickConfirm() {
                this.onConfirm();
                this.close();
            }
        }
    };
</script>

<style lang="less" scoped>
    @import "./_var";

    .g-date-picker {
        text-align: center;

        &-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            border: 1px solid green;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #FFFFFF;

            &-select {
                border-right: 1px solid;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 0 10px;

                &-year {
                    font-size: 12px;
                    font-weight: bold;
                }

                &-month {
                    font-size: 18px;
                    font-weight: bolder;
                }
            }

            &-days {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                align-items: center;
                width: 80%;

                & .selected {
                    color: #ffffff;
                    background-color: @blue;
                    border-radius: 50%;
                }

                &-day {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 6px;

                    &-week {
                        display: block;
                        font-size: 12px;
                        margin-bottom: 6px;
                    }
                }
            }
        }

        &-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
        }

        &-pop {
            border: 1px solid #ddd;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #FFFFFF;
        }

        &-pop-wrapper {
            padding: 0;
        }

        select {
            display: inline-block;
            font-size: 16px;
            font-family: sans-serif;
            font-weight: 700;
            color: #444;
            line-height: 1.3;
            padding: .6em 1.4em .5em .8em;
            max-width: 100%;
            box-sizing: border-box;
            margin: 0;
            border: 1px solid #aaa;
            box-shadow: 0 1px 0 1px rgba(0, 0, 0, .04);
            border-radius: .5em;
            -moz-appearance: none;
            -webkit-appearance: none;
            appearance: none;
            background-color: #fff;
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'),
            linear-gradient(to bottom, #ffffff 0%, #e5e5e5 100%);
            background-repeat: no-repeat, repeat;
            background-position: right .7em top 50%, 0 0;
            background-size: .65em auto, 100%;
        }

        select::-ms-expand {
            display: none;
        }

        select:hover {
            border-color: #888;
        }

        select:focus {
            border-color: #aaa;
            box-shadow: 0 0 1px 3px rgba(59, 153, 252, .7);
            color: #222;
            outline: none;
        }

        select option {
            font-weight: normal;
        }

        &-cell {
            color: #ddd;
            cursor: not-allowed;
            border-radius: @border-radius;

            &.currentMonth {
                color: black;
            }

            &.today {
                background-color: rgba(221, 221, 221, 0.34);
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
            height: 48px;
            width: 48px;
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

    @keyframes bounce-in {
        0% {
            transform: translateY(100%);
        }

        100% {
            transform: translateY(0%);
        }
    }

    .slide-enter-active {
        animation: bounce-in .5s;
    }

    .slide-leave-active {
        animation: bounce-in .5s reverse;
    }


</style>
