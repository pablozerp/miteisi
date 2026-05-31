# 📚 PLATAFORMA WEB PARA EL MEJORAMIENTO DEL RENDIMIENTO ACADÉMICO EN PROGRAMACIÓN
### Universidad Nacional Experimental Rómulo Gallegos (UNERG) — Venezuela
**Área:** Ingeniería en Sistemas  
**Tipo:** Proyecto de Tesis  
**Stack:** Next.js (Frontend) + Node.js/Express (Backend) + Gemini API (IA)

---

## 📌 ÍNDICE

1. [Descripción General](#descripcion)
2. [Arquitectura del Sistema](#arquitectura)
3. [Stack Tecnológico](#stack)
4. [Estructura de Archivos](#estructura)
5. [Base de Datos](#base-de-datos)
6. [Backend — API REST](#backend)
7. [Frontend — Interfaz de Usuario](#frontend)
8. [Integración con Gemini API](#gemini)
9. [Estructura de Nodos (Hoja de Ruta)](#nodos)
10. [Variables de Entorno](#env)
11. [Guía de Instalación](#instalacion)
12. [Flujo de la Aplicación](#flujo)

---

## 1. 📋 DESCRIPCIÓN GENERAL {#descripcion}

La plataforma es una aplicación web educativa que permite a estudiantes de Ingeniería en Sistemas:

- **Autenticarse** con usuario y contraseña.
- **Consultar** cualquier lenguaje de programación mediante una barra de búsqueda.
- **Recibir una hoja de ruta personalizada** generada por la IA de Gemini, estructurada como un plan de estudios visual con nodos interconectados.
- Cada nodo contiene: explicación teórica, documentación oficial y **links de videos de YouTube**.

---

## 2. 🏗️ ARQUITECTURA DEL SISTEMA {#arquitectura}

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTE (Browser)                      │
│          Next.js 14 — React — Tailwind CSS               │
│  Login → Dashboard → Barra de Búsqueda → Hoja de Ruta   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / REST API
┌───────────────────────▼─────────────────────────────────┐
│               SERVIDOR BACKEND                           │
│           Node.js + Express.js                           │
│  /auth/login   /auth/register   /roadmap/generate        │
└───────┬────────────────────────────┬────────────────────┘
        │                            │
┌───────▼───────┐          ┌────────▼──────────────────┐
│   PostgreSQL  │          │      GEMINI API            │
│   (Usuarios,  │          │  google-generativeai SDK   │
│   Roadmaps)   │          │  Modelo: gemini-2.0-flash  │
└───────────────┘          └───────────────────────────┘
```

---

## 3. 🛠️ STACK TECNOLÓGICO {#stack}

| Capa         | Tecnología                          | Versión     |
|--------------|-------------------------------------|-------------|
| Frontend     | Next.js (React)                     | 14+         |
| Estilos      | Tailwind CSS                        | 3+          |
| Nodos Visuales | React Flow (`reactflow`)          | 11+         |
| Backend      | Node.js + Express                   | 18+ / 4+    |
| Base de datos| PostgreSQL                          | 15+         |
| ORM          | Prisma                              | 5+          |
| IA           | Google Gemini API                   | 2.0 Flash   |
| Auth         | JWT (jsonwebtoken) + bcrypt         | —           |
| HTTP Client  | Axios                               | —           |

---

## 4. 📁 ESTRUCTURA DE ARCHIVOS {#estructura}

```
proyecto-tesis/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js       # Login y registro
│   │   │   └── roadmapController.js    # Generación de hojas de ruta
│   │   ├── middleware/
│   │   │   └── authMiddleware.js       # Verificación JWT
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── roadmapRoutes.js
│   │   ├── services/
│   │   │   └── geminiService.js        # Lógica de llamada a Gemini API
│   │   ├── prisma/
│   │   │   └── schema.prisma           # Esquema de BD
│   │   └── app.js                      # Punto de entrada Express
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.jsx            # Página de Login
│   │   │   └── register/
│   │   │       └── page.jsx            # Página de Registro
│   │   ├── dashboard/
│   │   │   └── page.jsx                # Barra de búsqueda + Roadmap
│   │   └── layout.jsx
│   ├── components/
│   │   ├── SearchBar.jsx               # Input de búsqueda de lenguaje
│   │   ├── RoadmapCanvas.jsx           # Canvas de nodos (React Flow)
│   │   ├── NodeCard.jsx                # Tarjeta de cada nodo
│   │   └── Navbar.jsx
│   ├── lib/
│   │   └── api.js                      # Funciones de llamada al backend
│   ├── .env.local
│   └── package.json
│
└── README.md
```

---

## 5. 🗄️ BASE DE DATOS {#base-de-datos}

### Archivo: `backend/src/prisma/schema.prisma`

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Tabla de usuarios (estudiantes)
model User {
  id           Int       @id @default(autoincrement())
  name         String
  email        String    @unique
  password     String    // Hasheado con bcrypt
  cedula       String?   @unique  // Cédula venezolana (opcional)
  createdAt    DateTime  @default(now())
  roadmaps     Roadmap[]
}

// Tabla de hojas de ruta generadas
model Roadmap {
  id          Int      @id @default(autoincrement())
  language    String   // Ej: "Python", "JavaScript"
  nodesData   Json     // JSON con todos los nodos generados por Gemini
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}
```

### Comandos para inicializar la BD:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

---

## 6. ⚙️ BACKEND — API REST {#backend}

### `backend/src/app.js`
```javascript
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
```

---

### `backend/src/controllers/authController.js`
```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, cedula } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, cedula }
    });
    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: 'El email o cédula ya existe' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { userId: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, name: user.name });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { register, login };
```

---

### `backend/src/middleware/authMiddleware.js`
```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = { verifyToken };
```

---

### `backend/src/routes/authRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
```

---

### `backend/src/routes/roadmapRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../controllers/roadmapController');
const { verifyToken } = require('../middleware/authMiddleware');

// Ruta protegida — requiere JWT
router.post('/generate', verifyToken, generateRoadmap);

module.exports = router;
```

---

### `backend/src/controllers/roadmapController.js`
```javascript
const { generateRoadmapWithGemini } = require('../services/geminiService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/roadmap/generate
const generateRoadmap = async (req, res) => {
  const { language } = req.body;
  const userId = req.user.userId;

  if (!language) return res.status(400).json({ error: 'Debes especificar un lenguaje' });

  try {
    // Llamar a Gemini para generar los nodos
    const nodes = await generateRoadmapWithGemini(language);

    // Guardar roadmap en BD
    const roadmap = await prisma.roadmap.create({
      data: { language, nodesData: nodes, userId }
    });

    res.json({ roadmapId: roadmap.id, nodes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el roadmap con Gemini' });
  }
};

module.exports = { generateRoadmap };
```

---

## 7. 🖥️ GEMINI API — SERVICIO DE IA {#gemini}

### `backend/src/services/geminiService.js`

Este es el corazón de la plataforma. Construye un prompt estructurado y parsea la respuesta de Gemini como nodos de una hoja de ruta.

> Nota: Además de usar Gemini para generar la estructura, el backend ahora enriquece cada nodo con enlaces reales de YouTube en español y documentación oficial usando la API de YouTube.

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Genera una hoja de ruta de aprendizaje para un lenguaje de programación.
 * @param {string} language - Nombre del lenguaje (ej: "Python", "JavaScript")
 * @returns {Array} - Array de nodos con estructura para React Flow
 */
const generateRoadmapWithGemini = async (language) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
Eres un experto en educación en programación. Genera una hoja de ruta de aprendizaje estructurada para el lenguaje de programación: "${language}".

La hoja de ruta debe estar orientada a estudiantes universitarios de Ingeniería en Sistemas en Venezuela (UNERG).

INSTRUCCIONES IMPORTANTES:
- Genera entre 6 y 10 nodos (pasos de aprendizaje).
- Cada nodo debe tener una secuencia lógica (de básico a avanzado).
- Incluye links de YouTube de videos educativos REALES y en español cuando sea posible.
- Incluye links a documentación oficial.
- Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin bloques de código.

FORMATO EXACTO DEL JSON:
[
  {
    "id": "node-1",
    "title": "Nombre del tema",
    "description": "Descripción breve de lo que aprenderás en este paso",
    "level": "Básico | Intermedio | Avanzado",
    "topics": ["tema1", "tema2", "tema3"],
    "documentation": [
      {
        "title": "Nombre del recurso",
        "url": "https://..."
      }
    ],
    "videos": [
      {
        "title": "Título del video",
        "url": "https://www.youtube.com/watch?v=..."
      }
    ],
    "position": { "x": 0, "y": 0 },
    "dependsOn": []
  },
  {
    "id": "node-2",
    ...
    "dependsOn": ["node-1"]
  }
]

El campo "dependsOn" indica de qué nodos anteriores depende (para construir las aristas del grafo).
El campo "position" será calculado automáticamente por el frontend, puedes dejarlo en { "x": 0, "y": 0 }.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Limpiar posibles bloques markdown si Gemini los incluye
  const cleanedText = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const nodes = JSON.parse(cleanedText);

  // Calcular posiciones automáticas en el canvas (layout vertical)
  const SPACING_X = 300;
  const SPACING_Y = 200;
  nodes.forEach((node, index) => {
    node.position = {
      x: (index % 2) * SPACING_X + 100,
      y: Math.floor(index / 2) * SPACING_Y + 100
    };
  });

  return nodes;
};

module.exports = { generateRoadmapWithGemini };
```

---

## 8. 🎨 FRONTEND — INTERFAZ DE USUARIO {#frontend}

### `frontend/lib/api.js` — Cliente HTTP
```javascript
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Obtener token guardado en localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data; // { token, name }
};

export const registerUser = async (data) => {
  const res = await axios.post(`${API_BASE}/auth/register`, data);
  return res.data;
};

export const generateRoadmap = async (language) => {
  const res = await axios.post(
    `${API_BASE}/roadmap/generate`,
    { language },
    { headers: getAuthHeader() }
  );
  return res.data; // { roadmapId, nodes }
};
```

---

### `frontend/app/(auth)/login/page.jsx`
```jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginUser(form.email, form.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      router.push('/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          📚 AcademiCode
        </h1>
        <p className="text-blue-200 text-center mb-6 text-sm">
          Plataforma Académica — UNERG
        </p>

        {error && (
          <p className="bg-red-500/20 text-red-300 rounded-lg p-3 mb-4 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-blue-200 text-sm mb-1 block">Email</label>
            <input
              type="email"
              placeholder="correo@unerg.edu.ve"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-blue-400"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-blue-200 text-sm mb-1 block">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-blue-400"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all duration-200"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-blue-300 text-center mt-4 text-sm">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="underline text-blue-200 hover:text-white">
            Regístrate aquí
          </a>
        </p>
      </div>
    </main>
  );
}
```

---

### `frontend/components/SearchBar.jsx`
```jsx
'use client';
import { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Ej: Python, JavaScript, Java, C++..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="flex-1 px-5 py-4 rounded-2xl bg-white/10 text-white border border-white/20 
                   placeholder-blue-300 focus:outline-none focus:border-blue-400 text-lg"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl 
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Generando...' : '🔍 Generar Ruta'}
      </button>
    </form>
  );
}
```

---

### `frontend/components/RoadmapCanvas.jsx`
```jsx
'use client';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect } from 'react';
import NodeCard from './NodeCard';

// Registrar el tipo de nodo personalizado
const nodeTypes = { customNode: NodeCard };

export default function RoadmapCanvas({ roadmapNodes }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!roadmapNodes?.length) return;

    // Convertir nodos de Gemini al formato de React Flow
    const rfNodes = roadmapNodes.map((n) => ({
      id: n.id,
      type: 'customNode',
      position: n.position,
      data: {
        title: n.title,
        description: n.description,
        level: n.level,
        topics: n.topics,
        documentation: n.documentation,
        videos: n.videos,
      },
    }));

    // Generar aristas (conexiones) a partir de dependsOn
    const rfEdges = [];
    roadmapNodes.forEach((n) => {
      (n.dependsOn || []).forEach((sourceId) => {
        rfEdges.push({
          id: `${sourceId}->${n.id}`,
          source: sourceId,
          target: n.id,
          animated: true,
          style: { stroke: '#60a5fa', strokeWidth: 2 },
        });
      });
    });

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [roadmapNodes]);

  return (
    <div className="w-full h-[75vh] rounded-2xl overflow-hidden border border-white/10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#334155" gap={16} />
        <Controls />
        <MiniMap nodeColor="#3b82f6" />
      </ReactFlow>
    </div>
  );
}
```

---

### `frontend/components/NodeCard.jsx`
```jsx
import { Handle, Position } from 'reactflow';

const levelColors = {
  'Básico': 'bg-green-500/20 text-green-300 border-green-500',
  'Intermedio': 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
  'Avanzado': 'bg-red-500/20 text-red-300 border-red-500',
};

export default function NodeCard({ data }) {
  const colorClass = levelColors[data.level] || levelColors['Básico'];

  return (
    <div className={`
      bg-slate-800/90 border rounded-2xl p-4 w-72 shadow-xl backdrop-blur-md
      border-white/10 hover:border-blue-400 transition-all duration-200
    `}>
      {/* Conectores de React Flow */}
      <Handle type="target" position={Position.Top} className="!bg-blue-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />

      {/* Nivel */}
      <span className={`text-xs px-2 py-1 rounded-full border ${colorClass} mb-2 inline-block`}>
        {data.level}
      </span>

      {/* Título */}
      <h3 className="text-white font-bold text-base mb-1">{data.title}</h3>

      {/* Descripción */}
      <p className="text-slate-300 text-xs mb-3 line-clamp-2">{data.description}</p>

      {/* Temas */}
      <div className="flex flex-wrap gap-1 mb-3">
        {data.topics?.slice(0, 3).map((t, i) => (
          <span key={i} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">
            {t}
          </span>
        ))}
      </div>

      {/* Documentación */}
      {data.documentation?.length > 0 && (
        <div className="mb-2">
          <p className="text-slate-400 text-xs font-semibold mb-1">📄 Documentación:</p>
          {data.documentation.slice(0, 2).map((doc, i) => (
            <a
              key={i}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 text-xs hover:underline truncate"
            >
              {doc.title}
            </a>
          ))}
        </div>
      )}

      {/* Videos */}
      {data.videos?.length > 0 && (
        <div>
          <p className="text-slate-400 text-xs font-semibold mb-1">🎥 Videos:</p>
          {data.videos.slice(0, 2).map((v, i) => (
            <a
              key={i}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-red-400 text-xs hover:underline truncate"
            >
              ▶ {v.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### `frontend/app/dashboard/page.jsx`
```jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import RoadmapCanvas from '@/components/RoadmapCanvas';
import { generateRoadmap } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [nodes, setNodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (!token) router.push('/login');
    else setUserName(name || 'Estudiante');
  }, []);

  const handleSearch = async (language) => {
    setLoading(true);
    setError('');
    setCurrentLanguage(language);
    try {
      const data = await generateRoadmap(language);
      setNodes(data.nodes);
    } catch (err) {
      setError('Error al generar la hoja de ruta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">📚 AcademiCode</h1>
          <p className="text-blue-300 text-sm">Bienvenido, {userName} 👋</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 text-sm transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-8">
        <h2 className="text-white text-center text-xl font-semibold mb-3">
          ¿Qué lenguaje de programación quieres aprender?
        </h2>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-center mb-4">{error}</p>
      )}

      {/* Roadmap */}
      {nodes && (
        <div>
          <h3 className="text-blue-300 text-center mb-4 text-lg">
            🗺️ Hoja de Ruta: <span className="text-white font-bold">{currentLanguage}</span>
          </h3>
          <RoadmapCanvas roadmapNodes={nodes} />
        </div>
      )}

      {/* Estado vacío */}
      {!nodes && !loading && (
        <div className="text-center mt-20">
          <p className="text-slate-500 text-lg">
            Ingresa un lenguaje de programación para ver tu plan de estudios
          </p>
          <p className="text-slate-600 text-sm mt-2">
            Ej: Python · JavaScript · Java · C++ · Go · Rust
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 9. 🔀 ESTRUCTURA DE NODOS (HOJA DE RUTA) {#nodos}

Los nodos siguen este esquema visual en el canvas:

```
[node-1: Fundamentos Básicos]
         |
         ▼
[node-2: Variables y Tipos]    [node-3: Control de Flujo]
         |                              |
         └──────────┬───────────────────┘
                    ▼
         [node-4: Funciones]
                    |
                    ▼
         [node-5: Programación OOP]
                    |
                    ▼
         [node-6: Proyecto Final]
```

Cada nodo contiene:
- `id`: Identificador único (`node-1`, `node-2`, etc.)
- `title`: Título del tema
- `description`: Descripción del contenido
- `level`: `Básico | Intermedio | Avanzado`
- `topics[]`: Lista de sub-temas
- `documentation[]`: Links a docs oficiales
- `videos[]`: Links de YouTube
- `position`: Coordenadas para React Flow
- `dependsOn[]`: IDs de nodos previos (genera las flechas)

---

## 10. 🔐 VARIABLES DE ENTORNO {#env}

### `backend/.env`
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/academicode"
JWT_SECRET="clave_super_secreta_cambiame_en_produccion"
GEMINI_API_KEY="TU_API_KEY_DE_GEMINI_AQUI"
YOUTUBE_API_KEY="TU_API_KEY_DE_YOUTUBE_AQUI"
PORT=4000
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> ⚠️ **IMPORTANTE**: Nunca subas `.env` a Git. Agrega estos archivos a `.gitignore`.

---

## 11. 🚀 GUÍA DE INSTALACIÓN {#instalacion}

### Prerrequisitos
- Node.js 18+
- PostgreSQL 15 instalado y corriendo
- Cuenta en Google AI Studio → [aistudio.google.com](https://aistudio.google.com)

### Paso 1: Clonar y configurar el Backend
```bash
cd backend
npm install
# Configurar el archivo .env con tus credenciales
npx prisma migrate dev --name init
npx prisma generate
node src/app.js
```

### Paso 2: Configurar el Frontend
```bash
cd frontend
npm install
# Configurar .env.local
npm run dev
```

### Dependencias del Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "@prisma/client": "^5.10.0",
    "@google/generative-ai": "^0.14.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "prisma": "^5.10.0"
  }
}
```

### Dependencias del Frontend
```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "^18",
    "react-dom": "^18",
    "axios": "^1.6.8",
    "reactflow": "^11.11.1"
  }
}
```

---

## 12. 🔄 FLUJO DE LA APLICACIÓN {#flujo}

```
1. El estudiante accede a /login
2. Ingresa email y contraseña
3. Backend valida → genera JWT
4. Frontend guarda el JWT en localStorage
5. Redirección a /dashboard
6. El estudiante escribe un lenguaje en la barra de búsqueda
7. Frontend llama a POST /api/roadmap/generate con el JWT en el header
8. Backend verifica el JWT → llama a Gemini API con el prompt estructurado
9. Gemini devuelve JSON con los nodos de la hoja de ruta
10. Backend guarda el roadmap en PostgreSQL → responde al frontend
11. Frontend renderiza los nodos en React Flow como un grafo interactivo
12. El estudiante navega por los nodos, accede a documentación y videos
```

---

## 📝 NOTAS FINALES PARA EL DESARROLLADOR

1. **API Key de Gemini**: Obtenerla gratis en [aistudio.google.com](https://aistudio.google.com/apikey).
2. **Modelo recomendado**: `gemini-2.0-flash` (más rápido y eficiente).
3. **Posicionamiento de nodos**: El campo `position` puede mejorarse con un algoritmo de layout como `dagre` (`@dagrejs/dagre`) para posicionamiento automático más elegante.
4. **YouTube**: El prompt le pide a Gemini que incluya links reales. Se puede mejorar integrando la YouTube Data API v3 para búsquedas dinámicas.
5. **Autenticación**: Para producción, considera refresh tokens y HTTPS obligatorio.
6. **UNERG context**: El prompt ya especifica el contexto venezolano/UNERG para que Gemini adapte el contenido.

---

*Documentación generada para el proyecto de tesis — UNERG, Venezuela, 2026*
