// 开屏黑屏淡出效果
window.addEventListener('load', () => {
    const bootScreen = document.getElementById('bootScreen');
    if (bootScreen) {
        // 短暂延迟后开始淡出
        setTimeout(() => {
            bootScreen.classList.add('fade-out');

            // 淡出完成后移除元素
            setTimeout(() => {
                bootScreen.style.display = 'none';

                // 开屏完成后显示新邮件通知
                setTimeout(() => {
                    showEmailNotification();
                }, 500);
            }, 1500);
        }, 300);
    }
});

// 更新时间显示
function updateTime() {
    const now = new Date();
    // 年份替换为2030
    const timeStr = '2030-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');
    document.getElementById('current-time').textContent = timeStr;
}
setInterval(updateTime, 1000);
updateTime();

// 打开应用窗口
let zIndex = 100;
document.querySelectorAll('.dock-icon').forEach(icon => {
    icon.addEventListener('click', function () {
        const appName = this.getAttribute('data-app');
        const windowId = appName + '-window';
        const windowEl = document.getElementById(windowId);

        if (windowEl) {
            // 如果窗口已经打开，将其置顶
            zIndex++;
            windowEl.style.zIndex = zIndex;
            windowEl.style.display = 'block';

            // 添加激活动画
            windowEl.style.animation = 'none';
            setTimeout(() => {
                windowEl.style.animation = 'windowOpen 0.3s ease-out';
            }, 10);

            // 如果是邮箱，移除未读标记
            if (appName === 'email') {
                const badge = document.getElementById('emailBadge');
                if (badge) {
                    badge.style.display = 'none';
                }
                // 标记用户已打开过邮箱
                localStorage.setItem('hasOpenedEmail', 'true');
            }

            // 如果是Safari，重新加载搜索历史
            if (appName === 'safari') {
                loadSearchHistory();
            }
        }
    });
});

// 关闭窗口
function closeWindow(appName) {
    const windowId = appName + '-window';
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
        windowEl.style.display = 'none';
    }
}

// 显示新邮件通知
function showEmailNotification() {

    // 检查用户是否已经打开过邮箱
    const hasOpenedEmail = localStorage.getItem('hasOpenedEmail') === 'true';
    if (hasOpenedEmail) {
        return;
    }

    const notification = document.getElementById('emailNotification');
    if (notification) {
        notification.style.display = 'flex';

        // 点击通知内容打开邮箱
        const content = notification.querySelector('.notification-content');
        if (content) {
            content.onclick = () => {
                // 标记用户已打开过邮箱
                localStorage.setItem('hasOpenedEmail', 'true');
                openEmailWindow();
                closeEmailNotification();
            };
        }

        // 5秒后自动关闭
        setTimeout(() => {
            closeEmailNotification();
        }, 5000);
    }
}

// 关闭新邮件通知
function closeEmailNotification() {
    const notification = document.getElementById('emailNotification');
    if (notification && notification.style.display !== 'none') {
        notification.classList.add('fade-out');

        setTimeout(() => {
            notification.style.display = 'none';
            notification.classList.remove('fade-out');
        }, 400);
    }
}

// 打开邮箱窗口
function openEmailWindow() {
    const emailWindow = document.getElementById('email-window');
    if (emailWindow) {
        zIndex++;
        emailWindow.style.zIndex = zIndex;
        emailWindow.style.display = 'block';

        // 刷新邮箱界面，确保收件箱计数正确
        updateEmailUI();
    }
}

// OA打卡功能
const attendanceData = {
    records: []
};

// 从localStorage加载打卡记录
function loadAttendanceRecords() {
    const saved = localStorage.getItem('attendanceRecords');
    if (saved) {
        attendanceData.records = JSON.parse(saved);
        // 检查是否需要补充缺失的工作日记录
        checkAndFillMissingRecords();
    } else {
        // 如果没有记录，初始化本月工作日的正常打卡记录
        initializeMonthAttendance();
    }
    renderAttendanceRecords();
}

// 检查并补充缺失的工作日打卡记录
function checkAndFillMissingRecords() {
    const now = new Date();
    const currentYear = 2030;
    const currentMonth = now.getMonth();
    const actualCurrentDate = now.getDate();

    let addedCount = 0;

    // 遍历当天之前的所有工作日(不含当日)
    for (let day = 1; day < actualCurrentDate; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();

        // 只处理工作日（周一到周五）
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const dateStr = currentYear + '-' +
                String(currentMonth + 1).padStart(2, '0') + '-' +
                String(day).padStart(2, '0');

            // 检查该日期是否有完整的上下班记录
            const dayRecords = attendanceData.records.filter(r => r.date === dateStr);
            const hasCheckIn = dayRecords.some(r => r.type === '上班');
            const hasCheckOut = dayRecords.some(r => r.type === '下班');

            // 如果缺少上班或下班记录，则补充
            if (!hasCheckIn || !hasCheckOut) {
                // 清除该日期的不完整记录
                attendanceData.records = attendanceData.records.filter(r => r.date !== dateStr);

                // 添加完整的上下班记录
                const checkInHour = 8;
                const checkInMinute = Math.floor(Math.random() * 31);
                const checkInTime = String(checkInHour).padStart(2, '0') + ':' +
                    String(checkInMinute).padStart(2, '0');

                attendanceData.records.push({
                    date: dateStr,
                    type: '上班',
                    time: checkInTime,
                    status: '正常'
                });

                const checkOutHour = 17 + Math.floor(Math.random() * 2);
                const checkOutMinute = Math.floor(Math.random() * 60);
                const checkOutTime = String(checkOutHour).padStart(2, '0') + ':' +
                    String(checkOutMinute).padStart(2, '0');

                attendanceData.records.push({
                    date: dateStr,
                    type: '下班',
                    time: checkOutTime,
                    status: '正常'
                });

                addedCount++;
            }
        }
    }

    if (addedCount > 0) {
        saveAttendanceRecords();
    }
}

// 初始化本月工作日的打卡记录
function initializeMonthAttendance() {
    const now = new Date();
    const currentYear = 2030;
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    // 获取本月天数
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 遍历本月每一天，只处理当天之前的工作日
    for (let day = 1; day < currentDate; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();

        // 只处理工作日（周一到周五）
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const dateStr = currentYear + '-' +
                String(currentMonth + 1).padStart(2, '0') + '-' +
                String(day).padStart(2, '0');

            // 检查是否已经存在该日期的记录
            const existingRecord = attendanceData.records.find(r => r.date === dateStr);
            if (existingRecord) {
                continue; // 跳过已存在的记录
            }

            // 添加上班打卡（8:30-9:00之间随机时间）
            const checkInHour = 8;
            const checkInMinute = Math.floor(Math.random() * 31); // 0-30分钟
            const checkInTime = String(checkInHour).padStart(2, '0') + ':' +
                String(checkInMinute).padStart(2, '0');

            attendanceData.records.push({
                date: dateStr,
                type: '上班',
                time: checkInTime,
                status: '正常'
            });

            // 添加下班打卡（17:30-18:30之间随机时间）
            const checkOutHour = 17 + Math.floor(Math.random() * 2); // 17或18点
            const checkOutMinute = Math.floor(Math.random() * 60);
            const checkOutTime = String(checkOutHour).padStart(2, '0') + ':' +
                String(checkOutMinute).padStart(2, '0');

            attendanceData.records.push({
                date: dateStr,
                type: '下班',
                time: checkOutTime,
                status: '正常'
            });

        }
    }

    // 保存到localStorage
    saveAttendanceRecords();
}

// 保存打卡记录
function saveAttendanceRecords() {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceData.records));
}

// 渲染打卡记录
function renderAttendanceRecords() {
    const container = document.getElementById('attendanceRecords');
    if (!container) return;

    // 获取当前日期（年份替换为2030）
    const now = new Date();
    const currentYear = 2030;
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    // 生成本月日历数据
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    // 构建本月打卡记录映射
    const monthRecordsMap = {};
    attendanceData.records.forEach(record => {
        const recordDate = new Date(record.date);
        if (recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth) {
            const day = recordDate.getDate();
            if (!monthRecordsMap[day]) {
                monthRecordsMap[day] = { checkIn: null, checkOut: null };
            }
            if (record.type === '上班') {
                monthRecordsMap[day].checkIn = record.time;
            } else if (record.type === '下班') {
                monthRecordsMap[day].checkOut = record.time;
            }
        }
    });

    // 生成日历HTML
    let html = '<div style="margin-bottom: 20px;">';
    html += '<h4 style="margin-bottom: 15px; color: #333; font-size: 16px;">' + currentYear + '年' + (currentMonth + 1) + '月 打卡记录</h4>';
    html += '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">';

    // 星期标题
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    weekDays.forEach(day => {
        html += '<div style="text-align: center; font-weight: bold; color: #666; padding: 8px 0; font-size: 12px;">' + day + '</div>';
    });

    // 空白填充
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += '<div></div>';
    }

    // 日期格子
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === currentDate;
        const records = monthRecordsMap[day];
        const hasCheckIn = records && records.checkIn;
        const hasCheckOut = records && records.checkOut;

        let bgColor = '#f5f5f5';
        if (isToday) {
            bgColor = '#e3f2fd';
        } else if (hasCheckIn && hasCheckOut) {
            bgColor = '#e8f5e9';
        } else if (hasCheckIn || hasCheckOut) {
            bgColor = '#fff3cd';
        }

        html += '<div style="border: 1px solid #ddd; border-radius: 4px; padding: 8px; text-align: center; background: ' + bgColor + '; min-height: 60px;">';
        html += '<div style="font-weight: bold; margin-bottom: 5px; color: ' + (isToday ? '#0066cc' : '#333') + ';">' + day + '</div>';

        if (records) {
            if (records.checkIn) {
                html += '<div style="font-size: 11px; color: #28c840; margin-bottom: 2px;">上:' + records.checkIn + '</div>';
            }
            if (records.checkOut) {
                html += '<div style="font-size: 11px; color: #ff9500;">下:' + records.checkOut + '</div>';
            }
        }

        html += '</div>';
    }

    html += '</div></div>';

    // 今日打卡记录
    const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(currentDate).padStart(2, '0');
    const todayRecords = attendanceData.records.filter(r => r.date === dateStr);

    if (todayRecords.length > 0) {
        html += '<div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">';
        html += '<h4 style="margin-bottom: 15px; color: #333; font-size: 16px;">今日打卡记录</h4>';
        todayRecords.forEach(record => {
            const statusColor = record.status === '正常' ? '#28c840' : '#ff9500';
            html += '<div style="padding: 10px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">';
            html += '<div><div style="font-weight: 500; color: #333;">' + record.type + '打卡</div><div style="font-size: 12px; color: #999;">' + record.time + '</div></div>';
            html += '<div style="color: ' + statusColor + '; font-weight: 500;">' + record.status + '</div></div>';
        });
        html += '</div>';
    } else {
        html += '<div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #999; padding: 20px;">暂无今日打卡记录</div>';
    }

    container.innerHTML = html;
}

