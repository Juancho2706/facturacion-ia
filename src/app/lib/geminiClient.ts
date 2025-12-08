import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSafeConfig } from '@/lib/config';

const config = getSafeConfig();

// Inicializar el cliente de Gemini (solo para uso interno)
const genAI = new GoogleGenerativeAI(config.google.apiKey);

export async function generarRespuestaGemini(prompt: string) {
  if (!config.google.apiKey) {
    throw new Error('GOOGLE_API_KEY no está configurada en el servidor');
  }

  try {
    // Usar el modelo Gemini Flash Latest
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // Generar respuesta
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error('Error al generar respuesta con Gemini:', error);

    // Mensaje de error más específico
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new Error('API key de Google AI inválida. Verifica que tu API key sea correcta y esté activa.');
    }

    throw new Error('Error al procesar con IA: ' + (error as Error).message);
  }
}

/**
 * Define la estructura de un item individual de la factura.
 */
export interface ItemFactura {
  descripcion: string;
  cantidad: number | null;
  precioUnitario: number | null;
  subtotal: number | null;
}

/**
 * Define la estructura de los datos que se extraerán de la factura.
 * Mejorada con más campos y validaciones.
 */
export interface DatosFactura {
  proveedor: string | null;
  fecha: string | null;
  monto: number | null;
  numeroFactura: string | null;
  categoria: string | null;
  moneda: string | null;
  impuestos: number | null;
  subtotal: number | null;
  descuentos: number | null;
  fechaVencimiento: string | null;
  metodoPago: string | null;
  direccionProveedor: string | null;
  rfcProveedor: string | null;
  items: ItemFactura[]; // Array de items de la factura
}

/**
 * Valida y limpia los datos extraídos de la factura
 */
function validarYLimpiarDatos(datos: any): DatosFactura {
  const limpiados: DatosFactura = {
    proveedor: null,
    fecha: null,
    monto: null,
    numeroFactura: null,
    categoria: null,
    moneda: null,
    impuestos: null,
    subtotal: null,
    descuentos: null,
    fechaVencimiento: null,
    metodoPago: null,
    direccionProveedor: null,
    rfcProveedor: null,
    items: [],
  };

  // Función helper para limpiar strings
  const limpiarString = (valor: any): string | null => {
    if (!valor || typeof valor !== 'string') return null;
    const limpio = valor.trim().replace(/\s+/g, ' ');
    return limpio.length > 0 ? limpio : null;
  };

  // Función helper para limpiar números
  const limpiarNumero = (valor: any): number | null => {
    if (valor === null || valor === undefined || valor === '') return null;
    if (typeof valor === 'number') {
      return isNaN(valor) || valor < 0 ? null : valor;
    }
    const numero = parseFloat(String(valor).replace(/[^\d.-]/g, ''));
    return isNaN(numero) || numero < 0 ? null : numero;
  };

  // Función helper para validar fechas
  const limpiarFecha = (valor: any): string | null => {
    if (!valor) return null;
    const fecha = new Date(valor);
    return !isNaN(fecha.getTime()) ? fecha.toISOString().split('T')[0] : null;
  };

  // Aplicar limpieza a cada campo
  limpiados.proveedor = limpiarString(datos.proveedor);
  limpiados.fecha = limpiarFecha(datos.fecha);
  limpiados.monto = limpiarNumero(datos.monto);
  limpiados.numeroFactura = limpiarString(datos.numeroFactura);
  limpiados.categoria = limpiarString(datos.categoria);
  limpiados.impuestos = limpiarNumero(datos.impuestos);
  limpiados.subtotal = limpiarNumero(datos.subtotal);
  limpiados.descuentos = limpiarNumero(datos.descuentos);
  limpiados.fechaVencimiento = limpiarFecha(datos.fechaVencimiento);
  limpiados.metodoPago = limpiarString(datos.metodoPago);
  limpiados.direccionProveedor = limpiarString(datos.direccionProveedor);
  limpiados.rfcProveedor = limpiarString(datos.rfcProveedor);

  // Validación especial para moneda
  if (datos.moneda && typeof datos.moneda === 'string') {
    const moneda = datos.moneda.trim().toUpperCase();
    const monedasValidas = {
      'MXN': 'MXN', 'PESOS': 'MXN', 'PESO': 'MXN',
      'USD': 'USD', 'DOLARES': 'USD', 'DOLAR': 'USD', '$': 'USD',
      'EUR': 'EUR', 'EUROS': 'EUR', 'EURO': 'EUR'
    };
    limpiados.moneda = monedasValidas[moneda as keyof typeof monedasValidas] || null;
  }

  // Validación especial para RFC (debe tener al menos 10 caracteres)
  if (limpiados.rfcProveedor && limpiados.rfcProveedor.length < 10) {
    limpiados.rfcProveedor = null;
  }

  // Procesar items de la factura
  if (Array.isArray(datos.items)) {
    limpiados.items = datos.items.map((item: any) => ({
      descripcion: limpiarString(item.descripcion) || '',
      cantidad: limpiarNumero(item.cantidad),
      precioUnitario: limpiarNumero(item.precioUnitario),
      subtotal: limpiarNumero(item.subtotal),
    }));
  }

  return limpiados;
}

/**
 * Procesa el texto extraído de una factura para obtener datos estructurados.
 * Mejorada con prompt más específico y validaciones robustas.
 * @param texto - El texto completo de la factura.
 * @returns Un objeto con los datos estructurados de la factura.
 */
