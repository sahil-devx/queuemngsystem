// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const createQueueBtn = document.getElementById('createQueueBtn');
const createFirstQueueBtn = document.getElementById('createFirstQueue');
const createModal = document.getElementById('createModal');
const closeCreateModal = document.getElementById('closeCreateModal');
const cancelCreate = document.getElementById('cancelCreate');
const createQueueForm = document.getElementById('createQueueForm');
const queueNameInput = document.getElementById('queueName');
const queueDescriptionInput = document.getElementById('queueDescription');
const nameCount = document.getElementById('nameCount');
const descCount = document.getElementById('descCount');
const queueCapacity = document.getElementById('queueCapacity');
const capacityValue = document.getElementById('capacityValue');
const queuesList = document.getElementById('queuesList');
const emptyState = document.getElementById('emptyState');
const queueDetailsModal = document.getElementById('queueDetailsModal');
const closeDetailsModal = document.getElementById('closeDetailsModal');
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const successToast = document.getElementById('successToast');
const toastMessage = document.getElementById('toastMessage');
// const filterButtons = document.querySelectorAll('.filter-btn'); // Moved to setupEventListeners
const callNextBtn = document.getElementById('callNextBtn');
const pauseQueueBtn = document.getElementById('pauseQueueBtn');
const deleteQueueBtn = document.getElementById('deleteQueueBtn');

// Queues data (loaded from backend)
let queues = [];
let currentQueueId = null;
let queueToDelete = null;

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserInfo();
    loadQueuesFromBackend();
    setupEventListeners();
});

// Load user info from backend
function loadUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    fetch('http://localhost:5000/api/dashboard/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.name) {
            document.getElementById('adminName').textContent = data.name;
        }
    })
    .catch(error => {
        console.error('Error loading user info:', error);
        // If token is invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
}

function setupEventListeners() {
    // Get DOM elements that need to be accessed after DOM load
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Theme toggle
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

        localStorage.setItem('adminTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // Logout event listener
    document.querySelector('.nav-item.logout').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    // Character Counters
    queueNameInput.addEventListener('input', function() {
        const count = this.value.length;
        const max = this.getAttribute('maxlength');
        nameCount.textContent = `${count}/${max}`;
        nameCount.style.color = count > max * 0.8 ? '#ef4444' : 'var(--text-secondary)';
    });

    queueDescriptionInput.addEventListener('input', function() {
        const count = this.value.length;
        const max = this.getAttribute('maxlength');
        descCount.textContent = `${count}/${max}`;
        descCount.style.color = count > max * 0.8 ? '#ef4444' : 'var(--text-secondary)';
    });

    // Capacity Slider
    queueCapacity.addEventListener('input', function() {
        capacityValue.textContent = `${this.value} users`;
    });

    // Create Queue Modal
    createQueueBtn.addEventListener('click', openCreateModal);
    createFirstQueueBtn.addEventListener('click', openCreateModal);
    closeCreateModal.addEventListener('click', closeCreateModalFunc);
    cancelCreate.addEventListener('click', closeCreateModalFunc);

    // Create Queue Form Submission
    createQueueForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = queueNameInput.value.trim();
        const description = queueDescriptionInput.value.trim();
        const category = document.getElementById('queueCategory').value;
        const capacity = queueCapacity.value;

        if (!name || !description) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (description.length > 25) {
            showToast('Description must be 25 characters or less', 'error');
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('createQueueSubmit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        submitBtn.disabled = true;

        const token = localStorage.getItem('token');

        fetch('http://localhost:5000/api/queues/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name,
                description: description,
                category: category,
                capacity: capacity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Queue created successfully') {
                showToast('Queue created successfully!', 'success');
                closeCreateModalFunc();
                loadQueuesFromBackend(); // Refresh the queues list
            } else {
                showToast(data.message || 'Failed to create queue', 'error');
            }
        })
        .catch(error => {
            console.error('Create queue error:', error);
            showToast('Network error. Please try again.', 'error');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });

    // Queue Details Modal
    closeDetailsModal.addEventListener('click', closeQueueDetailsModal);

    // Delete Modal
    closeDeleteModal.addEventListener('click', closeDeleteModalFunc);
    cancelDelete.addEventListener('click', closeDeleteModalFunc);
    confirmDelete.addEventListener('click', function() {
        if (queueToDelete) {
            deleteQueue(queueToDelete);
        }
    });

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter queues
            updateQueuesList(filter);
        });
    });

    // Queue action buttons (these will be set up when queues are displayed)
    // Call next, pause, delete buttons are handled in the queue card generation
}