// 执行打卡
function performCheckIn(type) {
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    // 年份替换为2030
    const dateStr = '2030-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');

    // 判断是否迟到/早退（简化逻辑）
    let status = '正常';
    if (type === '上班' && now.getHours() >= 9 && now.getMinutes() > 30) {
        status = '迟到';
    } else if (type === '下班' && now.getHours() < 18) {
        status = '早退';
    }

    // 检查是否已经打过卡
    const existingRecord = attendanceData.records.find(r =>
        r.date === dateStr && r.type === type
    );

    if (existingRecord) {
        // 更新提示文本，不弹窗
        const btn = type === '上班' ? document.getElementById('checkInBtn') : document.getElementById('checkOutBtn');
        if (btn) {
            btn.textContent = `已${type}打卡`;
            btn.style.opacity = '0.6';
            btn.disabled = true;
        }
        return;
    }

    // 添加打卡记录
    attendanceData.records.push({
        date: dateStr,
        type: type,
        time: timeStr,
        status: status
    });

    saveAttendanceRecords();
    renderAttendanceRecords();

    // 更新按钮状态
    const btn = type === '上班' ? document.getElementById('checkInBtn') : document.getElementById('checkOutBtn');
    if (btn) {
        btn.textContent = `已${type}打卡`;
        btn.style.opacity = '0.6';
        btn.disabled = true;
    }
}

// 更新OA时间显示
function updateOATime() {
    const now = new Date();
    // 年份改为2030
    const year = 2030;
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekDay = weekDays[now.getDay()];

    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const dateStr = `${year}年${month}月${day}日 ${weekDay}`;

    const oaTime = document.getElementById('oa-time');
    const oaDate = document.getElementById('oa-date');

    if (oaTime) oaTime.textContent = timeStr;
    if (oaDate) oaDate.textContent = dateStr;
}

// 使窗口可拖动
let isDragging = false;
let currentWindow = null;
let offset = { x: 0, y: 0 };

document.querySelectorAll('.window-header').forEach(header => {
    header.addEventListener('mousedown', function (e) {
        isDragging = true;
        currentWindow = this.parentElement;
        offset.x = e.clientX - currentWindow.offsetLeft;
        offset.y = e.clientY - currentWindow.offsetTop;

        // 置顶窗口
        zIndex++;
        currentWindow.style.zIndex = zIndex;
    });
});

document.addEventListener('mousemove', function (e) {
    if (isDragging && currentWindow) {
        currentWindow.style.left = (e.clientX - offset.x) + 'px';
        currentWindow.style.top = (e.clientY - offset.y) + 'px';
    }
});

document.addEventListener('mouseup', function () {
    isDragging = false;
    currentWindow = null;
});

// 点击窗口时置顶
document.querySelectorAll('.app-window').forEach(window => {
    window.addEventListener('mousedown', function () {
        zIndex++;
        this.style.zIndex = zIndex;
    });
});


// 记录已下载的附件
const downloadedFiles = new Set();

// 下载附件功能
function downloadAttachment(element, filename) {
    // 检查是否已经下载过
    if (downloadedFiles.has(filename)) {
        alert('文件已接收：' + filename);
        return;
    }

    // 显示进度条
    const overlay = document.getElementById('progress-overlay');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressTitle = document.getElementById('progress-title');

    progressTitle.textContent = '正在下载: ' + filename;
    overlay.style.display = 'flex';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // 下载完成
            setTimeout(() => {
                overlay.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.textContent = '0%';

                // 标记为已下载
                downloadedFiles.add(filename);
                element.classList.add('downloaded');
                element.querySelector('.download-status').textContent = '✓ 已接收';

                // 在桌面上创建文件图标
                createDesktopFile(filename);
            }, 500);
        }

        progressBar.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
    }, 100);
}

// 在桌面创建文件图标
function createDesktopFile(filename) {
    const desktop = document.body;
    const fileIcon = document.createElement('div');
    fileIcon.className = 'desktop-file';
    fileIcon.setAttribute('draggable', 'true');
    fileIcon.setAttribute('data-filename', filename);

    // 根据文件类型设置图标路径
    let iconPath = '';
    if (filename.endsWith('.pdf')) {
        iconPath = '../assets/pdf_icon.png';
    } else if (filename.endsWith('.dwg')) {
        iconPath = '../assets/dwg_icon.png';
    } else if (filename.endsWith('.docx')) {
        iconPath = '../assets/docx_icon.png';
    }

    fileIcon.innerHTML = `
                <img src="${iconPath}" class="file-icon-img" alt="${filename}">
                <div class="file-name">${filename}</div>
            `;

    // 随机位置（避免重叠）
    const positions = [
        { top: '100px', left: '50px' },
        { top: '100px', left: '150px' },
        { top: '100px', left: '250px' }
    ];

    const index = downloadedFiles.size - 1;
    if (positions[index]) {
        fileIcon.style.top = positions[index].top;
        fileIcon.style.left = positions[index].left;
    }

    // 添加拖拽事件
    fileIcon.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', filename);
        e.dataTransfer.effectAllowed = 'copy';
        fileIcon.classList.add('dragging');
    });

    fileIcon.addEventListener('dragend', () => {
        fileIcon.classList.remove('dragging');
    });

    desktop.appendChild(fileIcon);
}

// AI分析工具 - 拖拽功能
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const analysisPanel = document.getElementById('analysisPanel');

// 阻止整个页面的默认拖拽行为（防止浏览器直接打开文件）
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// 点击选择文件
dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.dwg')) {
        handleFileDrop(file);
    }
});

// 拖拽事件
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');

    // 尝试从dataTransfer获取文件名（来自桌面图标拖拽）
    let filename = e.dataTransfer.getData('text/plain');

    if (filename) {
        // 这是从桌面图标拖拽过来的
        if (filename.endsWith('.dwg')) {
            // 模拟文件对象
            const mockFile = {
                name: filename,
                type: 'application/dwg'
            };
            handleFileDrop(mockFile);
        } else {
            alert('请拖入DWG格式的图纸文件');
        }
    } else {
        // 尝试从真实文件系统拖拽
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.dwg')) {
                handleFileDrop(file);
            } else {
                alert('请上传DWG格式的图纸文件');
            }
        }
    }
});

// 处理文件上传
function handleFileDrop(file) {
    // 显示文件列表
    dropZone.classList.add('has-file');
    dropZone.innerHTML = `
                <div class="drop-icon">✅</div>
                <div class="drop-text">文件已加载</div>
            `;

    fileList.innerHTML = `
                <div class="file-item">
                    <span>📐</span>
                    <span>${file.name}</span>
                </div>
            `;

    // 开始分析
    startAnalysis(file.name);
}

// 开始分析
function startAnalysis(filename) {
    const terminalBody = document.getElementById('terminalBody');
    if (!terminalBody) return;

    // 清空终端内容
    terminalBody.innerHTML = '';

    const steps = [
        { text: '【结构有限元分析引擎 v4.1】正在初始化...', delay: 800 },
        { text: `导入图纸文件：${filename}`, delay: 800 },
        { text: '提取结构构件：框架柱、剪力墙、核心筒、楼盖板...', delay: 800 },
        { text: '正在构建3D空间有限元模型...', delay: 800 },
        { text: '正在计算整体质心（Center of Mass）与倒塌轨迹...', delay: 800 },
        { text: '分析完成。', delay: 800, success: true }
    ];

    let currentStep = 0;

    function processStep() {
        if (currentStep < steps.length) {
            const step = steps[currentStep];

            // 创建新的日志行
            const logLine = document.createElement('div');
            logLine.className = step.success ? 'log-line success' : 'log-line';
            terminalBody.appendChild(logLine);

            // 添加光标
            const cursor = document.createElement('span');
            cursor.className = 'cursor-blink';
            logLine.appendChild(cursor);

            // 打字机效果 - 逐字符输出
            let charIndex = 0;
            const typingSpeed = 20; // 每个字符的打字速度(毫秒) - 加快速度

            function typeChar() {
                if (charIndex < step.text.length) {
                    // 在光标前插入字符
                    cursor.insertAdjacentText('beforebegin', step.text[charIndex]);
                    charIndex++;
                    setTimeout(typeChar, typingSpeed);
                } else {
                    // 当前行完成，移除光标
                    cursor.remove();

                    currentStep++;

                    if (currentStep < steps.length) {
                        // 继续下一行 - 缩短间隔
                        setTimeout(processStep, step.delay * 0.6);
                    } else {
                        // 所有步骤完成，显示警告弹窗
                        setTimeout(() => {
                            showWarningPopup();
                        }, 500);
                    }
                }
            }

            // 开始打字 - 减少初始延迟
            setTimeout(typeChar, 150);
        }
    }

    processStep();
}

// 显示异常提示弹窗
function showWarningPopup() {
    const warningPopup = document.getElementById('warningPopup');
    const warningText = document.getElementById('warningText');

    if (warningPopup && warningText) {
        warningText.innerHTML = `
                    <span style="color: #EF4444; font-weight: bold;">WARNING：</span><span style="color: #EF4444; font-weight: 900; font-size: 15px; text-shadow: 0 0 8px rgba(239, 68, 68, 0.6);">第8层</span><span style="color: #EF4444; font-weight: bold;">核心筒结构异常</span><br><br>
                    该区域结构截面被定义为"实心实体"（或几何尺寸异常巨大）。<br><br>
                    <span style="color: rgba(239, 68, 68, 0.8);">请人工核查该区域</span><br><br>
                    <span style="color: rgba(107, 114, 128, 0.6);">报告编号：AE-2030-0710-STR</span>
                `;
        warningPopup.style.display = 'block';

        // AI分析结束后5秒，触发神秘线索邮件
        setTimeout(() => {
            window.triggerMysteryEmail();
        }, 1000);
    }
}


