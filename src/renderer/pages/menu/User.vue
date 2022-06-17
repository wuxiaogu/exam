<template>
    <div style="background-color: #fff;">

        <ExamHeader :exam_no="exam_no" :exam_name="exam.exam_name"></ExamHeader>
        
        <div class="ivu-card-body wrapper">

          <Form :label-width="90" inline @keydown.native.enter.prevent="getDataList('search')">
              
              <FormItem label="关键字搜索">
                  <Input v-model="search.name" style="width: 203px" clearable placeholder="身份证号"></Input>
              </FormItem>

              <FormItem :label-width="10">
                  <Button type="primary" icon="ios-search" @click="getDataList('search')" title="搜索"></Button>
                  <Button style="margin-left:5px;" type="primary" icon="ios-upload-outline" @click="downloadExcel"
                          title="导出" :loading="downloadExcelLoading">导出</Button>
              </FormItem>
              
          </Form>


          <Table border stripe :columns="dataList_table_column" :data="dataList" :loading="tableLoading"></Table>
          
          <Page :total="dataListTotalCount" :current="searchParams.pageIndex"
                :page-size="searchParams.pageSize" @on-change="getDataList" @on-page-size-change="getDataListOnPageChange"
                :page-size-opts="[10,20,30,40,50]" show-total
                show-sizer show-elevator transfer></Page>

          <div style="clear: both;"></div>

        </div>

        <!-- 准考证弹框 -->
        <Modal v-model="admissionModal"
          title="准考证"
          :styles="{top: '20px'}">

          <div class="content" v-html="admissionContent" ref="admission"></div>
          <div slot="footer">
            <Button type="success" size="large" @click="admissionPrint">打印</Button>
          </div>

        </Modal>

    </div>

</template>
<script>

import util from '../../utils/util';
import download from '../../utils/download';

import ExamHeader from '../../components/ExamHeader.vue';
import { ipcRenderer } from 'electron';

import fs from 'fs';
import path from 'path';

