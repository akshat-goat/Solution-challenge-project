// API endpoint
const API_BASE_URL = 'http://localhost:5000/api';

// Page navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Show correct page
        const pageName = this.getAttribute('data-page');
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        document.getElementById(`${pageName}-page`).style.display = 'block';
        
        // Load data for the page
        if (pageName === 'dashboard') loadDashboard();
        if (pageName === 'content') loadContent();
        if (pageName === 'contracts') loadContracts();
        if (pageName === 'rights') loadRights();
        if (pageName === 'alerts') loadAlerts();
    });
});

// Initial load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    initializeFormHandlers();
    prepareStaticData();
});

// Initialize territories and platforms data
function prepareStaticData() {
    // You would typically fetch these from the API, but for simplicity we're using static data
    window.territories = [
        { territory_id: 1, territory_name: 'United States', territory_code: 'US' },
        { territory_id: 2, territory_name: 'Europe', territory_code: 'EU' },
        { territory_id: 3, territory_name: 'Asia', territory_code: 'AS' },
        { territory_id: 4, territory_name: 'Global', territory_code: 'GL' }
    ];
    
    window.platforms = [
        { platform_id: 1, platform_name: 'Web Streaming', platform_type: 'Web' },
        { platform_id: 2, platform_name: 'Mobile App', platform_type: 'Mobile' },
        { platform_id: 3, platform_name: 'Smart TV', platform_type: 'TV' },
        { platform_id: 4, platform_name: 'All Platforms', platform_type: 'All' }
    ];
}

// Load Dashboard Data
function loadDashboard() {
    // Load counts
    fetch(`${API_BASE_URL}/content`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('content-count').textContent = data.length;
        });
    
    fetch(`${API_BASE_URL}/contracts`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('contract-count').textContent = data.length;
        });
    
    fetch(`${API_BASE_URL}/alerts`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('alert-count').textContent = data.length;
            
            // Display recent alerts
            const alertList = document.getElementById('alert-list');
            alertList.innerHTML = '';
            
            data.slice(0, 5).forEach(alert => {
                const alertItem = document.createElement('a');
                alertItem.href = '#';
                alertItem.className = 'list-group-item list-group-item-action';
                
                let severityClass = '';
                if (alert.severity === 'High') severityClass = 'text-danger';
                else if (alert.severity === 'Medium') severityClass = 'text-warning';
                
                alertItem.innerHTML = `
                    <div class="d-flex w-100 