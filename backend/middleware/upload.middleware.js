const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio de uploads existe
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-nombre_original
    // Limpiar nombre original de caracteres especiales
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Aceptar cualquier tipo de archivo por ahora, o restringir si es necesario
  // const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
  // const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // const mimetype = allowedTypes.test(file.mimetype);

  // if (extname && mimetype) {
  //   return cb(null, true);
  // } else {
  //   cb(new Error('Tipo de archivo no permitido'));
  // }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
