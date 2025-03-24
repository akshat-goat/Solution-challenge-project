<div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1 ${severityClass}">${alert.alert_type}</h5>
                        <small>${new Date(alert.created_at).toLocaleDateString()}</small>
                    </div>
                    <p class="mb-1">${alert.alert_message}</p>
                    <small>Content: ${alert.content_title}</small>
                `;
                
                alertList.appendChild(alertItem);
            });
            
            if (data.length === 0) {
                alertList.innerHTML = '<p class="text-muted p-3">No alerts found.</p>';
            }
        });
    
    // Load upcoming expirations
    fetch(`${API_BASE_URL}/rights`)
        .then(response => response.json())
        .then(data => {
            const today = new Date();
            const thirtyDaysLater = new Date();
            thirtyDaysLater.setDate(today.getDate() + 30);
            
            // Filter rights expiring in the next 30 days
            const expiringRights = data.filter(right => {
                const endDate = new Date(right.end_date);
                return endDate >= today && endDate <= thirtyDaysLater;
            });
            
            // Sort by expiration date (ascending)
            expiringRights.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
            
            // Display upcoming expirations
            const expirationList = document.getElementById('expiration-list');
            expirationList.innerHTML = '';
            
            expiringRights.slice(0, 5).forEach(right => {
                const expirationItem = document.createElement('a');
                expirationItem.href = '#';
                expirationItem.className = 'list-group-item list-group-item-action';
                
                const daysRemaining = Math.ceil((new Date(right.end_date) - today) / (1000 * 60 * 60 * 24));
                
                expirationItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${right.content_title}</h5>
                        <small class="text-danger">${daysRemaining} days left</small>
                    </div>
                    <p class="mb-1">Expires: ${new Date(right.end_date).toLocaleDateString()}</p>
                    <small>${right.territory_name} / ${right.platform_name}</small>
                `;
                
                expirationList.appendChild(expirationItem);
            });
            
            if (expiringRights.length === 0) {
                expirationList.innerHTML = '<p class="text-muted p-3">No rights expiring soon.</p>';
            }
        });
}

