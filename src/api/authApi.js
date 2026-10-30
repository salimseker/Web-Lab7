// Simulated server call. The fixed demo account is NOT a secret: everything shipped
// to the browser is readable, so this only stands in for a real backend check.
const DEMO_USERNAME = '230408006@st.biruni.edu.tr'
const DEMO_PASSWORD = 'demo123456'
const LATENCY_MS = 500

export function login(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalizedUsername = String(username ?? '').trim().toLowerCase()

      if (normalizedUsername === DEMO_USERNAME && password === DEMO_PASSWORD) {
        resolve({ username: normalizedUsername })
      } else {
        reject(new Error('Invalid credentials'))
      }
    }, LATENCY_MS)
  })
}
