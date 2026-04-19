const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');

// Check if Supabase credentials are configured
const hasSupabaseConfig = process.env.SUPABASE_URL && 
                         process.env.SUPABASE_SERVICE_ROLE_KEY && 
                         process.env.SUPABASE_BUCKET_NAME;

let upload;

if (hasSupabaseConfig) {
  // Production/Supabase: use memory storage
  // The actual upload to Supabase will be handled in the controller or a separate utility
  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
      }
    },
  });
} else {
  // Development: save to local disk
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  });

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
      }
    },
  });
}


module.exports = upload;
