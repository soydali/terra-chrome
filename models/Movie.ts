import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Film başlığı zorunludur'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Yıl zorunludur']
  },
  description: {
    type: String,
    required: [true, 'Açıklama zorunludur']
  },
  image: {
    type: String,
    required: [true, 'Görsel URL zorunludur']
  },
  videoUrl: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    required: [true, 'Puan zorunludur'],
    min: [0, 'Puan 0-10 arasında olmalıdır'],
    max: [10, 'Puan 0-10 arasında olmalıdır']
  },
  director: {
    type: String,
    required: [true, 'Yönetmen zorunludur']
  },
  cast: {
    type: [String],
    required: [true, 'Oyuncular zorunludur']
  },
  duration: {
    type: String,
    required: [true, 'Süre zorunludur']
  },
  genre: {
    type: [String],
    required: [true, 'Tür zorunludur']
  },
  status: {
    type: String,
    enum: ['Aktif', 'Beklemede'],
    default: 'Beklemede'
  },
  addedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Movie || mongoose.model('Movie', movieSchema); 