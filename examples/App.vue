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
                      :time="false"></calendar>
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
            };
        },
        methods: {
            dateScopeFunction() {
                alert('日期限制为 1992.11 - 今天');
            },
            timeScopeFunction() {
                alert('日期限制为 8:30 ~ 22:30');

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
