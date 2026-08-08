document.addEventListener('DOMContentLoaded', () => {
  // HTML me ID na hone par class-based fallback selector
  const loginBtn = document.getElementById('nav-login-btn') || document.querySelector('.btn-login');
  
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('safarsathi_user') || localStorage.getItem('travelgo_user'));
  } catch(e) {}

  if (loginBtn) {
    if (user && (user.name || user.email)) {
      const displayName = user.name || user.email.split('@')[0];

      loginBtn.style.display = 'inline-flex';
      loginBtn.style.alignItems = 'center';
      loginBtn.style.gap = '10px';
      loginBtn.style.padding = '8px 16px';
      loginBtn.style.textTransform = 'uppercase';

      loginBtn.innerHTML = `
        <span>👤 ${displayName}</span>
        <span id="logout-btn" style="
          background: rgba(255, 255, 255, 0.2);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-left: 5px;
          cursor: pointer;
          transition: background 0.2s ease;
        " title="Click to Logout">Logout</span>
      `;
      loginBtn.href = "javascript:void(0);";

      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('mouseenter', () => {
          logoutBtn.style.background = 'rgba(239, 68, 68, 0.8)';
        });
        logoutBtn.addEventListener('mouseleave', () => {
          logoutBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          localStorage.removeItem('safarsathi_user');
          localStorage.removeItem('travelgo_user');
          window.location.reload();
        });
      }
    } else {
      // Login na hone par auth.html par redirect ensure karega
      loginBtn.innerText = "Login / Sign Up";
      loginBtn.href = "auth.html";
    }
  }
});