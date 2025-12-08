'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { DatosFactura } from '../lib/geminiClient';
import InvoiceProcessor from '@/components/InvoiceProcessor';
import InvoiceDataDisplay from '@/components/InvoiceDataDisplay';
import DashboardStats from '@/components/DashboardStats';
import InvoiceCalculator from '@/components/InvoiceCalculator';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type FileStatus = 'pending' | 'uploaded' | 'processing' | 'processed' | 'error';

interface FileData {
  id: string;
  file_path: string;
  created_at: string;
  user_id: string;
  status: FileStatus;
  extracted_text: string | null;
  // Campos extraídos por la IA
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
  items: InvoiceItem[]; // Items de la factura en formato JSON
}

interface InvoiceItem {
  descripcion: string;
  cantidad: number | null;
  precioUnitario: number | null;
  subtotal: number | null;
}

// Función auxiliar para obtener el nombre del archivo
const getFileName = (filePath: string) => {
  const parts = filePath.split('/');
  return parts[parts.length - 1] || 'Archivo sin nombre';
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeFileUrl, setActiveFileUrl] = useState<string | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFileData, setActiveFileData] = useState<DatosFactura | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FileStatus | 'all'>('all');

  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Estado para la navegación del sidebar
  const [activeView, setActiveView] = useState<'stats' | 'list' | 'calculator'>('stats');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Función para procesar texto con IA usando la API route
  const processFile = async (texto: string): Promise<DatosFactura> => {
    try {
      const response = await fetch('/api/process-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: texto }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar con IA');
      }

      const { data } = await response.json();
      return data;
    } catch (error: unknown) {
      console.error('Error procesando con IA:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error('Error al procesar con IA: ' + errorMessage);
    }
  };

  const fetchFiles = useCallback(async (userId: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files from DB:', error);
      } else {
        setFiles(data as FileData[]);
      }
    } catch (err) {
      console.error('Exception in fetchFiles:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const syncFiles = async () => {
    if (!user) return;
    setSyncing(true);

    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('facturas')
      .list(user.id, { limit: 100, offset: 0 });

    if (storageError) {
      console.error("Error al listar archivos de Storage:", storageError);
      setSyncing(false);
      return;
    }

    const { data: dbFiles, error: dbError } = await supabase
      .from('files')
      .select('name')
      .eq('user_id', user.id);

    if (dbError) {
      console.error("Error al consultar la base de datos:", dbError);
      setSyncing(false);
      return;
    }

    const dbFileNames = new Set(dbFiles.map((f: { name: string }) => f.name));
    const filesToInsert = storageFiles
      .filter((sf: { name: string }) => !dbFileNames.has(sf.name))
      .map((sf: { name: string }) => ({
        user_id: user.id,
        name: sf.name,
        file_path: `${user.id}/${sf.name}`,
        status: 'pending' as const,
      }));

    if (filesToInsert.length > 0) {
      await supabase.from('files').insert(filesToInsert);
    }

    await fetchFiles(user.id);
    setSyncing(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        fetchFiles(session.user.id);
        setCheckingAuth(false);
      } else {
        router.push('/auth');
      }
    };
    checkUser();
  }, [router, supabase.auth, fetchFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange called');
    console.log('Files in input:', e.target.files);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Selected file:', file.name, file.size, file.type);
      setSelectedFile(file);
    } else {
      console.log('No file selected');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    console.log('handleUpload called');
    console.log('selectedFile:', selectedFile);
    console.log('user:', user);

    if (!selectedFile || !user) {
      console.log('Missing selectedFile or user, returning early');
      return;
    }

    console.log('Starting upload process...');
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${selectedFile.name}`;
    console.log('File path:', filePath);

    try {
      console.log('Uploading to Supabase storage...');
      const { error: uploadError } = await supabase.storage
        .from('facturas')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Error subiendo el archivo:', uploadError);
        setUploading(false);
        return;
      }

      console.log('File uploaded successfully, inserting into database...');
      const { data: insertData, error: insertError } = await supabase.from('files').insert({
        user_id: user.id,
        file_path: filePath,
        status: 'uploaded',
      }).select();

      if (insertError) {
        console.error('Error inserting into database:', insertError);
        setUploading(false);
        return;
      }

      console.log('File inserted successfully, starting AI processing...');
      setSelectedFile(null);
      setUploading(false);

      // Actualizar la lista de archivos
      await fetchFiles(user.id);

      // Procesar automáticamente con IA si se insertó correctamente
      if (insertData && insertData.length > 0) {
        const newFile = insertData[0] as FileData;
        console.log('Starting automatic AI processing for file:', newFile.id);

        // Procesar automáticamente la factura
        await processFileAutomatically(newFile);
      }

      console.log('Upload and processing process completed successfully');
    } catch (error) {
      console.error('Exception in handleUpload:', error);
      setUploading(false);
    }
  };

  // Nueva función para procesar automáticamente una factura
  const processFileAutomatically = async (file: FileData) => {
    if (!user) return;

    console.log('Processing file automatically:', file.id);

    // Actualizar estado a processing
    setFiles(files => files.map(f => f.id === file.id ? { ...f, status: 'processing' } : f));

    try {
      // Obtener la URL del archivo
      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/facturas/${file.file_path}`;

      // Procesar con Tesseract OCR
      console.log('Starting OCR processing...');
      const Tesseract = (await import('tesseract.js')).default;

      const result = await Tesseract.recognize(fileUrl, 'spa', {
        logger: (m) => {
          console.log('OCR Progress:', m.status, m.progress);
        },
      });

      const extractedText = result.data.text;
      console.log('OCR completed, extracted text length:', extractedText.length);

      // Procesar con IA
      console.log('Starting AI processing...');
      const datos: DatosFactura = await processFile(extractedText);
      console.log('AI processing completed:', datos);

      // Guardar resultados en la base de datos
      const { error: updateError } = await supabase
        .from('files')
        .update({
          extracted_text: extractedText,
          status: 'processed',
          proveedor: datos.proveedor,
          fecha: datos.fecha,
          monto: datos.monto,
          numeroFactura: datos.numeroFactura,
          categoria: datos.categoria,
          moneda: datos.moneda,
          impuestos: datos.impuestos,
          subtotal: datos.subtotal,
          descuentos: datos.descuentos,
          fechaVencimiento: datos.fechaVencimiento,
          metodoPago: datos.metodoPago,
          direccionProveedor: datos.direccionProveedor,
          rfcProveedor: datos.rfcProveedor,
          items: datos.items,
        })
        .eq('id', file.id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating file with AI results:', updateError);
        throw updateError;
      }

      // Actualizar la lista local
      setFiles(files =>
        files.map(f =>
          f.id === file.id
            ? {
              ...f,
              status: 'processed',
              ...datos,
              extracted_text: extractedText,
            }
            : f
        )
      );

      console.log('Automatic processing completed successfully for file:', file.id);
    } catch (error) {
      console.error('Error in automatic processing:', error);

      // Marcar como error en la base de datos
      await supabase.from('files').update({ status: 'error' }).eq('id', file.id);

      // Actualizar estado local
      setFiles(files => files.map(f => f.id === file.id ? { ...f, status: 'error' } : f));
    }
  };

  // Función para procesamiento manual (desde el panel derecho)
  const saveAndProcessFile = async (fileId: string, texto: string) => {
    if (!user) return;

    setFiles(files => files.map(f => f.id === fileId ? { ...f, status: 'processing' } : f));
    setActiveFileId(null);

    try {
      const datos: DatosFactura = await processFile(texto);

      const { error } = await supabase
        .from('files')
        .update({
          extracted_text: texto,
          status: 'processed',
          proveedor: datos.proveedor,
          fecha: datos.fecha,
          monto: datos.monto,
          numeroFactura: datos.numeroFactura,
          categoria: datos.categoria,
          moneda: datos.moneda,
          impuestos: datos.impuestos,
          subtotal: datos.subtotal,
          descuentos: datos.descuentos,
          fechaVencimiento: datos.fechaVencimiento,
          metodoPago: datos.metodoPago,
          direccionProveedor: datos.direccionProveedor,
          rfcProveedor: datos.rfcProveedor,
          items: datos.items,
        })
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (error) throw error;

      setFiles(files =>
        files.map(f =>
          f.id === fileId
            ? {
              ...f,
              status: 'processed',
              ...datos,
              extracted_text: texto,
            }
            : f
        )
      );
    } catch (error) {
      console.error('Error al procesar con IA o guardar:', error);
      await supabase.from('files').update({ status: 'error' }).eq('id', fileId);
      setFiles(files => files.map(f => f.id === fileId ? { ...f, status: 'error' } : f));
    }
  };

  const handleViewAndProcess = (file: FileData) => {
    setActiveFileUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/facturas/${file.file_path}`);
    setActiveFileId(file.id);

    // Si ya tiene datos procesados, mostrarlos
    if (file.status === 'processed' && (file.proveedor || file.monto)) {
      setActiveFileData({
        proveedor: file.proveedor,
        fecha: file.fecha,
        monto: file.monto,
        numeroFactura: file.numeroFactura,
        categoria: file.categoria,
        moneda: file.moneda,
        impuestos: file.impuestos,
        subtotal: file.subtotal,
        descuentos: file.descuentos,
        fechaVencimiento: file.fechaVencimiento,
        metodoPago: file.metodoPago,
        direccionProveedor: file.direccionProveedor,
        rfcProveedor: file.rfcProveedor,
        items: file.items || [],
      });
    } else {
      setActiveFileData(null);
    }
  };

  const handleSaveData = async (datos: DatosFactura) => {
    if (!activeFileId || !user) return;

    try {
      const { error } = await supabase
        .from('files')
        .update({
          proveedor: datos.proveedor,
          fecha: datos.fecha,
          monto: datos.monto,
          numeroFactura: datos.numeroFactura,
          categoria: datos.categoria,
          moneda: datos.moneda,
          impuestos: datos.impuestos,
          subtotal: datos.subtotal,
          descuentos: datos.descuentos,
          fechaVencimiento: datos.fechaVencimiento,
          metodoPago: datos.metodoPago,
          direccionProveedor: datos.direccionProveedor,
          rfcProveedor: datos.rfcProveedor,
          items: datos.items,
        })
        .eq('id', activeFileId)
        .eq('user_id', user.id);

      if (error) throw error;

      setFiles(files =>
        files.map(f =>
          f.id === activeFileId
            ? {
              ...f,
              ...datos,
            }
            : f
        )
      );

      setActiveFileData(datos);
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  };

  // Función para manejar la eliminación de facturas
  const handleDeleteFile = (file: FileData, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active el procesamiento
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete || !user) return;

    setDeleting(true);
    try {
      // Eliminar de Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('facturas')
        .remove([fileToDelete.file_path]);

      if (storageError) {
        console.error('Error eliminando archivo de Storage:', storageError);
      }

      // Eliminar de la base de datos
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileToDelete.id)
        .eq('user_id', user.id);

      if (dbError) {
        console.error('Error eliminando registro de DB:', dbError);
        throw dbError;
      }

      // Actualizar la lista local
      setFiles(files => files.filter(f => f.id !== fileToDelete.id));

      // Si la factura eliminada era la activa, limpiar el estado
      if (activeFileId === fileToDelete.id) {
        setActiveFileUrl(null);
        setActiveFileId(null);
        setActiveFileData(null);
      }

      console.log('Factura eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar la factura:', error);
    } finally {
      setDeleting(false);
      setFileToDelete(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Filtrar archivos
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchTerm === '' ||
      file.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFileName(file.file_path).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Cerrar menú de usuario cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: FileStatus) => {
    const statusConfig = {
      processed: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', text: 'Procesado' },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', text: 'Procesando' },
      error: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'Error' },
      uploaded: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', text: 'Subido' },
      pending: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', text: 'Pendiente' }
    };

    const config = statusConfig[status];

    if (!config) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {status}
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              FacturaIA Dashboard
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative user-menu">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Usuario
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="p-4 sm:p-6">
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveView('stats');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${activeView === 'stats'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Estadísticas</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('list');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${activeView === 'list'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Lista de Facturas</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('calculator');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${activeView === 'calculator'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Calculadora</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {activeView === 'stats' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Estadísticas del Dashboard
                </h2>
              </div>

              <DashboardStats files={files} />
            </div>
          ) : activeView === 'calculator' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Calculadora de Facturación
                </h2>
              </div>
              <InvoiceCalculator
                user={user}
                onInvoiceSaved={() => {
                  if (user) fetchFiles(user.id);
                  setActiveView('list');
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Gestión de Facturas
                </h2>
              </div>

              {/* Upload Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Subir Nueva Factura
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                    />
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>Subir Factura</span>
                        </>
                      )}
                    </button>
                  </div>

                  {uploading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-800 dark:text-blue-200 font-medium">
                          Procesando factura automáticamente...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Buscar por proveedor, número de factura..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as FileStatus | 'all')}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="pending">Pendientes</option>
                      <option value="uploaded">Subidas</option>
                      <option value="processing">Procesando</option>
                      <option value="processed">Procesadas</option>
                      <option value="error">Con errores</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Files List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Facturas ({filteredFiles.length})
                  </h3>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredFiles.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No hay facturas
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Sube tu primera factura para comenzar
                      </p>
                    </div>
                  ) : (
                    filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer relative group"
                        onClick={() => handleViewAndProcess(file)}
                      >
                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteFile(file, e)}
                          className="absolute top-2 left-2 sm:top-4 sm:left-4 w-8 h-8 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                          title="Eliminar factura"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate pl-10 sm:pl-12">
                                {getFileName(file.file_path)}
                              </h4>
                              {getStatusBadge(file.status)}
                            </div>

                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Subido: {new Date(file.created_at).toLocaleDateString('es-MX')}</span>
                              {file.proveedor && (
                                <span>• Proveedor: {file.proveedor}</span>
                              )}
                              {file.monto && (
                                <span>• Monto: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(file.monto)}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Panel for File Processing */}
          {activeFileUrl && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Procesamiento de Factura
                  </h3>
                  <button
                    onClick={() => {
                      setActiveFileUrl(null);
                      setActiveFileId(null);
                      setActiveFileData(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
                  {/* Image Panel */}
                  <div className="w-full lg:w-1/2 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
                    <div className="h-64 lg:h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={activeFileUrl}
                        alt="Factura"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Processing Panel */}
                  <div className="w-full lg:w-1/2 p-4 sm:p-6 overflow-y-auto">
                    {activeFileData ? (
                      <InvoiceDataDisplay
                        datos={activeFileData}
                        onSave={handleSaveData}
                      />
                    ) : (
                      <InvoiceProcessor
                        fileUrl={activeFileUrl}
                        onTextExtracted={(text) => {
                          if (activeFileId) {
                            saveAndProcessFile(activeFileId, text);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            title="Eliminar Factura"
            message={`¿Estás seguro de que quieres eliminar la factura "${fileToDelete ? getFileName(fileToDelete.file_path) : ''}"? Esta acción no se puede deshacer.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            isDestructive={true}
          />
        </main>
      </div>
    </div>
  );
}

