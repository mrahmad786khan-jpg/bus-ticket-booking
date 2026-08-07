// Get logged in user data from localStorage
function getLoggedInUser() {
  const userStr = localStorage.getItem('travelgo_user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.isLoggedIn ? user : null;
  } catch (e) {
    return null;
  }
}

// Check auth state before opening payment page
function checkAuthBeforePayment(targetPage = 'payment.html') {
  const user = getLoggedInUser();
  if (!user) {
    alert("Please Login or Sign Up to proceed with ticket payment.");
    window.location.href = `auth.html?redirect=${targetPage}`;
    return false;
  }
  return true;
}

// Clear session and logout user
function logoutUser() {
  localStorage.removeItem('travelgo_user');
  window.location.reload();
}

// Automatically update Login/Signup button in Navbar to show User Profile & Logout
function updateNavbarUI() {
  const user = getLoggedInUser();
  
  // Find navbar login button
  const navAuthBtn = document.querySelector('.nav-login-btn') || 
                     document.getElementById('nav-login-btn') || 
                     document.querySelector('a[href="auth.html"]');

  if (navAuthBtn && user) {
    navAuthBtn.outerHTML = `
      <div class="user-nav-profile" style="display: inline-flex; align-items: center; gap: 12px; background: rgba(15, 23, 42, 0.6); padding: 6px 14px; border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.3);">
        <span style="color: #38BDF8; font-weight: 600; font-size: 0.95rem; white-space: nowrap;">
          <i class="fa-solid fa-user-check" style="margin-right: 6px;"></i>${user.name}
        </span>
        <button onclick="logoutUser()" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); color: #FCA5A5; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s ease;">
          Logout
        </button>
      </div>
    `;
  }
}

// Run updateNavbarUI on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateNavbarUI);
} else {
  updateNavbarUI();
}