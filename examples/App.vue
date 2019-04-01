<template>
    <div id="app">
        <div class="test">
            <datepicker :value="value" @updateDay="value = $event" :time="true" :scope="scope" :scopeFunction="scopeFunction" class="g-date-picker"></datepicker>
            <button @click="x">确定</button>
            <datepicker :value="value" @updateDay="value = $event" :time="false" :scope="scope" :scopeFunction="scopeFunction" class="g-date-picker"></datepicker>

        </div>

    </div>
</template>

<script>
    import datepicker from './components/date-picker';

    export default {
        name: 'app',
        components: {
            datepicker
        },
        data() {
            return {
                fileList: [],
                value: undefined,
                scope: [new Date(1992, 11), new Date()],
            };
        },
        methods: {
            x() {
                console.log(this.value);
            },
            scopeFunction(){
                alert('日期限制为 1992.11 - 今天')
            }

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
