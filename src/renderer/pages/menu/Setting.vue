<template>
    <div>
        <div class="ivu-card-body wrapper">
            <Card>
                <p slot="title">
                    {{exam.exam_name}}
                </p>

                <Form inline>
                    <Row>
                        <FormItem label="准考证前缀">
                            <Input v-model="exam.exam_admission_prefix"></Input>
                        </FormItem>

<!--                    <FormItem label="考场号占位">
                            <Input v-model="exam.exam_room_no_num">
                                <span slot="append">位数</span>
                            </Input>
                        </FormItem>
                        <FormItem label="预览">
                            <Tag type="dot" color="warning">{{preview}}</Tag>
                        </FormItem> -->

                    </Row>
                    
<!--                     <Row>
                        <FormItem label="准考证样式">
                            <a @click="tplDialog = true">准考证模板管理</a>
                            <Modal
                                v-model="tplDialog"
                                title="模板管理"
                                width="800"
                                @on-ok="ok"
                                @on-cancel="cancel"
                                z-index=100000
                                class="tplList"
                                >
                                <Tpl></Tpl>
                            </Modal>

                             <i-select :label-in-value="true" style="width: 300px" @on-change="onAdmissionTplChange">
                                <i-option v-for="item in admission_list" :value="item.admission_tpl_id">{{ item.admission_tpl_name }}</i-option>
                            </i-select>
                        </FormItem>
                    </Row> -->

                    <Row>
                        <FormItem label="考生数量">
                            <Input v-model="exam.exam_num" disabled>
                                <span slot="append">人</span>
                            </Input>
                        </FormItem>
                    </Row>
                    
                    <Tabs type="card" @on-click="onModeClick">

                        <TabPane label="编排方式一">

                            <Row>
                                
                                <FormItem label="每个考场的座位数">
                                    <Input v-model="exam.exam_room_seat_num">
                                        <span slot="append">座位</span>
                                    </Input>
                                </FormItem>
          
                                <FormItem label="预览编排">
                                    <i-button type="primary" @click="previewUsers()">预览</i-button>
                                </FormItem>
                            </Row>

                            <p style="margin-bottom: 15px;font-weight: bold;">考场预览</p>

                            <Row>
                                <FormItem label="选择表格中考场，设置考点">
                                    <!-- <router-link :to="{path:'/location'}">考点管理</router-link> -->

                                    <a @click="locationDialog = true">考场管理</a>
                                    <Modal
                                        v-model="locationDialog"
                                        title="模板管理"
                                        width="800"
                                        @on-ok="ok1"
                                        @on-cancel="cancel1"
                                        z-index=100000
                                        class="tplList"
                                        :transfer=false
                                        >
                                        <Location></Location>
                                    </Modal>


                                    <i-select :label-in-value="true" style="width:400px" @on-change="onLocationChange" clearable ref="locationSelect">
                                        <i-option v-for="item in location_list" :value="item.location_id">{{ item.location_name }}(教室总数:{{item.location_room_num}} - 已使用:{{item.used_num}} - 剩余:{{item.remain_num}})</i-option>
                                    </i-select>
                                </FormItem>
                                  <Page :total="dataListTotalCount" :current="page.pageIndex"
                                  :page-size="page.pageSize" @on-change="getDisplayUserList"
                                  :page-size-opts="[10,20,30,40,50]" show-total
                                  transfer style="margin-top: 35px;"></Page>
                            </Row>

                            <i-table ref="selection" border :columns="user_columns" :data="display_user_list" @on-select="onUserSelect" @on-select-cancel="onUserSelectCancel"></i-table>
                            <div class="split" style="clear: both;"></div>
                            <Row>
                                <FormItem>
                                    <i-button type="primary" style="float: right;" @click="onSave">确定，自动编排并生成准考证</i-button>
                                </FormItem>
                            </Row>

                        </TabPane>

                        <TabPane label="编排方式二" class="mode2">
                            
                            <div style="max-height: 400px;">

                                <Row>

                                    <Col span="3">
                                        
                                        <Button type="default" size="small" style="width: 100px;margin-bottom: 5px;">笔试类别</Button>

                                        <RadioGroup vertical @on-change="onCatChange" v-model="catGroup">
                                            <Radio :label="item.user_job_cat_id" border  v-for="(item, index) in job_cats" >
                                                <span>{{item.user_job_cat_name}}</span>
                                            </Radio>
                                        </RadioGroup>
                                    </Col> 


                                    <Col span="3">
                                        
                                        <Button type="default" size="small" style="width: 100px;margin-bottom: 5px;">岗位代码</Button>

                                        <RadioGroup vertical @on-change="onJobCodeChange" v-model="jobCodeGroup">
                                            <Radio :label="item" border  v-for="(item, index) in current_job_codes" >
                                                <span>{{item}}</span>
                                            </Radio>
                                        </RadioGroup>

                                    </Col> 


                                    <Col span="3">
                                        
                                        <Button type="default" size="small" style="width: 100px;margin-bottom: 5px;">待编排考生
                                        </Button>

                                        <Button type="primary" size="small" @click="onQuickChooseUsers" style="width: 100px;margin-bottom: 5px;">快速选择:30</Button>

                                        <CheckboxGroup v-model="userGroup">
                                            <Checkbox :label="item.user_id" v-for="(item, index) in current_user_list2">
                                                <span>{{item.user_name}}</span>
                                            </Checkbox>
                                        </CheckboxGroup>

                                    </Col>

                                    <Col span="3">
                                        <Button size="large" type="primary" @click="onAllocation2">
                                            分配考场
                                            <Icon type="ios-arrow-forward" />
                                        </Button>
                                    </Col>
                                    
                                    <Col span="3">
                                        <Button type="default" size="small" style="width: 100px;margin-bottom: 5px;">考点列表</Button>
                                        <RadioGroup vertical @on-change="onLocationChange2" v-model="locationGroup">
                                            <Radio :label="item.location_id" border  v-for="(item, index) in location_list" >
                                                <span>{{item.location_name}}</span>
                                            </Radio>
                                        </RadioGroup>   
                                    </Col>
                                    
                                    <Col span="3">
                                        <Button type="default" size="small" style="width: 100px;margin-bottom: 5px;">考场列表</Button>
                                        <RadioGroup vertical v-model="roomGroup"  @on-change="onRoomChange2">
                                            <Radio :label="item.room_no" border  v-for="(item, index) in current_room_list2" >
                                                <span>第{{item.room_no}}考场({{item.users_num}})</span>
                                            </Radio>
                                        </RadioGroup> 
                                    </Col>


                                    <Col span="3">
                                        <Button type="default" size="small" style="width: 100px;margin-bottom: 5px;">已编排考生</Button>
                                        <CheckboxGroup v-model="roomUserGroup">
                                            <Checkbox :label="item.user_id" v-for="(item, index) in current_room_user_list2">
                                                <span>{{item.user_seat_no}}.{{item.user_name}}({{item.user_job_cat_name}})</span>
                                            </Checkbox>
                                        </CheckboxGroup>
                                        <Button type="error" size="small" @click="onRemoveUsers" style="width: 100px;">移除</Button>
                                    </Col>


                                    <Col span="3">
                                    <Button size="large" type="primary" @click="onSave2">
                                        确定生成准考证
                                    </Button>
                                    </Col>

                                </Row>   

                            </div>                        

                        </TabPane>

                    </Tabs>

                </Form>
            </Card>
        </div>

        <Modal v-model="processModal" width="360" :closable="false" class-name="vertical-center-modal">
            <div style="text-align:center">
                <p>当前正在处理用户：{{currentUserName}}</p>
            </div>
            <div slot="footer">
                <Progress :percent="process" :stroke-width="40" status="active" text-inside style="margin-bottom: 15px;" v-show="true" />
            </div>
        </Modal>
    
        <div class="choosen">{{userGroup.length}}</div>

    </div>
