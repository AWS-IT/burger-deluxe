import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Настройка хранилища файлов
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    cb(null, 'uploads/dishes/');
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Создаем уникальное имя файла с временной меткой
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Фильтр типов файлов
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла. Разрешены только JPEG, PNG и WebP изображения.'), false);
  }
};

// Конфигурация multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB по умолчанию
    files: 5 // Максимум 5 файлов за раз
  },
  fileFilter: fileFilter
});

// Middleware для обработки ошибок загрузки файлов
export const handleUploadErrors = (error: any, req: Request, res: any, next: Function) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Файл слишком большой. Максимальный размер: 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Слишком много файлов. Максимум: 5 файлов'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Неожиданное поле файла'
      });
    }
  }

  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Экспорт различных конфигураций upload
export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 5);
export const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 }
]);

export default upload;