import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Variables de entorno del servidor (no se exponen al cliente)
const apiKey = process.env.GOOGLE_API_KEY; // Sin NEXT_PUBLIC_
const genAI = new GoogleGenerativeAI(apiKey || '');

export async function POST(request: NextRequest) {
  try {
    // Validar API key
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google API key no configurada en el servidor' },
        { status: 500 }
      );
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Texto de factura requerido' },
        { status: 400 }
      );
    }

    // Procesar con Google AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite-001' });

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
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();

    // Extraer JSON del texto de respuesta
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON válido de la respuesta');
    }

    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, data });

  } catch (error: unknown) {
    console.error('Error procesando factura:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Error al procesar la factura',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}