// ==================== 邮件系统 ====================

// 加密盐值
const EMAIL_SALT = 'YuDingEmail2030';

// Base64编码的特殊账号配置（regret_0928@privatemail.com / ' OR '1'='1）
const encryptedSpecialAccount = 'eyJhY2NvdW50IjoicmVncmV0XzA5MjhAcHJpdmF0ZW1haWwuY29tIiwicGFzc3dvcmQiOiInIE9SICcxJz0nMSJ9';

// 不同用户的邮件数据
const userEmailData = {
    // 主角的邮件
    'protagonist': {
        inbox: [
            {
                id: 1,
                from: '李婷 (誉鼎集团总裁办)',
                fromEmail: 'ting.li@yuding-holdings.cn',
                to: 'hejia@jz-structure.cn',
                cc: 'bonian.su@yuding-holdings.cn',
                subject: '海伯利安大厦定向爆破结构安全评估项目合同及资料确认',
                date: getCurrentTime(),
                preview: '禾总，您好：现就“海伯利安大厦定向...',
                hasAttachment: true,
                attachments: [
                    { name: '《爆破安全评估外包合同》(已盖章扫描件).pdf', size: '2.3 MB', type: 'contract' },
                    { name: '海伯利安大厦2008年改造竣工图.dwg', size: '15.8 MB', type: 'drawing' },
                    { name: '项目执行人员确认表.docx', size: '1.2 MB', type: 'form' }
                ],
                content: `
                            <p>禾总，您好：</p>
                            <p>现就“<strong>海伯利安</strong>大厦定向爆破结构安全评估”项目的相关事宜与贵司进行最终确认。</p>
                            <p>本项目总包费用为人民币 <strong>280,000 元（贰拾捌万元整）</strong>。根据苏总的特别指示，鉴于该大厦年代久远且爆破工期紧迫，集团特批本项目免除现场实地勘测环节。</p>
                            <p>请贵司务必严格按照附件中提供的《2008年改造竣工图》进行3D有限元建模与力学演算。苏总及集团法务部特别强调以下合规与责任条款，请贵司在出具正式报告前务必核对：</p>
                            <ul style="margin-left: 20px; margin-top: 10px;">
                                <li>任何图纸数据与物理现状的偏差，均以甲方提供的图纸为准，乙方无需（也不得）进行现场复核。</li>
                                <li>贵司出具的《结构安全评估报告》需经注册结构工程师签字并加盖公章，即视为贵司对模型数据真实性、准确性的最终法律背书。</li>
                                <li>若因贵司核算失误、模型失真导致爆破审批受阻，或在爆破过程中因结构受力计算错误产生任何安全及法律纠纷，贵司需承担全部法律及经济赔偿责任。</li>
                            </ul>
                            <p>附件为已走完集团内部审批流的合同扫描件及图纸资料。请贵司于今日18:00前回复本邮件确认，并安排项目执行人员（如前期沟通的助理结构工程师）尽快开展底稿核算工作。</p>
                            <p>如有任何流程上的疑问，请随时与我联系。</p>
                            <p style="margin-top: 20px;">顺颂商祺！</p>
                            <p style="margin-top: 15px;">
                                <strong>李婷 (Ting Li)</strong><br>
                                高级秘书 | 总裁办<br>
                                誉鼎城市发展控股集团有限公司<br>
                                Mobile: 138-XXXX-XXXX<br>
                                Email: ting.li@yuding-holdings.cn<br>
                                Add: 江州市滨江区CBD中心，誉鼎金融大厦68层
                            </p>
                        `,
                canReply: true
            },
            {
                id: 2,
                from: '王经理 (项目部)',
                fromEmail: 'wang.pm@jz-structure.cn',
                to: 'hejia@jz-structure.cn',
                subject: '关于下周项目进度会议的通知',
                date: '2030-07-09 14:30',
                preview: '各位同事，下周一上午10点将召开项...',
                hasAttachment: false,
                content: `
                            <p>各位同事，</p>
                            <p>下周一上午10点将召开项目进度会议，请大家准时参加。</p>
                            <p>会议地点：会议室A</p>
                            <p>会议议程：</p>
                            <p>1、各项目组汇报本周进度</p>
                            <p>2、讨论存在的问题和解决方案</p>
                            <p>3、确定下周工作计划</p>
                            <p>请提前准备好相关材料。</p>
                        `,
                canReply: true
            },
            {
                id: 3,
                from: 'HR部门',
                fromEmail: 'hr@jz-structure.cn',
                to: 'hejia@jz-structure.cn',
                subject: '员工培训通知',
                date: '2030-07-08 10:00',
                preview: '公司将于本月举办新员工入职培训...',
                hasAttachment: false,
                content: `
                            <p>各位同事，</p>
                            <p>公司将于本月举办新员工入职培训，请相关部门负责人安排好工作交接。</p>
                            <p>培训时间：2030年7月15日-17日</p>
                            <p>培训地点：培训中心</p>
                        `,
                canReply: true
            },
            {
                id: 4,
                from: 'IT支持',
                fromEmail: 'it-support@jz-structure.cn',
                to: 'hejia@jz-structure.cn',
                subject: '系统维护通知',
                date: '2030-07-07 16:00',
                preview: '本周六凌晨2:00-4:00将进行系统维护...',
                hasAttachment: false,
                content: `
                            <p>尊敬的用户，</p>
                            <p>我们将于本周六凌晨2:00-4:00进行系统维护，届时系统将暂时无法访问。</p>
                            <p>请提前做好工作安排。</p>
                            <p>给您带来的不便，敬请谅解。</p>
                        `,
                canReply: true
            }
        ],
        sent: []
    },
    // 特殊用户的邮件
    'special': {
        inbox: [],
        sent: []
    }
};

// 当前用户的邮件数据（动态切换）
let emailData = null;

// 隐藏邮件标记（用于跨页面触发）
let hiddenEmails = [];

// 解密特殊账号配置
function decryptSpecialAccount() {
    try {
        addMysteryReplyCondition('loadmail')
        const base64Str = atob(encryptedSpecialAccount);
        const bytes = new Uint8Array(base64Str.length);
        for (let i = 0; i < base64Str.length; i++) {
            bytes[i] = base64Str.charCodeAt(i);
        }
        const jsonStr = new TextDecoder('utf-8').decode(bytes);
        return JSON.parse(jsonStr);
    } catch (e) {
        return { account: '', password: '' };
    }
}


// 当前登录用户
let currentUser = null;

// 加载当前用户
function loadCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    } else {
        // 默认登录主角
        currentUser = { username: '禾佳', email: 'hejia@jz-structure.cn' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // 根据用户类型切换邮件数据
    if (currentUser.username === '禾佳') {
        switchUserEmailData('protagonist');
        // 恢复触发的邮件
        restoreTriggeredEmails();
    } else {
        switchUserEmailData('special');
        // 恢复特殊用户的已发送和收件箱
        restoreSentEmails();
    }

    updateEmailUI();
}

// 恢复触发的邮件（从localStorage）
function restoreTriggeredEmails() {
    if (!currentUser || currentUser.username !== '禾佳') return;

    // 获取已触发的邮件ID列表
    const triggeredEmailIds = JSON.parse(localStorage.getItem('triggeredEmailIds') || '[]');

    // 恢复神秘线索邮件(海伯利安邮件是默认存在的,不需要恢复)
    if (triggeredEmailIds.includes(101)) {
        addMysteryEmailToInbox();
    }

    // 恢复regret回复邮件
    if (triggeredEmailIds.includes(102)) {
        addRegretReplyEmailToInbox();
    }
}

// 添加神秘线索邮件到收件箱
// 神秘线索邮件模板(统一数据源)
const MYSTERY_EMAIL_TEMPLATE = {
    id: 101,
    from: '匿名',
    fromEmail: 'regret_0928@privatemail.com',
    to: 'hejia@jz-structure.cn',
    subject: '匿名',
    date: getCurrentTime(),
    preview: '我相信你已经发现了这栋楼的异常，但是...',
    hasAttachment: false,
    content: `
                <p>我相信你已经发现了这栋楼的异常，但是我不能说太多。</p>
                <p>去江城热线里搜一下历史帖子吧，看看当年到底发生了什么。</p>
            `,
    canReply: false
};

// 添加神秘线索邮件到主角收件箱
function addMysteryEmailToInbox() {
    // 检查是否已经存在
    const existingEmail = emailData.inbox.find(e => e.id === 101);
    if (existingEmail) return;

    // 深拷贝模板,避免引用污染
    const mysteryEmail = JSON.parse(JSON.stringify(MYSTERY_EMAIL_TEMPLATE));
    emailData.inbox.unshift(mysteryEmail);
}

// 添加regret回复邮件到主角收件箱
function addRegretReplyEmailToInbox() {
    // 检查是否已经存在
    const existingEmail = emailData.inbox.find(e => e.id === 102);
    if (existingEmail) return;

    // 深拷贝模板,避免引用污染
    const regretEmail = JSON.parse(JSON.stringify(REGRET_REPLY_EMAIL_TEMPLATE));
    emailData.inbox.unshift(regretEmail);
}

// regret_0928的回复邮件模板(统一数据源)
const REGRET_REPLY_EMAIL_TEMPLATE = {
    id: 102,
    from: '匿名',
    fromEmail: 'regret_0928@privatemail.com',
    to: 'hejia@jz-structure.cn',
    subject: '匿名',
    date: getCurrentTime(),
    preview: '对不起，我对不起小敏，对不起老杨。。。',
    hasAttachment: false,
    content: `
                <p>对不起，我对不起小敏，对不起老杨。。。</p>
                <p>你应该已经登过我的账号了吧，后勤部的管理员密码是xxxxxxxx，如果可以，我也恳求你，一起撕碎这些吃人血的家伙。</p>
            `,
    canReply: false
};

// 触发regret_0928的回复邮件
function triggerRegretReplyEmail() {
    if (!currentUser || currentUser.username !== '禾佳') {
        return;
    }

    // 检查是否已经存在该邮件
    const existingEmail = emailData.inbox.find(e => e.id === 102);
    if (existingEmail) {
        return;
    }

    // 深拷贝模板,避免引用污染
    const regretEmail = JSON.parse(JSON.stringify(REGRET_REPLY_EMAIL_TEMPLATE));
    emailData.inbox.unshift(regretEmail);

    // 同时添加到特殊用户的已发送（因为是从regret发出的）
    const specialSentEmail = JSON.parse(JSON.stringify(REGRET_REPLY_EMAIL_TEMPLATE));
    userEmailData['special'].sent.unshift(specialSentEmail);

    // 保存到localStorage，标记为已触发
    const triggeredEmailIds = JSON.parse(localStorage.getItem('triggeredEmailIds') || '[]');
    if (!triggeredEmailIds.includes(102)) {
        triggeredEmailIds.push(102);
        localStorage.setItem('triggeredEmailIds', JSON.stringify(triggeredEmailIds));
    }

    // 保存数据
    saveAllUserData();

    // 刷新收件箱显示
    showInbox();

    // 显示新邮件弹窗通知
    showRegretEmailNotification();

}


// 更新邮箱界面显示
function updateEmailUI() {
    const windowTitle = document.querySelector('.email-window .window-title');
    if (windowTitle && currentUser) {
        windowTitle.textContent = `邮件 - [${currentUser.username}]`;
    }

    // 更新左下角用户名称
    const userNameEl = document.getElementById('currentUserName');
    if (userNameEl && currentUser) {
        userNameEl.textContent = currentUser.username;
    }

    // 更新收件箱和已发送计数
    const inboxCountEl = document.getElementById('inboxCount');
    const sentCountEl = document.getElementById('sentCount');

    if (inboxCountEl && emailData) {
        inboxCountEl.textContent = emailData.inbox.length;
    }

    if (sentCountEl && emailData) {
        sentCountEl.textContent = emailData.sent.length;
    }

    showInbox();
}

// 切换用户菜单显示/隐藏
function toggleUserMenu() {
    const popup = document.getElementById('userMenuPopup');
    if (popup) {
        if (popup.style.display === 'none' || popup.style.display === '') {
            popup.style.display = 'block';
        } else {
            popup.style.display = 'none';
        }
    }
}

// 登出功能
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;

    // 隐藏邮箱窗口
    const emailWindow = document.getElementById('email-window');
    if (emailWindow) {
        emailWindow.style.display = 'none';
    }

    // 显示登录界面（替换整个邮箱内容）
    showLoginInterface();
}

