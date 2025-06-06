import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Dizi başlığı zorunludur'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Başlangıç yılı zorunludur']
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
    required: [true, 'Yönetmen/Yapımcı zorunludur']
  },
  cast: {
    type: [String],
    required: [true, 'Oyuncular zorunludur']
  },
  genre: {
    type: [String],
    required: [true, 'Tür zorunludur']
  },
  numberOfSeasons: {
    type: Number,
    required: [true, 'Sezon sayısı zorunludur'],
    min: [1, 'Sezon sayısı en az 1 olmalıdır']
  },
  episodes: [{
    title: { type: String, required: true },
    videoUrl: { type: String, default: '' }
  }],
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

export default mongoose.models.Series || mongoose.model('Series', seriesSchema); 