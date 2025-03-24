# app.py - Main application file
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Database connection helper
def get_db_connection():
    conn = sqlite3.connect('rights_management.db')
    conn.row_factory = sqlite3.Row
    return conn

# Routes for content management
@app.route('/api/content', methods=['GET'])
def get_all_content():
    conn = get_db_connection()
    content = conn.execute('SELECT * FROM Content').fetchall()
    conn.close()
    return jsonify([dict(row) for row in content])

@app.route('/api/content', methods=['POST'])
def add_content():
    content_data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO Content (title, description, content_type, release_date, duration)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        content_data['title'],
        content_data['description'],
        content_data['content_type'],
        content_data['release_date'],
        content_data['duration']
    ))
    
    conn.commit()
    content_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'content_id': content_id, 'message': 'Content added successfully'})

# Routes for contract management
@app.route('/api/contracts', methods=['GET'])
def get_all_contracts():
    conn = get_db_connection()
    contracts = conn.execute('SELECT * FROM Contracts').fetchall()
    conn.close()
    return jsonify([dict(row) for row in contracts])

@app.route('/api/contracts', methods=['POST'])
def add_contract():
    contract_data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO Contracts (contract_name, provider_name, start_date, end_date, contract_file_path)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        contract_data['contract_name'],
        contract_data['provider_name'],
        contract_data['start_date'],
        contract_data['end_date'],
        contract_data.get('contract_file_path', '')
    ))
    
    conn.commit()
    contract_id = cursor.lastrowid
    
    # Basic text extraction from contract content (simplified)
    if 'contract_text' in contract_data:
        extract_and_store_terms(conn, contract_id, contract_data['contract_text'])
    
    conn.close()
    return jsonify({'contract_id': contract_id, 'message': 'Contract added successfully'})

# Routes for rights management
@app.route('/api/rights', methods=['GET'])
def get_rights():
    conn = get_db_connection()
    rights = conn.execute('''
        SELECT r.*, c.title as content_title, co.contract_name, 
               t.territory_name, p.platform_name
        FROM Rights r
        JOIN Content c ON r.content_id = c.content_id
        JOIN Contracts co ON r.contract_id = co.contract_id
        JOIN Territories t ON r.territory_id = t.territory_id
        JOIN Platforms p ON r.platform_id = p.platform_id
    ''').fetchall()
    conn.close()
    return jsonify([dict(row) for row in rights])

@app.route('/api/rights', methods=['POST'])
def add_rights():
    rights_data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO Rights (content_id, contract_id, territory_id, platform_id, 
                           start_date, end_date, exclusive)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        rights_data['content_id'],
        rights_data['contract_id'],
        rights_data['territory_id'],
        rights_data['platform_id'],
        rights_data['start_date'],
        rights_data['end_date'],
        rights_data.get('exclusive', False)
    ))
    
    conn.commit()
    rights_id = cursor.lastrowid
    
    # Check for compliance issues
    check_compliance(conn, rights_id)
    
    conn.close()
    return jsonify({'rights_id': rights_id, 'message': 'Rights added successfully'})

# Routes for compliance alerts
@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    conn = get_db_connection()
    alerts = conn.execute('''
        SELECT a.*, r.content_id, c.title as content_title
        FROM ComplianceAlerts a
        JOIN Rights r ON a.rights_id = r.rights_id
        JOIN Content c ON r.content_id = c.content_id
        WHERE a.is_resolved = 0
    ''').fetchall()
    conn.close()
    return jsonify([dict(row) for row in alerts])

# Helper function for term extraction (simplified for MVP)
def extract_and_store_terms(conn, contract_id, contract_text):
    # Simple keyword detection
    terms = []
    
    # Check for payment terms
    if 'payment' in contract_text.lower() or 'fee' in contract_text.lower():
        terms.append(('Payment', 'Contract contains payment terms'))
    
    # Check for distribution restrictions
    if 'restrict' in contract_text.lower() or 'prohibit' in contract_text.lower():
        terms.append(('Restriction', 'Contract contains distribution restrictions'))
    
    # Check for exclusivity
    if 'exclusive' in contract_text.lower() or 'solely' in contract_text.lower():
        terms.append(('Exclusivity', 'Contract contains exclusivity clauses'))
    
    # Store extracted terms
    cursor = conn.cursor()
    for term_type, term_text in terms:
        cursor.execute('''
            INSERT INTO ContractTerms (contract_id, term_type, term_text)
            VALUES (?, ?, ?)
        ''', (contract_id, term_type, term_text))
    
    conn.commit()

# Check for compliance issues
def check_compliance(conn, rights_id):
    cursor = conn.cursor()
    
    # Get rights details
    rights = conn.execute('SELECT * FROM Rights WHERE rights_id = ?', (rights_id,)).fetchone()
    
    # Check for upcoming expirations (30 days)
    today = datetime.now().date()
    expiry_date = datetime.strptime(rights['end_date'], '%Y-%m-%d').date()
    
    if (expiry_date - today).days <= 30:
        cursor.execute('''
            INSERT INTO ComplianceAlerts (rights_id, alert_type, alert_message, severity)
            VALUES (?, ?, ?, ?)
        ''', (
            rights_id,
            'Expiration',
            f'Rights will expire in {(expiry_date - today).days} days',
            'Medium' if (expiry_date - today).days > 7 else 'High'
        ))
    
    # Check for territory overlap (simplified)
    overlaps = conn.execute('''
        SELECT * FROM Rights 
        WHERE content_id = ? AND territory_id = ? AND platform_id = ?
        AND rights_id != ? 
        AND ((start_date <= ? AND end_date >= ?) OR 
             (start_date <= ? AND end_date >= ?))
    ''', (
        rights['content_id'], 
        rights['territory_id'],
        rights['platform_id'],
        rights_id,
        rights['end_date'], rights['start_date'],
        rights['start_date'], rights['start_date']
    )).fetchall()
    
    if overlaps:
        cursor.execute('''
            INSERT INTO ComplianceAlerts (rights_id, alert_type, alert_message, severity)
            VALUES (?, ?, ?, ?)
        ''', (
            rights_id,
            'Overlap',
            f'Content has overlapping rights for the same territory/platform',
            'High'
        ))
    
    conn.commit()

if __name__ == '__main__':
    app.run(debug=True)