// 显示登录界面
function showLoginInterface() {
    const emailWindow = document.getElementById('email-window');
    if (!emailWindow) return;

    // 显示窗口
    emailWindow.style.display = 'block';

    // 替换内容为登录界面
    const windowContent = emailWindow.querySelector('.window-content');
    windowContent.innerHTML = `
                <div style="height: 100%; display: flex; justify-content: center; align-items: center; background: white;">
                    <div style="text-align: center; min-width: 400px;">
                        <h2 style="margin-bottom: 40px; color: #333; font-size: 28px;">📧 邮箱登录</h2>
                        
                        <!-- 默认用户快速登录 -->
                        <div id="quickLoginSection" style="margin-bottom: 30px;">
                            <div onclick="quickLogin()" style="cursor: pointer; padding: 20px; border-radius: 10px; transition: all 0.2s; background: #f5f5f5;"
                                 onmouseover="this.style.background='#e8f4ff'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
                                 onmouseout="this.style.background='#f5f5f5'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 28px;">👤</div>
                                <div id="lastUserName" style="font-size: 18px; font-weight: 500; color: #333; margin-bottom: 5px;">禾佳</div>
                                <div style="font-size: 13px; color: #999;">点击快速登录</div>
                            </div>
                        </div>
                        
                        <!-- 分隔线 -->
                        <div style="display: flex; align-items: center; margin: 30px 0; color: #999; font-size: 13px;">
                            <div style="flex: 1; height: 1px; background: #e0e0e0;"></div>
                            <span style="padding: 0 15px;">或</span>
                            <div style="flex: 1; height: 1px; background: #e0e0e0;"></div>
                        </div>
                        
                        <!-- 其他账户登录按钮 -->
                        <button onclick="showOtherAccountForm()" style="width: 100%; padding: 12px; background: transparent; color: #0066cc; border: 2px solid #0066cc; border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 500; transition: all 0.2s;"
                                onmouseover="this.style.background='#0066cc'; this.style.color='white'"
                                onmouseout="this.style.background='transparent'; this.style.color='#0066cc'">
                            使用其他账户登录
                        </button>
                        
                        <!-- 其他账户表单（默认隐藏） -->
                        <div id="otherAccountForm" style="display: none; margin-top: 20px; text-align: left;">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">账户：</label>
                                <input type="text" id="otherAccountInput" placeholder="请输入邮箱地址" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none;">
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">密码：</label>
                                <input type="password" id="otherPasswordInput" placeholder="请输入密码" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none;">
                            </div>
                            <button onclick="loginWithOtherAccount()" style="width: 100%; padding: 12px; background: #0066cc; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 500; transition: background 0.2s;"
                                    onmouseover="this.style.background='#0052a3'"
                                    onmouseout="this.style.background='#0066cc'">
                                登录
                            </button>
                            <button onclick="hideOtherAccountForm()" style="width: 100%; padding: 10px; margin-top: 10px; background: transparent; color: #999; border: none; cursor: pointer; font-size: 13px;"
                                    onmouseover="this.style.color='#666'"
                                    onmouseout="this.style.color='#999'">
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            `;
}

// 快速登录（主角）
function quickLogin() {
    currentUser = { username: '禾佳', email: 'hejia@jz-structure.cn' };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // 切换为主角的邮件数据
    switchUserEmailData('protagonist');

    // 恢复触发的邮件
    restoreTriggeredEmails();

    restoreEmailInterface();
    updateEmailUI();
}

// 显示其他账户表单
function showOtherAccountForm() {
    const form = document.getElementById('otherAccountForm');
    const quickSection = document.getElementById('quickLoginSection');
    const otherBtn = document.querySelector('button[onclick="showOtherAccountForm()"]');
    if (form) {
        form.style.display = 'block';
    }
    if (quickSection) {
        quickSection.style.display = 'none';
    }
    if (otherBtn) {
        otherBtn.style.display = 'none';
    }
}

// 隐藏其他账户表单
function hideOtherAccountForm() {
    const form = document.getElementById('otherAccountForm');
    const quickSection = document.getElementById('quickLoginSection');
    const otherBtn = document.querySelector('button[onclick="showOtherAccountForm()"]');
    if (form) {
        form.style.display = 'none';
    }
    if (quickSection) {
        quickSection.style.display = 'block';
    }
    if (otherBtn) {
        otherBtn.style.display = 'block';
    }
}

// 使用其他账户登录
function loginWithOtherAccount() {
    const accountInput = document.getElementById('otherAccountInput');
    const passwordInput = document.getElementById('otherPasswordInput');

    if (!accountInput || !passwordInput) return;

    const account = accountInput.value.trim();
    const password = passwordInput.value;

    if (!account || !password) {
        alert('请输入账户和密码！');
        return;
    }

    // 验证特殊账号
    const specialAccount = decryptSpecialAccount();
    if (account === specialAccount.account && password === specialAccount.password) {
        currentUser = { username: '特殊用户', email: specialAccount.account };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // 切换为特殊用户的邮件数据
        switchUserEmailData('special');

        restoreEmailInterface();
        updateEmailUI();
    } else {
        alert('账户或密码错误！');
    }
}


// 恢复邮箱界面
function restoreEmailInterface() {
    const emailWindow = document.getElementById('email-window');
    if (!emailWindow) return;

    // 重新加载原始HTML结构
    const originalContent = `
                <div class="email-content">
                    <div class="email-sidebar" style="position: relative;">
                        <div class="email-folder" id="inboxFolder" onclick="showInbox()">📥 收件箱 (<span id="inboxCount">0</span>)</div>
                        <div class="email-folder" onclick="showSent()">📤 已发送 (<span id="sentCount">0</span>)</div>
                        <div class="email-folder">⭐ 星标</div>
                        <div class="email-folder">📝 草稿</div>
                        <div class="email-folder">🗑️ 垃圾箱</div>
                        
                        <!-- 左下角用户菜单 -->
                        <div style="position: absolute; bottom: 15px; left: 15px; right: 15px; padding: 0; border-top: 1px solid #ddd; background: transparent;">
                            <div id="userMenuTrigger" style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px; border-radius: 5px; transition: background 0.2s;"
                                 onmouseover="this.style.background='#e0e0e0'"
                                 onmouseout="this.style.background='transparent'"
                                 onclick="toggleUserMenu()">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 14px;">👤</div>
                                <div style="flex: 1;">
                                    <div id="currentUserName" style="font-size: 13px; font-weight: 500; color: #333;">${currentUser.username}</div>
                                    <div style="font-size: 11px; color: #999;">在线</div>
                                </div>
                                <div style="color: #999; font-size: 12px;">⚙️</div>
                            </div>
                            
                            <!-- 用户菜单弹窗 -->
                            <div id="userMenuPopup" style="display: none; position: absolute; bottom: 60px; left: 0; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border: 1px solid #e0e0e0; z-index: 1000;">
                                <div style="padding: 10px 0;">
                                    <div style="border-top: 1px solid #f0f0f0;"></div>
                                    <div style="padding: 10px 15px; cursor: pointer; transition: background 0.2s; font-size: 13px; color: #ff3b30;"
                                         onmouseover="this.style.background='#fff5f5'"
                                         onmouseout="this.style.background='transparent'"
                                         onclick="logout(); toggleUserMenu();">
                                        🚪 登出
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="email-list" id="emailList">
                        <!-- 邮件列表将通过JavaScript动态生成 -->
                    </div>
                    <div class="email-detail" id="email-detail-content">
                        <div style="text-align: center; color: #999; margin-top: 100px;">
                            <div style="font-size: 64px; margin-bottom: 20px;">📧</div>
                            <p>请选择一封邮件查看详情</p>
                        </div>
                    </div>
                </div>
            `;

    const windowContent = emailWindow.querySelector('.window-content');
    windowContent.innerHTML = originalContent;
}

// 获取当前系统时间（年份改为2030）
function getCurrentTime() {
    const now = new Date();
    return 2030 + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');
}