// Load Content Data
function loadContent() {
    fetch(`${API_BASE_URL}/content`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('content-table-body');
            tableBody.innerHTML = '';
            
            data.forEach(content => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${content.title}</td>
                    <td>${content.content_type}</td>
                    <td>${content.release_date || 'N/A'}</td>
                    <td>${content.duration ? content.duration + ' min' : 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-content" data-id="${content.content_id}">
                            View
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            if (data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">No content found. Add your first content item!</td>
                    </tr>
                `;
            }
        });
}

// Load Contracts Data
function loadContracts() {
    fetch(`${API_BASE_URL}/contracts`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('contract-table-body');
            tableBody.innerHTML = '';
            
            data.forEach(contract => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${contract.contract_name}</td>
                    <td>${contract.provider_name}</td>
                    <td>${contract.start_date}</td>
                    <td>${contract.end_date}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-contract" data-id="${contract.contract_id}">
                            View
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            if (data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">No contracts found. Add your first contract!</td>
                    </tr>
                `;
            }
        });
}

// Load Rights Data
function loadRights() {
    fetch(`${API_BASE_URL}/rights`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('rights-table-body');
            tableBody.innerHTML = '';
            
            data.forEach(right => {
                const today = new Date();
                const endDate = new Date(right.end_date);
                
                let status = 'Active';
                let statusClass = 'text-success';
                
                if (endDate < today) {
                    status = 'Expired';
                    statusClass = 'text-danger';
                } else if ((endDate - today) / (1000 * 60 * 60 * 24) <= 30) {
                    status = 'Expiring Soon';
                    statusClass = 'text-warning';
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${right.content_title}</td>
                    <td>${right.contract_name}</td>
                    <td>${right.territory_name}</td>
                    <td>${right.platform_name}</td>
                    <td>${right.start_date}</td>
                    <td>${right.end_date}</td>
                    <td class="${statusClass}">${status}</td>
                `;
                tableBody.appendChild(row);
            });
            
            if (data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">No rights defined. Add your first content rights!</td>
                    </tr>
                `;
            }
        });
        
    // Load content and contract dropdowns for the Add Rights form
    fetch(`${API_BASE_URL}/content`)
        .then(response => response.json())
        .then(data => {
            const contentSelect = document.getElementById('rightsContent');
            contentSelect.innerHTML = '';
            
            data.forEach(content => {
                const option = document.createElement('option');
                option.value = content.content_id;
                option.textContent = content.title;
                contentSelect.appendChild(option);
            });
        });
        
    fetch(`${API_BASE_URL}/contracts`)
        .then(response => response.json())
        .then(data => {
            const contractSelect = document.getElementById('rightsContract');
            contractSelect.innerHTML = '';
            
            data.forEach(contract => {
                const option = document.createElement('option');
                option.value = contract.contract_id;
                option.textContent = contract.contract_name;
                contractSelect.appendChild(option);
            });
        });
}

// Load Alerts Data
function loadAlerts() {
    fetch(`${API_BASE_URL}/alerts`)
        .then(response => response.json())
        .then(data => {
            const alertsList = document.getElementById('alerts-list');
            alertsList.innerHTML = '';
            
            data.forEach(alert => {
                const alertItem = document.createElement('div');
                alertItem.className = 'list-group-item';
                
                let severityClass = '';
                if (alert.severity === 'High') severityClass = 'border-danger';
                else if (alert.severity === 'Medium') severityClass = 'border-warning';
                
                alertItem.classList.add(severityClass);
                
                alertItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${alert.alert_type} Alert</h5>
                        <span class="badge ${alert.severity === 'High' ? 'bg-danger' : 'bg-warning'}">${alert.severity}</span>
                    </div>
                    <p class="mb-1">${alert.alert_message}</p>
                    <small>Content: ${alert.content_title}</small>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-success resolve-alert" data-id="${alert.alert_id}">
                            Mark Resolved
                        </button>
                    </div>
                `;
                
                alertsList.appendChild(alertItem);
            });
            
            if (data.length === 0) {
                alertsList.innerHTML = '<div class="alert alert-success">No compliance issues found!</div>';
            }
        });
}

// Initialize form handlers
function initializeFormHandlers() {
    // Save Content Form
    document.getElementById('saveContentBtn').addEventListener('click', function() {
        const contentData = {
            title: document.getElementById('contentTitle').value,
            description: document.getElementById('contentDescription').value,
            content_type: document.getElementById('contentType').value,
            release_date: document.getElementById('releaseDate').value,
            duration: document.getElementById('contentDuration').value
        };
        
        fetch(`${API_BASE_URL}/content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contentData)
        })
        .then(response => response.json())
        .then(data => {
            // Close modal and refresh content
            $('#addContentModal').modal('hide');
            loadContent();
            loadDashboard();
            document.getElementById('contentForm').reset();
        })
        .catch(error => {
            console.error('Error adding content:', error);
            alert('Failed to add content. Please try again.');
        });
    });
    
    // Save Contract Form
    document.getElementById('saveContractBtn').addEventListener('click', function() {
        const contractData = {
            contract_name: document.getElementById('contractName').value,
            provider_name: document.getElementById('providerName').value,
            start_date: document.getElementById('contractStartDate').value,
            end_date: document.getElementById('contractEndDate').value,
            contract_text: document.getElementById('contractText').value
        };
        
        fetch(`${API_BASE_URL}/contracts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contractData)
        })
        .then(response => response.json())
        .then(data => {
            // Close modal and refresh contracts
            $('#addContractModal').modal('hide');
            loadContracts();
            loadDashboard();
            document.getElementById('contractForm').reset();
        })
        .catch(error => {
            console.error('Error adding contract:', error);
            alert('Failed to add contract. Please try again.');
        });
    });
    
    // Save Rights Form
    document.getElementById('saveRightsBtn').addEventListener('click', function() {
        const rightsData = {
            content_id: document.getElementById('rightsContent').value,
            contract_id: document.getElementById('rightsContract').value,
            territory_id: document.getElementById('rightsTerritory').value,
            platform_id: document.getElementById('rightsPlatform').value,
            start_date: document.getElementById('rightsStartDate').value,
            end_date: document.getElementById('rightsEndDate').value,
            exclusive: document.getElementById('rightsExclusive').checked
        };
        
        fetch(`${API_BASE_URL}/rights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rightsData)
        })
        .then(response => response.json())
        .then(data => {
            // Close modal and refresh rights
            $('#addRightsModal').modal('hide');
            loadRights();
            loadDashboard();
            document.getElementById('rightsForm').reset();
        })
        .catch(error => {
            console.error('Error adding rights:', error);
            alert('Failed to add rights. Please try again.');
        });
    });
}
