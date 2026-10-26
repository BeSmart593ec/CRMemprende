import React, { useState } from 'react';
import { Plug, Code, Database, ArrowRight, CheckCircle2, Copy, ChevronDown, ChevronUp, AlertCircle, ExternalLink } from 'lucide-react';

const IntegrationPage: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    {
      title: '1. Arquitectura de Integración',
      icon: '🏗️',
      content: `
## Diagrama de Arquitectura

\`\`\`
┌─────────────────┐     API REST     ┌─────────────────┐
│   EmprendeCRM   │ ◄──────────────► │   Tu ERP       │
│   (React SPA)   │    JSON/HTTPS    │  (PHP 8.3)     │
└────────┬────────┘                   └────────┬────────┘
         │                                      │
         │         ┌─────────────────┐          │
         └────────►│  API Gateway    │◄─────────┘
                   │  (Middleware)   │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │    MySQL 8.0    │
                   │  (Base de datos)│
                   └─────────────────┘
\`\`\`

### Flujo de Datos
- **Clientes**: Sincronización bidireccional entre CRM y ERP
- **Ventas**: El CRM envía ventas al ERP para facturación
- **Recordatorios**: Exclusivos del CRM, no se sincronizan
- **Productos**: El ERP es la fuente principal de catálogo
      `
    },
    {
      title: '2. Crear API REST en tu ERP (PHP 8.3)',
      icon: '⚙️',
      content: `
## Estructura de Archivos PHP

\`\`\`
tu-erp/
├── api/
│   ├── index.php          (Router principal)
│   ├── config/
│   │   └── database.php   (Conexión MySQL)
│   ├── middleware/
│   │   └── auth.php       (Autenticación JWT)
│   ├── controllers/
│   │   ├── ClientController.php
│   │   ├── SaleController.php
│   │   └── ProductController.php
│   └── models/
│       ├── Client.php
│       └── Sale.php
\`\`\`

## Conexión a MySQL (config/database.php)

\`\`\`php
<?php
declare(strict_types=1);

class Database {
    private static ?PDO $instance = null;
    
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=utf8mb4',
                $_ENV['DB_HOST'] ?? 'localhost',
                $_ENV['DB_NAME'] ?? 'erp_database'
            );
            
            self::$instance = new PDO($dsn, 
                $_ENV['DB_USER'] ?? 'root', 
                $_ENV['DB_PASS'] ?? '',
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        }
        return self::$instance;
    }
}
\`\`\`

## Middleware de Autenticación (middleware/auth.php)

\`\`\`php
<?php
declare(strict_types=1);

class AuthMiddleware {
    private const SECRET_KEY = 'tu-clave-secreta-aqui';
    
    public static function validate(): bool {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? '';
        $token = str_replace('Bearer ', '', $token);
        
        if (empty($token)) {
            http_response_code(401);
            echo json_encode(['error' => 'Token requerido']);
            return false;
        }
        
        // Validar token (simplificado - usar JWT en producción)
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
        
        if (count($parts) !== 2) {
            http_response_code(401);
            echo json_encode(['error' => 'Token inválido']);
            return false;
        }
        
        $apiKey = $parts[0];
        $timestamp = (int)$parts[1];
        
        // Token válido por 1 hora
        if (abs(time() - $timestamp) > 3600) {
            http_response_code(401);
            echo json_encode(['error' => 'Token expirado']);
            return false;
        }
        
        if (!hash_equals(self::SECRET_KEY, $apiKey)) {
            http_response_code(401);
            echo json_encode(['error' => 'API Key inválida']);
            return false;
        }
        
        return true;
    }
}
\`\`\`
      `
    },
    {
      title: '3. Endpoints del API para Clientes',
      icon: '👥',
      content: `
## ClientController.php

\`\`\`php
<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

class ClientController {
    private PDO $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    // GET /api/clients - Listar clientes
    public function index(): void {
        if (!AuthMiddleware::validate()) return;
        
        $stmt = $this->db->query(
            'SELECT * FROM clients ORDER BY created_at DESC'
        );
        $clients = $stmt->fetchAll();
        
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $clients,
            'total' => count($clients)
        ]);
    }
    
    // POST /api/clients - Crear cliente
    public function store(): void {
        if (!AuthMiddleware::validate()) return;
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validar datos
        $errors = [];
        if (empty($input['name'])) $errors[] = 'Nombre requerido';
        if (empty($input['email'])) $errors[] = 'Email requerido';
        
        if (!empty($errors)) {
            http_response_code(422);
            echo json_encode(['errors' => $errors]);
            return;
        }
        
        $stmt = $this->db->prepare(
            'INSERT INTO clients (name, email, phone, company, status, notes, created_at, updated_at) 
             VALUES (:name, :email, :phone, :company, :status, :notes, NOW(), NOW())'
        );
        
        $stmt->execute([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'] ?? null,
            'company' => $input['company'] ?? null,
            'status' => $input['status'] ?? 'prospect',
            'notes' => $input['notes'] ?? null,
        ]);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'data' => ['id' => $this->db->lastInsertId()],
            'message' => 'Cliente creado exitosamente'
        ]);
    }
    
    // GET /api/clients/{id} - Obtener cliente
    public function show(int $id): void {
        if (!AuthMiddleware::validate()) return;
        
        $stmt = $this->db->prepare('SELECT * FROM clients WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $client = $stmt->fetch();
        
        if (!$client) {
            http_response_code(404);
            echo json_encode(['error' => 'Cliente no encontrado']);
            return;
        }
        
        echo json_encode(['success' => true, 'data' => $client]);
    }
    
    // PUT /api/clients/{id} - Actualizar cliente
    public function update(int $id): void {
        if (!AuthMiddleware::validate()) return;
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        $fields = [];
        $params = ['id' => $id];
        
        foreach (['name', 'email', 'phone', 'company', 'status', 'notes'] as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = :$field";
                $params[$field] = $input[$field];
            }
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay datos para actualizar']);
            return;
        }
        
        $fields[] = 'updated_at = NOW()';
        $sql = 'UPDATE clients SET ' . implode(', ', $fields) . ' WHERE id = :id';
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'message' => 'Cliente actualizado']);
    }
    
    // DELETE /api/clients/{id} - Eliminar cliente
    public function destroy(int $id): void {
        if (!AuthMiddleware::validate()) return;
        
        $stmt = $this->db->prepare('DELETE FROM clients WHERE id = :id');
        $stmt->execute(['id' => $id]);
        
        echo json_encode(['success' => true, 'message' => 'Cliente eliminado']);
    }
}
\`\`\`

## Router (api/index.php)

\`\`\`php
<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Routing simple
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path);
$segments = array_values(array_filter(explode('/', $path)));

// Cargar controlador
require_once __DIR__ . '/controllers/ClientController.php';
require_once __DIR__ . '/controllers/SaleController.php';

$controller = $segments[0] ?? '';
$action = $segments[1] ?? null;
$id = isset($segments[2]) ? (int)$segments[2] : null;

match([$controller, $method, $action]) {
    ['clients', 'GET', null] => (new ClientController())->index(),
    ['clients', 'POST', null] => (new ClientController())->store(),
    ['clients', 'GET', 'show'] => (new ClientController())->show($id),
    ['clients', 'PUT', 'update'] => (new ClientController())->update($id),
    ['clients', 'DELETE', 'destroy'] => (new ClientController())->destroy($id),
    default => (function() {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint no encontrado']);
    })()
};
\`\`\`
      `
    },
    {
      title: '4. Esquema de Base de Datos MySQL',
      icon: '🗄️',
      content: `
## Script SQL para crear las tablas del CRM

\`\`\`sql
-- =============================================
-- EmprendeCRM - Esquema de Base de Datos
-- Compatible con MySQL 8.0+
-- =============================================

CREATE DATABASE IF NOT EXISTS emprendecrm 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE emprendecrm;

-- Tabla de Clientes
CREATE TABLE clients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    erp_client_id BIGINT UNSIGNED NULL COMMENT 'ID del cliente en el ERP',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    company VARCHAR(255) NULL,
    status ENUM('active', 'inactive', 'prospect') DEFAULT 'prospect',
    notes TEXT NULL,
    synced_at TIMESTAMP NULL COMMENT 'Última sincronización con ERP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_erp_id (erp_client_id),
    UNIQUE INDEX uq_email (email)
) ENGINE=InnoDB;

-- Tabla de Ventas
CREATE TABLE sales (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT UNSIGNED NOT NULL,
    erp_sale_id BIGINT UNSIGNED NULL COMMENT 'ID de la venta en el ERP',
    product VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    date DATE NOT NULL,
    notes TEXT NULL,
    synced_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_status (status),
    INDEX idx_date (date),
    INDEX idx_erp_id (erp_sale_id),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de Recordatorios
CREATE TABLE reminders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT UNSIGNED NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    due_date DATE NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    type ENUM('follow_up', 'meeting', 'payment', 'task', 'custom') DEFAULT 'task',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_due_date (due_date),
    INDEX idx_completed (completed),
    INDEX idx_priority (priority),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla de Logs de Sincronización
CREATE TABLE sync_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT UNSIGNED NOT NULL,
    action ENUM('create', 'update', 'delete', 'sync') NOT NULL,
    status ENUM('success', 'error') NOT NULL,
    response TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Tabla de Tokens API
CREATE TABLE api_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    permissions JSON NULL,
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;
\`\`\`
      `
    },
    {
      title: '5. Conectar el CRM (React) con tu API',
      icon: '🔗',
      content: `
## Servicio API en React

Para conectar este CRM con tu backend PHP, crea un servicio API:

\`\`\`typescript
// src/services/api.ts

const API_BASE_URL = 'https://tu-erp.com/api';
const API_TOKEN = 'tu-api-key-aqui';

// Generar token de autenticación
function generateAuthToken(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = \`\${API_TOKEN}:\${timestamp}\`;
  return btoa(payload);
}

// Headers comunes
const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': \`Bearer \${generateAuthToken()}\`,
});

// Cliente genérico
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || \`Error \${response.status}\`);
  }
  
  return response.json();
}

// ==========================================
// API de Clientes
// ==========================================
export const clientApi = {
  getAll: () => apiRequest('/clients'),
  
  getById: (id: number) => apiRequest(\`/clients/\${id}/show\`),
  
  create: (data: any) => apiRequest('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: number, data: any) => apiRequest(\`/clients/\${id}/update\`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: number) => apiRequest(\`/clients/\${id}/destroy\`, {
    method: 'DELETE',
  }),
};

// ==========================================
// API de Ventas
// ==========================================
export const saleApi = {
  getAll: () => apiRequest('/sales'),
  
  create: (data: any) => apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: number, data: any) => apiRequest(\`/sales/\${id}/update\`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ==========================================
// API de Sincronización
// ==========================================
export const syncApi = {
  syncClients: () => apiRequest('/sync/clients', { method: 'POST' }),
  syncSales: () => apiRequest('/sync/sales', { method: 'POST' }),
  getSyncStatus: () => apiRequest('/sync/status'),
};
\`\`\`

## Configuración de Variables de Entorno

Crea un archivo \`.env\` en la raíz de tu proyecto React:

\`\`\`env
VITE_API_BASE_URL=https://tu-erp.com/api
VITE_API_TOKEN=tu-api-key-segura-aqui
\`\`\`

## Ejemplo de Uso en un Componente

\`\`\`typescript
import { useEffect, useState } from 'react';
import { clientApi } from '../services/api';

function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    clientApi.getAll()
      .then(res => setClients(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Cargando...</div>;
  
  return (
    <ul>
      {clients.map(client => (
        <li key={client.id}>{client.name}</li>
      ))}
    </ul>
  );
}
\`\`\`
      `
    },
    {
      title: '6. Pasos para la Integración Completa',
      icon: '📋',
      content: `
## Checklist de Integración

### Fase 1: Preparación (1-2 días)
- [ ] Crear las tablas MySQL del CRM en tu base de datos
- [ ] Configurar el archivo \`.env\` con credenciales
- [ ] Generar API Key segura para autenticación
- [ ] Configurar CORS en tu servidor PHP

### Fase 2: API Backend (2-3 días)
- [ ] Implementar ClientController con CRUD completo
- [ ] Implementar SaleController con CRUD completo
- [ ] Implementar middleware de autenticación JWT
- [ ] Configurar el router (api/index.php)
- [ ] Probar endpoints con Postman/Insomnia

### Fase 3: Frontend (1-2 días)
- [ ] Crear servicio API en React (src/services/api.ts)
- [ ] Reemplazar localStorage con llamadas API
- [ ] Implementar manejo de errores y loading states
- [ ] Agregar sincronización automática

### Fase 4: Sincronización (2-3 días)
- [ ] Implementar sync bidireccional de clientes
- [ ] Implementar envío de ventas al ERP para facturación
- [ ] Crear tabla de logs de sincronización
- [ ] Implementar reintentos automáticos en errores
- [ ] Agregar panel de estado de sincronización

### Fase 5: Producción (1 día)
- [ ] Configurar HTTPS/SSL
- [ ] Implementar rate limiting en API
- [ ] Configurar backups automáticos de MySQL
- [ ] Monitoreo de errores (Sentry, etc.)
- [ ] Documentación para el equipo

## Consideraciones de Seguridad

1. **Nunca expongas tu API Key en el frontend** - Usa un proxy o backend-for-frontend
2. **Implementa HTTPS** obligatorio para todas las comunicaciones
3. **Valida todos los inputs** tanto en frontend como backend
4. **Usa prepared statements** para prevenir SQL injection
5. **Implementa rate limiting** para prevenir abuso del API
6. **Registra todos los cambios** en la tabla sync_logs

## Recomendaciones del Guru CRM

> 💡 **Tip Pro**: No sincronices en tiempo real. Usa un sistema de colas (como Redis + Laravel Queue o RabbitMQ) para procesar las sincronizaciones de forma asíncrona. Esto mejora el rendimiento y la confiabilidad.

> 💡 **Tip Pro**: Implementa un campo \`synced_at\` en cada tabla para saber exactamente cuándo fue la última sincronización exitosa.

> 💡 **Tip Pro**: Usa webhooks para notificar al CRM cuando el ERP actualice datos relevantes (ej: cambio de estado de factura).
      `
    }
  ];

  const CodeBlock: React.FC<{ code: string; id: string; language?: string }> = ({ code, id, language = 'php' }) => (
    <div className="relative group">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-all opacity-0 group-hover:opacity-100"
        >
          {copiedCode === id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-sm">
        <code className="text-slate-300">{code}</code>
      </pre>
    </div>
  );

  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';
    let codeId = 0;

    lines.forEach((line, i) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(<CodeBlock key={`code-${codeId}`} code={codeContent.trim()} id={`code-${codeId}`} language={codeLanguage} />);
          codeContent = '';
          codeLanguage = '';
          inCodeBlock = false;
          codeId++;
        } else {
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim() || 'text';
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        return;
      }

      if (line.startsWith('## ')) {
        elements.push(<h3 key={i} className="text-lg font-semibold text-white mt-6 mb-3">{line.replace('## ', '')}</h3>);
      } else if (line.startsWith('- [ ]')) {
        elements.push(
          <label key={i} className="flex items-center gap-2 py-1 text-slate-300 text-sm cursor-pointer hover:text-white">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500/25" />
            <span>{line.replace('- [ ] ', '')}</span>
          </label>
        );
      } else if (line.startsWith('- ')) {
        elements.push(<li key={i} className="text-slate-300 text-sm py-0.5 list-disc list-inside">{line.replace('- ', '')}</li>);
      } else if (line.startsWith('> 💡')) {
        elements.push(
          <div key={i} className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 my-3">
            <p className="text-emerald-300 text-sm">{line.replace('> 💡 ', '').replace('> 💡', '')}</p>
          </div>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-emerald-500/50 pl-4 my-3 text-slate-400 italic text-sm">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.match(/^\d+\./)) {
        elements.push(<p key={i} className="text-slate-300 text-sm py-1 font-medium">{line}</p>);
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(<p key={i} className="text-slate-300 text-sm py-0.5">{line}</p>);
      }
    });

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Plug className="w-8 h-8 text-emerald-400" />
          Integración con tu ERP
        </h1>
        <p className="text-slate-400 mt-2">
          Guía completa para conectar EmprendeCRM con tu ERP existente en PHP 8.3 + MySQL
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">¿Cómo funciona la integración?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              EmprendeCRM se conecta a tu ERP mediante una <strong className="text-emerald-400">API REST</strong>. 
              Los datos se sincronizan de forma bidireccional: los clientes y ventas del CRM se reflejan en tu ERP, 
              y viceversa. Los recordatorios son exclusivos del CRM.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">PHP 8.3</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">MySQL 8.0+</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">REST API</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">JSON</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">JWT Auth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`bg-slate-900/50 border rounded-2xl overflow-hidden transition-all duration-300 ${
              expandedSection === index ? 'border-emerald-500/30' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <button
              onClick={() => setExpandedSection(expandedSection === index ? null : index)}
              className="w-full flex items-center gap-4 p-5 text-left"
            >
              <span className="text-2xl">{section.icon}</span>
              <span className="flex-1 text-lg font-semibold text-white">{section.title}</span>
              {expandedSection === index ? (
                <ChevronUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>
            {expandedSection === index && (
              <div className="px-5 pb-5 border-t border-slate-800 pt-4">
                {renderContent(section.content)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Endpoints Reference */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-emerald-400" />
          Referencia de Endpoints
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Método</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Endpoint</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { method: 'GET', endpoint: '/api/clients', desc: 'Listar todos los clientes' },
                { method: 'POST', endpoint: '/api/clients', desc: 'Crear nuevo cliente' },
                { method: 'GET', endpoint: '/api/clients/{id}/show', desc: 'Obtener cliente por ID' },
                { method: 'PUT', endpoint: '/api/clients/{id}/update', desc: 'Actualizar cliente' },
                { method: 'DELETE', endpoint: '/api/clients/{id}/destroy', desc: 'Eliminar cliente' },
                { method: 'GET', endpoint: '/api/sales', desc: 'Listar todas las ventas' },
                { method: 'POST', endpoint: '/api/sales', desc: 'Registrar nueva venta' },
                { method: 'POST', endpoint: '/api/sync/clients', desc: 'Sincronizar clientes con ERP' },
                { method: 'POST', endpoint: '/api/sync/sales', desc: 'Sincronizar ventas con ERP' },
                { method: 'GET', endpoint: '/api/sync/status', desc: 'Estado de sincronización' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                      row.method === 'GET' ? 'bg-blue-500/10 text-blue-400' :
                      row.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' :
                      row.method === 'PUT' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {row.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-300">{row.endpoint}</td>
                  <td className="py-3 px-4 text-slate-400">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🚀 Próximos Pasos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="text-2xl mb-2">1️⃣</div>
            <h3 className="font-semibold text-white text-sm mb-1">Crea las tablas</h3>
            <p className="text-xs text-slate-400">Ejecuta el SQL en tu MySQL para crear las tablas del CRM</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="text-2xl mb-2">2️⃣</div>
            <h3 className="font-semibold text-white text-sm mb-1">Implementa la API</h3>
            <p className="text-xs text-slate-400">Copia los controllers PHP en tu proyecto ERP</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="text-2xl mb-2">3️⃣</div>
            <h3 className="font-semibold text-white text-sm mb-1">Conecta el CRM</h3>
            <p className="text-xs text-slate-400">Actualiza el servicio API en React con tu URL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPage;
