'use client';
import { useEffect, useState, useRef } from 'react';
import { getAdminUsers, toggleUserStatus, assignUserRole, createAdminUser, updateAdminUser, deleteAdminUser } from '@/lib/api';
import gsap from 'gsap';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // CREATE or EDIT
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    cedula: '',
    semester: '',
    role: 'USER'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    setCurrentUserRole(localStorage.getItem('userRole'));
    loadUsers();
  }, []);

  useEffect(() => {
    if (isModalOpen && modalRef.current && backdropRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(modalRef.current, 
          { scale: 0.8, opacity: 0, y: 50 }, 
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
        );
      });
      return () => ctx.revert();
    }
  }, [isModalOpen]);

  const loadUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data.users);
    } catch (err) {
      console.error('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const data = await toggleUserStatus(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: data.isActive } : u));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const handleDeleteUser = async (userId, firstName) => {
    if (!confirm(`🚨 ¿Estás seguro de que deseas ELIMINAR permanentemente a ${firstName}? Esta acción borrará todas sus hojas de ruta y no se puede deshacer.`)) return;
    
    try {
      await deleteAdminUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setFormData({ firstName: '', lastName: '', email: '', password: '', cedula: '', semester: '', role: 'USER' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalMode('EDIT');
    setSelectedUser(user.id);
    setFormData({ 
      firstName: user.firstName, 
      lastName: user.lastName,
      email: user.email, 
      password: '', // Solo se usa si backend lo soporta, aquí la dejaremos vacía en update
      cedula: user.cedula || '', 
      semester: user.semester || '', 
      role: user.role 
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (modalMode === 'CREATE') {
        if (!formData.password) throw new Error('La contraseña es obligatoria para crear un usuario');
        const data = await createAdminUser(formData);
        setUsers([data.user, ...users]); // Agrega al inicio
      } else {
        const updateData = { ...formData };
        delete updateData.password; // En esta versión no actualizamos clave desde aquí
        const data = await updateAdminUser(selectedUser, updateData);
        setUsers(users.map(u => u.id === selectedUser ? { ...u, ...data.user } : u));
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Error en la solicitud');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-extrabold">
          Gestión de <span className="text-gradient">Usuarios</span>
        </h2>
        <button 
          onClick={openCreateModal}
          className="btn-gradient flex items-center gap-2 text-sm py-2.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Crear Usuario
        </button>
      </div>

      <div className="glass-card overflow-hidden relative z-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Detalles</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rol</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
                        {user.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-slate-300">C.I: {user.cedula || 'N/A'}</p>
                    <p className="text-xs text-slate-400">{user.semester || 'Sin semestre'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider border
                      ${user.role === 'SUPERADMIN' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 
                        user.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      {user.isActive ? 'Activo' : 'Inhabilitado'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {/* Botón Editar */}
                    {(currentUserRole === 'SUPERADMIN' || user.role === 'USER') && (
                      <button 
                        onClick={() => openEditModal(user)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-semibold inline-flex items-center gap-1"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    )}

                    {/* Botón Bloquear/Desbloquear */}
                    {user.role !== 'SUPERADMIN' && !(currentUserRole === 'ADMIN' && user.role === 'ADMIN') && (
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-semibold inline-flex items-center gap-1
                          ${user.isActive 
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'}`}
                        title={user.isActive ? 'Inhabilitar' : 'Activar'}
                      >
                        {user.isActive ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Botón Eliminar */}
                    {user.role !== 'SUPERADMIN' && !(currentUserRole === 'ADMIN' && user.role === 'ADMIN') && (
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.firstName)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-semibold inline-flex items-center gap-1"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA CREAR / EDITAR */}
      {isModalOpen && (
        <div 
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            // Cerrar si se hace clic en el fondo negro, no en el contenido del modal
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div ref={modalRef} className="glass-card w-full max-w-md p-6 relative shadow-2xl m-auto max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold mb-6 text-white">
              {modalMode === 'CREATE' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Nombre</label>
                  <input 
                    type="text" required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50"
                    value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Apellido</label>
                  <input 
                    type="text" required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50"
                    value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Correo Electrónico</label>
                <input 
                  type="email" required 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {modalMode === 'CREATE' && (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Contraseña Temporal</label>
                  <input 
                    type="text" required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Cédula</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50"
                    value={formData.cedula} onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Semestre</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50"
                    value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  />
                </div>
              </div>

              {currentUserRole === 'SUPERADMIN' && (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Rol</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50 [&>option]:bg-[#131b2e]"
                    value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="USER">ESTUDIANTE (USER)</option>
                    <option value="ADMIN">ADMINISTRADOR</option>
                    <option value="SUPERADMIN">SÚPER ADMIN</option>
                  </select>
                </div>
              )}

              <button 
                type="submit" disabled={formLoading}
                className="w-full btn-gradient py-3 mt-4 disabled:opacity-50"
              >
                {formLoading ? 'Guardando...' : 'Guardar Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