// Update queues list with optional filtering
function updateQueuesList(filter = 'all') {
    const queuesList = document.getElementById('queuesList');
    const emptyState = document.getElementById('emptyState');

    // Filter queues based on status
    let filteredQueues = queues;
    if (filter !== 'all') {
        filteredQueues = queues.filter(queue => queue.status === filter);
    }

    // Clear current list
    queuesList.innerHTML = '';

    if (filteredQueues.length === 0) {
        // Show empty state
        emptyState.style.display = 'block';
        queuesList.style.display = 'none';
        return;
    }

    // Hide empty state and show queues
    emptyState.style.display = 'none';
    queuesList.style.display = 'grid';

    // Render each queue
    filteredQueues.forEach(queue => {
        const queueCard = createQueueCard(queue);
        queuesList.appendChild(queueCard);
    });
}

// Create a queue card element
function createQueueCard(queue) {
    const card = document.createElement('div');
    card.className = `queue-card ${queue.status}`;
    card.dataset.queueId = queue.id;

    // Get category icon
    const iconClass = getQueueIcon(queue.category);

    // Format status for display
    const statusText = queue.status.charAt(0).toUpperCase() + queue.status.slice(1);

    // Calculate queue metrics
    const currentUsers = queue.users.length;
    const capacityPercent = Math.round((currentUsers / queue.capacity) * 100);

    card.innerHTML = `
        <div class="queue-header">
            <div class="queue-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="queue-info">
                <h3>${queue.name}</h3>
                <p>${queue.description}</p>
                <div class="queue-meta">
                    <span class="meta-item">
                        <i class="fas fa-users"></i>
                        ${currentUsers}/${queue.capacity} users
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-clock"></i>
                        ~${queue.averageWaitTime} min avg
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-check-circle"></i>
                        ${queue.served} served
                    </span>
                </div>
            </div>
            <div class="queue-status ${queue.status}">
                ${statusText}
            </div>
        </div>

        <div class="queue-capacity">
            <div class="capacity-bar">
                <div class="capacity-fill" style="width: ${capacityPercent}%"></div>
            </div>
            <span class="capacity-text">${capacityPercent}% full</span>
        </div>

        <div class="queue-actions">
            <button class="btn-view" onclick="viewQueueDetails('${queue.id}')">
                <i class="fas fa-eye"></i>
                View Details
            </button>
            <button class="btn-call-next" onclick="callNextUser('${queue.id}')" ${queue.status !== 'active' || currentUsers === 0 ? 'disabled' : ''}>
                <i class="fas fa-user-plus"></i>
                Call Next
            </button>
            <button class="btn-pause" onclick="toggleQueueStatus('${queue.id}')" ${queue.status === 'completed' ? 'disabled' : ''}>
                <i class="fas fa-${queue.status === 'active' ? 'pause' : 'play'}"></i>
                ${queue.status === 'active' ? 'Pause' : 'Resume'}
            </button>
            <button class="btn-delete" onclick="confirmDeleteQueue('${queue.id}')">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        </div>
    `;

    return card;
}

// Get queue icon based on category
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

// Queue action functions
function viewQueueDetails(queueId) {
    const queue = queues.find(q => q.id === queueId);
    if (!queue) return;

    // Populate and show queue details modal
    // This would show detailed information about the queue
    console.log('Viewing details for queue:', queue.name);
    // For now, just show a placeholder
    showToast('Queue details feature coming soon!', 'info');
}

