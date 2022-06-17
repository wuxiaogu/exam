<style lang="less">
    @import "../assets/less/global.less";

    aside {
        position: relative;
        .layout-menu-left {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 40px;
        }
        .aside-drop-menu {
            position: absolute;
            height: 40px;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            .ivu-dropdown {
                .ivu-dropdown-rel {
                    cursor: pointer;
                }
            }
        }
        .ivu-menu-light{
          background: transparent; 
        }

        .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu){
          border-right: 0;
        }

        .ivu-menu-vertical.ivu-menu-light:after{
          display: none;
        }


    }

    .aboutText {
        p {
            line-height: 26px;
        }
    }

    .psText {
        margin-top: 20px;
    }

    .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu){
      background-color: #1e7cff;
      color: #fff;
      border-radius: 25px;
      box-shadow: 1px 4px 5px rgba(45,140,240,.2);
    }
  
    .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu) span,
    .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu) i{
      color: #fff;
    }

    .ivu-menu-vertical .ivu-menu-item:hover {
      background-color: rgba(45, 140, 240, 0.05);
      border-radius: 25px
    }

</style>

<template>
    <aside>
      
        <Menu ref="menu" @on-select="selectMenu"
              width="100%" :active-name="activeMenuName" accordion class="layout-menu-left">
            <Menu-item v-for="(menu, index) in MENU" :name="menu.path" :key="index" v-show="menu.show">
              <Icon :type="menu.icon" :size="14"></Icon>
              <span style="margin-left: 5px">{{menu.title}}</span>
            </Menu-item>


            <li class="ivu-menu-item" trigger="click" v-on:click="dropMenuClick">
              <i class="ivu-icon ivu-icon-cube" style="font-size: 14px;"></i> 
              <span style="margin-left: 5px;">关于产品</span>
            </li>

        </Menu>
<!--         <div class="aside-drop-menu">
            <Dropdown trigger="click" placement="top-start" @on-click="dropMenuClick">
                <Icon type="navicon-round" :size="26" color="white"></Icon>
                <DropdownMenu slot="list">
                    <DropdownItem name="update">
                        <Icon type="ios-cloud-download-outline" :size="14"></Icon>
                        检查更新
                    </DropdownItem>
                    <DropdownItem name="about">
                        关于
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div> -->
        <Modal
                v-model="modalShow"
                title="关于">
            <div class="aboutText">
                <p><strong>中慧创联人事考试编排系统 {{version}}</strong></p>
                <p>如果您有BUG反馈、意见或更好的建议，请联系我们。</p>
                <p>联系电话：<strong>0556-2222226</strong></p>
            </div>
            <div class="psText">
            </div>
            <div slot="footer">
                <Button @click="modalShow = false">
                    关闭
                </Button>
            </div>
        </Modal>

    </aside>
</template>

<script>
import MENU from '../menu';
import packageJson from '../../../package.json';
import { docDir } from '../utils/settings';

export default {
  data() {
    return {
      MENU,
      activeMenuName: '',
      modalShow: false,
      version: packageJson.version,
      docDir,
    };
  },
  methods: {
    selectMenu(path) {
      this.$router.push({ path });
    },

    dropMenuClick() {
      this.modalShow = true;
    },

    openUrl(url) {
      this.$electron.shell.openExternal(url);
    },
    openPath(path) {
      this.$electron.shell.openItem(path);
    },
  },
  watch: {
    $route() {
      this.activeMenuName = this.$route.path;
      this.$nextTick(() => {
        this.$refs.menu.updateActiveName();
      });
    },
  },
  created() {
    this.activeMenuName = this.$route.path;
    this.$nextTick(() => {
      this.$refs.menu.updateActiveName();
    });
  },
};
</script>
