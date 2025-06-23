-- Script para agregar columna items a la tabla files
-- Ejecutar este script en tu proyecto de Supabase

-- Agregar columna items si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'items') THEN
        ALTER TABLE files ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Columna items agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna items ya existe';
    END IF;
END $$;

-- Actualizar la vista para incluir items
DROP VIEW IF EXISTS facturas_procesadas;
CREATE OR REPLACE VIEW facturas_procesadas AS
SELECT 
    id,
    user_id,
    file_path,
    created_at,
    updated_at,
    proveedor,
    fecha,
    monto,
    "numeroFactura",
    categoria,
    moneda,
    impuestos,
    subtotal,
    descuentos,
    "fechaVencimiento",
    "metodoPago",
    "direccionProveedor",
    "rfcProveedor",
    items,
    status
FROM files 
WHERE status = 'processed'
ORDER BY created_at DESC;

-- Agregar comentario para la columna items
COMMENT ON COLUMN files.items IS 'Items de la factura en formato JSON (descripción, cantidad, precio unitario, subtotal)';

-- Forzar actualización del esquema cache
COMMENT ON TABLE public.files IS 'Actualización de esquema cache - items agregados';

-- Mensaje de confirmación
SELECT 'Columna items agregada exitosamente a la tabla files.' as mensaje; 