</template>

<script>
    
    import xlsx from 'node-xlsx';
    import fs from 'fs';
    import path from 'path';
    import download from '../../utils/download';
    import { ipcRenderer } from 'electron';
    import util from '../../utils/util';

    import Tpl from './Tpl.vue';
    import Location from './Location.vue';

    export default {

        components: {
            Tpl,
            Location
        },

        data () {
            return {

                tplDialog: false,
                locationDialog: false,

                exam_no: null,

                exam: {
                    exam_admission_prefix: "16200",
                    exam_room_no_num: 2,
                    exam_room_seat_num: 2,
                    admission_tpl_id: 0, 
                    admission_tpl_content: "",
                },

                admission_list: [], // 准考证模板列表
                user_list: [], // 考生列表

                job_cats: [], // 考生列表2
                user_list2: [],
                current_user_list2: [],
                theme3: 'light',
                catGroup: "",
                userGroup: [],
                roomUserGroup: [],
                locationGroup: "",
                current_location2: {}, // 当前选择的考场
                roomGroup: "",
                current_room_user_list2:[],
                current_room_list2:[],
                user_choosen: 0,

                display_user_list: [], // 显示的考生列表
                location_list: [], // 考点列表

                user_columns: [
                    {
                        title: '身份证号',
                        key: 'user_idcard'
                    },
                    {
                        title: '考点名称',
                        key: 'user_location_name'
                    },
                    {
                        title: '考点编号',
                        key: 'user_location_code'
                    },
                    {
                        title: '教室编号',
                        key: 'user_room_no'
                    },
                    {
                        title: '职位类别',
                        key: 'user_job_cat_name'
                    },
                    {
                        title: '座位号',
                        key: 'user_seat_no'
                    }
                ],

                processModal: false,
                process: 0,
                currentUserName: '',

                dataListTotalCount: 0,
                page: {
                  pageIndex: 1,
                  pageSize: 10,
                },

                // 已经使用过的考点
                location_used: [],
                current_page: 1,

                current_job_codes: [],
                jobCodeGroup: ""

            }
        },

        computed: {
            preview: function(){

                let result = '';
                const n = this.exam.exam_room_no_num;
                for (let i = 0; i < n - 1; i++){
                    result += "0";
                }

                return this.exam.exam_admission_prefix + result + "101";
            }
        },


        methods: {

            ok () {
                console.log("OK");
                this.getAdmissionTplList();
            },
            cancel () {
                console.log("cancel");
                this.getAdmissionTplList();
            },

            ok1 () {
                console.log("OK");
                this.getLocationList();
            },
            cancel1 () {
                console.log("cancel");
                this.getLocationList();
            },



            // 数字前面补0
            prefixInteger(num, m) {
                return (Array(m).join(0) + num).slice(-m);
            },

            // 生成准考证
            generateAdmissionNo(prefix, user_location_code, room_no, room_no_num, seat_no){
                let room_no_1 = this.prefixInteger(room_no, parseInt(room_no_num));

                // this.exam.exam_room_seat_num 每个教室的座位数
                // this.exam.exam_room_seat_num.toString().length

                let rtn = prefix + "" + user_location_code + "" + room_no_1 + "" + this.prefixInteger(seat_no, 2);
                return rtn;
            },

            // 保存设置数据
            onSave(){

                const exam = this.exam;

                if (!exam.exam_admission_prefix) {
                    this.$Notice.error({
                        title: '错误',
                        desc: '请输入准考证前缀！',
                    }); 
                    return;                   
                }

                if (!exam.exam_room_no_num) {
                    this.$Notice.error({
                        title: '错误',
                        desc: '请输入考场占位！',
                    }); 
                    return;                   
                }                

                const SQL = `UPDATE EXAM SET
                exam_admission_prefix='${exam.exam_admission_prefix}',
                exam_room_no_num='${exam.exam_room_no_num}',
                exam_room_seat_num='${exam.exam_room_seat_num}',
                admission_tpl_id='${exam.admission_tpl_id}',
                admission_tpl_content='${exam.admission_tpl_content}',
                exam_draft='2',
                update_time='${Date.now()}'
                WHERE exam_no = '${this.exam_no}'`;
                this.$logger(SQL);
                this.$db.run(SQL, err => {
                    if (err) {
                        this.$logger(err);
                        this.$Notice.error({
                            title: '编辑失败',
                            desc: err,
                        });
                    } else {

                        this.$Message.success({
                            content: '保存成功',
                        });

                        // 使用进度条的方式保存用户信息
                        this.processModal = true
                        let user_list = this.user_list;
                        let that = this;

                        that.$db.run('BEGIN TRANSACTION;');

                        for (var i = 0; i <= user_list.length - 1; i++) {

                            if (user_list[i].user_id == 0) continue; // 过滤虚拟用户

                            that.currentUserName = user_list[i].user_name;

                            // 生成准考证号
                            let user_admission_no = this.generateAdmissionNo(exam.exam_admission_prefix, user_list[i].user_location_code, user_list[i].user_room_no, exam.exam_room_no_num, user_list[i].user_seat_no);

                            console.log("user_admission_no", user_admission_no)

                            const SQL = `UPDATE USER SET
                                user_room_no='${user_list[i].user_room_no}',
                                user_seat_no='${user_list[i].user_seat_no}',
                                user_admission_no='${user_admission_no}',

                                user_location_id='${user_list[i].user_location_id}',
                                user_location_name='${user_list[i].user_location_name}',
                                
                                user_location_code='${user_list[i].user_location_code}',

                                user_location_addr='${user_list[i].user_location_addr}',
                                user_location_remark='${user_list[i].user_location_remark}',

                                update_time='${Date.now()}'
                                WHERE user_id = '${user_list[i].user_id}'`; 

                            console.log("生成准考证SQL", SQL)

                            this.$db.run(SQL, err => {
                                that.process = (i / exam.exam_num) * 100;
                            });

                        }

                        let res = that.$db.run('COMMIT TRANSACTION;');
                        console.log("生成准考证", res)

                        // 跳转到考试详情页面
                        that.$router.push({
                          path: '/user',
                          query: {
                            exam_no: that.exam_no,
                          },
                        });

                    }
                });
            },


            onUserSelectCancel(selection, row){
                console.log(row);
                for (var i = 0; i <= this.user_list.length - 1; i++) {
                    if (this.user_list[i].user_room_no == row.user_room_no) {
                        this.user_list[i]._checked = false;
                    }
                }
            },

            onUserSelect(selection, row){
                console.log(row);
                for (var i = 0; i <= this.user_list.length - 1; i++) {
                    console.log(row);
                    if (this.user_list[i].user_room_no == row.user_room_no) {
                        this.user_list[i]._checked = true;
                    }
                }
            },

            // 准考证变化
            onAdmissionTplChange(value){
                if (typeof value == "undefined") return;
                this.exam.admission_tpl_id = value.value;
                let admission_list = this.admission_list;
                for (var i = 0; i <= admission_list.length - 1; i++) {
                    if (admission_list[i]['admission_tpl_id'] == value.value) {
                        this.exam.admission_tpl_content = admission_list[i]['admission_tpl_content'];
                        break;
                    }
                }
            },

            // 分配教室
            // 参数 location_id: 考点ID
            // 参数 current_page: 分页
            allocation(location_id, current_page){

                // =================================== S
                // 考点使用记录
                let location_used = this.location_used;
                let index = location_used.findIndex(item => item.current_page == current_page);
                if (index >= 0) {
                    location_used[index].location_id = location_id               
                } else {
                    location_used.push({
                        current_page: current_page,
                        location_id: location_id
                    })
                }
                this.location_used = location_used
                console.log("location_used", location_used);
                // =================================== E

                
                // =================================== S
                // 获取教室号
                let room_num = 0;
                for (var i = 0; i <= location_used.length - 1; i++) {
                    if (location_used[i].location_id == location_id) {
                        room_num ++;
                    }
                }
                // =================================== E

                let selections = this.display_user_list;
                for (var i = 0; i <= this.user_list.length - 1; i++) {
                    for (var j = 0; j <= selections.length - 1; j++) {
                        if (this.user_list[i].user_id > 0 && this.user_list[i].user_id == selections[j].user_id ) {
                            let location = this.getLocation(location_id);
                            this.user_list[i].user_location_id = location_id;
                            this.user_list[i].user_location_code = location.location_no; // 考点编号
                            this.user_list[i].user_location_name = location.location_name;
                            this.user_list[i].user_location_addr = location.location_addr;
                            this.user_list[i].user_location_remark = location.location_remark;

                            // 教室号
                            this.user_list[i].user_room_no = room_num;

                            continue;
                        }
                    }
                }

                // 计算剩余教室数量
                this.location_list = this.computeLocations(this.location_list, this.location_used);                
            },


            // 考点变化
            onLocationChange(value){

                if (typeof value == "undefined") {
                    this.$refs.locationSelect.clearSingleSelect();
                    return;
                }

                if (this.display_user_list.length <= 0) {
                    this.$refs.locationSelect.clearSingleSelect();
                    return;
                }

                let index0 = this.location_list.findIndex(item => item.location_id == value.value);
                if(this.location_list[index0].remain_num <= 0){
                    this.$Notice.error({
                        title: '错误',
                        desc: '该考点教室已分配完！',
                    }); 
                    this.$refs.locationSelect.clearSingleSelect();
                    return;    
                }

                // 分配教室
                this.allocation(value.value, this.current_page);

                this.$refs.locationSelect.clearSingleSelect();

            },

            // 预览
            previewUsers(){

                if (!this.exam.exam_room_seat_num) {
                    this.$Notice.error({
                        title: '错误',
                        desc: '请输入每个考场的座位数！',
                    }); 
                    return;                     
                }

                this.getUserList();
            },


            // 计算剩余教室数量
            computeLocations(location_list, location_used){

                for (var i = 0; i <= location_list.length - 1; i++) {

                    let used_num = 0;
                    let remain_num = 0;

                    for (var j = 0; j <= location_used.length - 1; j++) {
                        if (location_list[i].location_id == location_used[j].location_id) {
                            used_num ++;
                        }
                    }

                    location_list[i].used_num = used_num;
                    location_list[i].remain_num = location_list[i].location_room_num - used_num;

                }

                return location_list;

            },

            // 获取考点列表
            getLocationList(){
                let that = this;
                const SQL = `SELECT * FROM LOCATION`;
                this.$logger(SQL);
                this.$db.all(SQL, (err, res) => {
                    this.location_list = that.computeLocations(res, that.location_used);
                });                
            },

            // 获取考点
            getLocation(location_id){
                for (var i = 0; i <= this.location_list.length - 1; i++) {
                    if (this.location_list[i].location_id == location_id) {
                        return this.location_list[i];
                    }
                }
                return false;               
            },

            // 获取准考证模板列表
            getAdmissionTplList(){
                const SQL = `SELECT * FROM ADMISSION_TPL`;
                this.$logger(SQL);
                this.$db.all(SQL, (err, res) => {
                    this.admission_list = res;
                });                
            },

            // 获取准考证模板
            getAdmissionTpl(admission_tpl_id){
                for (var i = 0; i <= this.admission_list.length - 1; i++) {
                    if (this.admission_list[i].admission_tpl_id == admission_tpl_id) {
                        return this.admission_list[i];
                    }
                }
                return false;               
            },

            // 获取考生列表
            getUserList(){
                const SQL = `SELECT * FROM USER WHERE exam_no = '${this.exam_no}' ORDER BY user_job_cat_id ASC,user_no ASC`; // 根据职位类别ID、用户号排序
                this.$logger(SQL);
                this.$db.all(SQL, (err, res) => {

                    // =================================== S
                    // 职位类别整理
                    let job_cats = []; 
                    for (var i = 0; i <= res.length - 1; i++) {
                        if(job_cats.length){
                            let index = job_cats.findIndex(item => item.user_job_cat_id == res[i].user_job_cat_id);
                            if(index >= 0){
                                job_cats[index].users.push(res[i]);
                            } else{
                                job_cats.push({
                                    "user_job_cat_id": res[i].user_job_cat_id,
                                    "users": [res[i]]
                                });
                            }
                        } else {
                            job_cats.push({
                                "user_job_cat_id": res[i].user_job_cat_id,
                                "users": [res[i]]
                            });
                        }
                    }

                    console.log("job_cats", job_cats);

                    let user_list = [];

                    for (var i = 0; i <= job_cats.length - 1; i++) {

                        for (var k = 0; k <= job_cats[i].users.length - 1; k++) {
                            user_list.push(job_cats[i].users[k]);
                        }

                        // 需要补上如下空座位数
                        let surplus = job_cats[i].users.length % this.exam.exam_room_seat_num;

                        if (surplus > 0) {
                            let remain = this.exam.exam_room_seat_num - surplus;
                            for (var j = 0; j <= remain - 1; j ++) {
                                user_list.push({
                                    user_id: 0,
                                    user_job_cat_id: job_cats[i].user_job_cat_id,
                                })
                            }
                        }

                    }

                    // 不足设定人数的话 补充虚拟人数 方便处理
                    // =================================== E

                    // 座位分配
                    // =================================== S
                    let seat_count = 1;

                    for (var i = 0; i <= user_list.length - 1; i++) {

                        if (user_list[i].user_id > 0) {
                            user_list[i].user_seat_no = seat_count;
                        }

                        if (seat_count < this.exam.exam_room_seat_num) {
                            seat_count ++;
                        } else {
                            seat_count = 1;
                        }

                        // 考场编号分配
                        // console.log("考场编号", i / this.exam.exam_room_seat_num);
                        // res[i].user_room_no = parseInt(i / this.exam.exam_room_seat_num) + 1;

                    }
                    // =================================== E


                    this.page.pageSize = parseInt(this.exam.exam_room_seat_num);

                    // this.user_list = res;
                    // this.dataListTotalCount = res.length;
                    
                    this.user_list = user_list;
                    this.dataListTotalCount = user_list.length;

                    this.getDisplayUserList(1);

                });                
            },

            // 获取考场编号
            getUserRoomNo(location_id){
                // 获取该考点已经分配的人数
                let num = 0;
                for (var i = 0; i <= this.user_list.length - 1; i++) {
                    if (this.user_list[i].user_location_id == location_id) {
                        num ++;
                    }
                }
                return parseInt(num / this.exam.exam_room_seat_num) + 1;
            },

            getDisplayUserList(pageIndex){

              console.log("分页下标", pageIndex)

              let list = this.user_list;
              let display_user_list = [];

              let start = (pageIndex - 1) * this.exam.exam_room_seat_num; // 截取开始位置
              let end = parseInt(start) + parseInt(this.exam.exam_room_seat_num); // 截取结束位置

              console.log("分页下标", start, end)

              display_user_list = list.slice(start, end);

              this.display_user_list = display_user_list;
              this.current_page = pageIndex
            },

            // 获取准考证模板列表
            getExam(exam_no){
                const SQL = `SELECT * FROM EXAM WHERE exam_no = '${exam_no}'`;
                
                this.$logger(SQL);
                this.$db.get(SQL, (err, res) => {
                    this.$logger(err);
                    this.$logger(res);

                    res.exam_admission_prefix = "16200"; // 默认
                    res.exam_room_no_num = 2; // 默认位数
                    this.exam = res;
                });                
            },

            getCurrentPageList(){

            },

            getCurrentPageListOnPageChange(){

            },


            // ************* 编排方式2 **************

            // 获取考生列表
            getUserList2(){
                const SQL = `SELECT * FROM USER WHERE exam_no = '${this.exam_no}' ORDER BY user_job_cat_id ASC,user_no ASC`; // 根据职位类别ID、用户号排序
                this.$logger(SQL);
                this.$db.all(SQL, (err, res) => {

                    // =================================== S
                    // 职位类别整理
                    let job_cats = []; 
                    for (var i = 0; i <= res.length - 1; i++) {
                        let index = job_cats.findIndex(item => item.user_job_cat_id == res[i].user_job_cat_id);
                        if(index < 0){
                            job_cats.push({
                                "user_job_cat_id": res[i].user_job_cat_id,
                                "user_job_cat_name": res[i].user_job_cat_name
                            });
                        }
                    }

                    console.log("job_cats", job_cats);

                    this.job_cats = job_cats;

                    console.log("user_list", res);
                    this.user_list2 = res;

                });                
            },

            // 获取考生
            

            onModeClick(tab_index) {
                console.log(tab_index)
                if(tab_index == 1 && this.job_cats.length == 0) this.getUserList2(); 
            },


            onCatChange(val){
                console.log(val)

                // 获取岗位代码列表
                var current_job_codes  = [];
                
                for (var i = 0; i < this.user_list2.length; i++) {
                    if (this.user_list2[i].user_job_cat_id == val) {
                        let index = current_job_codes.findIndex(item => item == this.user_list2[i].user_pos_name);

                        // 没找到
                        if(index < 0) {
                            current_job_codes.push(this.user_list2[i].user_pos_name);   
                        }
                    }
                }
                console.log('current_job_codes', current_job_codes)
                this.current_job_codes = current_job_codes

                this.jobCodeGroup = "";
                this.userGroup = [];

                this.current_user_list2 = [];

            },


           // 选择岗位代码
            onJobCodeChange(val){

                console.log("onJobCodeChange", val)

                var current_user_list2 = [];

                for (var i = 0; i < this.user_list2.length; i++) {
                    if (this.user_list2[i].user_pos_name == val && !this.user_list2[i].user_seat_no) {
                        current_user_list2.push(this.user_list2[i]);
                    }
                }

                console.log('current_user_list2', current_user_list2)
                this.current_user_list2 = current_user_list2;
                this.userGroup = [];

            },


            // 切换考点
            onLocationChange2(val, clear){

                clear = clear || 1

                console.log(val, clear)

                var location = this.getLocation(val)
                console.log(location)

                var room_num = location.location_room_num
                this.current_location2 = location

                var current_room_list2 = []
                for (var i = 1; i <= location.location_room_num; i++) {
                    current_room_list2.push({
                        "room_no": i,
                        "users_num": this.getRoomUsersNum(location.location_id, i)
                    })
                }
                this.current_room_list2 = current_room_list2

                if (clear == 1) {
                    this.current_room_user_list2 = []
                    this.roomGroup = ''
                }

            },

            // 切换考场
            onRoomChange2(val){

                console.log(val)

                var that = this;

                var current_room_user_list2 = [];
                for (var i = 0; i < that.user_list2.length; i++) {

                    if (that.user_list2[i].user_room_no == val && that.user_list2[i].user_location_id == that.current_location2.location_id) {
                        current_room_user_list2.push(that.user_list2[i]);
                    }

                }

                that.current_room_user_list2 =  current_room_user_list2.sort(util.compare('user_seat_no'));

            },


            // 获取该考场考生数
            getRoomUsersNum(location_id, user_room_no){
                var num = 0;
                for (var i = 0; i < this.user_list2.length; i++) {
                    if (this.user_list2[i].user_location_id == location_id && this.user_list2[i].user_room_no == user_room_no) {
                        num ++;
                    }
                }
                return num;
            },

            // 分配学生
            onAllocation2(e){

                if (!this.userGroup.length) {
                    this.$Notice.error({
                        title: '错误',
                        desc: '请选择考生！',
                    }); 
                    return; 
                }

                if (!this.roomGroup) {
                    this.$Notice.error({
                        title: '错误',
                        desc: '请选择考场！',
                    }); 
                    return; 
                }


                console.log("userGroup", this.userGroup)
                console.log("current_location2", this.current_location2)
                console.log("roomGroup", this.roomGroup)
                
                var user_seat_no = this.getRoomUsersNum(this.current_location2.location_id, this.roomGroup);

                for (var i = 0; i < this.user_list2.length; i++) {
                    if (util.in_array(this.user_list2[i].user_id, this.userGroup)) {
                        this.user_list2[i].user_location_id = this.current_location2.location_id;
                        this.user_list2[i].user_location_code = this.current_location2.location_no; // 考点编号
                        this.user_list2[i].user_location_name = this.current_location2.location_name;
                        this.user_list2[i].user_location_addr = this.current_location2.location_addr;
                        this.user_list2[i].user_location_remark = this.current_location2.location_remark;
                        // 教室号
                        user_seat_no = user_seat_no + 1;
                        this.user_list2[i].user_room_no = this.roomGroup;
                        
                        this.user_list2[i].user_seat_no = user_seat_no;
                    }
                }

                console.log("user_list2", this.user_list2)
                console.log("catGroup", this.catGroup)


                //this.onCatChange(this.catGroup);
                this.onJobCodeChange(this.jobCodeGroup)

                this.onLocationChange2(this.locationGroup, 2);

                this.onRoomChange2(this.roomGroup);

            },

            // 移除学生
            onRemoveUsers(){

                var user_seat_no = 1;
                for (var i = 0; i < this.user_list2.length; i++) {

                    if (this.user_list2[i].user_location_id == this.current_location2.location_id && this.user_list2[i].user_room_no == this.roomGroup) {
                        if (util.in_array(this.user_list2[i].user_id, this.roomUserGroup)){
                            this.user_list2[i].user_location_id = null
                            this.user_list2[i].user_location_code = null
                            this.user_list2[i].user_location_name = null
                            this.user_list2[i].user_location_addr = null
                            this.user_list2[i].user_location_remark = null
                            this.user_list2[i].user_room_no = null
                            this.user_list2[i].user_seat_no = null
                        } else {
                            this.user_list2[i].user_seat_no = user_seat_no
                            user_seat_no = user_seat_no + 1
                        }
                    }

                }

                 this.onJobCodeChange(this.jobCodeGroup);

                // this.onCatChange(this.catGroup);

                this.onLocationChange2(this.locationGroup, 2);
                this.onRoomChange2(this.roomGroup);
                this.roomUserGroup = [];

            },

            // 快速选择
            onQuickChooseUsers(){
                var num = 1
                this.userGroup = [];
                for (var i = 0; i < this.current_user_list2.length; i++) {
                    if (num > 30) break;
                    this.userGroup.push(this.current_user_list2[i].user_id)
                    num = num + 1;
                }                
            },


            // 保存设置数据
            onSave2(){

                const exam = this.exam;

                if (!exam.exam_admission_prefix) {
                    this.$Notice.error({
                        title: '错误',
                        desc: '请输入准考证前缀！',
                    }); 
                    return;                   
                }

                if (!exam.exam_room_no_num) {
                    this.$Notice.error({
                        title: '错误',
                        desc: '请输入考场占位！',
                    }); 
                    return;                   
                }  


                for (var i = 0; i < this.user_list2.length; i++) {
                    if (!this.user_list2[i].user_seat_no) {
                        this.$Notice.error({
                            title: '错误',
                            desc: '考生尚未分配完毕！',
                        }); 
                        return;                   
                    }
                }

                const SQL = `UPDATE EXAM SET
                exam_admission_prefix='${exam.exam_admission_prefix}',
                exam_room_no_num='${exam.exam_room_no_num}',
                exam_room_seat_num='${exam.exam_room_seat_num}',
                admission_tpl_id='${exam.admission_tpl_id}',
                admission_tpl_content='${exam.admission_tpl_content}',
                exam_draft='2',
                update_time='${Date.now()}'
                WHERE exam_no = '${this.exam_no}'`;
                this.$logger(SQL);
                this.$db.run(SQL, err => {
                    if (err) {
                        this.$logger(err);
                        this.$Notice.error({
                            title: '编辑失败',
                            desc: err,
                        });
                    } else {

                        this.$Message.success({
                            content: '保存成功',
                        });

                        // 使用进度条的方式保存用户信息
                        this.processModal = true
                        let user_list = this.user_list2;
                        let that = this;

                        that.$db.run('BEGIN TRANSACTION;');

                        for (var i = 0; i <= user_list.length - 1; i++) {

                            if (user_list[i].user_id == 0) continue; // 过滤虚拟用户

                            that.currentUserName = user_list[i].user_name;

                            // 生成准考证号
                            let user_admission_no = this.generateAdmissionNo(exam.exam_admission_prefix, user_list[i].user_location_code, user_list[i].user_room_no, exam.exam_room_no_num, user_list[i].user_seat_no);

                            console.log("user_admission_no", user_admission_no)

                            const SQL = `UPDATE USER SET
                                user_room_no='${user_list[i].user_room_no}',
                                user_seat_no='${user_list[i].user_seat_no}',
                                user_admission_no='${user_admission_no}',

                                user_location_id='${user_list[i].user_location_id}',
                                user_location_name='${user_list[i].user_location_name}',
                                
                                user_location_code='${user_list[i].user_location_code}',

                                user_location_addr='${user_list[i].user_location_addr}',
                                user_location_remark='${user_list[i].user_location_remark}',

                                update_time='${Date.now()}'
                                WHERE user_id = '${user_list[i].user_id}'`; 

                            console.log("生成准考证SQL", SQL)

                            this.$db.run(SQL, err => {
                                that.process = (i / exam.exam_num) * 100;
                            });

                        }

                        let res = that.$db.run('COMMIT TRANSACTION;');
                        console.log("生成准考证", res)

                        // 跳转到考试详情页面
                        that.$router.push({
                          path: '/user',
                          query: {
                            exam_no: that.exam_no,
                          },
                        });

                    }
                });
            },

 

        },

        created() {
            this.exam_no = this.$route.query.exam_no;
            this.getExam(this.exam_no);
            this.getAdmissionTplList();
            this.getLocationList();
        },

    }
</script>

<style lang="less">
    .wrapper{
        background-color: #fff
    }
    .split{
        border: 1px dashed #eee;
        margin-bottom: 20px;
    }

    .vertical-center-modal{
        display: flex;
        align-items: center;
        justify-content: center;

        .ivu-modal{
            top: 0;
        }
    }

    .tplEdit{
        position: fixed;
        z-index: 1000;
    }

    .mode2 .ivu-checkbox-group-item,
    .mode2 .ivu-radio-group-item{
        border: 1px solid #eee;
        width: 100px;
        padding: 5px;
        margin-bottom: 5px;
    }

    .mode2 .ivu-radio-group-item{
        line-height: 19px!important;
        display: inherit;
    }

    .choosen{
        position: fixed;
        bottom: 60px;
        right: 60px;
        width: 60px;
        height: 60px;
        border-radius: 30px;
        background-color: #eee;
        text-align: center;
        /* vertical-align: middle; */
        /* display: table-cell; */
        line-height: 60px;
        font-size: 18px;
    }

</style>
