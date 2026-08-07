document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get('redirect') || 'index.html';

  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');

  // Custom Toast Popup Function
  function showToast(message, heading = "Success!", callback) {
    const toast = document.getElementById('custom-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMsg = document.getElementById('toast-message');

    if (toast && toastTitle && toastMsg) {
      toastTitle.innerText = heading;
      toastMsg.innerText = message;
      toast.classList.add('show');

      setTimeout(() => {
        toast.classList.remove('show');
        if (callback) callback();
      }, 1800); // 1.8 second tak alert dikhega fir redirect hoga
    } else {
      alert(message);
      if (callback) callback();
    }
  }

  // Switch to Login Tab
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.classList.add('active-form');
    signupForm.classList.remove('active-form');
    title.innerText = 'Welcome Back';
    subtitle.innerText = 'Log in to manage your bus bookings & fast checkout.';
  });

  // Switch to Signup Tab
  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupForm.classList.add('active-form');
    loginForm.classList.remove('active-form');
    title.innerText = 'Create Account';
    subtitle.innerText = 'Sign up once to book buses with zero hassle.';
  });

  // Handle Login Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    
    let userName = "Ahmad Hasan Khan";
    if (identifier && isNaN(identifier) && identifier.includes('@')) {
      userName = identifier.split('@')[0];
    }

    const userData = {
      isLoggedIn: true,
      name: userName,
      phone: "8081627647",
      email: identifier.includes('@') ? identifier : "ahmad@travelgo.com"
    };

    localStorage.setItem('travelgo_user', JSON.stringify(userData));

    // Custom Toast Alert Call
    showToast(`Welcome back, ${userData.name}!`, "Login Successful", () => {
      window.location.href = redirectTarget;
    });
  });

  // Handle Signup Submit
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const email = document.getElementById('signup-email').value.trim();

    const userData = {
      isLoggedIn: true,
      name: name || "Ahmad Hasan Khan",
      phone: phone || "8081627647",
      email: email
    };

    localStorage.setItem('travelgo_user', JSON.stringify(userData));

    // Custom Toast Alert Call
    showToast(`Welcome aboard, ${userData.name}!`, "Account Created", () => {
      window.location.href = redirectTarget;
    });
  });
});