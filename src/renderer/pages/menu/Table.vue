<template>
    <div  style="background-color: #fff;">
      
      <ExamHeader :exam_no="exam_no" :exam_name="exam.exam_name"></ExamHeader>

      <div class="ivu-card-body wrapper">
        
        <div style="position: relative;height: 32px;margin-bottom: 16px;right: 0;">
        <Button type="primary" @click="printBatch" style="position: absolute;z-index: 1;right: 0px">批量打印</Button>
        </div>

        <Card style="margin-bottom: 15px;" v-for="item in user_list">
          <p slot="title">
              考点：{{item.user_location_name}}
          </p>
          <Row :gutter="16">
            <Col span="3" v-for="room in item.room_users" @click.native.prevent="checkList(item, room)" style="min-height: 150px">
                <div class="room_wrapper">
                  <div class="room">
                    <h3>第{{room.user_room_no}}考场</h3>
                    <span v-for="pos in room.pos_names">
                      {{pos.name}}({{pos.num}})
                    </span>
                  </div>
                </div>
            </Col>
          </Row>
        </Card>
      </div>
      
      <!-- 每个考场的数据 -->
      <Modal v-model="checklistModal" width="80%">
        <h1 slot="header">
          桌贴
        </h1>
        <div ref="checkListPrint">
          <h2 style="text-align:center">{{currentLocation.user_location_name}}考点 - 第{{currentCheckList.user_room_no}}考场</h2>

          <div class="wrapper">
            <div class="item" v-for="item in currentCheckList.users" style="margin:2px;float: left;padding: 5px;border: 1px solid #ccc; width: 300px;">
              <div style="float: left;">
                <div style="margin: 0px; padding: 0px; height: 100px;margin-right: 10px;">
                  <img :src="item.user_pic" width="70" height="100">
                </div>
              </div>
    
              <div style="float: left;">
                <p style="font-size: 18px;">{{item.user_name}}</p>
                <p style="font-size: 16px;">准考证号:</p>
                <p style="font-size: 16px;">{{item.user_admission_no}}</p>
                <p style="font-size: 16px;">第{{currentCheckList.user_room_no}}考场</p>
              </div>
              
              <div style="float: right;text-align: center;">
                <p style="font-size: 48px;">{{item.user_seat_no}}</p>
                <p style="font-size: 16px;">座位号</p>
              </div>

            </div>
            <div style="clear: both;"></div>
          </div>
        </div>

        <div slot="footer">
          <Button type="primary" @click="print">打印</Button>
        </div>

      </Modal>

      <!-- 批量打印的数据 -->
      <div class="printBatch" ref="printBatch">
        <Card :bordered="false" style="" v-for="item in user_list">
          <Row :gutter="16">
            <Col span="3" v-for="room in item.room_users">
                <div class="room_wrapper">
                  <div class="room">

                    <h3>{{item.user_location_name}}考点-第{{room.user_room_no}}考场</h3>
                    
                    <div class="wrapper">
                      <div class="item" v-for="user in room.users" style="margin:2px;float: left;padding: 5px;border: 1px solid #ccc;width: 300px;">
                        
                        <div style="float: left;">
                          <div style="margin: 0px; padding: 0px; height: 100px;margin-right: 10px;">
                            <img :src="user.user_pic" width="70" height="100">
                          </div>
                        </div>
              
                        <div style="float: left;">
                          <p style="font-size: 18px;">{{user.user_name}}</p>
                          <p style="font-size: 16px;">准考证号:</p>
                          <p style="font-size: 16px;">{{user.user_admission_no}}</p>
                          <p style="font-size: 16px;">第{{room.user_room_no}}考场</p>
                        </div>
                        
                        <div style="float: right;text-align: center;">
                          <p style="font-size: 48px;">{{user.user_seat_no}}</p>
                          <p style="font-size: 16px;">座位号</p>
                        </div>

                      </div>
                    </div>
                    
                    <div style="clear: both;"></div>

                  </div>

                  <div style="page-break-before:always"></div>

                </div>
            </Col>
          </Row>
        </Card>
      </div>


    </div>

</template>
<script>

import util from '../../utils/util';
import ExamHeader from '../../components/ExamHeader.vue';

import fs from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron';

