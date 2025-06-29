# 🧠 FacturaIA - Sistema Inteligente de Gestión de Facturas

![FacturaIA Logo](https://img.shields.io/badge/FacturaIA-AI%20Powered-blue?style=for-the-badge&logo=robot)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## 📋 Descripción General

**FacturaIA** es una aplicación web inteligente que automatiza el procesamiento y gestión de facturas utilizando tecnologías de Inteligencia Artificial. La aplicación combina OCR (Reconocimiento Óptico de Caracteres) con IA para extraer, estructurar y analizar datos de facturas de manera automática.

### 🎯 Propósito Principal
- **Automatización completa** del procesamiento de facturas
- **Extracción inteligente** de datos usando IA
- **Gestión centralizada** de facturas empresariales
- **Análisis y reportes** financieros automáticos
- **Interfaz moderna y responsiva** para todos los dispositivos

---

## 🚀 Características Principales

### 🤖 **Procesamiento Inteligente con IA**
- **OCR Automático**: Extracción de texto usando Tesseract.js
- **IA de Google Gemini**: Análisis y estructuración de datos
- **Procesamiento Automático**: Sin intervención manual requerida
- **Validación Inteligente**: Verificación automática de datos extraídos

### 📊 **Dashboard Analítico**
- **Estadísticas en Tiempo Real**: Métricas de facturas procesadas
- **Análisis Financiero**: Totales, impuestos, descuentos
- **Gráficos Interactivos**: Facturas por mes con tooltips detallados
- **Categorización Automática**: Clasificación por tipo de gasto
- **Proveedores Principales**: Análisis de frecuencia

### 🔍 **Sistema de Búsqueda y Filtros**
- **Búsqueda Inteligente**: Por proveedor, número de factura, nombre de archivo
- **Filtros por Estado**: Pendientes, procesadas, con errores
- **Ordenamiento**: Por fecha, monto, proveedor
- **Vista Responsiva**: Adaptada para móviles y desktop

### 📱 **Interfaz Moderna y Responsiva**
- **Diseño CMS**: Sidebar de navegación profesional
- **Modo Oscuro/Claro**: Soporte completo para temas
- **Responsive Design**: Optimizado para todos los dispositivos
- **Menú Hamburguesa**: Navegación móvil intuitiva
- **Animaciones Suaves**: Transiciones y efectos visuales

### 🔐 **Sistema de Autenticación**
- **Autenticación Supabase**: Segura y escalable
- **Gestión de Usuarios**: Sesiones individuales
- **Protección de Rutas**: Middleware de autenticación
- **Logout Seguro**: Cierre de sesión con confirmación

---

## 🏗️ Arquitectura del Proyecto

### **Stack Tecnológico**
```
Frontend:
├── Next.js 14 (App Router)
├── TypeScript 5.0
├── Tailwind CSS
├── React Hooks
└── Responsive Design

Backend & AI:
├── Supabase (Database + Auth + Storage)
├── Google Gemini AI
├── Tesseract.js (OCR)
└── Edge Functions

Componentes:
├── DashboardStats (Estadísticas)
├── InvoiceProcessor (Procesamiento)
├── InvoiceDataDisplay (Visualización)
├── ConfirmModal (Confirmaciones)
└── AdvancedSearch (Búsqueda)
```

### **Estructura de Carpetas**
```
facturacion-ia-1/
├── src/
│   ├── app/
│   │   ├── auth/           # Página de autenticación
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── lib/           # Clientes y utilidades
│   │   └── globals.css    # Estilos globales
│   ├── components/        # Componentes reutilizables
│   └── lib/
│       └── supabase/      # Configuración de Supabase
├── public/               # Archivos estáticos
├── credenciales/        # Configuración de credenciales
└── database_update.sql  # Scripts de base de datos
```

---

## 🧩 Componentes Detallados

### **1. DashboardStats** 📊
**Propósito**: Visualización de estadísticas y métricas del sistema

**Funcionalidades**:
- **Métricas Principales**: Total facturas, procesadas, gastos, por vencer
- **Desglose Financiero**: Subtotal, impuestos, descuentos, promedio
- **Categorías**: Top 5 categorías más frecuentes
- **Proveedores**: Proveedores principales con conteo
- **Gráfico Mensual**: Facturas por mes con tooltips detallados
- **Responsive**: Adapta layout según tamaño de pantalla

**Tecnologías**: React Hooks, Tailwind CSS, Chart.js (implícito)

### **2. InvoiceProcessor** 🤖
**Propósito**: Procesamiento automático de facturas con OCR e IA

**Funcionalidades**:
- **OCR Automático**: Extracción de texto con Tesseract.js
- **IA Integration**: Procesamiento con Google Gemini
- **Progress Tracking**: Barra de progreso en tiempo real
- **Error Handling**: Manejo robusto de errores
- **Auto-processing**: Procesamiento automático post-upload
- **Status Updates**: Estados de procesamiento en tiempo real

**Tecnologías**: Tesseract.js, Google Gemini AI, React Hooks

### **3. InvoiceDataDisplay** 📄
**Propósito**: Visualización y edición de datos extraídos

**Funcionalidades**:
- **Visualización Completa**: Todos los campos extraídos
- **Modo Edición**: Edición inline de datos
- **Validación Visual**: Indicadores de campos encontrados/faltantes
- **Items de Factura**: Lista detallada de productos/servicios
- **Formato Inteligente**: Monedas, fechas, categorías
- **Responsive Layout**: Adaptación móvil completa

**Tecnologías**: React Hooks, Tailwind CSS, Form Validation

### **4. ConfirmModal** ⚠️
**Propósito**: Confirmaciones y alertas del sistema

**Funcionalidades**:
- **Confirmaciones Destructivas**: Eliminación de facturas
- **Modo Destructivo**: Estilo visual diferenciado
- **Keyboard Support**: Escape para cerrar
- **Backdrop Click**: Cierre al hacer clic fuera
- **Responsive**: Botones apilados en móvil

**Tecnologías**: React Hooks, Tailwind CSS, Accessibility

### **5. AdvancedSearch** 🔍
**Propósito**: Búsqueda avanzada y filtrado de facturas

**Funcionalidades**:
- **Búsqueda en Tiempo Real**: Filtrado instantáneo
- **Múltiples Campos**: Proveedor, número, archivo
- **Filtros por Estado**: Dropdown de estados
- **Resultados Dinámicos**: Actualización automática
- **Responsive**: Adaptación completa móvil

**Tecnologías**: React Hooks, Tailwind CSS, Debouncing

---

## 🗄️ Base de Datos

### **Esquema Principal**
```sql
-- Tabla de archivos/facturas
CREATE TABLE files (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  extracted_text TEXT,
  
  -- Campos extraídos por IA
  proveedor TEXT,
  fecha DATE,
  monto DECIMAL(10,2),
  numeroFactura TEXT,
  categoria TEXT,
  moneda TEXT DEFAULT 'MXN',
  impuestos DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  descuentos DECIMAL(10,2),
  fechaVencimiento DATE,
  metodoPago TEXT,
  direccionProveedor TEXT,
  rfcProveedor TEXT,
  items JSONB -- Array de items de la factura
);
```

### **Vistas y Funciones**
- **Vista de Estadísticas**: Agregación de datos para dashboard
- **RLS (Row Level Security)**: Seguridad por usuario
- **Índices Optimizados**: Para búsquedas rápidas
- **Triggers**: Actualización automática de estadísticas

---

## 🤖 Integración con IA

### **Google Gemini AI**
- **Modelo**: Gemini Pro
- **Prompt Engineering**: Prompts optimizados para facturas
- **Validación**: Verificación de datos extraídos
- **Fallbacks**: Manejo de errores de IA
- **Rate Limiting**: Control de uso de API

### **Tesseract.js OCR**
- **Idioma**: Español (spa)
- **Configuración**: Optimizada para facturas
- **Progress Tracking**: Monitoreo en tiempo real
- **Error Handling**: Manejo de imágenes problemáticas

---

## 🎨 Diseño y UX

### **Sistema de Diseño**
- **Paleta de Colores**: Azul/Púrpura profesional
- **Tipografía**: Inter (sistema)
- **Iconografía**: Heroicons
- **Espaciado**: Sistema 8px
- **Bordes**: Radios consistentes

### **Responsive Breakpoints**
```css
sm: 640px   /* Móviles grandes */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Pantallas grandes */
```

### **Modo Oscuro**
- **Soporte Completo**: Todos los componentes
- **Transiciones Suaves**: Cambio automático
- **Accesibilidad**: Contraste optimizado
- **Consistencia**: Misma funcionalidad en ambos modos

---

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase
- API Key de Google AI (Gemini)

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/facturacion-ia-1.git
cd facturacion-ia-1
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Variables de Entorno**
Copia el archivo de ejemplo y configura tus credenciales:
```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales:
```env
# Supabase Configuration (Públicas - seguras para el navegador)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Google AI Configuration (Servidor - NO se expone al navegador)
GOOGLE_API_KEY=tu_google_api_key
```

**🔒 Nota de Seguridad**: 
- Las variables `NEXT_PUBLIC_*` se exponen al navegador (son seguras para Supabase)
- `GOOGLE_API_KEY` se mantiene en el servidor y nunca se expone al cliente
- Esto protege tu API key de Google AI de ser visible en el código del navegador

### **4. Configurar Base de Datos**
1. Ve a tu proyecto en Supabase Dashboard
2. Ejecuta el script `database_update.sql` en el SQL Editor
3. Configura las políticas de RLS (Row Level Security)

### **5. Ejecutar en Desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🌐 Deployment en Vercel

### **Configuración Automática**

1. **Conectar con GitHub**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

2. **Configurar Variables de Entorno**
   - En el dashboard de Vercel, ve a **Settings → Environment Variables**
   - Agrega las siguientes variables:
   ```
   # Variables públicas (seguras para el navegador)
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   
   # Variable del servidor (NO se expone al navegador)
   GOOGLE_API_KEY=tu_google_api_key
   ```

   **🔒 Importante**: 
   - `GOOGLE_API_KEY` se mantiene en el servidor y nunca se expone al cliente
   - Esto elimina la advertencia de seguridad de Vercel
   - Tu API key de Google AI está completamente protegida

3. **Deploy Automático**
   - Cada push a `main` activará un nuevo deployment
   - Vercel construirá automáticamente la aplicación
   - La URL estará disponible en el dashboard

### **Configuración Manual (Opcional)**

Si prefieres configurar manualmente:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Deploy
vercel

# Para producción
vercel --prod
```

### **Solución de Problemas Comunes**

**Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"**
- Verifica que las variables de entorno estén configuradas en Vercel
- Asegúrate de que los nombres coincidan exactamente

**Error: "Cannot access before initialization"**
- Este error ya está solucionado con `export const dynamic = 'force-dynamic'`
- Las páginas ahora son dinámicas en lugar de estáticas

**Error: "API key not valid"**
- Verifica que tu API key de Google AI esté activa
- Confirma que tienes cuota disponible en Google AI Studio

### **Optimizaciones para Producción**

- ✅ **Páginas Dinámicas**: Evita problemas de SSG
- ✅ **Configuración Robusta**: Manejo seguro de variables de entorno
- ✅ **Error Handling**: Validación en runtime
- ✅ **Responsive Design**: Optimizado para todos los dispositivos

---

## 🚀 Roadmap y Futuras Características

### **Fase 1: Mejoras Inmediatas** 🎯
- [ ] **Exportación de Datos**: PDF, Excel, CSV
- [ ] **Notificaciones Push**: Alertas de facturas por vencer
- [ ] **Búsqueda Avanzada**: Filtros por fecha, monto, categoría
- [ ] **Bulk Operations**: Operaciones masivas en facturas
- [ ] **Backup Automático**: Respaldo de datos críticos

### **Fase 2: Funcionalidades Avanzadas** 🚀
- [ ] **Machine Learning**: Predicción de categorías
- [ ] **Análisis Predictivo**: Forecasting de gastos
- [ ] **Integración ERP**: Conexión con sistemas empresariales
- [ ] **API REST**: Endpoints para integraciones
- [ ] **Webhooks**: Notificaciones automáticas

### **Fase 3: Escalabilidad** 🌟
- [ ] **Multi-tenant**: Soporte para múltiples empresas
- [ ] **Microservicios**: Arquitectura distribuida
- [ ] **Cache Redis**: Optimización de rendimiento
- [ ] **CDN**: Distribución global de contenido
- [ ] **Monitoring**: Logs y métricas avanzadas

### **Fase 4: IA Avanzada** 🤖
- [ ] **Computer Vision**: Análisis de imágenes mejorado
- [ ] **NLP Avanzado**: Comprensión de contexto
- [ ] **Auto-categorización**: ML para clasificación
- [ ] **Detección de Fraudes**: Análisis de anomalías
- [ ] **Chatbot IA**: Asistente virtual

### **Fase 5: Mobile & Desktop** 📱💻
- [ ] **App Móvil**: React Native / Flutter
- [ ] **Desktop App**: Electron
- [ ] **Offline Mode**: Funcionalidad sin conexión
- [ ] **Sync Multi-device**: Sincronización entre dispositivos
- [ ] **Push Notifications**: Notificaciones nativas

---

## 🤝 Contribución

### **Cómo Contribuir**
1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### **Estándares de Código**
- **TypeScript**: Tipado estricto
- **ESLint**: Linting automático
- **Prettier**: Formateo de código
- **Conventional Commits**: Mensajes de commit estandarizados
- **Testing**: Tests unitarios y de integración

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👥 Autores

- **Juan** - *Desarrollo inicial* - [TuGitHub](https://github.com/tu-usuario)

### **Agradecimientos**
- **Supabase** por la infraestructura backend
- **Google** por la API de Gemini AI
- **Next.js** por el framework React
- **Tailwind CSS** por el sistema de diseño

---

## 📞 Soporte

- **Email**: soporte@facturaia.com
- **Documentación**: [docs.facturaia.com](https://docs.facturaia.com)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/facturacion-ia-1/issues)
- **Discord**: [Servidor de la comunidad](https://discord.gg/facturaia)

---

## 🏆 Estado del Proyecto

![Estado del Proyecto](https://img.shields.io/badge/Estado-Producción%20Ready-green?style=for-the-badge)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue?style=for-the-badge)
![Última Actualización](https://img.shields.io/badge/Última%20Actualización-Diciembre%202024-orange?style=for-the-badge)

---

*FacturaIA - Transformando la gestión de facturas con Inteligencia Artificial* 🚀