// 切换用户邮件数据
function switchUserEmailData(userType) {
    if (userType === 'protagonist') {
        // 先恢复已保存的数据
        restoreSentEmails();

        // 然后从userEmailData加载
        emailData = JSON.parse(JSON.stringify(userEmailData['protagonist']));
    } else if (userType === 'special') {
        // 先恢复已保存的数据
        restoreSentEmails();

        // 然后从userEmailData加载
        emailData = JSON.parse(JSON.stringify(userEmailData['special']));
    }

    // 初始化隐藏邮件列表
    hiddenEmails = [];
}

// 检查邮件是否被隐藏
function isEmailHidden(emailId) {
    return hiddenEmails.includes(emailId);
}

// 显示收件箱
function showInbox() {
    const emailList = document.getElementById('emailList');
    const visibleEmails = emailData.inbox.filter(email => !isEmailHidden(email.id));

    // 更新计数
    document.getElementById('inboxCount').textContent = visibleEmails.length;

    // 生成邮件列表
    let html = '';
    visibleEmails.forEach(email => {
        html += `
                    <div class="email-item" onclick="showEmailDetail(${email.id})">
                        <strong>${email.from}</strong><br>
                        <small>${email.preview}</small>
                    </div>
                `;
    });

    emailList.innerHTML = html;

    // 清空详情区域
    document.getElementById('email-detail-content').innerHTML = `
                <div style="text-align: center; color: #999; margin-top: 100px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📧</div>
                    <p>请选择一封邮件查看详情</p>
                </div>
            `;
}

// 显示已发送
function showSent() {
    const emailList = document.getElementById('emailList');

    // 更新计数
    document.getElementById('sentCount').textContent = emailData.sent.length;

    // 生成邮件列表
    let html = '';
    if (emailData.sent.length === 0) {
        html = '<div style="text-align: center; color: #999; padding: 50px;">暂无已发送邮件</div>';
    } else {
        emailData.sent.forEach(email => {
            html += `
                        <div class="email-item" onclick="showEmailDetail(${email.id}, true)">
                            <strong>${email.to}</strong><br>
                            <small>${email.subject}</small>
                        </div>
                    `;
        });
    }

    emailList.innerHTML = html;

    // 清空详情区域
    document.getElementById('email-detail-content').innerHTML = `
                <div style="text-align: center; color: #999; margin-top: 100px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📧</div>
                    <p>请选择一封邮件查看详情</p>
                </div>
            `;
}

// 显示邮件详情
function showEmailDetail(emailId, isSent = false) {
    const sourceArray = isSent ? emailData.sent : emailData.inbox;
    const email = sourceArray.find(e => e.id === emailId);

    if (!email) return;

    const detailContent = document.getElementById('email-detail-content');

    let attachmentHtml = '';
    if (email.hasAttachment && email.attachments) {
        attachmentHtml = `
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <h3 style="margin-bottom: 15px;">📎 附件 (${email.attachments.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${email.attachments.map(att => `
                            <div class="attachment-item" data-file="${att.type}" onclick="downloadAttachment(this, '${att.name}')">
                                <span>📄 ${att.name}</span>
                                <span class="download-status">点击下载</span>
                            </div>
                        `).join('')}
                    </div>
                `;
    }

    // 已发送邮件不显示回复按钮，收件箱邮件显示回复按钮
    let replyButton = '';
    if (!isSent) {
        replyButton = `
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <button class="reply-btn" onclick="replyToEmail(${email.id})">回复邮件</button>
                `;
    }

    let ccLine = email.cc ? `<p style="color: #666; margin-bottom: 8px;"><strong>抄送：</strong>${email.cc}</p>` : '';

    detailContent.innerHTML = `
                <h2 style="margin-bottom: 15px;">${email.subject}</h2>
                <p style="color: #666; margin-bottom: 8px;"><strong>发件人：</strong>${email.fromEmail || email.from}</p>
                <p style="color: #666; margin-bottom: 8px;"><strong>收件人：</strong>${email.to}</p>
                ${ccLine}
                <p style="color: #666; margin-bottom: 8px;"><strong>时间：</strong>${email.date}</p>
                <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
                
                <div style="line-height: 1.8; color: #333;">
                    ${email.content}
                </div>
                
                ${attachmentHtml}
                ${replyButton}
            `;
}

// 回复邮件
function replyToEmail(emailId) {
    const email = emailData.inbox.find(e => e.id === emailId);
    if (!email) return;

    // 特殊处理：神秘线索邮件(ID=101)的回复
    if (email.id === 101) {
        // 检查是否可以回复（需要达成多个条件）
        const conditions = JSON.parse(localStorage.getItem('mysteryReplyConditions') || '[]');
        const canReplyMystery = conditions.length >= 2; // 需要至少2个条件

        if (!canReplyMystery) {
            // 显示灰色浮框提示
            showToast(`先找找他的身份信息再回复吧...`);
            return;
        }

        // 检查是否已经回复过
        const hasReplied = localStorage.getItem('hasRepliedMystery') === 'true';
        if (hasReplied) {
            return;
        }

        // 显示回复界面
        showReplyInterface(emailId);
    }
    // 普通邮件点击回复无响应，不弹窗
}

// 显示回复界面
function showReplyInterface(emailId) {
    const detailContent = document.getElementById('email-detail-content');
    if (!detailContent) return;

    const replyContent = '你就是林建国吧？我是杨敏的大学同学，你为什么要冒充她爸爸给她写信，她爸爸到底怎么了？！';

    detailContent.innerHTML = `
                <h2 style="margin-bottom: 15px;">回复：匿名</h2>
                <p style="color: #666; margin-bottom: 8px;"><strong>收件人：</strong>regret_0928@privatemail.com</p>
                <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
                
                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #666; font-size: 14px;">回复内容：</label>
                    <textarea id="replyTextArea" readonly style="width: 100%; height: 150px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; resize: none; background: #f9f9f9; color: #333; line-height: 1.6;">${replyContent}</textarea>
                </div>
                
                <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <button onclick="sendReply(${emailId})" style="padding: 10px 30px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background 0.2s;"
                            onmouseover="this.style.background='#0052a3'"
                            onmouseout="this.style.background='#0066cc'">
                        发送
                    </button>
                    <button onclick="cancelReply()" style="padding: 10px 30px; background: #999; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background 0.2s;"
                            onmouseover="this.style.background='#777'"
                            onmouseout="this.style.background='#999'">
                        取消
                    </button>
                </div>
                
                <!-- 进度条容器 -->
                <div id="progressContainer" style="margin-top: 20px; display: none;">
                    <div style="background: #e0e0e0; border-radius: 10px; height: 20px; overflow: hidden;">
                        <div id="progressBar" style="background: linear-gradient(90deg, #0066cc, #0099ff); height: 100%; width: 0%; transition: width 0.3s ease; border-radius: 10px;"></div>
                    </div>
                    <p id="progressText" style="text-align: center; margin-top: 8px; color: #666; font-size: 13px;">正在发送...</p>
                </div>
            `;
}

// 取消回复
function cancelReply() {
    // 重新显示原邮件详情
    showEmailDetail(101);
}

// 发送回复
function sendReply(emailId) {
    // 禁用按钮，防止重复点击
    const sendBtn = event.target;
    sendBtn.disabled = true;
    sendBtn.style.background = '#ccc';
    sendBtn.style.cursor = 'not-allowed';

    // 显示进度条
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (progressContainer) {
        progressContainer.style.display = 'block';
    }

    // 模拟发送进度
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // 随机增加5-20%
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // 发送完成
            setTimeout(() => {
                completeReply(emailId);
            }, 500);
        }

        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        if (progressText) {
            if (progress < 30) {
                progressText.textContent = '正在连接服务器...';
            } else if (progress < 60) {
                progressText.textContent = '正在发送邮件...';
            } else if (progress < 90) {
                progressText.textContent = '正在确认发送状态...';
            } else {
                progressText.textContent = '发送完成！';
            }
        }
    }, 200);
}

// 完成回复
function completeReply(emailId) {
    const replyContent = '你就是林建国吧？我是杨敏的大学同学，你为什么要冒充她爸爸给她写信，她爸爸到底怎么了？！';

    // 添加到已发送（主角的已发送）
    const sentEmail = {
        id: Date.now(),
        from: 'hejia@jz-structure.cn',
        to: 'regret_0928@privatemail.com',
        subject: 'Re: 匿名',
        date: getCurrentTime(),
        preview: replyContent.substring(0, 15) + '...',
        hasAttachment: false,
        content: `<p>${replyContent}</p>`,
        canReply: false
    };

    emailData.sent.unshift(sentEmail);

    // 同时添加到特殊用户的收件箱
    const receivedEmail = {
        id: Date.now() + 1,
        from: 'hejia@jz-structure.cn',
        fromEmail: 'hejia@jz-structure.cn',
        to: 'regret_0928@privatemail.com',
        subject: 'Re: 匿名',
        date: getCurrentTime(),
        preview: replyContent.substring(0, 15) + '...',
        hasAttachment: false,
        content: `<p>${replyContent}</p>`,
        canReply: true
    };

    // 保存到特殊用户的邮件数据中
    userEmailData['special'].inbox.unshift(receivedEmail);

    // 更新已发送计数
    document.getElementById('sentCount').textContent = emailData.sent.length;

    // 标记为已回复，防止重复发送
    localStorage.setItem('hasRepliedMystery', 'true');

    // 立即保存两个用户的数据到localStorage
    saveAllUserData();

    // 2秒后收到来自regret_0928的回复邮件
    setTimeout(() => {
        triggerRegretReplyEmail();
    }, 3000);

    // 显示成功提示（使用进度条文字变化代替alert）
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = '✓ 发送成功！';
        progressText.style.color = '#4CAF50';
        progressText.style.fontWeight = 'bold';
    }

    // 延迟后切换到已发送视图
    setTimeout(() => {
        showSent();
    }, 1000);
}

// 保存所有用户的数据到localStorage
function saveAllUserData() {
    const savedData = JSON.parse(localStorage.getItem('savedEmailData') || '{}');

    // 保存主角的已发送
    if (currentUser && currentUser.username === '禾佳' && emailData) {
        savedData['protagonist'] = {
            sent: emailData.sent
        };
    }

    // 保存特殊用户的收件箱和已发送
    savedData['special'] = {
        inbox: userEmailData['special'].inbox,
        sent: userEmailData['special'].sent
    };

    localStorage.setItem('savedEmailData', JSON.stringify(savedData));
}