export default {
  data() {
    return {

      exam_no: this.$route.query.exam_no,
      exam: {},
      user_list: [],

      checklistModal: false,
      currentLocation: {}, // 当前考点信息
      currentCheckList: {}, // 当前考场考生信息

      pdf_url: null,
      printPreview: false,

      default_img: __static + "/img/headimg.jpg",

    };
  },
  computed: {

  },

  mounted() {

  },

  methods: {

    // 批量打印
    printBatch(){
      let html = this.$refs.printBatch.innerHTML
      ipcRenderer.send('print-to-pdf', html);
    },

    print(event){
      let html = this.$refs.checkListPrint.innerHTML
      ipcRenderer.send('print-to-pdf', html);
    },

    // 查看核验单
    checkList(item, room){
      console.log(item, room);
      this.checklistModal = true;
      this.currentLocation = item;
      this.currentCheckList = room;
    },

    // 获取考试
    getExam(exam_no){
        const SQL = `SELECT * FROM EXAM WHERE exam_no = '${exam_no}'`;
        this.$db.get(SQL, (err, res) => {
            this.exam = res;
        });           
    },

    // 获取考生列表
    getUserList(exam_no){
        const SQL = `SELECT * FROM USER WHERE exam_no = '${exam_no}' ORDER BY user_admission_no ASC`;
        this.$db.all(SQL, (err, res) => {

          // 考点归集
          let json = [];
          for (var i = 0; i <= res.length - 1; i++) {
            if(json.length){
                let index = json.findIndex(item => item.user_location_name == res[i].user_location_name);
                if(index >= 0){
                    json[index].users.push(res[i]);
                } else{
                    json.push({
                        "user_location_name": res[i].user_location_name,
                        "users": [res[i]]
                    });
                }
            } else {
                json.push({
                    "user_location_name": res[i].user_location_name,
                    "users": [res[i]]
                });
            }
          }


          // 考场归集
          for (var j = 0; j <= json.length - 1; j++) {

            let users = json[j].users;
            let room_users = []; // 考场考生
            
            for (var i = 0; i <= users.length - 1; i++) {
              // 记录该考场内的所有学生
              if(room_users.length){
                  let index = room_users.findIndex(item => item.user_room_no == users[i].user_room_no);
                  if(index >= 0){
                      room_users[index].users.push(users[i]);
                  } else{
                      room_users.push({
                          "user_room_no": users[i].user_room_no,
                          "users": [users[i]]
                      });
                  }
              } else {
                  room_users.push({
                      "user_room_no": users[i].user_room_no,
                      "users": [users[i]]
                  });
              }
            }

            // 计算每个考场内的职位代码
            for (var i = 0; i <= room_users.length - 1; i++) {
              let pos_names = [];
              for (var k = 0; k <= room_users[i].users.length - 1; k++) {
                let room_user = room_users[i].users[k];
                // 记录该考场内的所有职位
                if (pos_names.length) {
                  let index0 = pos_names.findIndex(item => item.name == room_user.user_pos_name);
                  if(index0 == -1){ // 没有找到
                    pos_names.push({
                      name: room_user.user_pos_name,
                      num: 1
                    });
                  } else {
                    pos_names[index0].num++;
                  }

                } else {
                  pos_names.push({
                    name: room_user.user_pos_name,
                    num: 1
                  });
                }
              }
              room_users[i].pos_names = pos_names;
            }

            json[j].room_users = room_users;

          }


          console.log("数据处理", json);
          this.user_list = json;
        });           
    },


  },
  created() {

    this.getExam(this.exam_no);
    this.getUserList(this.exam_no);

  },

  components: {
    ExamHeader
  },


};

</script>
<style lang="less">
  
  .room_wrapper{
    padding: 10px;
  }

  .room{
    color: #fff;
    padding: 10px 0;
    text-align: center;
    background: rgba(0,153,229,.7);
  }
  
  .headimg{
    float: left;
    padding-right: 5px;
  }
  .sign{
    float: left;
  }

  .printBatch{
    display: none;
  }

  .header-mark{
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .remark{
    float: left;
  }

  .teacher-sign{
    float: right;
  }


  @media print {

    .header,
    .aside{
      display: none;
    }    

  }

</style>
