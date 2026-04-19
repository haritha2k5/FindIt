const path = require('path');
const { v4: uuid } = require('uuid');
const supabase = require('../config/supabase');

const uploadToSupabase = async (file) => {
  if (!file) return null;

  const bucketName = process.env.SUPABASE_BUCKET_NAME || 'lost-and-found';
  const ext = path.extname(file.originalname);
  const fileName = `items/${uuid()}${ext}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrl;
};

module.exports = { uploadToSupabase };
