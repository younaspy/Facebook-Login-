document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    
    // بيانات المستخدمين (للتجربة فقط)
    const users = [
        { email: "test@example.com", password: "123456", name: "مستخدم تجريبي" },
        { email: "user@demo.com", password: "demo123", name: "مستخدم تجريبي 2" }
    ];
    
    // دالة لعرض الرسائل
    function showMessage(text, type = 'info') {
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
    
    // التحقق من صحة الإدخال
    function validateEmail(email) {
        // قبول بريد إلكتروني أو رقم هاتف
        if (!email || email.trim() === '') {
            return false;
        }
        
        // إذا كان بريد إلكتروني
        if (email.includes('@')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        // إذا كان رقم هاتف (على الأقل 8 أرقام)
        const phoneRegex = /^[0-9]{8,15}$/;
        return phoneRegex.test(email.replace(/[^0-9]/g, ''));
    }
    
    function validatePassword(password) {
        return password && password.length >= 6;
    }
    
    // إرسال البيانات إلى الخادم (محاكاة)
    function sendToServer(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // محاكاة استجابة الخادم
                const user = users.find(u => 
                    u.email === data.email && u.password === data.password
                );
                
                if (user) {
                    resolve({
                        success: true,
                        user: user,
                        token: 'demo_token_' + Date.now(),
                        message: 'تم تسجيل الدخول بنجاح'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'البريد الإلكتروني أو كلمة السر غير صحيحة'
                    });
                }
            }, 1500);
        });
    }
    
    // معالجة تسجيل الدخول
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // التحقق من صحة الإدخال
        if (!validateEmail(email)) {
            showMessage('يرجى إدخال بريد إلكتروني صحيح أو رقم هاتف', 'error');
            emailInput.focus();
            return;
        }
        
        if (!validatePassword(password)) {
            showMessage('كلمة السر يجب أن تكون 6 أحرف على الأقل', 'error');
            passwordInput.focus();
            return;
        }
        
        // تغيير حالة الزر
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        loginBtn.disabled = true;
        
        try {
            // إرسال البيانات إلى الخادم (محاكاة)
            const result = await sendToServer({ email, password });
            
            if (result.success) {
                showMessage(`مرحباً ${result.user.name}! تم تسجيل الدخول بنجاح`, 'success');
                
                // هنا في التطبيق الحقيقي، يتم حفظ الجلسة وتوجيه المستخدم
                console.log('بيانات تسجيل الدخول:', {
                    email: email,
                    time: new Date().toLocaleString(),
                    userAgent: navigator.userAgent
                });
                
                // إعادة تعيين النموذج بعد تسجيل الدخول الناجح
                setTimeout(() => {
                    loginForm.reset();
                }, 2000);
            } else {
                showMessage(result.message, 'error');
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            showMessage('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            // استعادة حالة الزر
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    });
    
    // زر إنشاء حساب جديد
    document.querySelector('.create-account-btn').addEventListener('click', function() {
        showMessage('سيتم توجيهك إلى صفحة إنشاء حساب جديد', 'info');
    });
    
    // رابط نسيت كلمة السر
    document.querySelector('.forgot-password a').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('سيتم توجيهك إلى صفحة استعادة كلمة السر', 'info');
    });
    
    // زر الحصول على التطبيق
    document.querySelector('.get-app-btn').addEventListener('click', function() {
        showMessage('سيتم توجيهك إلى متجر التطبيقات لتحميل فيسبوك', 'info');
    });
    
    // تحسين تجربة المستخدم
    emailInput.addEventListener('focus', function() {
        this.style.borderColor = 'var(--facebook-blue)';
    });
    
    emailInput.addEventListener('blur', function() {
        this.style.borderColor = 'var(--facebook-border)';
    });
    
    passwordInput.addEventListener('focus', function() {
        this.style.borderColor = 'var(--facebook-blue)';
    });
    
    passwordInput.addEventListener('blur', function() {
        this.style.borderColor = 'var(--facebook-border)';
    });
    
    // رسالة ترحيبية في الكونسول
    console.log('%cتسجيل الدخول إلى فيسبوك', 'color: #1877f2; font-size: 16px; font-weight: bold;');
    console.log('%cهذه نسخة توضيحية لأغراض التعليم', 'color: #666; font-size: 12px;');
});
