import multer from 'multer';
import { httpError } from '../utils/httpError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(httpError(400, 'Invalid file type. Only PDF resumes (application/pdf) are allowed.'));
  }
};

export const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter
}).single('resume');
