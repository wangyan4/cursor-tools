/**
 * 农历日期计算
 */
const LunarCalendar = {
    /**
     * 农历1900-2100的润大小信息表
     * 数据格式：[闰月所在月，0为没有闰月; *正常月份大小；*闰月大小]，1为大月30天，0为小月29天
     */
    lunarInfo: [
        0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,//1900-1909
        0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,//1910-1919
        0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,//1920-1929
        0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,//1930-1939
        0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,//1940-1949
        0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,//1950-1959
        0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,//1960-1969
        0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,//1970-1979
        0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,//1980-1989
        0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,//1990-1999
        0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,//2000-2009
        0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,//2010-2019
        0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,//2020-2029
        0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,//2030-2039
        0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,//2040-2049
        0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,//2050-2059
        0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,//2060-2069
        0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,//2070-2079
        0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,//2080-2089
        0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,//2090-2099
        0x0d520],

    // 天干
    Gan: ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],
    
    // 地支
    Zhi: ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"],
    
    // 生肖
    Animals: ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"],
    
    // 农历月份
    monthCn: ["正","二","三","四","五","六","七","八","九","十","冬","腊"],
    
    // 农历日期
    dayCn: ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
            "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
            "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"],

    /**
     * 获取农历年的总天数
     * @param {number} year 农历年
     * @returns {number} 总天数
     */
    getLunarYearDays: function(year) {
        let sum = 348;
        for(let i=0x8000; i>0x8; i>>=1) {
            sum += (this.lunarInfo[year-1900] & i) ? 1 : 0;
        }
        return sum + this.getLeapDays(year);
    },

    /**
     * 获取农历年闰月的天数
     * @param {number} year 农历年
     * @returns {number} 闰月天数，0表示该年没有闰月
     */
    getLeapDays: function(year) {
        if(this.getLeapMonth(year)) {
            return (this.lunarInfo[year-1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    },

    /**
     * 获取农历年闰月月份
     * @param {number} year 农历年
     * @returns {number} 闰月月份，0表示该年没有闰月
     */
    getLeapMonth: function(year) {
        return this.lunarInfo[year-1900] & 0xf;
    },

    /**
     * 获取农历月份的天数
     * @param {number} year 农历年
     * @param {number} month 农历月
     * @returns {number} 该月天数
     */
    getMonthDays: function(year, month) {
        return (this.lunarInfo[year-1900] & (0x10000>>month)) ? 30 : 29;
    },

    /**
     * 公历转农历
     * @param {number} year 公历年
     * @param {number} month 公历月
     * @param {number} day 公历日
     * @returns {Object} 农历日期对象
     */
    solarToLunar: function(year, month, day) {
        if(year < 1900 || year > 2100) {
            return {
                GanZhiYear: '不支持的年份',
                monthCn: '',
                dayCn: ''
            };
        }

        let offset = (Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000;
        
        let lunarYear = 1900;
        let lunarMonth = 1;
        let lunarDay = 1;
        
        // 计算年份
        let temp = 0;
        for(let y = 1900; y < 2101 && offset > 0; y++) {
            temp = this.getLunarYearDays(y);
            if(offset < temp) {
                lunarYear = y;
                break;
            }
            offset -= temp;
        }
        
        // 计算月份
        let leapMonth = this.getLeapMonth(lunarYear);
        let isLeap = false;
        
        for(let m = 1; m < 13 && offset > 0; m++) {
            if(leapMonth > 0 && m === (leapMonth + 1) && !isLeap) {
                m--;
                isLeap = true;
                temp = this.getLeapDays(lunarYear);
            } else {
                temp = this.getMonthDays(lunarYear, m);
            }
            
            if(isLeap && m === (leapMonth + 1)) {
                isLeap = false;
            }
            
            if(offset < temp) {
                lunarMonth = m;
                lunarDay = Math.floor(offset + 1);
                break;
            }
            offset -= temp;
        }
        
        // 计算天干地支年
        const ganIndex = (lunarYear - 4) % 10;
        const zhiIndex = (lunarYear - 4) % 12;
        
        return {
            GanZhiYear: this.Gan[ganIndex] + this.Zhi[zhiIndex],
            monthCn: (isLeap ? "闰" : "") + this.monthCn[lunarMonth - 1] + "月",
            dayCn: this.dayCn[lunarDay - 1]
        };
    }
}; 