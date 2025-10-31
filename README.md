
## Instalación

### Backend
```bash
cd backend
npm init -y
npm install express cors jsonwebtoken bcrypt sqlite3 sqlite
```

**package.json**
```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }
}
```

### Frontend
```bash
cd frontend
npm install -g @angular/cli
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

**tailwind.config.js**
```js
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0A0E27',
        'dark-card': '#131829',
        'dark-hover': '#1A1F3A',
        'dark-border': '#2A2F4A',
        'primary': '#8B5CF6',
        'primary-dark': '#7C3AED',
        'primary-light': '#A78BFA',
        'gray-text': '#E5E7EB',
        'gray-secondary': '#9CA3AF'
      }
    }
  }
}
```

**src/styles.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0A0E27;
  color: #E5E7EB;
}
```

## Ejecución
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
ng serve
```

Abrir: `http://localhost:4200`


##  API Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/posts
POST   /api/posts
GET    /api/projects
POST   /api/projects
GET    /api/messages
POST   /api/messages
```