function callNextUser(queueId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:5000/api/queues/${queueId}/call-next`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Next user called successfully') {
            showToast('Next user called successfully!', 'success');
            loadQueuesFromBackend(); // Refresh the queues
        } else {
            showToast(data.message || 'Failed to call next user', 'error');
        }
    })
    .catch(error => {
        console.error('Call next user error:', error);
        showToast('Network error. Please try again.', 'error');
    });
}

function toggleQueueStatus(queueId) {
    const queue = queues.find(q => q.id === queueId);
    if (!queue) return;

    const newStatus = queue.status === 'active' ? 'paused' : 'active';

    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:5000/api/queues/${queueId}/status`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Queue status updated') {
            showToast(`Queue ${newStatus === 'active' ? 'resumed' : 'paused'} successfully!`, 'success');
            loadQueuesFromBackend(); // Refresh the queues
        } else {
            showToast(data.message || 'Failed to update queue status', 'error');
        }
    })
    .catch(error => {
        console.error('Toggle queue status error:', error);
        showToast('Network error. Please try again.', 'error');
    });
}

function confirmDeleteQueue(queueId) {
    const queue = queues.find(q => q.id === queueId);
    if (!queue) return;

    queueToDelete = queueId;
    document.getElementById('deleteModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Load queues from backend
function loadQueuesFromBackend() {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:5000/api/queues/my-queues', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.queues) {
            queues = data.queues.map(queue => ({
                id: queue._id,
                name: queue.name,
                description: queue.description,
                category: queue.category,
                capacity: queue.capacity,
                status: queue.status,
                createdAt: queue.createdAt,
                users: queue.currentUsers || [],
                served: queue.servedUsers?.length || 0,
                averageWaitTime: queue.stats?.averageWaitTime || 0
            }));
            updateQueuesList();
        }
    })
    .catch(error => {
        console.error('Load queues error:', error);
    });
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Add logout event listener
document.querySelector('.nav-item.logout').addEventListener('click', function(e) {
    e.preventDefault();
    logout();
});

// Character Counters
queueNameInput.addEventListener('input', function() {
    const count = this.value.length;
    const max = this.getAttribute('maxlength');
    nameCount.textContent = `${count}/${max}`;
    nameCount.style.color = count > max * 0.8 ? '#ef4444' : 'var(--text-secondary)';
});

queueDescriptionInput.addEventListener('input', function() {
    const count = this.value.length;
    const max = this.getAttribute('maxlength');
    descCount.textContent = `${count}/${max}`;
    descCount.style.color = count > max * 0.8 ? '#ef4444' : 'var(--text-secondary)';
});

// Capacity Slider
queueCapacity.addEventListener('input', function() {
    capacityValue.textContent = `${this.value} users`;
});

// Create Queue Modal
createQueueBtn.addEventListener('click', openCreateModal);
createFirstQueueBtn.addEventListener('click', openCreateModal);

function openCreateModal() {
    createModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    queueNameInput.focus();
}

closeCreateModal.addEventListener('click', closeCreateModalFunc);
cancelCreate.addEventListener('click', closeCreateModalFunc);

function closeCreateModalFunc() {
    createModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    createQueueForm.reset();
    nameCount.textContent = '0/50';
    descCount.textContent = '0/25';
    capacityValue.textContent = '50 users';
}

