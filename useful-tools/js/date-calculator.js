// 获取DOM元素
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const diffDays = document.getElementById('diffDays');
const diffWeeks = document.getElementById('diffWeeks');
const diffMonths = document.getElementById('diffMonths');

const baseDate = document.getElementById('baseDate');
const calcValue = document.getElementById('calcValue');
const calcUnit = document.getElementById('calcUnit');
const calcDirection = document.getElementById('calcDirection');
const resultDate = document.getElementById('resultDate');
const lunarDate = document.getElementById('lunarDate');

// 添加新的DOM元素引用
const startDateStr = document.getElementById('startDateStr');
const endDateStr = document.getElementById('endDateStr');
const startLunar = document.getElementById('startLunar');
const endLunar = document.getElementById('endLunar');

// 设置日期输入框的最小值
const minDate = '1901-01-01';
[startDate, endDate, baseDate].forEach(input => {
    input.min = minDate;
    input.value = formatDate(new Date());
});

// 修改农历日期转换函数
function getLunarDate(date) {
    try {
        // 使用 LunarCalendar 而不是 Lunar
        if (typeof LunarCalendar === 'undefined') {
            console.error('LunarCalendar library not loaded');
            return {
                gzYear: '未知',
                IMonthCn: '未知',
                IDayCn: '未知'
            };
        }
        
        // 使用 LunarCalendar.solarToLunar 进行转换
        const lunar = LunarCalendar.solarToLunar(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        );

        return {
            gzYear: lunar.GanZhiYear,
            IMonthCn: lunar.monthCn,
            IDayCn: lunar.dayCn
        };
    } catch (error) {
        console.error('Error converting to lunar date:', error);
        return {
            gzYear: '未知',
            IMonthCn: '未知',
            IDayCn: '未知'
        };
    }
}

// 计算日期差值
function calculateDateDiff() {
    try {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            clearDiffResults();
            return;
        }

        // 显示公历日期
        startDateStr.textContent = formatDisplayDate(start);
        endDateStr.textContent = formatDisplayDate(end);

        // 显示农历日期
        const startLunarDate = getLunarDate(start);
        const endLunarDate = getLunarDate(end);
        
        startLunar.textContent = formatLunarDate(startLunarDate);
        endLunar.textContent = formatLunarDate(endLunarDate);

        // 计算天数差
        const daysDiff = Math.round((end - start) / (1000 * 60 * 60 * 24));
        diffDays.textContent = daysDiff > 0 ? `+${daysDiff}天` : `${daysDiff}天`;

        // 计算周数差
        const weeksDiff = (daysDiff / 7).toFixed(1);
        diffWeeks.textContent = weeksDiff > 0 ? `+${weeksDiff}周` : `${weeksDiff}周`;

        // 计算月数差
        const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth());
        const adjustedMonths = end.getDate() < start.getDate() ? months - 1 : months;
        diffMonths.textContent = adjustedMonths > 0 ? `+${adjustedMonths}个月` : `${adjustedMonths}个月`;
    } catch (error) {
        console.error('计算日期差值时发生错误:', error);
        clearDiffResults();
    }
}

// 清空差值结果
function clearDiffResults() {
    startDateStr.textContent = '-';
    endDateStr.textContent = '-';
    startLunar.textContent = '-';
    endLunar.textContent = '-';
    diffDays.textContent = '-';
    diffWeeks.textContent = '-';
    diffMonths.textContent = '-';
}

// 计算推算日期
function calculateDate() {
    try {
        const base = new Date(baseDate.value);
        const value = parseInt(calcValue.value) || 0;
        const unit = calcUnit.value;
        const direction = calcDirection.value;
        
        if (isNaN(base.getTime())) {
            clearCalcResults();
            return;
        }

        let result = new Date(base);
        const sign = direction === 'after' ? 1 : -1;

        switch (unit) {
            case 'days':
                result.setDate(result.getDate() + sign * value);
                break;
            case 'weeks':
                result.setDate(result.getDate() + sign * value * 7);
                break;
            case 'months':
                result.setMonth(result.getMonth() + sign * value);
                break;
        }

        // 显示结果
        resultDate.textContent = formatDisplayDate(result);
        
        // 计算农历日期
        const lunar = getLunarDate(result);
        lunarDate.textContent = formatLunarDate(lunar);
    } catch (error) {
        console.error('计算推算日期时发生错误:', error);
        clearCalcResults();
    }
}

// 清空推算结果
function clearCalcResults() {
    resultDate.textContent = '-';
    lunarDate.textContent = '-';
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化农历日期
function formatLunarDate(lunar) {
    if (lunar.gzYear === '未知') {
        return '农历加载中...';
    }
    return `${lunar.gzYear}年 ${lunar.IMonthCn}${lunar.IDayCn}`;
}

// 添加一个新的函数用于显示格式
function formatDisplayDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
}

// 绑定事件
startDate.addEventListener('change', calculateDateDiff);
endDate.addEventListener('change', calculateDateDiff);

baseDate.addEventListener('change', calculateDate);
calcValue.addEventListener('input', calculateDate);
calcUnit.addEventListener('change', calculateDate);
calcDirection.addEventListener('change', calculateDate);

// 初始计算
calculateDateDiff();
calculateDate();

// 修改日期推算函数，添加错误处理
function calculateDate() {
    try {
        const base = new Date(baseDate.value);
        const value = parseInt(calcValue.value) || 0;
        const unit = calcUnit.value;
        const direction = calcDirection.value;
        
        if (isNaN(base.getTime())) {
            clearCalcResults();
            return;
        }

        let result = new Date(base);
        const sign = direction === 'after' ? 1 : -1;

        switch (unit) {
            case 'days':
                result.setDate(result.getDate() + sign * value);
                break;
            case 'weeks':
                result.setDate(result.getDate() + sign * value * 7);
                break;
            case 'months':
                result.setMonth(result.getMonth() + sign * value);
                break;
        }

        // 显示结果
        resultDate.textContent = formatDisplayDate(result);
        
        // 计算农历日期
        const lunar = getLunarDate(result);
        lunarDate.textContent = formatLunarDate(lunar);
    } catch (error) {
        console.error('计算推算日期时发生错误:', error);
        clearCalcResults();
    }
}

// 初始化时设置今天的日期并计算
function initializeDates() {
    const today = new Date();
    const todayStr = formatDate(today);
    
    startDate.value = todayStr;
    endDate.value = todayStr;
    baseDate.value = todayStr;
    
    // 等待一小段时间确保 Lunar 库加载完成
    setTimeout(() => {
        calculateDateDiff();
        calculateDate();
    }, 100);
}

// 修改检查函数
function checkLunarLoaded() {
    if (typeof LunarCalendar !== 'undefined') {
        initializeDates();
    } else {
        setTimeout(checkLunarLoaded, 100);
    }
}

// 页面加载完成后检查并初始化
document.addEventListener('DOMContentLoaded', checkLunarLoaded); 