// 保存已发送邮件到localStorage
function saveSentEmails() {
    if (!emailData || !emailData.sent) return;

    const savedData = JSON.parse(localStorage.getItem('savedEmailData') || '{}');

    // 根据当前用户类型保存
    if (currentUser && currentUser.username === '特殊用户') {
        savedData['special'] = {
            sent: emailData.sent,
            inbox: userEmailData['special'].inbox
        };
        localStorage.setItem('savedEmailData', JSON.stringify(savedData));
    }
}

// 恢复已发送邮件和收件箱邮件
function restoreSentEmails() {
    if (!currentUser) return;

    const savedData = JSON.parse(localStorage.getItem('savedEmailData') || '{}');

    // 根据用户类型恢复
    if (currentUser.username === '禾佳' && savedData['protagonist']) {
        // 恢复主角的已发送
        if (savedData['protagonist'].sent) {
            userEmailData['protagonist'].sent = savedData['protagonist'].sent;
        }
    }

    if (currentUser.username === '特殊用户' && savedData['special']) {
        // 恢复到userEmailData['special']中
        if (savedData['special'].inbox) {
            userEmailData['special'].inbox = savedData['special'].inbox;
        }

        if (savedData['special'].sent) {
            userEmailData['special'].sent = savedData['special'].sent;
        }
    }
}

// 初始化邮件系统
loadCurrentUser();

// ==================== 跨页面触发功能 ====================

// 从其他页面触发显示神秘线索邮件（给主角）
function triggerMysteryEmail() {
    if (!currentUser || currentUser.username !== '禾佳') {
        return;
    }

    // 检查是否已经存在该邮件
    const existingEmail = emailData.inbox.find(e => e.id === 101);
    if (existingEmail) {
        return;
    }

    // 添加神秘线索邮件到主角收件箱(复用已有函数)
    addMysteryEmailToInbox();

    // 保存到localStorage，标记为已触发
    const triggeredEmailIds = JSON.parse(localStorage.getItem('triggeredEmailIds') || '[]');
    if (!triggeredEmailIds.includes(101)) {
        triggeredEmailIds.push(101);
        localStorage.setItem('triggeredEmailIds', JSON.stringify(triggeredEmailIds));
    }

    // 同时在特殊用户的发件箱中添加此邮件
    addMysteryEmailToSpecialUserSent();

    // 刷新收件箱显示
    showInbox();

    // 显示新邮件弹窗通知
    showMysteryEmailNotification();
}

// 显示神秘线索邮件的弹窗通知
function showMysteryEmailNotification() {
    const notification = document.createElement('div');
    notification.id = 'mysteryEmailNotification';
    notification.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 30px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 12px;
                padding: 15px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 280px;
                max-width: 350px;
                z-index: 9999;
                animation: slideInRight 0.5s ease-out;
                border: 1px solid rgba(0, 0, 0, 0.08);
                cursor: pointer;
            `;

    notification.innerHTML = `
                <div style="font-size: 28px;">📧</div>
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 4px;">新邮件提醒</div>
                    <div style="font-size: 13px; color: #6e6e73;">您收到一封新邮件</div>
                </div>
                <button onclick="this.parentElement.remove()" style="background: transparent; border: none; font-size: 20px; color: #86868b; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">×</button>
            `;

    // 点击通知打开邮箱
    notification.onclick = (e) => {
        if (!e.target.tagName || e.target.tagName !== 'BUTTON') {
            openEmailWindow();
            notification.remove();
        }
    };

    document.body.appendChild(notification);

    // 5秒后自动关闭
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.4s ease-in forwards';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 400);
        }
    }, 5000);
}

// 显示regret回复邮件的弹窗通知
function showRegretEmailNotification() {
    const notification = document.createElement('div');
    notification.id = 'regretEmailNotification';
    notification.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 30px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 12px;
                padding: 15px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 280px;
                max-width: 350px;
                z-index: 9999;
                animation: slideInRight 0.5s ease-out;
                border: 1px solid rgba(0, 0, 0, 0.08);
                cursor: pointer;
            `;

    notification.innerHTML = `
                <div style="font-size: 28px;">📧</div>
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 4px;">新邮件提醒</div>
                    <div style="font-size: 13px; color: #6e6e73;">您收到一封新邮件</div>
                </div>
                <button onclick="this.parentElement.remove()" style="background: transparent; border: none; font-size: 20px; color: #86868b; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">×</button>
            `;

    // 点击通知打开邮箱
    notification.onclick = (e) => {
        if (!e.target.tagName || e.target.tagName !== 'BUTTON') {
            openEmailWindow();
            notification.remove();
        }
    };

    document.body.appendChild(notification);

    // 5秒后自动关闭
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.4s ease-in forwards';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 400);
        }
    }, 5000);
}


// 将函数暴露到全局作用域
window.triggerMysteryEmail = triggerMysteryEmail;
window.addMysteryReplyCondition = addMysteryReplyCondition;
window.checkMysteryReplyConditions = checkMysteryReplyConditions;

// ==================== 清空缓存功能 ====================

// 清空所有标记和状态信息
function clearAllCache() {
    try {
        // 清除触发的邮件ID列表(包括海伯利安邮件ID=1和神秘线索邮件ID=101)
        localStorage.removeItem('triggeredEmailIds');

        // 清除当前用户登录状态
        localStorage.removeItem('currentUser');

        // 清除邮件相关标记
        localStorage.removeItem('canReplyMystery');
        localStorage.removeItem('hasRepliedMystery');
        localStorage.removeItem('savedEmailData');
        localStorage.removeItem('mysteryReplyConditions');

        // 清除UI状态标记
        localStorage.removeItem('hasOpenedEmail');
        localStorage.removeItem('forumUser');

        // 清除OA打卡记录
        localStorage.removeItem('attendanceRecords');

        // 清除搜索历史
        localStorage.removeItem('searchHistory');

        // 清除论坛私信对话历史(所有用户)
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.startsWith('chat_')) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error('清除缓存时出错:', error);
    }
}


// 将函数暴露到全局作用域
window.clearAllCache = clearAllCache;

// 在特殊用户的发件箱中添加神秘线索邮件
// 添加神秘线索邮件到特殊用户发件箱(双向同步)
function addMysteryEmailToSpecialUserSent() {
    // 获取特殊用户的邮件数据
    const specialUserData = userEmailData['special'];

    // 检查是否已经存在
    const existingSent = specialUserData.sent.find(e => e.id === 101);
    if (existingSent) {
        return;
    }

    // 深拷贝模板,避免引用污染
    const sentEmail = JSON.parse(JSON.stringify(MYSTERY_EMAIL_TEMPLATE));
    specialUserData.sent.unshift(sentEmail);

}

// 初始化OA考勤
loadAttendanceRecords();
setInterval(updateOATime, 1000);
updateOATime();

// ==================== 工具函数 ====================

// 神秘线索邮件回复条件管理
function addMysteryReplyCondition(conditionName) {
    const conditions = JSON.parse(localStorage.getItem('mysteryReplyConditions') || '[]');
    if (!conditions.includes(conditionName)) {
        conditions.push(conditionName);
        localStorage.setItem('mysteryReplyConditions', JSON.stringify(conditions));
    }
}

function checkMysteryReplyConditions() {
    const conditions = JSON.parse(localStorage.getItem('mysteryReplyConditions') || '[]');
    return conditions.length >= 2;
}

// 显示灰色浮框提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 99999;
                pointer-events: none;
                animation: fadeInOut 2s ease-in-out;
            `;

    document.body.appendChild(toast);

    // 2秒后自动消失
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// 添加淡入淡出动画样式
if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                }
            `;
    document.head.appendChild(style);
}

// ==================== 搜索引擎系统 ====================

// Base64编码的搜索重定向配置
const encryptedSearchConfig = 'eyLmsZ/ln47ng63nur8iOnsicmVzdWx0cyI6W3sidXJsIjoiRm9ydW0uaHRtbCIsInRpdGxlIjoi5rGf5Z+O54Ot57q/IiwiZGVzY3JpcHRpb24iOiLmsZ/lt57kurrnmoTnvZHkuIrlrrblm60ifV19LCLoqonpvI7pm4blm6IiOnsicmVzdWx0cyI6W3sidXJsIjoiWXVEaW5nLmh0bWwiLCJ0aXRsZSI6Iuiqiem8jumbhuWboiAtIOWumOe9kSIsImRlc2NyaXB0aW9uIjoi6KqJ6byO5Z+O5biC5Y+R5bGV5o6n6IKh6ZuG5ZuiLeWumOe9kSJ9XX19';

// 解密函数（Base64解码 + UTF-8转换）
function decryptSearchConfig() {
    try {
        // Base64解码
        const base64Str = atob(encryptedSearchConfig);

        // 将二进制字符串转为UTF-8字符串
        const bytes = new Uint8Array(base64Str.length);
        for (let i = 0; i < base64Str.length; i++) {
            bytes[i] = base64Str.charCodeAt(i);
        }
        const jsonStr = new TextDecoder('utf-8').decode(bytes);

        return JSON.parse(jsonStr);
    } catch (e) {
        return {};
    }
}

// 解密后的搜索重定向配置
const searchRedirects = decryptSearchConfig();

// 搜索历史记录
let searchHistoryData = [];

// 从localStorage加载搜索历史
function loadSearchHistory() {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
        searchHistoryData = JSON.parse(saved);
        renderSearchHistory();
    }
}

// 保存搜索历史到localStorage
function saveSearchHistory() {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryData));
}

// 渲染搜索历史
function renderSearchHistory() {
    const historyContainer = document.getElementById('searchHistory');
    if (!historyContainer) return;

    if (searchHistoryData.length === 0) {
        historyContainer.innerHTML = '';
        return;
    }

    let html = '<div style="color: #666; margin-bottom: 15px; font-size: 14px;">🕐 搜索历史</div>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';

    searchHistoryData.forEach((item, index) => {
        html += `
                    <div onclick="searchFromHistory('${item.keyword}')" 
                         style="padding: 8px 15px; background: #f5f5f5; color: #333; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all 0.2s; border: 1px solid #e0e0e0;"
                         onmouseover="this.style.background='#e8f4ff'; this.style.borderColor='#0066cc'"
                         onmouseout="this.style.background='#f5f5f5'; this.style.borderColor='#e0e0e0'">
                        ${item.keyword}
                    </div>
                `;
    });

    html += '</div>';
    historyContainer.innerHTML = html;
}

