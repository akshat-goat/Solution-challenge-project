-- Content table to store media information
CREATE TABLE Content (
    content_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL, -- Movie, Series, Documentary, etc.
    release_date DATE,
    duration INT, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contracts table to store licensing agreement info
CREATE TABLE Contracts (
    contract_id INT PRIMARY KEY AUTO_INCREMENT,
    contract_name VARCHAR(255) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    contract_file_path VARCHAR(255), -- path to stored contract file
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table to store territories/regions
CREATE TABLE Territories (
    territory_id INT PRIMARY KEY AUTO_INCREMENT,
    territory_name VARCHAR(100) NOT NULL,
    territory_code VARCHAR(10) NOT NULL
);

-- Table to store platforms (streaming, theatrical, etc.)
CREATE TABLE Platforms (
    platform_id INT PRIMARY KEY AUTO_INCREMENT,
    platform_name VARCHAR(100) NOT NULL,
    platform_type VARCHAR(50) NOT NULL -- Web, Mobile, SmartTV, etc.
);

-- Rights table to associate content with contracts and specific rights
CREATE TABLE Rights (
    rights_id INT PRIMARY KEY AUTO_INCREMENT,
    content_id INT NOT NULL,
    contract_id INT NOT NULL,
    territory_id INT NOT NULL,
    platform_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    exclusive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES Content(content_id),
    FOREIGN KEY (contract_id) REFERENCES Contracts(contract_id),
    FOREIGN KEY (territory_id) REFERENCES Territories(territory_id),
    FOREIGN KEY (platform_id) REFERENCES Platforms(platform_id)
);

-- Table to track compliance issues
CREATE TABLE ComplianceAlerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    rights_id INT NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- Expiration, Violation, etc.
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- High, Medium, Low
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (rights_id) REFERENCES Rights(rights_id)
);

-- Table to store extracted key terms from contracts
CREATE TABLE ContractTerms (
    term_id INT PRIMARY KEY AUTO_INCREMENT,
    contract_id INT NOT NULL,
    term_type VARCHAR(50) NOT NULL, -- Payment, Distribution, Restriction, etc.
    term_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES Contracts(contract_id)
);
