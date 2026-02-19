// User Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserInfo();
    loadCurrentQueues();
    setupEventListeners();
});

function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
}

function loadUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:5000/api/dashboard/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.name) {
            document.querySelector('.user-info h3').textContent = data.name;
            document.querySelector('.user-info p').textContent = data.role === 'admin' ? 'Administrator' : 'User Account';
        }
    })
    .catch(error => {
        console.error('Error loading user info:', error);
        logout();
    });
}

function loadCurrentQueues() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const queuesList = document.querySelector('.queues-list');
    const queueCount = document.querySelector('.queue-count');

    // Show loading state
    queuesList.innerHTML = '<div class="loading">Loading your queues...</div>';

    fetch('http://localhost:5000/api/queues/my-joined', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.queues && data.queues.length > 0) {
            displayCurrentQueues(data.queues);
            queueCount.textContent = `${data.queues.length} active queues`;
        } else {
            queuesList.innerHTML = '<div class="no-queues"><i class="fas fa-info-circle"></i><h3>No Active Queues</h3><p>You haven\'t joined any queues yet. Search for a queue above to get started!</p></div>';
            queueCount.textContent = '0 active queues';
        }
    })
    .catch(error => {
        console.error('Error loading current queues:', error);
        queuesList.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i><h3>Error Loading Queues</h3><p>Please try refreshing the page.</p></div>';
    });
}

function displayCurrentQueues(queues) {
    const queuesList = document.querySelector('.queues-list');
    let html = '';

    queues.forEach(queue => {
        const iconClass = getQueueIcon(queue.category);
        const statusClass = queue.position === 1 ? 'active' : 'waiting';
        const statusText = queue.position === 1 ? 'Your Turn!' : `Position ${queue.position}`;

        html += `
            <div class="queue-card ${statusClass}">
                <div class="queue-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="queue-info">
                    <h3>${queue.name}</h3>
                    <p>${queue.description}</p>
                    <div class="queue-meta">
                        <span class="meta-item">
                            <i class="fas fa-users"></i>
                            ${queue.peopleAhead} people ahead
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-clock"></i>
                            ~${queue.estimatedWaitTime} min wait
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-hashtag"></i>
                            Position: ${queue.position}
                        </span>
                    </div>
                </div>
                <div class="queue-actions">
                    <span class="queue-status ${statusClass}">${statusText}</span>
                    <button class="btn-view" onclick="leaveQueue('${queue.id}', event)">
                        <i class="fas fa-sign-out-alt"></i>
                        Leave Queue
                    </button>
                </div>
            </div>
        `;
    });

    queuesList.innerHTML = html;
}

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
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

    // Logout functionality - add logout button to sidebar
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.className = 'nav-item logout-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
    logoutBtn.addEventListener('click', logout);
    sidebar.appendChild(logoutBtn);

    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const queueIdSearch = document.getElementById('queueIdSearch');

    searchBtn.addEventListener('click', function() {
        const searchTerm = queueIdSearch.value.trim();
        if (searchTerm) {
            performSearch(searchTerm);
        }
    });

    queueIdSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            if (searchTerm) {
                performSearch(searchTerm);
            }
        }
    });

    // Refresh current queues button
    const refreshBtn = document.querySelector('.btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadCurrentQueues();
            showNotification('Queues refreshed', 'info');
        });
    }
}

