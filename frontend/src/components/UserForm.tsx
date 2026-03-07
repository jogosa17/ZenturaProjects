import React, { useState, useEffect } from 'react';
import { CreateUserDto, User } from '../services/user.service';
import './UserForm.css';

interface UserFormProps {
  onSubmit: (data: CreateUserDto) => Promise<void>;
  onCancel: () => void;
  initialData?: User | null;
  loading?: boolean;
}

// Función para generar usuario automático
const generateUsername = (dni: string): string => {
  if (!dni || dni.length < 8) return '1234';
  
  // Limpiar el DNI de espacios y caracteres no deseados
  const dniLimpio = dni.trim().toUpperCase();
  console.log('🔍 DNI recibido para username:', dni);
  console.log('🔍 DNI limpio para username:', dniLimpio);
  
  // Extraer la letra del DNI (último carácter)
  const letra = dniLimpio.slice(-1);
  console.log('🔍 Letra extraída para username:', letra);
  
  // Extraer los números del DNI (todos excepto el último carácter)
  const numerosDni = dniLimpio.slice(0, -1);
  console.log('🔍 Números del DNI para username:', numerosDni);
  
  // Verificar que la letra sea válida
  if (!/^[A-Z]$/.test(letra)) {
    console.warn('⚠️ El último carácter no es una letra válida para username:', letra);
    return '1234';
  }
  
  // Verificar que los números sean válidos
  if (!/^\d+$/.test(numerosDni)) {
    console.warn('⚠️ Los caracteres extraídos no son números válidos para username:', numerosDni);
    return '1234';
  }
  
  // Extraer 4 números aleatorios de los números del DNI
  const numerosArray = numerosDni.split('');
  const numerosAleatorios = [];
  
  // Mezclar los números y tomar 4
  for (let i = numerosArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numerosArray[i], numerosArray[j]] = [numerosArray[j], numerosArray[i]];
  }
  
  // Tomar los primeros 4 números mezclados
  for (let i = 0; i < 4; i++) {
    numerosAleatorios.push(numerosArray[i]);
  }
  
  const numerosSeleccionados = numerosAleatorios.join('');
  const username = letra + numerosSeleccionados;
  console.log('🔍 4 números aleatorios del DNI para username:', numerosSeleccionados);
  console.log('🔍 Username generado:', username);
  
  return username;
};

// Función para generar contraseña automática
const generatePassword = (dni: string): string => {
  if (!dni || dni.length < 8) return '1234';
  
  // Limpiar el DNI de espacios y caracteres no deseados
  const dniLimpio = dni.trim().toUpperCase();
  console.log('🔍 DNI recibido para password:', dni);
  console.log('🔍 DNI limpio para password:', dniLimpio);
  
  // Extraer los números del DNI (todos excepto el último carácter)
  const numerosDni = dniLimpio.slice(0, -1);
  console.log('🔍 Números del DNI para password:', numerosDni);
  
  // Verificar que los números sean válidos
  if (!/^\d+$/.test(numerosDni)) {
    console.warn('⚠️ Los caracteres extraídos no son números válidos para password:', numerosDni);
    return '1234';
  }
  
  // Extraer 4 números aleatorios de los números del DNI
  const numerosArray = numerosDni.split('');
  const numerosAleatorios = [];
  
  // Mezclar los números y tomar 4
  for (let i = numerosArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numerosArray[i], numerosArray[j]] = [numerosArray[j], numerosArray[i]];
  }
  
  // Tomar los primeros 4 números mezclados
  for (let i = 0; i < 4; i++) {
    numerosAleatorios.push(numerosArray[i]);
  }
  
  const password = numerosAleatorios.join('');
  console.log('🔍 4 números aleatorios del DNI para password:', password);
  console.log('🔍 Contraseña generada:', password);
  
  return password;
};

