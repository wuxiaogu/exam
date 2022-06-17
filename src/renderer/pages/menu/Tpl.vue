<template>
    <div>
      
      <div class="ivu-card-body wrapper">

        <Form :label-width="90" inline @keydown.native.enter.prevent="getDataList('search')">
            <FormItem label="模板名称">
                <Input v-model="search.admission_tpl_name" style="width: 203px" clearable></Input>
            </FormItem>
            <FormItem label="排序">
                <Select v-model="search.sort" style="width:200px;">
                    <Option v-for="(item,index) in sortList" :value="item.value">{{item.label}}
                    </Option>
                </Select>
            </FormItem>

            <FormItem :label-width="10">
                <Button type="primary" icon="ios-search" @click="getDataList('search')" title="搜索"></Button>
                <Button style="margin-left:5px;" type="primary" icon="plus-round" @click="add" title="创建"></Button>
            </FormItem>
        </Form>

        <Table border stripe :columns="dataList_table_column" :data="dataList" :loading="tableLoading"
               @on-row-dblclick="tableRowDblClick"></Table>
        
        <Page :total="dataListTotalCount" :current="searchParams.pageIndex"
              :page-size="searchParams.pageSize" @on-change="getDataList" @on-page-size-change="getDataListOnPageChange"
              :page-size-opts="[10,20,30,40,50]" show-total
              show-sizer show-elevator transfer></Page>
          
        <div style="clear: both;"></div>

      </div>

      <Modal width="60%" v-model="modalShow" :mask-closable="false" :title="modalTitle" @on-cancel="modalShow = false" z-index=99999 class="tplEdit">
          <div>
              <Form inline ref="formVali" :model="modalParams" :rules="ruleValidate" label-position="top" @keydown.native.enter.prevent="enterConfirm(modalParams.admission_tpl_id)">
                  <Row>
                    <FormItem label="模板名称" prop="admission_tpl_name">
                        <Input v-model="modalParams.admission_tpl_name" placeholder="必填，长度 100 以内"
                               style="width: 350px"></Input>
                    </FormItem>
                  </Row>
                  <Row>
                      <FormItem label="向模板中插入字段">
                          <i-button type="ghost" @click="insertExamName()">考试名称</i-button>
                          <div style="display: inline-block;">
                            <i-select style="width:120px" v-model="userCol">
                                <i-option v-for="item in userColList" :value="item.value">{{ item.label }}</i-option>
                            </i-select>
                            <div class="ivu-input-group-append" style="display: inline;padding:8px; margin-left: -6px;" @click="insertUserCol()">
                              <span slot="append">插入考生字段</span>
                            </div>
                          </div>

                      </FormItem>
                  </Row>
                  <Row>
                    <FormItem label="备注" prop="remark">
                      
                    </FormItem>
                  </Row>
              </Form>
          </div>
          <div slot="footer">
              <Button @click="modalShow = false">
                  取消
              </Button>
              <Button type="primary" v-if="!modalParams.admission_tpl_id" @click="addConfirm" :loading="modalBtnLoading">确认
              </Button>
              <Button type="primary" v-if="modalParams.admission_tpl_id" @click="editConfirm" :loading="modalBtnLoading">确认
              </Button>
          </div>
      </Modal>
      <Modal v-model="delModalShow" width="370">
          <p slot="header" style="color:#f60;text-align:center">
              <Icon type="information-circled"></Icon>
              <span>删除确认</span>
          </p>
          <div style="text-align:center;line-height: 26px;">
              <p>将永久删除 <strong>{{modalParams.admission_tpl_name}}</strong> ，且<strong>无法恢复</strong>。</p>
              <p>请输入该模板名称以确认删除。</p>
              <Input v-model="modalParams.input"
                     style="width: 250px"></Input>
          </div>
          <div slot="footer">
              <Button type="error" size="large" long @click="delConfrim" :loading="modalBtnLoading"
                      :disabled="modalParams.admission_tpl_name !== modalParams.input">删除
              </Button>
          </div>
      </Modal>

    </div>
</template>
<script>

import util from '../../utils/util';
import download from '../../utils/download';

import fs from 'fs';
import path from 'path';

