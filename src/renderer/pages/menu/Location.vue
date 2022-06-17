<template>
    <div>
        <div class="ivu-card-body wrapper">
          
          <div style="text-align: right;padding-bottom: 10px;">
          <Button type="primary" icon="plus-round" @click="add" title="创建"></Button>
          </div>

          <Table border stripe :columns="dataList_table_column" :data="dataList" :loading="tableLoading"
                 @on-row-dblclick="tableRowDblClick"></Table>
          <Page :total="dataListTotalCount" :current="searchParams.pageIndex"
                :page-size="searchParams.pageSize" @on-change="getDataList" @on-page-size-change="getDataListOnPageChange"
                :page-size-opts="[10,20,30,40,50]" show-total
                show-sizer show-elevator transfer></Page>

          <div style="clear: both;"></div>

        </div>

        <Modal width="60%" v-model="modalShow" :mask-closable="false" :title="modalTitle" @on-cancel="modalShow = false">
            <div>
                <Form inline ref="formVali" :model="modalParams" :rules="ruleValidate" label-position="top" @keydown.native.enter.prevent="enterConfirm(modalParams.location_id)">
                    
                    <Row>
                      <FormItem label="考点编号" prop="location_no">
                          <Input v-model="modalParams.location_no" placeholder="必填，长度 100 以内"
                                 style="width: 350px"></Input>
                      </FormItem>

                      <FormItem label="考点名称" prop="location_name">
                          <Input v-model="modalParams.location_name" placeholder="必填，长度 100 以内"
                                 style="width: 350px"></Input>
                      </FormItem>

                    </Row>

                    <Row>
                      <FormItem label="教室数量" prop="location_room_num">
                          <Input v-model="modalParams.location_room_num" placeholder=""
                                 style="width: 350px"></Input>
                      </FormItem>
                    </Row>


                    <Row>
                      <FormItem label="考点地址" prop="location_addr">
                          <Input v-model="modalParams.location_addr" placeholder="必填"
                                 style="width: 350px"></Input>
                      </FormItem>
                    </Row>
                    
                    <Row>
                      <FormItem label="备注（交通说明等）" prop="location_remark">
                          <Input v-model="modalParams.location_remark" placeholder="" style="width: 350px"></Input>
                      </FormItem>
                    </Row>

                </Form>
            </div>
            <div slot="footer">
                <Button @click="modalShow = false">
                    取消
                </Button>
                <Button type="primary" v-if="!modalParams.location_id" @click="addConfirm" :loading="modalBtnLoading">确认
                </Button>
                <Button type="primary" v-if="modalParams.location_id" @click="editConfirm" :loading="modalBtnLoading">确认
                </Button>
            </div>
        </Modal>
        <Modal v-model="delModalShow" width="370">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="information-circled"></Icon>
                <span>删除确认</span>
            </p>
            <div style="text-align:center;line-height: 26px;">
                <p>将永久删除 <strong>{{modalParams.location_name}}</strong> ，且<strong>无法恢复</strong>。</p>
                <p>请输入该考点名称以确认删除。</p>
                <Input v-model="modalParams.input"
                       style="width: 250px"></Input>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long @click="delConfrim" :loading="modalBtnLoading"
                        :disabled="modalParams.location_name !== modalParams.input">删除
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
        location_name: '',
        sort: 'DESC',
        pageIndex: 1,
        pageSize: 10,
      },

      searchParams: {},
      dataList: [],
      dataListTotalCount: 0,
      dataList_table_column: [
        {
          title: '考点编号',
          key: 'location_no',
          align: 'center',
          minWidth: 200,
        },
        {
          title: '考点名称',
          key: 'location_name',
          align: 'center',
          minWidth: 200,
        },

        {
          title: '教室数量',
          key: 'location_room_num',
          align: 'center',
          minWidth: 200,
        },

        {
          title: '考点地址',
          key: 'location_addr',
          align: 'center',
          minWidth: 200,
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
        location_name: '',
        location_no: '',
        location_room_num: 0,
        location_addr: '',
        location_remark: '',
      },
      delModalShow: false,
      ruleValidate: {
        location_name: [
          { required: true, message: '请输入 考点名称' },
        ],
        location_no: [
          { required: true, message: '请输入 考点编号' },
        ],
        location_addr: [
          { required: true, message: '请输入 考点地址' },
        ],
      },
      downloadExcelSQL: '',
    };
  },
  computed: {
    modalTitle() {
      return this.modalParams.location_id ? '修改' : '创建';
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
      let whereSQL = `WHERE location_name LIKE '%${searchParams.location_name}%'`;
      const pageSQL = `LIMIT ${searchParams.pageSize} OFFSET ${(searchParams.pageIndex - 1) * searchParams.pageSize} `;
      const orderSQL = `ORDER BY location_id ${searchParams.sort} `;
      // 导出sql
      this.downloadExcelSQL = 'SELECT * from LOCATION ' + whereSQL + orderSQL;
      const rowSQL = this.downloadExcelSQL + pageSQL;
      const countSQL = 'SELECT COUNT(location_id) AS totalCount from LOCATION ' + whereSQL;
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
    },
    // 新增确认
    addConfirm() {
      this.$refs.formVali.validate(valid => {

        if (valid) {

          this.modalBtnLoading = true;
          const modalParams = this.modalParams;

          // 检测是否存在
          const SQL = `SELECT COUNT(location_id) AS totalCount from LOCATION WHERE location_no = '${modalParams.location_no}'`;

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
                  content: '该考点编号已存在',
                });
                this.modalBtnLoading = false;
              } else {

                const SQL = `INSERT INTO LOCATION (location_name,location_no,location_room_num,location_addr,location_remark,create_time,update_time)
          VALUES ('${modalParams.location_name}','${modalParams.location_no}','${modalParams.location_room_num}','${modalParams.location_addr}','${modalParams.location_remark}','${Date.now()}','${Date.now()}')`;

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
      console.log("ROW", row)
      this.$refs.formVali.resetFields();
      this.modalParams = {
        location_id: row.location_id,
        location_name: row.location_name,
        location_no: row.location_no,
        location_room_num: row.location_room_num,
        location_addr: row.location_addr,
        location_remark: row.location_remark
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

          const SQL = `UPDATE LOCATION SET
          location_name='${modalParams.location_name}'
          ,location_no='${modalParams.location_no}'
          ,location_room_num='${modalParams.location_room_num}'
          ,location_addr='${modalParams.location_addr}'
          ,location_remark='${modalParams.location_remark}'
          ,update_time='${Date.now()}'
          WHERE location_id = ${modalParams.location_id}`;
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
        location_id: row.location_id,
        location_name: row.location_name,
        input: '',
      };
      this.delModalShow = true;
    },
    //  删除确认
    delConfrim() {
      this.$db.serialize(() => {
        this.$db.run('BEGIN');
        // 删除所有明细
        const deleteDetailSQL = `DELETE FROM LOCATION WHERE location_id = ${this.modalParams.location_id}`;
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
  }

};

</script>
<style lang="less">
</style>
