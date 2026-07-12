/**
 * 论坛公共JavaScript模块
 * 包含：登录功能、数据加密/解密工具
 */

// ==================== 登录功能 ====================

// 检查登录状态
function initForumLogin() {
    window.addEventListener('load', () => {
        const forumUser = localStorage.getItem('forumUser');
        if (forumUser) {
            updateUserInfo(forumUser);
        }
    });
}

// 显示登录弹窗
function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
}

// 关闭登录弹窗
function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('show');
    setTimeout(() => {
        const btnText = document.getElementById('loginBtnText');
        const spinner = document.getElementById('loginSpinner');
        const success = document.getElementById('loginSuccess');
        if (btnText) btnText.textContent = '微信登录';
        if (spinner) spinner.style.display = 'none';
        if (success) success.style.display = 'none';
    }, 300);
}

// 点击弹窗外部关闭
function initLoginModalClose() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeLoginModal();
            }
        });
    }
}

// 微信登录
function wechatLogin() {
    const btnText = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');
    const success = document.getElementById('loginSuccess');
    
    if (!btnText || !spinner || !success) return;
    
    btnText.textContent = '登录中...';
    spinner.style.display = 'block';
    
    setTimeout(() => {
        spinner.style.display = 'none';
        btnText.textContent = '登录成功';
        success.style.display = 'block';
        
        localStorage.setItem('forumUser', '禾佳');
        updateUserInfo('禾佳');
        
        setTimeout(() => {
            closeLoginModal();
        }, 1000);
    }, 1500);
}

// 更新用户信息显示
function updateUserInfo(username) {
    const userStatusArea = document.getElementById('userStatusArea');
    if (!userStatusArea) return;
    
    userStatusArea.innerHTML = `
        <div style="color: #FFD700; font-weight: bold;">欢迎您，${username}</div>
        <div class="user-links">
            <a href="#" onclick="logout(); return false;">退出</a> | 
            <a href="#">个人中心</a> | 
            <a href="#">消息</a>
        </div>
    `;
}

// 退出登录
function logout() {
    localStorage.removeItem('forumUser');
    location.reload();
}

// ==================== 数据加密/解密工具 ====================

// Base64编码（支持UTF-8）
function encryptData(data) {
    try {
        const jsonStr = JSON.stringify(data);
        const bytes = new TextEncoder('utf-8').encode(jsonStr);
        let binaryString = '';
        for (let i = 0; i < bytes.length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
        }
        return btoa(binaryString);
    } catch (e) {
        console.error('数据加密失败:', e);
        return '';
    }
}

// Base64解码（支持UTF-8）
function decryptData(encryptedStr) {
    try {
        const base64Str = atob(encryptedStr);
        const bytes = new Uint8Array(base64Str.length);
        for (let i = 0; i < base64Str.length; i++) {
            bytes[i] = base64Str.charCodeAt(i);
        }
        const jsonStr = new TextDecoder('utf-8').decode(bytes);
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('数据解密失败:', e);
        return null;
    }
}


// ==================== 搜索功能 ====================

// 搜索关键词映射表：关键词 -> 帖子信息
let searchKeywordMap = {};

// 添加搜索关键词映射
function addSearchKeyword(keyword, postData) {
    if (!keyword || !postData) return;
    searchKeywordMap[keyword] = postData;
}

// 批量添加搜索关键词
function addSearchKeywords(keywordsObj) {
    if (!keywordsObj) return;
    Object.assign(searchKeywordMap, keywordsObj);
}

// 执行搜索
function performSearch(keyword) {
    if (!keyword || keyword.trim() === '') {
        return null;
    }
    
    const trimmedKeyword = keyword.trim();
    
    // 精确匹配
    if (searchKeywordMap[trimmedKeyword]) {
        return searchKeywordMap[trimmedKeyword];
    }
    
    // 模糊匹配（包含关键词）
    for (const key in searchKeywordMap) {
        if (key.includes(trimmedKeyword)) {
            return searchKeywordMap[key];
        }
    }
    
    return null;
}

// 初始化搜索框
function initSearchBox() {
    console.log('开始初始化搜索框...');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchInput || !searchBtn) {
        console.warn('未找到搜索框元素');
        return;
    }
    
    console.log('找到搜索框元素');
    
    // 创建搜索结果容器
    let resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) {
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'searchResults';
            resultsContainer.className = 'search-results';
            searchBox.parentNode.insertBefore(resultsContainer, searchBox.nextSibling);
            console.log('创建搜索结果容器成功');
        }
    }
    
    // 点击搜索按钮
    searchBtn.addEventListener('click', () => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            showSearchResults(keyword);
        }
    });
    
    // 回车键搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const keyword = searchInput.value.trim();
            if (keyword) {
                showSearchResults(keyword);
            }
        }
    });
    
    // 实时搜索（输入时即时显示结果）
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.trim();
        if (keyword.length >= 1) {
            showSearchResults(keyword, true);
        } else {
            hideSearchResults();
        }
    });
}

// 显示搜索结果
function showSearchResults(keyword, isRealtime = false) {
    console.log('显示搜索结果, 关键词:', keyword);
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) {
        console.error('未找到搜索结果容器');
        return;
    }
    
    const result = performSearch(keyword);
    console.log('搜索结果:', result);
    
    if (!result) {
        resultsContainer.innerHTML = '<div class="search-no-result">未找到相关帖子</div>';
        resultsContainer.classList.add('show');
        return;
    }
    
    // 生成结果HTML
    const html = `
        <div class="search-result-item" onclick="window.location.href='${result.url}'">
            <div class="search-result-title">${result.title}</div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    resultsContainer.classList.add('show');
    
    // 点击外部关闭搜索结果
    if (!isRealtime) {
        setTimeout(() => {
            const closeHandler = (e) => {
                const searchBox = document.querySelector('.search-box');
                if (searchBox && !searchBox.contains(e.target)) {
                    hideSearchResults();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    }
}

// 隐藏搜索结果
function hideSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.classList.remove('show');
    }
}

// 初始化所有登录相关功能
function initForumCommon() {
    initForumLogin();
    initLoginModalClose();
    initSearchBox();
}