// Componente Modal para mostrar credenciales generadas
const CredentialsModal: React.FC<{
  show: boolean;
  username: string;
  password: string;
  onAccept: () => void;
}> = ({ show, username, password, onAccept }) => {
  if (!show) return null;

  return (
    <div className="credentials-modal-overlay">
      <div className="credentials-modal">
        <h3>🔐 Credenciales Generadas</h3>
        <div className="credentials-content">
          <div className="credential-item">
            <label>Usuario:</label>
            <div className="credential-value">{username}</div>
          </div>
          <div className="credential-item">
            <label>Contraseña:</label>
            <div className="credential-value">{password}</div>
          </div>
        </div>
        <div className="credentials-warning">
          <strong>⚠️ Importante:</strong> Guarde estas credenciales en un lugar seguro.
          El usuario necesitará este usuario y contraseña para iniciar sesión.
        </div>
        <button className="btn-accept-credentials" onClick={onAccept}>
          Entendido
        </button>
      </div>
    </div>
  );
};

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel, initialData, loading = false }) => {
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    dni: '',
    username: '',
    password: '',
    role: 'worker'
  });

  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({
    username: '',
    password: ''
  });

  // Verificar si el usuario actual es administrador
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        dni: initialData.dni || '',
        username: initialData.username || '',
        password: isAdmin ? (initialData.password || '') : '', // Solo mostrar contraseña si es admin
        role: initialData.role
      });
    }
  }, [initialData, isAdmin]);

  // Manejar clic fuera del modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Manejar tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onCancel]);

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    console.log('🔍 handleDniChange llamado con:', value);
    
    setFormData(prev => ({
      ...prev,
      dni: value
    }));
    
    // No generar credenciales aquí, solo al guardar
    console.log('🔍 DNI actualizado, esperando a guardar para generar credenciales');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // No permitir modificar username o contraseña si no es un usuario nuevo
    if ((name === 'username' || name === 'password') && initialData) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAcceptCredentials = async () => {
    // Cerrar el modal y el formulario al aceptar las credenciales
    setShowCredentialsModal(false);
    onCancel(); // Cerrar el formulario
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que el DNI sea válido antes de generar credenciales
    if (!formData.dni || formData.dni.length < 9) {
      alert('Por favor, introduzca un DNI válido (8 números + 1 letra)');
      return;
    }
    
    // Generar usuario y contraseña al guardar
    console.log('🔍 Generando credenciales al guardar el formulario...');
    const newUsername = generateUsername(formData.dni);
    const newPassword = generatePassword(formData.dni);
    
    console.log('🔍 Username generado:', newUsername);
    console.log('🔍 Password generado:', newPassword);
    
    // Actualizar formData con las credenciales generadas
    const finalFormData = {
      ...formData,
      username: newUsername,
      password: newPassword
    };
    
    try {
      // Intentar guardar el usuario
      await onSubmit(finalFormData);
      
      // Si se guardó exitosamente, mostrar modal con las credenciales
      setGeneratedCredentials({
        username: newUsername,
        password: newPassword
      });
      setShowCredentialsModal(true);
      // NO cerrar el formulario aquí - esperar a que el usuario cierre el modal
      
    } catch (error: any) {
      console.error('Error al guardar:', error);
      
      // Verificar si es error de conflicto (409)
      if (error.response && error.response.status === 409) {
        const errorMessage = error.response.data?.message || '';
        
        if (errorMessage.includes('email')) {
          alert('Error: El email ya está registrado. Por favor use otro email.');
        } else if (errorMessage.includes('usuario') || errorMessage.includes('username')) {
          alert('Error: El usuario generado ya existe. Por favor intente guardar nuevamente para generar otro usuario.');
        } else {
          alert('Error: Ya existe un usuario con estos datos.');
        }
      } else {
        alert('Error al guardar el usuario. Por favor intente nuevamente.');
      }
    }
  };

  return (
    <div className="user-form-overlay" onClick={handleOverlayClick}>
      <div className="user-form-modal">
        <h3>{initialData ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dni">DNI</label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleDniChange}
              placeholder="12345678A"
              required={!initialData}
              disabled={!!initialData}
            />
            {!initialData && (
              <small className="form-hint">Introduzca 8 números + 1 letra. Las credenciales se generarán al guardar.</small>
            )}
          </div>

          {initialData && (
            <>
              <div className="form-group">
                <label htmlFor="username">Usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  readOnly
                  className="readonly-input"
                />
              </div>

              {isAdmin && (
                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="text"
                    id="password"
                    name="password"
                    value={formData.password || ''}
                    readOnly
                    className="readonly-input"
                  />
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={!!initialData}
            >
              <option value="worker">Trabajador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
      
      <CredentialsModal
        show={showCredentialsModal}
        username={generatedCredentials.username}
        password={generatedCredentials.password}
        onAccept={handleAcceptCredentials}
      />
    </div>
  );
};

export default UserForm;
