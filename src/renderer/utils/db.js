import fse from 'fs-extra';
import path from 'path';
import sq3 from 'sqlite3';
import logger from './logger';
import { docDir } from './settings';
// 将数据存至系统用户目录，防止用户误删程序
export const dbPath = path.join(docDir, 'data.sqlite3');
fse.ensureFileSync(dbPath);

const sqlite3 = sq3.verbose();
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  /**
   * 物品表 GOODS
   * name 品名
   * standard_buy_unit_price 标准进价
   * standard_sell_unit_price 标准售价
   * total_amount 总金额
   * total_count 总数量
   * remark 备注
   * create_time 创建时间
   * update_time 修改时间
   */
  db.run(`CREATE TABLE GOODS(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    standard_buy_unit_price DECIMAL(15,2) NOT NULL,
    standard_sell_unit_price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    total_count DECIMAL(15,3) NOT NULL,
    remark VARCHAR(255) NOT NULL,
    create_time INTEGER NOT NULL,
    update_time INTEGER NOT NULL
    )`, err => {
    logger(err);
  });

  /**
   * 进出明细表 GOODS_DETAIL_LIST
   * goods_id 物品id
   * count 计数（+加 -减）
   * actual_buy_unit_price 实际进价
   * actual_sell_unit_price 实际售价
   * amount 实际金额
   * remark 备注
   * latest 是否某物品最新一条记录（不是最新操作无法删除）（1是 0不是）
   * create_time 创建时间
   * update_time 修改时间
   */
  db.run(`CREATE TABLE GOODS_DETAIL_LIST(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    goods_id INTEGER NOT NULL, 
    count DECIMAL(15,3) NOT NULL,
    actual_sell_unit_price DECIMAL(15,2) NOT NULL,
    actual_buy_unit_price DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    remark VARCHAR(255) NOT NULL,
    latest INTEGER NOT NULL,
    create_time INTEGER NOT NULL,
    update_time INTEGER NOT NULL,
    FOREIGN KEY (goods_id) REFERENCES GOODS(id)
    )`, err => {
    logger(err);
  });

  /**
   * 考试表 EXAM
   * id 考试id
   * no 考试编号
   * name 考试名称
   * num 考试人数
   * admission_prefix 准考证号前缀
   * exam_admission_tpl_content 准考证模板
   * exam_admission_tpl_content 准考证模板
   * room_num_no 考场号占位
   * draft 草稿 1 是 0 不是
   * exam_room_seat_num 每个考场的座位数
   * create_time 创建时间
   * update_time 修改时间
   */
  db.run(`CREATE TABLE EXAM(

    exam_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    exam_no VARCHAR(255) NOT NULL, 
    exam_name VARCHAR(100) NOT NULL,
    exam_admission_prefix VARCHAR(100),
    exam_room_seat_num INTEGER NOT NULL DEFAULT (30),

    admission_tpl_id INTEGER,
    admission_tpl_content text,

    exam_room_no_num INTEGER NOT NULL DEFAULT (0),

    exam_num INTEGER NOT NULL DEFAULT (0),
    exam_draft INTEGER NOT NULL DEFAULT (1),
    
    create_time INTEGER NOT NULL,
    update_time INTEGER NOT NULL
    )`, err => {
    logger(err);
  });


  /**
   * 准考证模板表 ADMISSION_TPL
   * id 模板id
   * name 模板名称
   * content 模板内容
   * create_time 创建时间
   * update_time 修改时间
   */
  db.run(`CREATE TABLE ADMISSION_TPL(
    admission_tpl_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    admission_tpl_name VARCHAR(100) NOT NULL,
    admission_tpl_content TEXT NOT NULL,
    create_time INTEGER NOT NULL,
    update_time INTEGER NOT NULL
    )`, err => {
    logger(err);
  });


  /**
   * 考生表 USER
   * user_id 考生id
   * user_name 考生名称
   * user_admission_no 准考证号
   * user_pic 考生头像
   * user_idcard 考生省份证号
   * user_phone 准考手机号
   * user_pos_name 考生报考职位
   * user_room_no 考生考场号
   * user_site_no 考生座位号
   * 
   * user_job_cat_id 职位类别ID
   * user_job_cat_name 职位类别名称
   * 
   * user_location_name 考点名称
   * user_location_code 考点编号
   * create_time 创建时间
   * update_time 修改时间
   */
  db.run(`CREATE TABLE USER(

    user_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,

    user_no VARCHAR(255) NOT NULL,

    exam_no VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_pic VARCHAR(100),
    user_idcard VARCHAR(100),
    user_phone VARCHAR(100),
    user_pos_name VARCHAR(100),

    user_room_no VARCHAR(100),
    user_seat_no VARCHAR(100),
    
    user_admission_no VARCHAR(100),
    user_admission_tpl_content VARCHAR(100),
    
    user_job_cat_id INTEGER,
    user_job_cat_name VARCHAR(100),

    user_location_id INTEGER,
    user_location_code VARCHAR(100),
    user_location_name VARCHAR(100),
    user_location_addr VARCHAR(100),
    user_location_remark VARCHAR(100),

    create_time INTEGER NOT NULL,
    update_time INTEGER NOT NULL
    )`, err => {
    logger(err);
  });


  /**
   * 考点表 LOCATION
   * location_id 考点id
   * location_name 考点名称
   * location_no 考点编号
   * location_room_num 考点教室数量
   * location_addr 考点地址
   * location_remark 考点备注
   * create_time 创建时间
   * update_time 修改时间
   */
  db.run(`CREATE TABLE LOCATION(
    location_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    location_no VARCHAR(100) NOT NULL,
    location_room_num INTEGER,
    location_addr VARCHAR(100) NOT NULL,
    location_remark VARCHAR(100) NOT NULL,
    create_time INTEGER NOT NULL,
    update_time INTEGER NOT NULL
    )`, err => {
    logger(err);
  });

});

export default db;
