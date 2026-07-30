import axios from 'axios'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://reale-production.up.railway.app/api'
).replace(/\/$/, '')

const api = axios.create({ baseURL: API_BASE_URL })

export const analyseConversation = (conversation) =>
  api.post('/analysis/analyse', { conversation }).then(r => r.data)

export const askData = (question) =>
  api.post('/analysis/ask', { question }).then(r => r.data)

export const getConversations = () =>
  api.get('/data/conversations').then(r => r.data)

export const getStats = () =>
  api.get('/data/stats').then(r => r.data)

export const clearCache = () =>
  api.delete('/data/cache').then(r => r.data)

export const transcribeAudio = (audioBlob, languageHint = '', filename = 'audio.wav') => {
  const form = new FormData()
  form.append('audio', audioBlob, filename)
  form.append('language_hint', languageHint)
  return api.post('/voice/transcribe', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const analyseTranscript = (transcript) =>
  api.post('/analysis/analyse', { conversation: transcript }).then(r => r.data)

export const createBatchStream = (batchSize) => {
  return fetch(`${API_BASE_URL}/analysis/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_size: batchSize }),
  })
}

export const getSalespeople = () =>
  api.get('/data/salespeople').then(r => r.data)

export default api
