<template>
    <div>
        <div class="ivu-tabs-nav-scroll" style="padding: 10px;">
            
            <div class="ivu-tabs-nav"> 

                <router-link :to="{path:'/history'}">
                <div style="" class="return"><Icon type="arrow-left-a"></Icon></div>
                </router-link>

                <h3>{{exam_name}}</h3>
            </div>
        </div>

        <div class="ivu-tabs-nav-scroll">
          <div class="ivu-tabs-nav"> 
            <div class="ivu-tabs-tab" :class="{'ivu-tabs-tab-active': path == 'user'}">
                <router-link :to="{ path: '/user', query: {exam_no: exam_no} }"> 考生列表 </router-link>
            </div>
            <div class="ivu-tabs-tab" :class="{'ivu-tabs-tab-active': path == 'checklist'}">
                <router-link :to="{ path: '/checklist', query: {exam_no: exam_no} }"> 留验单 </router-link>
            </div>
            <div class="ivu-tabs-tab" :class="{'ivu-tabs-tab-active': path == 'table'}">
                <router-link :to="{ path: '/table', query: {exam_no: exam_no} }"> 桌贴 </router-link>
            </div>
            <div class="ivu-tabs-tab" :class="{'ivu-tabs-tab-active': path == 'door'}">
                <router-link :to="{ path: '/door', query: {exam_no: exam_no} }"> 门贴 </router-link>
            </div>
          </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            exam_no: {
                type: String,
                default: ''
            },

            exam_name: {
                type: String,
                default: ''
            },

        },
        data() {
            return {
                path: null
            }
        },

        created() {
            console.log("LOCATION", location);
            console.log("exam_no", this.exam_no);
            this.path = location.hash.match(/#\/(\S*)\?/)[1];
        },

    }
</script>

<style lang="less">
  .ivu-tabs-tab-active{
    border-bottom: 2px solid;
  }
  .ivu-tabs-nav-scroll{
    border-top: 1px solid #ccc;
    border-bottom: 0px;
  }
  .return{
    float: left;
    padding-left: 10px;
    padding-right: 10px;
    border: 1px solid #ccc;
    margin-right: 10px;
    color: #4e4e4e;
    cursor: pointer;
  }
</style>
    