// 从历史记录搜索
function searchFromHistory(keyword) {
    document.getElementById('mainSearchInput').value = keyword;
    performMainSearch();
}

// 主搜索框搜索
function performMainSearch() {
    const keyword = document.getElementById('mainSearchInput').value.trim();
    if (!keyword) return;

    executeSearch(keyword);
}

// 地址栏搜索
function handleSearch(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) return;

    executeSearch(keyword);
}

// 执行搜索
function executeSearch(keyword) {
    // 添加到搜索历史
    const existingIndex = searchHistoryData.findIndex(item => item.keyword === keyword);
    if (existingIndex > -1) {
        searchHistoryData.splice(existingIndex, 1);
    }
    searchHistoryData.unshift({
        keyword: keyword,
        timestamp: new Date().toISOString()
    });

    // 只保留最近10条
    if (searchHistoryData.length > 10) {
        searchHistoryData = searchHistoryData.slice(0, 10);
    }
    saveSearchHistory();

    // 查找匹配的跳转
    const redirect = findRedirect(keyword);

    // 显示搜索结果
    showSearchResults(keyword, redirect);
}

// 查找匹配的跳转规则
function findRedirect(keyword) {
    // 精确匹配
    if (searchRedirects[keyword]) {
        return searchRedirects[keyword];
    }

    // 模糊匹配（包含关键词）
    for (let key in searchRedirects) {
        if (keyword.includes(key) || key.includes(keyword)) {
            return searchRedirects[key];
        }
    }

    return null;
}

// 显示搜索结果
function showSearchResults(keyword, redirect) {
    const searchEngine = document.getElementById('searchEngine');
    const searchResults = document.getElementById('searchResults');

    searchEngine.style.display = 'none';
    searchResults.style.display = 'block';

    let html = `
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                        <button onclick="goBackToSearch()" style="padding: 8px 16px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s;" 
                                onmouseover="this.style.background='#e8f4ff'"
                                onmouseout="this.style.background='#f5f5f5'">
                            ← 返回
                        </button>
                        <h2 style="margin: 0; color: #333; font-size: 20px;">搜索结果: "${keyword}"</h2>
                    </div>
            `;

    if (redirect && redirect.results) {
        // 多条搜索结果
        html += `<div style="margin-bottom: 20px; color: #666;">找到 ${redirect.results.length} 条相关结果</div>`;

        redirect.results.forEach((result, index) => {
            html += `
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #0066cc; margin-bottom: 15px; transition: all 0.2s;"
                             onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'"
                             onmouseout="this.style.boxShadow='none'">
                            <h3 style="margin-bottom: 10px; color: #0066cc;">
                                <a href="${result.url}" target="_blank" style="color: #0066cc; text-decoration: none;">${result.title}</a>
                            </h3>
                            <p style="color: #666; font-size: 14px; line-height: 1.6;">${result.description}</p>
                            <p style="color: #999; font-size: 12px; margin-top: 10px;">${result.url}</p>
                        </div>
                    `;
        });
    } else if (redirect) {
        // 单条结果（兼容旧格式）
        html += `
                    <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; border-left: 4px solid #0066cc; margin-bottom: 20px;">
                        <h3 style="margin-bottom: 10px; color: #0066cc;">
                            <a href="${redirect.url}" target="_blank" style="color: #0066cc; text-decoration: none;">${redirect.title}</a>
                        </h3>
                        <p style="color: #666; font-size: 14px;">${redirect.description}</p>
                        <p style="color: #999; font-size: 12px; margin-top: 10px;">${redirect.url}</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="window.open('${redirect.url}', '_blank')" 
                                style="padding: 12px 30px; background: #0066cc; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
                            访问页面
                        </button>
                    </div>
                `;
    } else {
        // 未找到相关信息 - 显示404页面
        html += `
                    <div style="text-align: center; padding: 80px 20px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 120px; font-weight: bold; color: #e0e0e0; margin-bottom: 20px;">404</div>
                        <h2 style="color: #333; margin-bottom: 15px;">页面未找到</h2>
                        <p style="color: #666; font-size: 16px; margin-bottom: 30px;">抱歉，我们找不到与 "${keyword}" 相关的内容</p>
                        <button onclick="goBackToSearch()" style="padding: 10px 24px; background: #0066cc; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: background 0.2s;"
                                onmouseover="this.style.background='#0052a3'"
                                onmouseout="this.style.background='#0066cc'">
                            返回首页
                        </button>
                    </div>
                `;
    }

    html += '</div>';
    searchResults.innerHTML = html;

    // 更新地址栏
    document.getElementById('searchInput').value = keyword;
}

// 返回搜索主页
function goBackToSearch() {
    const searchEngine = document.getElementById('searchEngine');
    const searchResults = document.getElementById('searchResults');

    searchEngine.style.display = 'flex';
    searchResults.style.display = 'none';
    document.getElementById('searchInput').value = '';
}

// 初始化搜索引擎
loadSearchHistory();

// ==================== 微信功能 ====================

// 微信联系人数据
const wechatContacts = [
    {
        id: 'boss',
        name: '老板',
        avatar: '老',
        preview: '嗯，注意时间节点。',
        type: 'chat'
    },
    {
        id: 'yangmin',
        name: '杨敏',
        avatar: '杨',
        preview: '哎。',
        type: 'chat'
    },
    {
        id: 'workgroup',
        name: '工作群',
        avatar: '工',
        preview: '我：......',
        type: 'chat'
    },
    {
        id: 'zhangsan',
        name: '张三',
        avatar: '张',
        preview: '不渴。',
        type: 'chat'
    },
    {
        id: 'lisi',
        name: '李四',
        avatar: '李',
        preview: '周末去爬山拍的',
        type: 'chat'
    },
    {
        id: 'family',
        name: '家庭群',
        avatar: '家',
        preview: '妈妈: 好吧，工作要紧，注意身体',
        type: 'chat'
    }
];

// 朋友圈数据
const momentsData = [
    {
        id: 1,
        user: '老板',
        avatar: '老',
        time: '2小时前',
        content: '咖啡时光 ☕️',
        images: ['../assets/coffee.png'],
        likes: ['张三', '李四'],
        comments: [
            { user: '张三', text: '看起来不错！' }
        ]
    },
    {
        id: 2,
        user: '李四',
        avatar: '李',
        time: '昨天',
        content: '爬山看到的风景，空气真好 🏔️',
        images: ['../assets/mountain.png'],
        likes: ['张三', '李四'],
        comments: []
    },
    {
        id: 3,
        user: '张三',
        avatar: '张',
        time: '3天前',
        content: '加班到深夜，打工人加油 💪',
        images: [],
        likes: [],
        comments: [
        ]
    },
    {
        id: 4,
        user: '杨敏',
        avatar: '杨',
        time: '5天前',
        content: '列表里有没有江州工作的？如果你们认识照片里这个人，请你们告诉我他在哪！',
        images: ['../assets/yang.jpg'],
        likes: [],
        comments: [
            { user: 'me', 'text': '我在江州工作！有消息会帮你留意的。' },
            { user: '杨敏', 'text': '谢谢！' }
        ]
    },
    {
        id: 4,
        user: '杨敏',
        avatar: '杨',
        time: '7天前',
        content: '大老远跑来江州，连个面都不让见。发邮件说“工程保密”、“别再发邮件了”。爸，你到底在躲什么？我是你亲闺女，不是来要债的……[心碎][流泪]',
        images: ['../assets/re_email.png'],
        likes: [],
        comments: [
        ]
    }
];

// 聊天记录数据
const wechatMessages = {
    'boss': [
        {
            time: '2030-07-08 10:15',
            messages: [
                { from: 'boss', text: '海伯利安大厦的爆破安全评估项目，你负责跟进一下。', time: '10:15' },
                { from: 'me', text: '好的，收到。', time: '10:16' },
                { from: 'boss', text: '这个项目比较紧急。你先和李婷对接，把合同和图纸资料拿到手。', time: '10:17' },
                { from: 'me', text: '明白，我这就联系她。', time: '10:18' },
                { from: 'boss', text: '嗯，注意时间节点。', time: '10:19' }
            ]
        }
    ],
    'yangmin': [
        {
            time: '三天前',
            messages: [
                { from: 'me', text: '刚看你朋友圈了。别太难过，叔叔可能真的有苦衷，慢慢来。', time: '15:30' },
                { from: 'yangmin', text: '哎，不提他了，心累。[叹气]', time: '15:31' },
                { from: 'me', text: '行，那咱先不想了。你刚工作事情也多，别把自己逼太紧。', time: '15:35' },
                { from: 'yangmin', text: '嗯。真是整宿整宿都在想。', time: '15:36' },
                { from: 'yangmin', text: '想不通。', time: '15:41' },
                { from: 'me', text: '哎。', time: '15:43' }
            ]
        }
    ],
    'workgroup': [
        {
            time: '昨天 14:30',
            messages: [
                { from: 'zhangsan', text: '你好，今天有空吗？@禾佳', time: '14:30' },
                { from: 'me', text: '有的，什么事？', time: '14:32' },
                { from: 'zhangsan', text: '有个项目的内容我感觉涉及到你领域了，钉钉转发你了。', time: '14:33' },
                { from: 'me', text: '......', time: '14:32' },
            ]
        }
    ],
    'zhangsan': [
        {
            time: '昨天 16:35',
            messages: [
                { from: 'zhangsan', text: '姐，感谢感谢！', time: '16:30' },
                { from: 'me', text: '不会还有什么事要我帮忙把？', time: '16:32' },
                { from: 'zhangsan', text: '没有没有，想请姐喝奶茶！', time: '16:33' },
                { from: 'me', text: '不渴。', time: '16:35' }
            ]
        }
    ],
    'lisi': [
        {
            time: '2030-07-07 16:45',
            messages: [
                { from: 'lisi', text: '[图片]', time: '16:45', isImage: true },
                { from: 'me', text: '这是哪里？风景不错', time: '16:50' },
                { from: 'lisi', text: '周末去爬山拍的', time: '16:52' }
            ]
        }
    ],
    'family': [
        {
            time: '2030-07-06 19:30',
            messages: [
                { from: 'mom', text: '周末回家吃饭吗？', time: '19:30' },
                { from: 'me', text: '这周要加班，可能回不去了', time: '19:35' },
                { from: 'mom', text: '好吧，工作要紧，注意身体', time: '19:36' }
            ]
        }
    ]
};

