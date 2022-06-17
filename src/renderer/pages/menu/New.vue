<template>
    <div>
        <div class="ivu-card-body wrapper">

            <Progress :percent="process" :stroke-width="40" :hide-info="true" v-show="loadingStatus" style="margin-bottom: 10px;" />

            <div class="ivu-upload">
                <div class="ivu-upload ivu-upload-drag">
                    <div class="upload" v-show="uploadStatus" @click="handleUpload">
                        <div style="padding: 220px 0px;"><i class="ivu-icon ivu-icon-ios-cloud-upload" style="font-size: 52px; color: rgb(51, 153, 255);"></i> 
                            <p>导入考生信息</p>
                        </div>
                    </div>

                    <div class="namePart" v-show="!uploadStatus">
                        <Form class="nameForm">
                            
                            <div style="font-size: 14px;color: #2a9c68;margin-bottom: 20px;">
                                <Icon type="checkmark-circled" style="font-size: 48px;margin-bottom: 10px;"></Icon>
                                <h3>考生信息导入成功</h3>
                            </div>

                            <FormItem>
                                <Input size="large" placeholder="请填写考试名称" v-model="exam_name">
                                    <span slot="append" @click="onSave">下一步</span>
                                </Input>
                            </FormItem>

                        </Form>
                    </div>
                </div>
            </div>
            
            <a @click="downloadTpl" style="text-align: right;display: block; margin-top: 10px;">下载考生信息模板</a>

        </div>
    </div>
</template>

<script>
    
    import xlsx from 'node-xlsx';
    import fs from 'fs';
    import path from 'path';
    import download from '../../utils/download';
    import { ipcRenderer } from 'electron';
    import util from '../../utils/util';

    export default {
        data () {
            return {
                file: null,
                loadingStatus: true,
                uploadStatus: true,
                process: 0,

                exam_no: '',
                exam_name: '',

                templateXlsx: path.join(__static, '/up-demo.xlsx'),

                pdf_url: null,
                base: `file://` + __static+ `/pdfjs/web/viewer.html`
            }
        },

        mounted() {
            // ipcRenderer.on('pdf-recieve', (e, arg) => {
            //   console.log('文件路径', arg)
            //   this.pdf_url= arg + '#toolbar=0';

            //     setTimeout(function(){
            //         window.frames["print_frame"].focus();
            //         window.frames["print_frame"].print();
            //     },2000);

            // })
        },

        methods: {

            print(){
                ipcRenderer.send('print-to-pdf');
            },

            onSave(){

                const that = this;

                const exam_name = that.exam_name;
                const exam_no = that.exam_no;
                const exam_draft = 0;

                const SQL = `UPDATE EXAM SET
                  exam_name='${exam_name}', exam_draft='${exam_draft}', update_time='${Date.now()}'
                  WHERE exam_no = '${exam_no}'`;

                that.$logger(SQL);
                that.$db.run(SQL, (err) => {
                    that.$logger(err);
                    this.$router.push({path: '/setting', query: {exam_no: exam_no}});
                });
            },


            sleep(d){
              for(var t = Date.now();Date.now() - t <= d;);
            },


            handleUpload () {

                const dialog = require('electron').remote.dialog;

                dialog.showOpenDialog({
                    properties:['openFile'],
                    filters: [
                      { name: 'XLSX', extensions: ['xlsx'] }
                    ]
                }, (files) => {
                    console.log('选择文件', files);
                    if (typeof files != 'undefined') {

                        const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(files[0]));
                        console.log('文件内容', workSheetsFromBuffer);

                        console.log('插入考试');
                        
                        const exam_no = util.randomString(16); // 考试编号

                        const user_list = workSheetsFromBuffer[0]['data'];

                        user_list.shift();
                        const exam_num = user_list.length; // 去掉表头

                        const SQL = `INSERT INTO EXAM (exam_no,exam_name,exam_admission_prefix,exam_room_no_num,exam_num,exam_draft,create_time,update_time) VALUES ('${exam_no}','','','0','${exam_num}','1','${Date.now()}','${Date.now()}')`;

                        const that = this;

                        that.$logger(SQL);
                        that.$db.run(SQL, (err) => {

                            if (err) {

                                that.$Notice.error({
                                  title: '新增失败',
                                  desc: err,
                                });

                            } else {

                                that.loadingStatus = true;

                                that.$db.run('BEGIN TRANSACTION;');

                                for (var i = 0; i <= user_list.length - 1; i++) {

                                    const item = user_list[i];

                                    if (typeof item[1] == 'undefined') {item[1] = '';}
                                    if (typeof item[3] == 'undefined') {item[3] = '';}

                                    item[1] = item[1].replace("'",""); // 去除 身份证号 '
                                    item[3] = item[3].replace("'",""); // 去除 手机号 '

                                    console.log("user_pos_name", item[2]);

                                    const user_no = util.randomString(16); // 考试编号

                                    const SQL = `INSERT INTO USER (user_no, exam_no,user_name,user_idcard,user_pos_name,user_phone,user_pic,user_job_cat_id,user_job_cat_name,create_time,update_time) VALUES ('${user_no}','${exam_no}','${item[0]}','${item[1]}','${item[2]}','${item[3]}','${item[4]}','${item[5]}','${item[6]}','${Date.now()}','${Date.now()}')`;
                                    that.$logger(SQL);
                                    that.$db.run(SQL, (err) => {that.$logger(err);});
                                    
                                    that.process = ((i+1) / exam_num) * 100;
                                    console.log("process", that.process);
                                    that.$forceUpdate();

                                };

                                that.$db.run('COMMIT TRANSACTION;');

                                that.uploadStatus = false;
                                that.exam_no = exam_no; // 考试编号
                            }

                        });

                        console.log('导入开始');
                        
                    }
                })

                //this.$logger(file);
                //const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(file.path));
                //this.$logger(workSheetsFromBuffer);
 
                //this.file = file;
                
                return false;
            },



            // 下载模板
            downloadTpl() {

                ipcRenderer.send('download', this.templateXlsx);
                ipcRenderer.once('downstate', (event, arg) => {
                    if (arg === 'completed') {

                        this.$Notice.success({
                            title: '保存成功',
                            desc: '您下载的文件已经保存成功，请查看.'
                        });

                    } else {

                    }
                });
            }
        }
    }
</script>

<style lang="less">

    @import "../../assets/css/print.css";

    .wrapper{
        background-color: #fff
    }
    .tips{
        padding: 10px 0;
        float: right;
    }
    .namePart{
        padding: 10px;
    }
</style>