export default {
  data() {
    return {

      userCol: null,
      userColList: [
        {
          value: 'user_admission_no',
          label: '考生准考证号'
        },
        {
          value: 'user_name',
          label: '考生姓名'
        },
        {
          value: 'user_pic',
          label: '考生照片'
        },
        {
          value: 'user_idcard',
          label: '考生身份证号'
        },
        {
          value: 'user_phone',
          label: '考生手机号'
        },
        {
          value: 'user_pos_name',
          label: '考生报考项目'
        },
        {
          value: 'user_room_no',
          label: '考生考场号'
        },
        {
          value: 'user_seat_no',
          label: '考生座位号'
        }
      ],

      locationCol: null,
      locationColList: [
        {
          value: 'location_name',
          label: '考点名称'
        },
        {
          value: 'location_addr',
          label: '考点地址'
        },
        {
          value: 'location_remark',
          label: '考点备注'
        }
      ],

      ckeditorData: "",

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
        admission_tpl_name: '',
        sort: 'DESC',
        pageIndex: 1,
        pageSize: 10,
      },

      searchParams: {},
      dataList: [],
      dataListTotalCount: 0,
      dataList_table_column: [
        {
          title: '模板名称',
          key: 'admission_tpl_name',
          align: 'center',
          minWidth: 200,
        },
        
        {
          title: '创建时间',
          key: 'create_time',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('span', util.dateFilter(params.row.create_time));
          },
        },
        
        {
          title: '操作',
          key: 'action',
          width: 130,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  icon: 'edit',
                },
                attrs: {
                  title: '修改',
                },
                style: {
                  'margin-left': '5px',
                },
                on: {
                  click: () => {
                    this.edit(params.row);
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small',
                  icon: 'trash-b',
                },
                attrs: {
                  title: '删除',
                },
                style: {
                  'margin-left': '5px',
                },
                on: {
                  click: () => {
                    this.del(params.row);
                  },
                },
              }),
            ]);
          },
        },
      ],
      modalShow: false,
      modalParams: {
        admission_tpl_name: '',
        admission_tpl_content: '',
      },
      delModalShow: false,
      ruleValidate: {
        name: [
          { required: true, message: '请输入 品名' },
          { max: 100, message: '品名 长度 100 以内' },
        ],
        standard_buy_unit_price: [
          { pattern: util.getRegexp('money'), message: '标准进价 只能为 小数位不超过2位的正整数' },
        ],
        standard_sell_unit_price: [
          { pattern: util.getRegexp('money'), message: '标准售价 只能为 小数位不超过2位的正整数' },
        ],
        remark: [
          { max: 200, message: '备注 长度 200 以内' },
        ],
      },
      downloadExcelSQL: '',
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
      let whereSQL = `WHERE admission_tpl_name LIKE '%${searchParams.admission_tpl_name}%'`;
      const pageSQL = `LIMIT ${searchParams.pageSize} OFFSET ${(searchParams.pageIndex - 1) * searchParams.pageSize} `;
      const orderSQL = `ORDER BY admission_tpl_id ${searchParams.sort} `;
      // 导出sql
      this.downloadExcelSQL = 'SELECT * from ADMISSION_TPL ' + whereSQL + orderSQL;
      const rowSQL = this.downloadExcelSQL + pageSQL;
      const countSQL = 'SELECT COUNT(admission_tpl_id) AS totalCount from ADMISSION_TPL ' + whereSQL;
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
      
      // 设置富文本默认内容
      const default_path = path.join(__static, '/tpl_default.txt');

      const that = this;
      fs.readFile(default_path, 'utf-8', function (err, data) {
        if (err) {
          console.log(err)// eslint-disable-line
        } else {
          console.log(data)// eslint-disable-line
          that.modalParams.admission_tpl_content = data;
          that.modalShow = true;
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
        admission_tpl_id: row.admission_tpl_id,
        name: row.admission_tpl_name,
        input: '',
      };
      this.delModalShow = true;
    },
    //  删除确认
    delConfrim() {
      this.$db.serialize(() => {
        this.$db.run('BEGIN');

        const deleteSQL = `DELETE FROM ADMISSION_TPL WHERE admission_tpl_id = ${this.modalParams.admission_tpl_id}`;
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
            [ '品名', '数量', '标准进价', '标准售价', '总金额', '备注', '创建时间', '修改时间' ],
          ];
          for (const item of res) {
            data.push([ item.name, item.total_count, item.standard_buy_unit_price, item.standard_sell_unit_price, item.total_amount, item.remark, util.dateFilter(item.create_time), util.dateFilter(item.update_time) ]);
          }
          const name = '物品管理';
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
  },

  components: {
  },


};

</script>
<style lang="less">
  .tplEdit{
    position: fixed;
    z-index: 1001;
  }
</style>
