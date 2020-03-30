<template>
    <div id="app">
        <div class="test">
            <!--            <g-date-picker :value="value"-->
            <!--                           @updateDay="value=$event"-->
            <!--                           :time="false"-->
            <!--                           :time-scope="timeScope"-->
            <!--                           :date-scope="dateScope"-->
            <!--                           :date-scope-function="dateScopeFunction"-->
            <!--                           :time-scope-function="timeScopeFunction"-->
            <!--            >-->
            <!--            </g-date-picker>-->
            <calendar :value="value"
                      @updateDay="value=$event"
                      :on-confirm="confirm"
                      :on-change-day="onChangeDay"
                      :on-change-month="onChangeMonth"
                      :on-change-year="onChangeYear"
                      :todo-date-list="todoDateList"
                      :disabled-date="disabledDate2"
                      :time="false"/>
            <!--            <button @click="x">确定</button>-->
            <!--            <datepicker :value="value" @updateDay="value = $event" :time="false" :scope="scope"-->
            <!--                        :dateScopeFunction="dateScopeFunction" class="g-date-picker"></datepicker>-->

        </div>

    </div>
</template>

<script>
    import datepicker from './components/date-picker';
    import calendar from './components/calendar';

    export default {
        name: 'app',
        components: {
            'g-date-picker': datepicker,
            calendar
        },
        data() {
            return {
                value: new Date(),
                dateScope: [new Date(1992, 11), new Date()],
                timeScope: ['8:30', '22:30'], //['8:30','12:30'] 在这之间的时间可选择
                todoDateList: ['2020-03-23'],
                // disabledDate: ['2020-01-02', new Date()]
                disabledDate: (date) => {
                    return new Date(date).toDateString() === new Date('2020-03-30').toDateString();
                }
            };
        },
        methods: {
            disabledDate2(date) {
                let now = new Date()
                if (now.getTime() > date) {
                    return true;
                } else {
                    return false;
                }

            },
            dateScopeFunction() {
                alert('日期限制为 1992.11 - 今天');
            },
            timeScopeFunction() {
                alert('日期限制为 8:30 ~ 22:30');
            },
            confirm() {
                //点击确定要干的事情
                console.log('点击确定了');
            },
            onChangeDay() {
                console.log('日期变化了');
            },
            onChangeYear({year, month}) {
                console.log(year, month);
            },
            onChangeMonth({year, month}) {
                console.log(year, month);
            },
        }
    };
</script>

<style lang="less">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

    .g-date-picker .g-date-picker-cell.currentMonth {
        /*color: red;*/
    }

</style>
