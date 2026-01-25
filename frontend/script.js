const API_URL = 'http://localhost:8000/api'

const loginForm = document.getElementById('loginForm')
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (data.success) {
      localStorage.setItem('token', data.data.token)
      window.location.href = 'dashboard.html'
    } else {
      document.getElementById('error').innerText = data.message
    }
  })
}

const table = document.getElementById('itemTable')
if (table) {
  fetch(`${API_URL}/items`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(res => res.json())
  .then(data => {
    data.data.forEach(item => {
      table.innerHTML += `
        <tr>
          <td>${item.item_code}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.condition}</td>
        </tr>
      `
    })
  })
}

function logout() {
  localStorage.removeItem('token')
  window.location.href = 'index.html'
}