export default {
  data() {
    return {

      exam_no: this.$route.query.exam_no,

      // loading
      downloadExcelLoading: false,
      modalBtnLoading: false,
      tableLoading: false,

      // ----特殊枚举
      sortList: [
        {
          label: '按创建倒序',
          value: 'DESC',
        },
        {
          label: '按创建顺序',
          value: 'ASC',
        },
      ],

      // ----常用
      search: {
        name: '',
        sort: 'DESC',
        pageIndex: 1,
        pageSize: 30,
      },

      searchParams: {},
      dataList: [],
      dataListTotalCount: 0,
      dataList_table_column: [
        {
          title: '姓名|证件号',
          key: 'info',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            console.log(params)
            return h('div',  {
                attrs: {}
              }, [
              h('div', {
                  style: {
                    'float': 'left',
                    'padding': '10px',
                    'padding-bottom': 0
                  }, 
                },
                [
                  h('img', {attrs: {
                      src: params.row.user_pic,
                      width: "50",
                      height: "50"
                    },

                    style: {
                      'padding': '1px',
                      'border': '1px solid #ccc'
                    }

                  })
                ]
              ),
              h('div', {
                  style: {
                    'float': 'left',
                    'text-align': 'left',
                    'padding': '10px',
                    'padding-top': 0
                  }, 
                },
                [
                  h('p', params.row.user_name),
                  h('p', params.row.user_idcard),
                  h('p', "准考证号：" + params.row.user_admission_no),
                ]
              )
            ]);
          }
        },
        
        {
          title: '考点号',
          key: 'user_location_code',
          align: 'center',
          minWidth: 150
        },

        {
          title: '考场号',
          key: 'user_room_no',
          align: 'center',
          minWidth: 150
        },

        {
          title: '座位号',
          key: 'user_seat_no',
          align: 'center',
          minWidth: 150
        },

        {
          title: '职位类别',
          key: 'user_job_cat_name',
          align: 'center',
          minWidth: 150
        },

        {
          title: '职位代码',
          key: 'user_pos_name',
          align: 'center',
          minWidth: 150
        },
        {
          title: '手机号',
          key: 'user_phone',
          align: 'center',
          minWidth: 150
        },
        
        // {
        //   title: '操作',
        //   key: 'action',
        //   width: 200,
        //   align: 'center',
        //   fixed: 'right',
        //   render: (h, params) => {
        //     return h('div', [
        //       h('Button', {
        //         props: {
        //           type: 'primary',
        //           size: 'small',
        //           icon: 'edit',
        //         },
        //         attrs: {
        //           title: '准考证',
        //         },
        //         style: {
        //           'margin-left': '5px',
        //         },
        //         on: {
        //           click: () => {
        //             this.admission(params.row);
        //           },
        //         },
        //       }, "准考证号")
        //     ]);
        //   },
        // },
      ],
      modalShow: false,
      modalParams: {
        admission_tpl_name: '',
        admission_tpl_content: '',
      },
      delModalShow: false,
      ruleValidate: {},
      downloadExcelSQL: '',

      // 准考证弹框相关变量
      admissionModal: false,
      admissionContent: '',
      exam: {},

    };
  },
  computed: {
    modalTitle() {
      return this.modalParams.id ? '修改' : '创建';
    },
  },
  methods: {

    // 插入用户字段
    insertUserCol(){
      this.$refs.editor.insert("{"+this.userCol+"}");
    },

    // 插入用户字段
    insertLocationCol(){
      this.$refs.editor.insert("{"+this.locationCol+"}");
    },

        // 插入用户字段
    insertExamName(){
      this.$refs.editor.insert("{exam_name}");
    },


    // 搜索
    getDataList(method) {
      this.tableLoading = true;
      if (method === 'search') {
        this.searchParams = JSON.parse(JSON.stringify(this.search));
      }
      if (typeof method === 'number') {
        this.searchParams.pageIndex = method;
      }
      const searchParams = this.searchParams;
      let whereSQL = `WHERE user_idcard LIKE '%${searchParams.name}%' AND exam_no='${this.exam_no}'`;
      const pageSQL = `LIMIT ${searchParams.pageSize} OFFSET ${(searchParams.pageIndex - 1) * searchParams.pageSize} `;
      // const orderSQL = ` ORDER BY user_id ${searchParams.sort} `;
      const orderSQL = ` ORDER BY user_admission_no ${searchParams.sort} `;
      // 导出sql
      this.downloadExcelSQL = 'SELECT * from USER ' + whereSQL + orderSQL;
      const rowSQL = this.downloadExcelSQL + pageSQL;
      const countSQL = 'SELECT COUNT(user_id) AS totalCount from USER ' + whereSQL;
      this.$logger(rowSQL);
      this.$db.all(rowSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          if (!res.length && searchParams.pageIndex !== 1) {
            // 该页没数据，又不是第一页，就往上一页翻
            this.getDataList(searchParams.pageIndex - 1);
          } else {
            this.dataList = res;
          }
        }
        this.tableLoading = false;
      });
      this.$logger(countSQL);
      this.$db.get(countSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          this.dataListTotalCount = res.totalCount;
        }
      });
    },
    // pageSize改变
    getDataListOnPageChange(pageSize) {
      this.search.pageSize = pageSize;
      this.getDataList('search');
    },
    // 双击表格某行
    tableRowDblClick(row) {
      this.direct(row);
    },

    // 新增
    add() {
      this.$refs.formVali.resetFields();
      this.modalParams = this.$options.data().modalParams;
      this.modalShow = true;

      // 设置富文本默认内容
      const default_path = path.join(__static, '/tpl_default.txt');
      const that = this;
      fs.readFile(default_path, 'utf-8', function (err, data) {
        if (err) {
          console.log(err) // eslint-disable-line
        } else {
          console.log(data) // eslint-disable-line
          that.modalParams.admission_tpl_content = data;
        }
      });
    },

    // 新增确认
    addConfirm() {
      this.$refs.formVali.validate(valid => {
        if (valid) {
          this.modalBtnLoading = true;
          const modalParams = this.modalParams;
          // 检测品名是否存在
          const SQL = `SELECT COUNT(admission_tpl_id) AS totalCount from ADMISSION_TPL WHERE admission_tpl_name = '${modalParams.admission_tpl_name}'`;
          this.$db.get(SQL, (err, res) => {
            if (err) {
              this.$logger(err);
              this.$Notice.error({
                title: '搜索失败',
                desc: err,
              });
            } else {
              if (res.totalCount) {
                this.$Message.warning({
                  content: '该模板名称已存在',
                });
                this.modalBtnLoading = false;
              } else {
                const SQL = `INSERT INTO ADMISSION_TPL (admission_tpl_name,admission_tpl_content,create_time,update_time)
          VALUES ('${modalParams.admission_tpl_name}','${modalParams.admission_tpl_content}','${Date.now()}','${Date.now()}')`;
                this.$logger(SQL);
                this.$db.run(SQL, err => {
                  if (err) {
                    this.$logger(err);
                    this.$Notice.error({
                      title: '新增失败',
                      desc: err,
                    });
                  } else {
                    this.modalShow = false;
                    this.$Message.success({
                      content: '新增成功',
                    });
                    this.getDataList(1);
                  }
                  this.modalBtnLoading = false;
                });
              }
            }
          });
        }
      });
    },

    // 跳转
    direct(row) {
      this.$router.push({
        path: '/detailList',
        query: {
          goods_id: row.id,
        },
      });
    },

    // 编辑
    edit(row) {
      this.$logger(row);
      this.$refs.formVali.resetFields();
      this.modalParams = {
        admission_tpl_id: row.admission_tpl_id,
        admission_tpl_name: row.admission_tpl_name,
        admission_tpl_content: row.admission_tpl_content,
      };
      this.modalShow = true;
    },

    // 打印
    admissionPrint(){
      // alert("打印准考证");
      let html = this.$refs.admission.innerHTML
      ipcRenderer.send('print-to-pdf', html);
    },

    // 准考证
    admission(row) {

      this.$logger('准考证');
      this.$logger(row);
      
      // 获取考试数据
      // let exam = this.getExam(row.exam_no);

      const SQL = `SELECT * FROM EXAM WHERE exam_no = '${row.exam_no}'`;
      this.$db.get(SQL, (err, res) => {
        let admission_content = res.admission_tpl_content;
        admission_content = util.strReplace(admission_content, "{exam_name}", res.exam_name);
        admission_content = util.strReplace(admission_content, "{user_admission_no}", row.user_admission_no);
        admission_content = util.strReplace(admission_content, "{user_name}", row.user_name);
        if (row.user_pic == null) {
          row.user_pic = __static + "/img/headimg.jpg"; 
        }
        admission_content = util.strReplace(admission_content, "{user_pic}", "<img width=100 src='" + row.user_pic + "'/>");
        admission_content = util.strReplace(admission_content, "{user_idcard}", row.user_idcard);
        admission_content = util.strReplace(admission_content, "{user_phone}", row.user_phone);
        admission_content = util.strReplace(admission_content, "{user_pos_name}", row.user_pos_name);
        admission_content = util.strReplace(admission_content, "{user_room_no}", row.user_room_no);
        admission_content = util.strReplace(admission_content, "{user_seat_no}", row.user_seat_no);
        admission_content = util.strReplace(admission_content, "{user_location_name}", row.user_location_name);
        admission_content = util.strReplace(admission_content, "{user_location_addr}", row.user_location_addr);
        this.admissionContent = admission_content;
        this.admissionModal = true;
      });
    },

    // 获取考试
    getExam(exam_no){
        const SQL = `SELECT * FROM EXAM WHERE exam_no = '${exam_no}'`;
        this.$db.get(SQL, (err, res) => {
            this.exam = res;
        });           
    },

    // 编辑确认
    editConfirm() {
      this.$refs.formVali.validate(valid => {
        if (valid) {
          this.modalBtnLoading = true;
          const modalParams = this.modalParams;
          // 检测品名是否存在

          const SQL = `UPDATE ADMISSION_TPL SET
          admission_tpl_name='${modalParams.admission_tpl_name}'
          ,admission_tpl_content='${modalParams.admission_tpl_content}'
          ,update_time='${Date.now()}'
          WHERE admission_tpl_id = ${modalParams.admission_tpl_id}`;
          this.$logger(SQL);
          this.$db.run(SQL, err => {
            if (err) {
              this.$logger(err);
              this.$Notice.error({
                title: '编辑失败',
                desc: err,
              });
            } else {
              this.modalShow = false;
              this.$Message.success({
                content: '编辑成功',
              });
              this.getDataList();
            }
            this.modalBtnLoading = false;
          });
        }
      });
    },

    enterConfirm(id) {
      console.log("edit", id)
      if (id) {
        this.editConfirm();
      } else {
        this.addConfirm();
      }
    },

    // 删除
    del(row) {
      this.modalParams = {
        id: row.id,
        name: row.name,
        input: '',
      };
      this.delModalShow = true;
    },

    //  删除确认
    delConfrim() {
      this.$db.serialize(() => {
        this.$db.run('BEGIN');
        // 删除所有明细
        const deleteDetailSQL = `DELETE FROM GOODS_DETAIL_LIST WHERE goods_id = ${this.modalParams.id}`;
        this.$logger(deleteDetailSQL);
        this.$db.run(deleteDetailSQL, err => {
          if (err) {
            this.$logger(err);
            this.$db.run('ROLLBACK');
            this.$Notice.error({
              title: '删除失败',
              desc: err,
            });
          }
        });
        const deleteSQL = `DELETE FROM GOODS WHERE id = ${this.modalParams.id}`;
        this.$logger(deleteSQL);
        this.$db.run(deleteSQL, err => {
          if (err) {
            this.$logger(err);
            this.$db.run('ROLLBACK');
            this.$Notice.error({
              title: '删除失败',
              desc: err,
            });
          }
        });
        this.$db.run('COMMIT');
        this.delModalShow = false;
        this.$Message.success({
          content: '删除成功',
        });
        this.getDataList();
      });
    },

    // 导出表格
    downloadExcel() {
      this.downloadExcelLoading = true;
      this.$db.all(this.downloadExcelSQL, (err, res) => {
        if (err) {
          this.$logger(err);
          this.$Notice.error({
            title: '搜索失败',
            desc: err,
          });
        } else {
          const data = [
            [ '准考证号', '考点号', '考场号', '座位号', '姓名', '身份证号', '报考项目', '手机号', '考点', '考点地址'],
          ];
          for (const item of res) {
            data.push([ item.user_admission_no, item.user_location_code, item.user_room_no, item.user_seat_no, item.user_name, item.user_idcard, item.user_pos_name, item.user_phone, item.user_location_name, item.user_location_addr]);
          }
          const name = '报名考生数据导出';
          download.excel(name, [
            {
              name,
              data,
            },
          ]).then(arg => {
            this.downloadExcelLoading = false;
            if (arg === 'completed') {
              this.$Message.success({
                content: '导出成功',
              });
            } else {
              this.$Message.warning({
                content: '导出取消',
              });
            }
          }).catch(err => {
            this.downloadExcelLoading = false;
            this.$Notice.error({
              title: '导出失败',
              desc: err,
            });
          });
        }
      });
    },
  },
  created() {
    this.getDataList('search');
    this.getExam(this.exam_no);
  },
  components: {
    ExamHeader,
  },
};

</script>
<style lang="less">
  .wrapper{
    margin-bottom: 40px;
  }

</style>