export async function procesarTextoFactura(texto: string): Promise<DatosFactura> {
  const prompt = `
Analiza esta factura y extrae los datos disponibles en formato JSON. Es importante que:

1. SOLO incluyas campos que encuentres claramente en la factura
2. Si un campo no está presente o no es claro, usa null
3. Las facturas pueden ser simples (solo proveedor, fecha, monto) o complejas (con todos los detalles)
4. Para montos, extrae solo números (sin símbolos de moneda)
5. Para fechas, usa formato YYYY-MM-DD
6. Para items, extrae cada línea de producto/servicio con su descripción, cantidad, precio unitario y subtotal

Estructura esperada:
{
  "proveedor": "nombre de la empresa o proveedor (null si no se encuentra)",
  "fecha": "fecha de la factura en formato YYYY-MM-DD (null si no se encuentra)",
  "monto": "monto total de la factura (solo números, null si no se encuentra)",
  "numeroFactura": "número de factura o folio (null si no se encuentra)",
  "categoria": "categoría del gasto (servicios, productos, impuestos, etc., null si no se encuentra)",
  "moneda": "moneda (MXN, USD, EUR, null si no se encuentra)",
  "impuestos": "monto de impuestos (solo números, null si no se encuentra)",
  "subtotal": "subtotal antes de impuestos (solo números, null si no se encuentra)",
  "descuentos": "monto de descuentos (solo números, null si no se encuentra)",
  "fechaVencimiento": "fecha de vencimiento en formato YYYY-MM-DD (null si no se encuentra)",
  "metodoPago": "método de pago (efectivo, tarjeta, transferencia, etc., null si no se encuentra)",
  "direccionProveedor": "dirección del proveedor (null si no se encuentra)",
  "rfcProveedor": "RFC del proveedor (null si no se encuentra)",
  "items": [
    {
      "descripcion": "descripción del producto o servicio",
      "cantidad": "cantidad (solo números, null si no se encuentra)",
      "precioUnitario": "precio unitario (solo números, null si no se encuentra)",
      "subtotal": "subtotal del item (solo números, null si no se encuentra)"
    }
  ]
}

Texto de la factura:
"""
${texto}
"""

IMPORTANTE: Responde SOLO con el JSON válido, sin texto adicional.
`;

  try {
    const respuesta = await generarRespuestaGemini(prompt);

    // Limpiar la respuesta para extraer solo el JSON
    let jsonString = respuesta.trim();

    // Buscar el JSON en la respuesta (por si la IA agregó texto adicional)
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    // Intentar parsear el JSON
    let datos;
    try {
      datos = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing JSON from AI response:', parseError);
      console.log('Raw AI response:', respuesta);
      throw new Error('La IA no pudo generar una respuesta JSON válida. Intenta con una imagen más clara.');
    }

    // Validar que sea un objeto
    if (typeof datos !== 'object' || datos === null) {
      throw new Error('La IA no generó un objeto JSON válido.');
    }

    // Validar y limpiar los datos
    const datosLimpios = validarYLimpiarDatos(datos);

    // Verificar que al menos tenemos datos básicos
    const camposBasicos = [datosLimpios.proveedor, datosLimpios.fecha, datosLimpios.monto];
    const camposBasicosEncontrados = camposBasicos.filter(campo => campo !== null).length;

    if (camposBasicosEncontrados === 0) {
      console.warn('⚠️ No se encontraron campos básicos (proveedor, fecha, monto). La factura puede ser muy simple o la imagen no es clara.');
    }

    console.log('✅ Datos extraídos exitosamente:', datosLimpios);
    return datosLimpios;

  } catch (error) {
    console.error('Error en procesarTextoFactura:', error);
    throw error;
  }
}

/**
 * Clasifica automáticamente la categoría de gasto basándose en el texto
 */
export async function clasificarGasto(texto: string, proveedor: string): Promise<string> {
  const prompt = `
Clasifica esta factura en una de las siguientes categorías:
- Servicios (luz, agua, internet, teléfono, etc.)
- Productos (materia prima, inventario, etc.)
- Impuestos (IVA, ISR, etc.)
- Transporte (gasolina, mantenimiento, etc.)
- Oficina (papelería, equipos, etc.)
- Marketing (publicidad, promociones, etc.)
- Otros

Proveedor: ${proveedor}
Texto de la factura: ${texto}

Responde solo con la categoría más apropiada.
`;

  try {
    const respuesta = await generarRespuestaGemini(prompt);
    return respuesta.trim();
  } catch (error) {
    console.error('Error al clasificar gasto:', error);
    return 'Otros';
  }
}

// Función simplificada para extraer solo datos básicos (mantener compatibilidad)
export async function extraerDatosBasicos(textoFactura: string) {
  const prompt = `
    Extrae los siguientes datos básicos de esta factura:
    
    ${textoFactura}
    
    Devuelve SOLO un JSON con esta estructura:
    {
      "proveedor": "nombre del proveedor",
      "fecha": "fecha en formato YYYY-MM-DD", 
      "monto": "monto total solo números"
    }
  `;

  try {
    const respuesta = await generarRespuestaGemini(prompt);
    const datos = JSON.parse(respuesta);
    return datos;
  } catch (error) {
    console.error('Error al extraer datos básicos:', error);
    return null;
  }
}
