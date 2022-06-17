<template>
    <div>

      <div class="ivu-card-body wrapper">

        <Form :label-width="90" inline @keydown.native.enter.prevent="getDataList('search')">
            <FormItem label="考试名称">
                <Input v-model="search.exam_name" style="width: 203px" clearable></Input>
            </FormItem>

            <FormItem :label-width="10">
                <Button type="primary" icon="ios-search" @click="getDataList('search')" title="搜索"></Button>
                <Button style="margin-left:5px;" type="primary" icon="plus-round" @click="add" title="创建"></Button>
               
            </FormItem>
        </Form>


        <Table border stripe :columns="dataList_table_column" :data="dataList" :loading="tableLoading"
              ></Table>
        
        <Page :total="dataListTotalCount" :current="searchParams.pageIndex"
              :page-size="searchParams.pageSize" @on-change="getDataList" @on-page-size-change="getDataListOnPageChange"
              :page-size-opts="[10,20,30,40,50]" show-total
              show-sizer show-elevator transfer></Page>
        
        <div style="clear: both;"></div>

      </div>

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
          value: 'user_site_no',
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
        exam_name: '',
        sort: 'DESC',
        pageIndex: 1,
        pageSize: 10,
      },

      searchParams: {},
      dataList: [],
      dataListTotalCount: 0,
      dataList_table_column: [

        {
          title: '考试编号',
          key: 'exam_no',
          align: 'center',
          minWidth: 200,
        },
        
        {
          title: '考试名称',
          key: 'exam_name',
          align: 'center',
          minWidth: 200,
        },
        
        {
          title: '考生人数',
          key: 'exam_num',
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
      ruleValidate: {},
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
      let whereSQL = `WHERE exam_draft IN(0,2) AND exam_name LIKE '%${searchParams.exam_name}%'`;
      const pageSQL = `LIMIT ${searchParams.pageSize} OFFSET ${(searchParams.pageIndex - 1) * searchParams.pageSize} `;
      const orderSQL = `ORDER BY exam_id ${searchParams.sort} `;
      // 导出sql
      this.downloadExcelSQL = 'SELECT * from EXAM ' + whereSQL + orderSQL;
      const rowSQL = this.downloadExcelSQL + pageSQL;
      const countSQL = 'SELECT COUNT(exam_id) AS totalCount from EXAM ' + whereSQL;
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
      this.$router.push({
        path: '/new'
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

      if (row.exam_draft == 0) {

        this.$router.push({
          path: '/setting',
          query: {
            exam_no: row.exam_no,
          },
        }); 

      } else if (row.exam_draft == 2) {

        this.$router.push({
          path: '/user',
          query: {
            exam_no: row.exam_no,
          },
        });

      }

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
        exam_id: row.exam_id,
        exam_name: row.exam_name,
        input: '',
      };
      this.delModalShow = true;
    },
    //  删除确认
    delConfrim() {
      this.$db.serialize(() => {

        this.$db.run('BEGIN');

        const deleteSQL = `DELETE FROM EXAM WHERE exam_id = ${this.modalParams.exam_id}`;
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
</style>
