// نظام إدارة المستخدمين مع حفظ البيانات محلياً
class UserManager {
    constructor() {
        this.usersKey = 'facebook_users_data';
        this.activityKey = 'facebook_activity_log';
        this.users = this.loadUsers();
        this.activityLog = this.loadActivityLog();
        this.currentUser = null;
        this.init();
    }

    init() {
        this.renderUsers();
        this.updateStats();
        this.setupEventListeners();
        this.logActivity('تهيئة النظام', 'system');
    }

    // تحميل المستخدمين من localStorage
    loadUsers() {
        try {
            const usersJson = localStorage.getItem(this.usersKey);
            if (usersJson) {
                return JSON.parse(usersJson);
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات المستخدمين:', error);
        }
        
        // بيانات افتراضية إذا لم توجد بيانات
        return [
            {
                id: 1,
                email: "user@demo.com",
                password: "Demo123!",
                name: "مستخدم تجريبي",
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                email: "test@example.com",
                password: "Test456!",
                name: "مستخدم اختبار",
                created_at: new Date().toISOString()
            }
        ];
    }

    // تحميل سجل النشاطات
    loadActivityLog() {
        try {
            const logJson = localStorage.getItem(this.activityKey);
            if (logJson) {
                return JSON.parse(logJson);
            }
        } catch (error) {
            console.error('خطأ في تحميل سجل النشاطات:', error);
        }
        return [];
    }

    // حفظ المستخدمين في localStorage
    saveUsers() {
        try {
            localStorage.setItem(this.usersKey, JSON.stringify(this.users));
            this.updateStorageInfo();
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات المستخدمين:', error);
            this.showMessage('حدث خطأ في حفظ البيانات', 'error');
            return false;
        }
    }

    // حفظ سجل النشاطات
    saveActivityLog() {
        try {
            // حفظ آخر 50 نشاط فقط
            const recentLogs = this.activityLog.slice(-50);
            localStorage.setItem(this.activityKey, JSON.stringify(recentLogs));
        } catch (error) {
            console.error('خطأ في حفظ سجل النشاطات:', error);
        }
    }

    // تسجيل نشاط
    logActivity(message, type = 'info') {
        const activity = {
            id: Date.now(),
            message: message,
            type: type,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString('ar-SA')
        };
        
        this.activityLog.push(activity);
        this.saveActivityLog();
        this.updateActivityLog();
    }

    // البحث عن مستخدم بالبريد الإلكتروني
    findUserByEmail(email) {
        return this.users.find(user => 
            user.email.toLowerCase() === email.toLowerCase()
        );
    }

    // التحقق من بيانات تسجيل الدخول
    validateLogin(email, password) {
        const user = this.findUserByEmail(email);
        if (!user) {
            return { success: false, message: 'البريد الإلكتروني غير مسجل' };
        }
        
        if (user.password !== password) {
            return { success: false, message: 'كلمة المرور غير صحيحة' };
        }
        
        return { success: true, user: user };
    }

    // إنشاء حساب جديد
    createAccount(name, email, password) {
        // التحقق من وجود البريد الإلكتروني
        if (this.findUserByEmail(email)) {
            return { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' };
        }

        // التحقق من صحة كلمة المرور
        if (password.length < 6) {
            return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }

        // إنشاء مستخدم جديد
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
        };

        // إضافة المستخدم إلى القائمة
        this.users.push(newUser);
        
        // حفظ التغييرات
        if (this.saveUsers()) {
            this.logActivity(`تم إنشاء حساب جديد: ${email}`, 'success');
            this.renderUsers();
            this.updateStats();
            return { success: true, user: newUser };
        }
        
        return { success: false, message: 'حدث خطأ في إنشاء الحساب' };
    }

    // حذف مستخدم
    deleteUser(userId) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            const deletedUser = this.users.splice(userIndex, 1)[0];
            if (this.saveUsers()) {
                this.logActivity(`تم حذف المستخدم: ${deletedUser.email}`, 'warning');
                this.renderUsers();
                this.updateStats();
                return true;
            }
        }
        return false;
    }

    // مسح جميع البيانات
    clearAllData() {
        if (confirm('هل أنت متأكد من مسح جميع بيانات المستخدمين؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            this.users = [];
            this.activityLog = [];
            
            localStorage.removeItem(this.usersKey);
            localStorage.removeItem(this.activityKey);
            
            this.logActivity('تم مسح جميع البيانات', 'error');
            this.renderUsers();
            this.updateStats();
            this.showMessage('تم مسح جميع البيانات بنجاح', 'success');
        }
    }

    // تصدير بيانات users.json
    exportUsersData() {
        const dataStr = JSON.stringify(this.users, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'users.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.logActivity('تم تصدير بيانات المستخدمين', 'info');
    }

    // عرض قائمة المستخدمين
    renderUsers() {
        const usersList = document.getElementById('usersList');
        const usersCount = document.getElementById('usersCount');
        
        if (!usersList) return;
        
        usersList.innerHTML = '';
        usersCount.textContent = this.users.length;
        
        this.users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            
            const date = new Date(user.created_at).toLocaleDateString('ar-SA');
            
            userElement.innerHTML = `
                <div class="user-avatar">
                    ${user.name.charAt(0)}
                </div>
                <div class="user-info">
                    <div class="user-email">${user.email}</div>
                    <div class="user-date">${date}</div>
                </div>
                <button class="delete-user" data-id="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            usersList.appendChild(userElement);
        });
        
        // إضافة أحداث لحذف المستخدمين
        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = parseInt(e.currentTarget.dataset.id);
                this.deleteUser(userId);
            });
        });
    }

    // تحديث الإحصائيات
    updateStats() {
        const totalUsers = document.getElementById('totalUsers');
        const lastLogin = document.getElementById('lastLogin');
        const storageInfo = document.getElementById('storageInfo');
        
        if (totalUsers) totalUsers.textContent = this.users.length;
        
        // حساب حجم التخزين
        const usersSize = JSON.stringify(this.users).length;
        const logSize = JSON.stringify(this.activityLog).length;
        const totalSize = ((usersSize + logSize) / 1024).toFixed(2);
        
        if (storageInfo) {
            storageInfo.textContent = `التخزين المحلي: ${totalSize}KB`;
        }
        
        // آخر تسجيل دخول
        if (lastLogin && this.users.length > 0) {
            const latestUser = this.users.reduce((latest, user) => {
                return user.last_login && new Date(user.last_login) > new Date(latest.last_login || 0) 
                    ? user : latest;
            }, this.users[0]);
            
            if (latestUser.last_login) {
                const time = new Date(latestUser.last_login).toLocaleTimeString('ar-SA');
                lastLogin.textContent = time;
            }
        }
    }

    // تحديث سجل النشاطات
    updateActivityLog() {
        const activityLog = document.getElementById('activityLog');
        if (!activityLog) return;
        
        activityLog.innerHTML = '';
        
        // عرض آخر 10 نشاطات
        const recentActivities = this.activityLog.slice(-10).reverse();
        
        recentActivities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <div>${activity.message}</div>
                <small>${activity.time}</small>
            `;
            activityLog.appendChild(activityElement);
        });
    }

    // عرض رسائل التنبيه
    showMessage(text, type = 'info') {
        const container = document.getElementById('messageContainer');
        
        // إزالة الرسائل القديمة
        const oldMessages = container.querySelectorAll('.message');
        oldMessages.forEach(msg => {
            setTimeout(() => {
                if (msg.parentNode) {
                    msg.style.opacity = '0';
                    msg.style.transform = 'translateX(-50%) translateY(-20px)';
                    setTimeout(() => msg.remove(), 300);
                }
            }, 100);
        });
        
        // إنشاء الرسالة الجديدة
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${text}</span>
        `;
        
        container.appendChild(message);
        
        // إزالة الرسالة بعد 5 ثوانٍ
        setTimeout(() => {
            if (message.parentNode) {
                message.style.opacity = '0';
                message.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => message.remove(), 300);
            }
        }, 5000);
    }

    // تحديث معلومات التخزين
    updateStorageInfo() {
        const storageInfo = document.getElementById('storageInfo');
        if (storageInfo) {
            const total = JSON.stringify(this.users).length + JSON.stringify(this.activityLog).length;
            const sizeKB = (total / 1024).toFixed(2);
            storageInfo.textContent = `التخزين المحلي: ${sizeKB}KB`;
        }
    }

    // إعداد جميع الأحداث
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const createAccountBtn = document.getElementById('createAccountBtn');
        const createAccountForm = document.getElementById('createAccountForm');
        const adminBtn = document.getElementById('adminBtn');
        const closePanel = document.getElementById('closePanel');
        const exportBtn = document.getElementById('exportBtn');
        const clearBtn = document.getElementById('clearBtn');
        const closeCreateModal = document.getElementById('closeCreateModal');
        const createAccountModal = document.getElementById('createAccountModal');

        // تسجيل الدخول
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const loginBtn = document.getElementById('loginBtn');
                
                // التحقق من الإدخال
                if (!email || !password) {
                    this.showMessage('يرجى ملء جميع الحقول', 'error');
                    return;
                }
                
                // تغيير حالة الزر
                const originalText = loginBtn.innerHTML;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                loginBtn.disabled = true;
                
                // محاكاة تأخير الشبكة
                setTimeout(() => {
                    // التحقق من بيانات الدخول
                    const result = this.validateLogin(email, password);
                    
                    if (result.success) {
                        // تحديث وقت آخر تسجيل دخول
                        const user = this.findUserByEmail(email);
                        user.last_login = new Date().toISOString();
                        this.saveUsers();
                        
                        this.showMessage(`مرحباً ${result.user.name}! تم تسجيل الدخول بنجاح`, 'success');
                        this.logActivity(`تسجيل دخول ناجح: ${email}`, 'success');
                        
                        // تسجيل البيانات في الكونسول
                        console.log('==========================================');
                        console.log('بيانات تسجيل الدخول:');
                        console.log('البريد الإلكتروني:', email);
                        console.log('كلمة المرور:', password);
                        console.log('اسم المستخدم:', result.user.name);
                        console.log('وقت التسجيل:', new Date().toLocaleString());
                        console.log('==========================================');
                        
                        // إعادة تعيين النموذج
                        loginForm.reset();
                        
                        // تحديث الإحصائيات
                        this.updateStats();
                    } else {
                        this.showMessage(result.message, 'error');
                        this.logActivity(`محاولة تسجيل دخول فاشلة: ${email}`, 'error');
                    }
                    
                    // استعادة حالة الزر
                    loginBtn.innerHTML = originalText;
                    loginBtn.disabled = false;
                }, 1500);
            });
        }

        // فتح نافذة إنشاء حساب
        if (createAccountBtn) {
            createAccountBtn.addEventListener('click', () => {
                if (createAccountModal) {
                    createAccountModal.classList.add('active');
                }
            });
        }

        // إغلاق نافذة إنشاء حساب
        if (closeCreateModal) {
            closeCreateModal.addEventListener('click', () => {
                if (createAccountModal) {
                    createAccountModal.classList.remove('active');
                }
            });
        }

        // إنشاء حساب جديد
        if (createAccountForm) {
            createAccountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const name = document.getElementById('newName').value.trim();
                const email = document.getElementById('newEmail').value.trim();
                const password = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                // التحقق من صحة الإدخال
                if (!name || !email || !password || !confirmPassword) {
                    this.showMessage('يرجى ملء جميع الحقول', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    this.showMessage('كلمات المرور غير متطابقة', 'error');
                    return;
                }
                
                // إنشاء الحساب
                const result = this.createAccount(name, email, password);
                
                if (result.success) {
                    this.showMessage(`تم إنشاء حساب ${name} بنجاح`, 'success');
                    createAccountForm.reset();
                    if (createAccountModal) {
                        createAccountModal.classList.remove('active');
                    }
                } else {
                    this.showMessage(result.message, 'error');
                }
            });
        }

        // فتح/إغلاق لوحة التحكم
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                const adminPanel = document.getElementById('adminPanel');
                if (adminPanel) {
                    adminPanel.classList.add('active');
                }
            });
        }

        if (closePanel) {
            closePanel.addEventListener('click', () => {
                const adminPanel = document.getElementById('adminPanel');
                if (adminPanel) {
                    adminPanel.classList.remove('active');
                }
            });
        }

        // تصدير البيانات
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportUsersData();
                this.showMessage('تم تصدير بيانات المستخدمين', 'success');
            });
        }

        // مسح جميع البيانات
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        // رابط نسيت كلمة السر
        const forgotPassword = document.getElementById('forgotPassword');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMessage('سيتم توجيهك إلى صفحة استعادة كلمة السر', 'info');
            });
        }

        // زر الحصول على التطبيق
        const getAppBtn = document.getElementById('getAppBtn');
        if (getAppBtn) {
            getAppBtn.addEventListener('click', () => {
                this.showMessage('سيتم توجيهك إلى متجر التطبيقات', 'info');
            });
        }

        // تغيير اللغة
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                const lang = e.target.value;
                this.showMessage(`تم تغيير اللغة إلى ${lang === 'ar' ? 'العربية' : lang}`, 'info');
            });
        }
    }
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const userManager = new UserManager();
    
    // إظهار رسالة ترحيبية في الكونسول
    console.log('%c🎯 نظام إدارة المستخدمين', 'color: #1877f2; font-size: 18px; font-weight: bold;');
    console.log('%c📊 المستخدمين المسجلين: ' + userManager.users.length, 'color: #42b72a;');
    console.log('%c💾 يتم حفظ البيانات تلقائياً في localStorage', 'color: #666;');
    console.log('%c⚠️  هذا نموذج تعليمي - لا تستخدم بيانات حقيقية', 'color: #f02849; font-weight: bold;');
});
