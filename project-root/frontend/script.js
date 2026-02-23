// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const roleToggle = document.getElementById('roleToggle');
const roleBadge = document.getElementById('roleBadge');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const loginFormElement = document.getElementById('loginForm');
const signupFormElement = document.getElementById('signupForm');
const notificationToast = document.getElementById('notificationToast');
const passwordStrengthValue = document.getElementById('strengthValue');
const strengthBar = document.querySelector('.strength-bar');

// Theme Toggle
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    
    const icon = this.querySelector('i');
    const span = this.querySelector('span');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        span.textContent = 'Light Mode';
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        span.textContent = 'Dark Mode';
    }
});

// Role Toggle (User/Admin)
roleToggle.addEventListener('change', function() {
    const isAdmin = this.checked;
    
    // Update role badge
    if (isAdmin) {
        roleBadge.innerHTML = '<i class="fas fa-user-cog"></i> Admin Mode';
        roleBadge.style.background = 'linear-gradient(135deg, #f72585 0%, #b5179e 100%)';
        
        // Update role labels
        document.querySelectorAll('.role-label').forEach(label => {
            label.classList.toggle('active', label.textContent === 'Admin');
        });
        
        // Add admin-specific features
        addAdminFeatures();
    } else {
        roleBadge.innerHTML = '<i class="fas fa-user"></i> User Mode';
        roleBadge.style.background = 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)';
        
        // Update role labels
        document.querySelectorAll('.role-label').forEach(label => {
            label.classList.toggle('active', label.textContent === 'User');
        });
        
        // Remove admin-specific features
        removeAdminFeatures();
    }
    
    // Show role change notification
    showNotification(`${isAdmin ? 'Admin' : 'User'} mode activated`, isAdmin ? 'warning' : 'info');
});

// Add admin-specific features to forms
function addAdminFeatures() {
    // Add admin code field to login form
    if (!document.getElementById('adminCode')) {
        const adminField = document.createElement('div');
        adminField.className = 'input-group';
        adminField.innerHTML = `
            <label for="adminCode">Admin Access Code</label>
            <div class="input-with-icon">
                <i class="fas fa-key"></i>
                <input type="password" id="adminCode" placeholder="Enter admin access code">
            </div>
        `;
        
        const loginFormFields = loginFormElement.querySelector('.input-group:last-of-type');
        loginFormFields.parentNode.insertBefore(adminField, loginFormFields.nextSibling);
    }
    
    // Add admin checkbox to signup form
    if (!document.getElementById('adminRequest')) {
        const termsContainer = document.querySelector('.terms-agreement');
        const adminRequest = document.createElement('div');
        adminRequest.className = 'admin-request';
        adminRequest.innerHTML = `
            <input type="checkbox" id="adminRequest">
            <label for="adminRequest">Request administrator access (requires approval)</label>
        `;
        termsContainer.parentNode.insertBefore(adminRequest, termsContainer.nextSibling);
    }
}

// Remove admin-specific features
function removeAdminFeatures() {
    const adminCodeField = document.getElementById('adminCode');
    const adminRequestField = document.querySelector('.admin-request');
    
    if (adminCodeField) {
        adminCodeField.parentElement.parentElement.remove();
    }
    
    if (adminRequestField) {
        adminRequestField.remove();
    }
}

// Form Switching
switchToSignup.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
    updateFormForRole();
});

switchToLogin.addEventListener('click', function(e) {
    e.preventDefault();
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
    updateFormForRole();
});

// Update form based on current role
function updateFormForRole() {
    const isAdmin = roleToggle.checked;
    
    if (isAdmin) {
        addAdminFeatures();
    }
}

// Password Strength Checker
document.getElementById('signupPassword').addEventListener('input', function() {
    const password = this.value;
    const strength = calculatePasswordStrength(password);
    
    // Update strength bar
    const strengthBarAfter = strengthBar.querySelector('::after') || strengthBar;
    strengthBarAfter.style.width = `${strength.percentage}%`;
    strengthBarAfter.style.backgroundColor = strength.color;
    
    // Update strength text
    passwordStrengthValue.textContent = strength.text;
    passwordStrengthValue.style.color = strength.color;
});

function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    
    // Determine strength level
    if (score >= 80) {
        return { percentage: 100, color: '#10b981', text: 'Strong' };
    } else if (score >= 60) {
        return { percentage: 75, color: '#f59e0b', text: 'Good' };
    } else if (score >= 40) {
        return { percentage: 50, color: '#f59e0b', text: 'Fair' };
    } else {
        return { percentage: 30, color: '#ef4444', text: 'Weak' };
    }
}

