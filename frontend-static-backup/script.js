document.addEventListener('DOMContentLoaded', function() {
    // API Configuration
    const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';
    const API_ENDPOINTS = {
        register: `${API_BASE_URL}/api/auth/register`,
        login: `${API_BASE_URL}/api/auth/login`,
        profile: `${API_BASE_URL}/api/user/profile`,
        health: `${API_BASE_URL}/health`
    };

    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleBtn = document.getElementById('toggleBtn');
    const toggleText = document.getElementById('toggleText');
    const passwordToggles = document.querySelectorAll('.toggle-password');
    const socialButtons = document.querySelectorAll('.btn-social');

    let isLoginMode = true;

    // Toggle between login and signup forms
    toggleBtn.addEventListener('click', function() {
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            // Switch to login
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
            toggleText.textContent = "Don't have an account?";
            toggleBtn.textContent = "Sign Up";
        } else {
            // Switch to signup
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
            toggleText.textContent = "Already have an account?";
            toggleBtn.textContent = "Sign In";
        }
    });

    // Password visibility toggle
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // Form validation and submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignup();
    });

    // Login form handling
    async function handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Basic validation
        if (!validateEmail(email)) {
            showError('loginEmail', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            showError('loginPassword', 'Password must be at least 6 characters');
            return;
        }

        // Show loading state
        const submitBtn = loginForm.querySelector('.btn-primary');
        submitBtn.classList.add('loading');

        try {
            const response = await fetch(API_ENDPOINTS.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('aige_token', data.token);
                    localStorage.setItem('aige_user', JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem('aige_token', data.token);
                    sessionStorage.setItem('aige_user', JSON.stringify(data.user));
                }

                showSuccessMessage(data.message || 'Login successful! Welcome back to AIGE.');
                
                // Redirect to dashboard or home page after successful login
                setTimeout(() => {
                    window.location.href = '/dashboard'; // Update this to your dashboard URL
                }, 2000);
            } else {
                showError('loginPassword', data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('loginPassword', 'Network error. Please check your connection.');
        } finally {
            submitBtn.classList.remove('loading');
        }
    }

    // Signup form handling
    async function handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Clear previous errors
        clearErrors();

        // Validation
        let hasErrors = false;

        if (name.trim().length < 2) {
            showError('signupName', 'Name must be at least 2 characters');
            hasErrors = true;
        }

        if (!validateEmail(email)) {
            showError('signupEmail', 'Please enter a valid email address');
            hasErrors = true;
        }

        if (password.length < 8) {
            showError('signupPassword', 'Password must be at least 8 characters');
            hasErrors = true;
        }

        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            hasErrors = true;
        }

        if (!agreeTerms) {
            showError('agreeTerms', 'You must agree to the terms and conditions');
            hasErrors = true;
        }

        if (hasErrors) return;

        // Show loading state
        const submitBtn = signupForm.querySelector('.btn-primary');
        submitBtn.classList.add('loading');

        try {
            const response = await fetch(API_ENDPOINTS.register, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem('aige_token', data.token);
                localStorage.setItem('aige_user', JSON.stringify(data.user));

                showSuccessMessage(data.message || 'Account created successfully! Welcome to AIGE.');
                
                // Redirect to dashboard or home page after successful registration
                setTimeout(() => {
                    window.location.href = '/dashboard'; // Update this to your dashboard URL
                }, 2000);
            } else {
                if (data.errors && data.errors.length > 0) {
                    data.errors.forEach(error => {
                        showError(error.param, error.msg);
                    });
                } else {
                    showError('signupEmail', data.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Signup error:', error);
            showError('signupEmail', 'Network error. Please check your connection.');
        } finally {
            submitBtn.classList.remove('loading');
        }
    }

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show error message
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const wrapper = field.closest('.input-wrapper');
        
        // Remove existing error message
        const existingError = wrapper.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error styling
        wrapper.classList.add('error');
        
        // Create and add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        wrapper.parentNode.appendChild(errorDiv);

        // Focus on the field
        field.focus();
    }

    // Clear all errors
    function clearErrors() {
        document.querySelectorAll('.input-wrapper.error').forEach(wrapper => {
            wrapper.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
    }

    // Show success message
    function showSuccessMessage(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
        `;
        
        notification.querySelector('i').style.cssText = `
            font-size: 1.2rem;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Social authentication handlers
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
            
            // Show loading state
            const originalContent = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            this.style.pointerEvents = 'none';
            
            // Simulate social auth (replace with real OAuth implementation)
            setTimeout(() => {
                this.innerHTML = originalContent;
                this.style.pointerEvents = 'auto';
                showSuccessMessage(`Connected with ${provider} successfully!`);
            }, 2000);
        });
    });

    // Input focus effects
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function() {
            clearErrors();
        });
    });

    // Real-time password strength indicator for signup
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            const password = this.value;
            const strength = getPasswordStrength(password);
            updatePasswordStrengthIndicator(strength);
        });
    }

    // Password strength calculation
    function getPasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score < 2) return 'weak';
        if (score < 4) return 'medium';
        return 'strong';
    }

    // Update password strength indicator
    function updatePasswordStrengthIndicator(strength) {
        // Remove existing indicator
        const existingIndicator = document.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (!signupPassword.value) return;

        const indicator = document.createElement('div');
        indicator.className = 'password-strength';
        
        const colors = {
            weak: '#e74c3c',
            medium: '#f39c12',
            strong: '#27ae60'
        };
        
        const messages = {
            weak: 'Weak password',
            medium: 'Medium strength',
            strong: 'Strong password'
        };
        
        indicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%'}; background-color: ${colors[strength]};"></div>
            </div>
            <span style="color: ${colors[strength]}; font-size: 0.8rem;">${messages[strength]}</span>
        `;
        
        indicator.style.cssText = `
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        indicator.querySelector('.strength-bar').style.cssText = `
            flex: 1;
            height: 4px;
            background: #e1e5e9;
            border-radius: 2px;
            overflow: hidden;
        `;
        
        indicator.querySelector('.strength-fill').style.cssText = `
            height: 100%;
            transition: all 0.3s ease;
        `;
        
        signupPassword.parentNode.parentNode.appendChild(indicator);
    }

    // Add some interactive animations
    document.querySelectorAll('.btn-primary, .btn-social').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (this.contains(ripple)) {
                    ripple.remove();
                }
            }, 600);
        });
    });

    // Add ripple animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Check if user is already logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('aige_token') || sessionStorage.getItem('aige_token');
        if (token) {
            // User is logged in, redirect to dashboard
            window.location.href = '/dashboard'; // Update this to your dashboard URL
        }
    }

    // Check auth status on page load
    checkAuthStatus();
}); 