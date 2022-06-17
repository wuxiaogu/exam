<template>
    <div class="home-background theme-color1">
        <Header class="header"></Header>

<!--         <div class="backgd">
            <div style="width: 160px;text-align: center; padding: 30px;">
                <img :src="logo_img" width="50" height="50" style="border-radius: 25px;">
                <div style="color: #fff;font-size: 14px;">
                    人社局
                </div>
            </div>
        </div> -->

        <Aside class="aside"></Aside>
        <div class="container">
            <router-view class="clearfix"></router-view>
        </div>

        <div style="text-align: center; background-color: #eef2fb; text-align: center;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;">
            <p style="padding: 15px;font-size: 14px;">本系统由<a>安徽中慧创联网络科技有限公司</a>开发并提供技术支持</p>
        </div>

    </div>
</template>
<script>
import Aside from '../components/Aside.vue';
import Header from '../components/Header.vue';

export default {
  data() {
    return {
        logo_img: __static + "/img/logo.png",
    };
  },
  components: {
    Aside,
    Header,
  },
};
</script>
<style lang="less">
    @import "../assets/less/global.less";

    .home-background {
        position: relative;
        background-color: #eef2fb;
        .header {
            height: 70px;
            line-height: 70px;
            color: #FFF;
            border-bottom: 1px solid #4995ff;
            font-size: 20px;
        }
        .aside {
            position: absolute;
            top: 80px;
            bottom: 0;
            left: 0;
            width: 150px;
        }
        .container {
            position: absolute;
            top: 80px;
            right: 0;
            left: 150px;
            bottom: 0;
            overflow: auto;
            padding: @view-padding;
            padding-bottom: 60px;
            .clearfix{

            }
        }
        .backgd {
            height: 130px;
            background-color: #1e7cff;
        }
        .wrapper{
            border-radius: 5px;
        }
    }
</style>