// Create Queue Form Submission
createQueueForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = queueNameInput.value.trim();
    const description = queueDescriptionInput.value.trim();
    const category = document.getElementById('queueCategory').value;
    const capacity = queueCapacity.value;

    if (!name || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (description.length > 25) {
        showToast('Description must be 25 characters or less', 'error');
        return;
    }

    // Show loading state
    const submitBtn = createQueueForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    submitBtn.disabled = true;

    // Send to backend
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/queues/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            description,
            category,
            capacity: parseInt(capacity)
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Queue created successfully') {
            closeCreateModalFunc();
            showToast(`Queue "${name}" created successfully!`);

            // Reload queues from backend
            loadQueuesFromBackend();
            updateStats();
        } else {
            showToast(data.message || 'Failed to create queue', 'error');
        }
    })
    .catch(error => {
        console.error('Create queue error:', error);
        showToast('Network error. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
});

function generateQueueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'Q-';
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Update Queues List
function updateQueuesList() {
    if (queues.length === 0) {
        emptyState.style.display = 'block';
        queuesList.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    queuesList.style.display = 'block';
    queuesList.innerHTML = '';
    
    // Sort by creation date (newest first)
    const sortedQueues = [...queues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    sortedQueues.forEach(queue => {
        const queueItem = document.createElement('div');
        queueItem.className = 'queue-item';
        queueItem.setAttribute('data-id', queue.id);
        
        const iconClass = getQueueIcon(queue.category);
        const statusClass = queue.status === 'active' ? 'active' : 'paused';
        const statusText = queue.status === 'active' ? 'Active' : 'Paused';
        
        queueItem.innerHTML = `
            <div class="queue-main">
                <div class="queue-icon-small">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="queue-info">
                    <div class="queue-name">
                        ${queue.name}
                        <span class="queue-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="queue-meta">
                        <span>
                            <i class="fas fa-users"></i>
                            ${queue.users.length} users
                        </span>
                        <span>
                            <i class="fas fa-clock"></i>
                            ${queue.averageWaitTime || 0} min avg
                        </span>
                        <span>
                            <i class="fas fa-calendar"></i>
                            ${formatDate(queue.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
            <div class="queue-actions-mini">
                <button class="btn-action-mini view" data-id="${queue.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action-mini delete" data-id="${queue.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        queuesList.appendChild(queueItem);
    });
    
    // Add event listeners to queue items
    document.querySelectorAll('.queue-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-action-mini')) {
                const queueId = this.getAttribute('data-id');
                viewQueueDetails(queueId);
            }
        });
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.btn-action-mini.view').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const queueId = this.getAttribute('data-id');
            viewQueueDetails(queueId);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-action-mini.delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const queueId = this.getAttribute('data-id');
            confirmDeleteQueue(queueId);
        });
    });
}

function getQueueIcon(category) {
    const icons = {
        health: 'fa-heartbeat',
        education: 'fa-graduation-cap',
        banking: 'fa-university',
        government: 'fa-landmark',
        retail: 'fa-shopping-cart',
        other: 'fa-list-alt'
    };
    return icons[category] || 'fa-list-alt';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
}

// View Queue Details
function viewQueueDetails(queueId) {
    const queue = queues.find(q => q.id === queueId);
    if (!queue) return;
    
    currentQueueId = queueId;
    
    // Update modal content
    document.getElementById('detailQueueName').textContent = queue.name;
    document.getElementById('detailQueueDescription').textContent = queue.description;
    document.getElementById('detailQueueId').textContent = `ID: ${queue.id}`;
    document.getElementById('detailQueueStatus').textContent = queue.status === 'active' ? 'Active' : 'Paused';
    document.getElementById('detailQueueStatus').className = `queue-status ${queue.status}`;
    document.getElementById('detailQueueDate').textContent = `Created: ${formatDate(queue.createdAt)}`;
    document.getElementById('totalUsers').textContent = queue.users.length + queue.served;
    document.getElementById('waitingUsers').textContent = queue.users.length;
    document.getElementById('servedUsers').textContent = queue.served;
    document.getElementById('avgWaitTime').textContent = `${queue.averageWaitTime || 0} min`;
    document.getElementById('userCount').textContent = `${queue.users.length} users`;
    
    // Update users list
    updateUsersList(queue.users);
    
    // Update button states
    pauseQueueBtn.innerHTML = queue.status === 'active' 
        ? '<i class="fas fa-pause"></i> Pause Queue'
        : '<i class="fas fa-play"></i> Resume Queue';
    
    // Show modal
    queueDetailsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function updateUsersList(users) {
    const usersList = document.getElementById('usersList');
    const emptyUsers = document.getElementById('emptyUsers');
    
    if (users.length === 0) {
        usersList.style.display = 'none';
        emptyUsers.style.display = 'block';
        return;
    }
    
    usersList.style.display = 'block';
    emptyUsers.style.display = 'none';
    usersList.innerHTML = '';
    
    // Sort users by join time (oldest first)
    const sortedUsers = [...users].sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
    
    sortedUsers.forEach((user, index) => {
        const userItem = document.createElement('div');
        userItem.className = `user-item ${index === 0 ? 'current' : ''}`;
        
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        userItem.innerHTML = `
            <div class="user-main">
                <div class="user-avatar">${initials}</div>
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>Joined ${formatTime(user.joinedAt)}</p>
                </div>
            </div>
            <div class="user-position">#${index + 1}</div>
        `;
        
        usersList.appendChild(userItem);
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
}

// Close Queue Details Modal
closeDetailsModal.addEventListener('click', closeQueueDetailsModal);

function closeQueueDetailsModal() {
    queueDetailsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentQueueId = null;
}

// Queue Actions
callNextBtn.addEventListener('click', function() {
    if (!currentQueueId) return;
    
    const queue = queues.find(q => q.id === currentQueueId);
    if (!queue || queue.users.length === 0) {
        showToast('No users in queue to call', 'warning');
        return;
    }
    
    const nextUser = queue.users.shift();
    queue.served++;
    
    // Update average wait time (simplified calculation)
    const waitTime = Math.floor(Math.random() * 30) + 5;
    queue.averageWaitTime = queue.averageWaitTime 
        ? (queue.averageWaitTime * 0.8 + waitTime * 0.2)
        : waitTime;
    
    saveQueues();
    updateQueuesList();
    viewQueueDetails(currentQueueId);
    
    showToast(`Called next user: ${nextUser.name}`);
});

pauseQueueBtn.addEventListener('click', function() {
    if (!currentQueueId) return;
    
    const queue = queues.find(q => q.id === currentQueueId);
    if (!queue) return;
    
    queue.status = queue.status === 'active' ? 'paused' : 'active';
    
    saveQueues();
    updateQueuesList();
    viewQueueDetails(currentQueueId);
    
    showToast(`Queue ${queue.status === 'paused' ? 'paused' : 'resumed'}`);
});

deleteQueueBtn.addEventListener('click', function() {
    if (!currentQueueId) return;
    
    confirmDeleteQueue(currentQueueId);
});

// Delete Queue Confirmation
function confirmDeleteQueue(queueId) {
    const queue = queues.find(q => q.id === queueId);
    if (!queue) return;
    
    queueToDelete = queueId;
    document.getElementById('deleteMessage').textContent = 
        `Are you sure you want to delete "${queue.name}"? This action cannot be undone. All ${queue.users.length} users in the queue will be removed.`;
    
    deleteModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Reset confirmation checkbox
    document.getElementById('confirmDelete').checked = false;
    confirmDeleteBtn.disabled = true;
}

closeDeleteModal.addEventListener('click', closeDeleteModalFunc);
cancelDelete.addEventListener('click', closeDeleteModalFunc);

function closeDeleteModalFunc() {
    deleteModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    queueToDelete = null;
}

// Confirm delete checkbox
document.getElementById('confirmDelete').addEventListener('change', function() {
    confirmDeleteBtn.disabled = !this.checked;
});

// Delete queue button
confirmDeleteBtn.addEventListener('click', function() {
    if (!queueToDelete) return;
    
    const queueIndex = queues.findIndex(q => q.id === queueToDelete);
    if (queueIndex === -1) return;
    
    const queueName = queues[queueIndex].name;
    queues.splice(queueIndex, 1);
    
    saveQueues();
    updateQueuesList();
    updateStats();
    closeDeleteModalFunc();
    closeQueueDetailsModal();
    
    showToast(`Queue "${queueName}" deleted successfully`);
});

// Filter Queues
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.textContent.toLowerCase();
        // In a real app, you would filter the queues array here
        // For now, we'll just show all queues
        updateQueuesList();
    });
});

// Update Statistics
function updateStats() {
    const activeQueues = queues.filter(q => q.status === 'active').length;
    const totalUsers = queues.reduce((sum, q) => sum + q.users.length, 0);
    const totalServed = queues.reduce((sum, q) => sum + q.served, 0);
    
    // Update sidebar stats
    document.querySelector('.admin-stats .stat-number:nth-child(1)').textContent = activeQueues;
    document.querySelector('.admin-stats .stat-number:nth-child(2)').textContent = totalUsers;
    document.querySelector('.admin-stats .stat-number:nth-child(3)').textContent = totalServed;
    
    // Update main stats (simplified)
    const avgWaitTime = queues.length > 0 
        ? Math.round(queues.reduce((sum, q) => sum + (q.averageWaitTime || 0), 0) / queues.length)
        : 0;
    
    // These would normally come from backend analytics
    // For demo, we'll use simulated data
}

// Save queues to localStorage
function saveQueues() {
    localStorage.setItem('adminQueues', JSON.stringify(queues));
}

// Show Toast Notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Update toast styling based on type
    if (type === 'error') {
        successToast.style.background = 'var(--error-color)';
        successToast.querySelector('i').className = 'fas fa-exclamation-circle';
        successToast.querySelector('h4').textContent = 'Error!';
    } else if (type === 'warning') {
        successToast.style.background = 'var(--warning-color)';
        successToast.querySelector('i').className = 'fas fa-exclamation-triangle';
        successToast.querySelector('h4').textContent = 'Warning!';
    } else {
        successToast.style.background = 'var(--success-color)';
        successToast.querySelector('i').className = 'fas fa-check-circle';
        successToast.querySelector('h4').textContent = 'Success!';
    }
    
    // Show toast with animation
    successToast.style.display = 'block';
    successToast.style.animation = 'none';
    void successToast.offsetWidth; // Trigger reflow
    successToast.style.animation = 'slideInUp 0.5s ease, fadeOut 0.5s ease 2.5s forwards';
    
    // Hide after animation completes
    setTimeout(() => {
        successToast.style.display = 'none';
    }, 3000);
}

// Sample data initialization (for demo)
if (queues.length === 0) {
    queues = [
        {
            id: 'Q-7A9B',
            name: 'Doctor Consultation',
            description: 'General physician appointments',
            category: 'health',
            capacity: 50,
            status: 'active',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            users: [
                { name: 'John Smith', joinedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
                { name: 'Sarah Johnson', joinedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
                { name: 'Mike Wilson', joinedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
            ],
            served: 12,
            averageWaitTime: 24
        },
        {
            id: 'Q-3C8D',
            name: 'Student Registration',
            description: 'Fall semester enrollment',
            category: 'education',
            capacity: 100,
            status: 'active',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            users: [
                { name: 'Emma Davis', joinedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
                { name: 'James Brown', joinedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString() }
            ],
            served: 8,
            averageWaitTime: 18
        },
        {
            id: 'Q-5E2F',
            name: 'Bank Teller Service',
            description: 'Cash transactions and inquiries',
            category: 'banking',
            capacity: 30,
            status: 'paused',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            users: [],
            served: 5,
            averageWaitTime: 15
        }
    ];
    saveQueues();
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === createModal) closeCreateModalFunc();
    if (e.target === queueDetailsModal) closeQueueDetailsModal();
    if (e.target === deleteModal) closeDeleteModalFunc();
});

// ESC key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (createModal.style.display === 'flex') closeCreateModalFunc();
        if (queueDetailsModal.style.display === 'flex') closeQueueDetailsModal();
        if (deleteModal.style.display === 'flex') closeDeleteModalFunc();
    }
});