function performSearch(searchTerm) {
    const searchResults = document.getElementById('searchResults');
    const resultsGrid = document.getElementById('resultsGrid');
    const noResults = document.getElementById('noResults');

    // Show loading
    searchResults.style.display = 'block';
    resultsGrid.innerHTML = '<div class="loading">Searching...</div>';
    noResults.style.display = 'none';

    // Make API call to search for queue
    fetch(`http://localhost:5000/api/queues/search/${encodeURIComponent(searchTerm)}`)
    .then(response => response.json())
    .then(data => {
        if (data.queue) {
            // Display the found queue
            displaySearchResult(data.queue);
        } else {
            // Show no results
            resultsGrid.innerHTML = '';
            noResults.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Search error:', error);
        resultsGrid.innerHTML = '';
        noResults.style.display = 'block';
        // You could show an error message here
    });
}

function displaySearchResult(queue) {
    const resultsGrid = document.getElementById('resultsGrid');
    const noResults = document.getElementById('noResults');

    // Get category icon
    const iconClass = getQueueIcon(queue.category);

    // Format the queue data for display
    const resultHTML = `
        <div class="result-card">
            <div class="result-header">
                <h3>${queue.name}</h3>
                <span class="result-id">${queue.id}</span>
            </div>
            <p>${queue.description}</p>
            <div class="result-meta">
                <span><i class="fas ${iconClass}"></i> ${formatCategory(queue.category)}</span>
                <span><i class="fas fa-users"></i> ${queue.currentUsersCount}/${queue.capacity} users</span>
                <span><i class="fas fa-clock"></i> ~${queue.estimatedWaitTime} min wait</span>
                <span><i class="fas fa-hashtag"></i> Position: ${queue.position}</span>
            </div>
            <div class="result-status">
                <span class="status-badge ${queue.status}">${queue.status.charAt(0).toUpperCase() + queue.status.slice(1)}</span>
            </div>
            <button class="btn-join" onclick="joinQueue('${queue.id}', event)">
                <i class="fas fa-plus"></i>
                Join Queue
            </button>
        </div>
    `;

    resultsGrid.innerHTML = resultHTML;
    noResults.style.display = 'none';
}

function getQueueIcon(category) {
    const icons = {
        'health': 'fa-heartbeat',
        'education': 'fa-graduation-cap',
        'banking': 'fa-university',
        'government': 'fa-landmark',
        'retail': 'fa-shopping-bag',
        'other': 'fa-list-alt'
    };
    return icons[category] || 'fa-list-alt';
}

function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function joinQueue(queueId, event) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Show loading state
    const joinBtn = event.target;
    const originalText = joinBtn.innerHTML;
    joinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
    joinBtn.disabled = true;

    fetch(`http://localhost:5000/api/queues/${queueId}/join`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Successfully joined the queue') {
            showNotification(`Successfully joined the queue! Your position: ${data.position}`, 'success');
            // Refresh the current queues section
            loadCurrentQueues();
            // Hide search results after successful join
            document.getElementById('searchResults').style.display = 'none';
            document.getElementById('queueIdSearch').value = '';
        } else {
            showNotification(data.message || 'Failed to join queue', 'error');
        }
    })
    .catch(error => {
        console.error('Join queue error:', error);
        showNotification('Network error. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        joinBtn.innerHTML = originalText;
        joinBtn.disabled = false;
    });
}

function leaveQueue(queueId, event) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Show confirmation dialog
    if (!confirm('Are you sure you want to leave this queue?')) {
        return;
    }

    // Show loading state
    const leaveBtn = event.target;
    const originalText = leaveBtn.innerHTML;
    leaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Leaving...';
    leaveBtn.disabled = true;

    fetch(`http://localhost:5000/api/queues/${queueId}/leave`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Successfully left the queue') {
            showNotification('Successfully left the queue', 'success');
            // Refresh the current queues section
            loadCurrentQueues();
        } else {
            showNotification(data.message || 'Failed to leave queue', 'error');
        }
    })
    .catch(error => {
        console.error('Leave queue error:', error);
        showNotification('Network error. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        leaveBtn.innerHTML = originalText;
        leaveBtn.disabled = false;
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Notification function
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification-toast');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <div class="toast-message">
                    <h4>Success!</h4>
                    <p>Message</p>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
    }

    const icon = notification.querySelector('i');
    const title = notification.querySelector('h4');
    const text = notification.querySelector('p');

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

    notification.style.background = colors[type] || colors.success;
    icon.className = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-circle' :
                    type === 'warning' ? 'fas fa-exclamation-triangle' : 
                    'fas fa-info-circle';

    // Show notification
    notification.style.display = 'block';
    notification.style.animation = 'none';
    void notification.offsetWidth; // Trigger reflow
    notification.style.animation = 'slideInUp 0.5s ease, fadeOut 0.5s ease 3s forwards';

    // Hide after animation completes
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3500);
}