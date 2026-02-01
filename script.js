document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    
    const demoUsers = [
        { email: "user@demo.com", password: "Demo123!", name: "مستخدم تجريبي" },
        { email: "test@example.com", password: "Test456!", name: "مستخدم اختبار" }
    ];
    
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
    
    function showAlert(message, type = 'success') {
        const alertContainer = document.getElementById('alertContainer');
        
        const existingAlert = alertContainer.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close"><i class="fas fa-times"></i></button>
        `;
        
        alertContainer.appendChild(alert);
        
        const closeBtn = alert.querySelector('.alert-close');
        closeBtn.addEventListener('click', function() {
            alert.remove();
        });
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email && emailRegex.test(email);
    }
    
    function validatePassword(password) {
        return password && password.length >= 6;
    }
    
    emailInput.addEventListener('input', function() {
        if (!validateEmail(this.value)) {
            this.style.borderColor = 'var(--fb-error)';
        } else {
            this.style.borderColor = 'var(--fb-border)';
        }
    });
    
    passwordInput.addEventListener('input', function() {
        if (!validatePassword(this.value)) {
            this.style.borderColor = 'var(--fb-error)';
        } else {
            this.style.borderColor = 'var(--fb-border)';
        }
    });
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = document.getElementById('remember');
        const csrfToken = document.getElementById('csrfToken').value;
        
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        
        if (!isEmailValid || !isPasswordValid) {
            showAlert('يرجى التحقق من صحة البيانات المدخلة', 'error');
            return;
        }
        
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        loginBtn.disabled = true;
        
        setTimeout(() => {
            const user = demoUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                showAlert(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`);
                
                console.log('Login attempt:', { 
                    email, 
                    password: '******', 
                    csrfToken 
                });
            } else {
                showAlert('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
            }
            
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }, 1500);
    });
    
    document.querySelector('.fb-create-account-btn').addEventListener('click', function() {
        showAlert('سيتم توجيهك إلى صفحة إنشاء حساب جديد');
    });
    
    document.querySelector('.forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        showAlert('سيتم توجيهك إلى صفحة استعادة كلمة المرور');
    });
});