let currentChatId = 'workgroup';
let currentWechatTab = 'messages';

// 切换微信Tab
function switchWechatTab(tab, event) {
    currentWechatTab = tab;

    // 更新导航状态
    document.querySelectorAll('.wechat-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    const contactList = document.getElementById('contactList');
    const searchBar = document.getElementById('searchBar');
    const chatMain = document.querySelector('.wechat-main');

    if (tab === 'messages') {
        // 消息列表
        contactList.style.display = 'block';
        searchBar.style.display = 'block';
        chatMain.style.display = 'flex';
        document.querySelector('.wechat-input-area').style.display = 'flex';
        initWechatContacts();
        loadChatMessages(currentChatId);
    } else if (tab === 'contacts') {
        // 通讯录 - 按字母排序显示
        contactList.style.display = 'block';
        searchBar.style.display = 'block';
        chatMain.style.display = 'flex';
        renderContacts();
        // 清空聊天区域显示空白
        document.getElementById('chatHeader').textContent = '';
        document.getElementById('chatMessages').innerHTML = '<div style="text-align: center; color: #999; margin-top: 100px;">请选择联系人开始聊天</div>';
        document.querySelector('.wechat-input-area').style.display = 'none';
    } else if (tab === 'moments') {
        // 朋友圈 - 打开弹窗
        openMoments();
    }
}

// 打开朋友圈弹窗
function openMoments() {
    const modal = document.getElementById('momentsModal');
    modal.classList.add('show');
    renderMomentsInModal();
}

// 关闭朋友圈弹窗
function closeMoments() {
    const modal = document.getElementById('momentsModal');
    modal.classList.remove('show');
    // 切回消息Tab
    document.querySelectorAll('.wechat-nav-item').forEach((item, index) => {
        item.classList.remove('active');
        if (index === 0) item.classList.add('active');
    });
    currentWechatTab = 'messages';
    document.getElementById('contactList').style.display = 'block';
    document.getElementById('searchBar').style.display = 'block';
    document.querySelector('.wechat-main').style.display = 'flex';
    document.querySelector('.wechat-input-area').style.display = 'flex';
    initWechatContacts();
    loadChatMessages(currentChatId);
}

// 渲染通讯录
function renderContacts() {
    const contactList = document.getElementById('contactList');
    if (!contactList) return;

    // 按首字母分组（简化版）
    let html = '<div style="padding: 10px; color: #999; font-size: 12px;">常用联系人</div>';

    wechatContacts.forEach(contact => {
        html += `
                    <div class="wechat-contact" onclick="switchToChat('${contact.id}')">
                        <div class="wechat-avatar">${contact.avatar}</div>
                        <div class="wechat-contact-info">
                            <div class="wechat-contact-name">${contact.name}</div>
                        </div>
                    </div>
                `;
    });

    contactList.innerHTML = html;
}

// 从通讯录切换到聊天
function switchToChat(contactId) {
    // 切换到消息Tab
    document.querySelectorAll('.wechat-nav-item').forEach((item, index) => {
        item.classList.remove('active');
        if (index === 0) item.classList.add('active');
    });

    currentWechatTab = 'messages';
    document.getElementById('contactList').style.display = 'block';
    document.getElementById('searchBar').style.display = 'block';

    initWechatContacts();
    switchChat(contactId);
}

// 渲染朋友圈（在弹窗中）
function renderMomentsInModal() {
    const momentsContent = document.getElementById('momentsContent');
    if (!momentsContent) return;

    let html = '';
    momentsData.forEach(moment => {
        // 图片展示
        let imagesHtml = '';
        if (moment.images && moment.images.length > 0) {
            imagesHtml = '<div style="margin-top: 10px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">';
            moment.images.forEach(img => {
                imagesHtml += `
                            <div style="width: 100%; padding-bottom: 100%; position: relative; overflow: hidden; border-radius: 5px; background: #f0f0f0;">
                                <img src="${img}" alt="朋友圈图片" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open('${img}', '_blank')">
                            </div>
                        `;
            });
            imagesHtml += '</div>';
        }

        // 点赞
        let likesHtml = '';
        if (moment.likes && moment.likes.length > 0) {
            likesHtml = `
                        <div style="margin-top: 10px; padding: 8px; background: #2e2e2e; border-radius: 5px; font-size: 13px;">
                            <span style="color: #576b95;">❤️ ${moment.likes.join('、')}</span>
                        </div>
                    `;
        }

        // 评论
        let commentsHtml = '';
        if (moment.comments && moment.comments.length > 0) {
            commentsHtml = '<div style="margin-top: 5px; padding: 8px; background: #2e2e2e; border-radius: 5px; font-size: 13px;">';
            moment.comments.forEach(comment => {
                commentsHtml += `<div><span style="color: #576b95;">${comment.user}:</span> <span style="color: #FFFFFF;">${comment.text}</span></div>`;
            });
            commentsHtml += '</div>';
        }

        html += `
                    <div style="padding: 15px; border-bottom: 1px solid #C1C1BF;">
                        <div style="display: flex; gap: 10px;">
                            <div class="wechat-avatar" style="width: 40px; height: 40px; font-size: 16px;">${moment.avatar}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; color: #576b95; margin-bottom: 5px;">${moment.user}</div>
                                <div style="color: #fff; font-size: 14px; line-height: 1.6;">${moment.content}</div>
                                ${imagesHtml}
                                <div style="margin-top: 8px; font-size: 12px; color: #999;">${moment.time}</div>
                                ${likesHtml}
                                ${commentsHtml}
                            </div>
                        </div>
                    </div>
                `;
    });

    momentsContent.innerHTML = html;
}

// 初始化微信联系人列表
function initWechatContacts() {
    const contactList = document.getElementById('contactList');
    if (!contactList) return;

    let html = '';
    wechatContacts.forEach((contact, index) => {
        const activeClass = contact.id === currentChatId ? 'active' : '';
        html += `
                    <div class="wechat-contact ${activeClass}" onclick="switchChat('${contact.id}')" data-id="${contact.id}">
                        <div class="wechat-avatar">${contact.avatar}</div>
                        <div class="wechat-contact-info">
                            <div class="wechat-contact-name">${contact.name}</div>
                            <div class="wechat-contact-preview">${contact.preview}</div>
                        </div>
                    </div>
                `;
    });

    contactList.innerHTML = html;
}

// 切换聊天对象
function switchChat(contactId) {
    currentChatId = contactId;

    // 更新联系人选中状态
    document.querySelectorAll('.wechat-contact').forEach(contact => {
        contact.classList.remove('active');
        if (contact.getAttribute('data-id') === contactId) {
            contact.classList.add('active');
        }
    });

    // 获取联系人信息
    const contact = wechatContacts.find(c => c.id === contactId);
    if (contact) {
        // 更新聊天头部
        document.getElementById('chatHeader').textContent = contact.name;

        // 加载聊天记录
        loadChatMessages(contactId);
    }
}

// 加载聊天记录
function loadChatMessages(contactId) {
    const chatMessages = document.getElementById('chatMessages');
    const messages = wechatMessages[contactId];

    if (!messages || messages.length === 0) {
        chatMessages.innerHTML = '<div style="text-align: center; color: #999; margin-top: 50px;">暂无聊天记录</div>';
        return;
    }

    let html = '';
    messages.forEach(group => {
        html += `<div style="text-align: center; color: #999; font-size: 12px; margin-bottom: 15px;">${group.time}</div>`;

        group.messages.forEach(msg => {
            const isSelf = msg.from === 'me';
            const avatarText = isSelf ? '我' : getAvatarText(msg.from);

            if (msg.isImage) {
                // 图片消息
                html += `
                            <div class="wechat-message ${isSelf ? 'self' : ''}">
                                <div class="wechat-msg-avatar">${avatarText}</div>
                                <div class="wechat-msg-content">
                                    <div class="wechat-msg-bubble" style="padding: 5px; background: #f0f0f0;">
                                        <div style="width: 200px; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; color: white; font-size: 14px; border-radius: 4px;">
                                            📷 ${msg.imagePlaceholder || '图片'}
                                        </div>
                                    </div>
                                    <div class="wechat-msg-time">${msg.time}</div>
                                </div>
                            </div>
                        `;
            } else {
                // 文字消息
                html += `
                            <div class="wechat-message ${isSelf ? 'self' : ''}">
                                <div class="wechat-msg-avatar">${avatarText}</div>
                                <div class="wechat-msg-content">
                                    <div class="wechat-msg-bubble">${msg.text}</div>
                                    <div class="wechat-msg-time">${msg.time}</div>
                                </div>
                            </div>
                        `;
            }
        });
    });

    chatMessages.innerHTML = html;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 获取头像文字
function getAvatarText(from) {
    const contact = wechatContacts.find(c => c.id === from);
    return contact ? contact.avatar : '?';
}

// 发送微信消息
function sendWechatMessage() {
    const textarea = document.querySelector('.wechat-textarea');
    const message = textarea.value.trim();

    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    // 添加自己的消息
    const messageHTML = `
                <div class="wechat-message self">
                    <div class="wechat-msg-avatar">我</div>
                    <div class="wechat-msg-content">
                        <div class="wechat-msg-bubble">${message}</div>
                        <div class="wechat-msg-time">${timeStr}</div>
                    </div>
                </div>
            `;

    chatMessages.insertAdjacentHTML('beforeend', messageHTML);
    textarea.value = '';

    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 支持回车发送
document.addEventListener('DOMContentLoaded', () => {
    initWechatContacts();
    loadChatMessages(currentChatId);

    const textarea = document.querySelector('.wechat-textarea');
    if (textarea) {
        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendWechatMessage();
            }
        });
    }
});

// 点击页面其他地方关闭用户菜单
document.addEventListener('click', (e) => {
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userMenuPopup = document.getElementById('userMenuPopup');

    if (userMenuTrigger && userMenuPopup) {
        // 如果点击的不是用户菜单区域，则关闭菜单
        if (!userMenuTrigger.contains(e.target) && !userMenuPopup.contains(e.target)) {
            userMenuPopup.style.display = 'none';
        }
    }
});