// Password Visibility Toggle
function setupPasswordToggle(inputId, buttonId) {
    const button = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    
    if (button && input) {
        button.addEventListener('click', function() {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
}

// Setup password toggles
setupPasswordToggle('loginPassword', 'showLoginPassword');
setupPasswordToggle('signupPassword', 'showSignupPassword');
setupPasswordToggle('signupConfirmPassword', 'showSignupConfirmPassword');

// Form Validation
function validateSignupForm() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    const isAdmin = roleToggle.checked;
    const adminRequest = document.getElementById('adminRequest');
    
    // Name validation
    if (name.length < 2) {
        showNotification('Please enter a valid name (at least 2 characters)', 'error');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    // Password validation
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return false;
    }
    
    // Password confirmation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return false;
    }
    
    // Terms acceptance
    if (!acceptTerms) {
        showNotification('You must accept the Terms of Service and Privacy Policy', 'error');
        return false;
    }
    
    // Admin request validation (if applicable)
    if (isAdmin && adminRequest && !adminRequest.checked) {
        showNotification('Administrator access requires explicit request approval', 'error');
        return false;
    }
    
    return true;
}

// Show Notification
function showNotification(message, type = 'success') {
    const toast = notificationToast;
    const icon = toast.querySelector('i');
    const title = toast.querySelector('h4');
    const text = toast.querySelector('p');
    
    // Set content
    title.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    text.textContent = message;
    
    // Set styling based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.style.background = colors[type] || colors.success;
    icon.className = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-circle' :
                    type === 'warning' ? 'fas fa-exclamation-triangle' : 
                    'fas fa-info-circle';
    
    // Show toast
    toast.style.display = 'block';
    toast.style.animation = 'none';
    void toast.offsetWidth; // Trigger reflow
    toast.style.animation = 'slideInUp 0.5s ease, fadeOut 0.5s ease 2.5s forwards';
    
    // Hide after animation completes
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Form Submission Handlers
loginFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const isAdmin = roleToggle.checked;
    const adminCode = isAdmin ? document.getElementById('adminCode')?.value : null;
    
    // Simple validation
    if (!email || !password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Admin code validation (if in admin mode)
    if (isAdmin && adminCode && adminCode.length < 6) {
        showNotification('Admin access code must be at least 6 characters', 'error');
        return;
    }
    
    // Make API call to backend
    showNotification('Signing in...', 'info');
    
    fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            showNotification('Signin successful!', 'success');
            loginFormElement.reset();
            
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect based on role
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'user.html';
            }
            
            // Reset to user mode after login for security
            if (isAdmin) {
                roleToggle.checked = false;
                roleToggle.dispatchEvent(new Event('change'));
            }
        } else {
            showNotification(data.message || 'Signin failed', 'error');
        }
    })
    .catch(error => {
        console.error('Signin error:', error);
        showNotification('Network error. Please check if backend is running.', 'error');
    });
});

signupFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateSignupForm()) {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const isAdmin = roleToggle.checked;
        const adminRequest = document.getElementById('adminRequest');
        
        // Determine role
        let role = 'user';
        if (isAdmin && adminRequest && adminRequest.checked) {
            role = 'admin';
        }
        
        // Show processing message
        showNotification('Creating account...', 'info');
        
        // Make API call to backend
        fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, name, role })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                showNotification('Account created successfully!', 'success');
                signupFormElement.reset();
                
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Switch to login form
                signupForm.classList.remove('active');
                loginForm.classList.add('active');
                
                // Auto-fill login email
                document.getElementById('loginEmail').value = email;
                
                // Reset to user mode after signup
                if (isAdmin) {
                    roleToggle.checked = false;
                    roleToggle.dispatchEvent(new Event('change'));
                }

                // Redirect based on role
                if (data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'user.html';
                }
            } else {
                showNotification(data.message || 'Signup failed', 'error');
            }
        })
        .catch(error => {
            console.error('Signup error:', error);
            showNotification('Network error. Please check if backend is running.', 'error');
        });
    }
});

// Social Login Handlers
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', function() {
        const platform = this.classList.contains('google') ? 'Google' : 'GitHub';
        const isAdmin = roleToggle.checked;
        
        showNotification(`Connecting with ${platform} as ${isAdmin ? 'Admin' : 'User'}...`, 'info');
    });
});

// Forgot Password Link
document.querySelector('.forgot-link').addEventListener('click', function(e) {
    e.preventDefault();
    showNotification('Password reset link sent to your email', 'info');
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    
    // Set initial theme icon
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeText.textContent = 'Light Mode';
    }
    
    // Trigger initial role setup
    roleToggle.dispatchEvent(new Event('change'));
});