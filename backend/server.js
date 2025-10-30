import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "supersecret";
let db;

// -------------------- BASE DE DATOS --------------------
const initDB = async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      username TEXT UNIQUE,
      password TEXT,
      bio TEXT,
      avatar TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      user_id INTEGER,
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // NUEVA TABLA DE COMENTARIOS DE PROYECTOS
  await db.exec(`
    CREATE TABLE IF NOT EXISTS project_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      user_id INTEGER,
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER,
      followed_id INTEGER,
      FOREIGN KEY (follower_id) REFERENCES users(id),
      FOREIGN KEY (followed_id) REFERENCES users(id)
    );
  `);
await db.exec(`
  CREATE TABLE IF NOT EXISTS reposts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    post_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    UNIQUE(user_id, post_id)
  );
`);

// Tabla de likes en posts
await db.exec(`
  CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    post_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    UNIQUE(user_id, post_id)
  );
`);
  // TABLA DE PROYECTOS
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      github_url TEXT,
      demo_url TEXT,
      technologies TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // TABLA DE LIKES EN PROYECTOS
  await db.exec(`
    CREATE TABLE IF NOT EXISTS project_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(project_id, user_id)
    );
  `);
await db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER,
    user2_id INTEGER,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id),
    UNIQUE(user1_id, user2_id)
  );
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );
`);
  console.log("Base de datos lista ");
};
initDB();

// -------------------- HELPERS --------------------
const verifyTokenAndGetId = (header) => {
  if (!header) throw { status: 401, message: "No hay token" };
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded.id;
  } catch (err) {
    throw { status: 401, message: "Token inválido o expirado", error: err.message };
  }
};

// -------------------- AUTH --------------------

// Registro
app.post("/api/auth/register", async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password)
    return res.status(400).json({ message: "Faltan campos" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.run(
      "INSERT INTO users (name, username, password) VALUES (?, ?, ?)",
      [name, username, hashed]
    );

    const token = jwt.sign({ id: result.lastID }, SECRET, { expiresIn: "7d" });
    res.json({
      message: "Usuario registrado correctamente",
      token,
      user: { id: result.lastID, name, username },
    });
  } catch (err) {
    res.status(400).json({ message: "Error al registrar usuario", error: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });
    res.json({
      message: "Login exitoso",
      token,
      user: { id: user.id, name: user.name, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ message: "Error al iniciar sesión", error: err.message });
  }
});

// Perfil autenticado
app.get("/api/auth/me", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const decodedId = verifyTokenAndGetId(header);

    const user = await db.get(
      `SELECT 
        u.id, u.name, u.username, u.bio, u.avatar,
        (SELECT COUNT(*) FROM follows WHERE followed_id = u.id) AS followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following
      FROM users u
      WHERE u.id = ?`,
      [decodedId]
    );

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const posts = await db.all(
      `SELECT id, content, created_at
       FROM posts
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [decodedId]
    );

    res.json({ ...user, posts });
  } catch (err) {
    const status = err.status || 401;
    res.status(status).json({ message: err.message || "Token inválido" });
  }
});

// -------------------- ACTUALIZAR PERFIL --------------------
app.put("/api/users/profile", async (req, res) => {
  try {
    const userId = verifyTokenAndGetId(req.headers.authorization);
    const { name, bio, avatar } = req.body;

    await db.run(
      "UPDATE users SET name = ?, bio = ?, avatar = ? WHERE id = ?",
      [name, bio, avatar, userId]
    );

    const user = await db.get("SELECT id, name, username, bio, avatar FROM users WHERE id = ?", [userId]);

    res.json({ message: "Perfil actualizado", user });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// -------------------- CAMBIAR CONTRASEÑA --------------------
app.put("/api/users/password", async (req, res) => {
  try {
    const userId = verifyTokenAndGetId(req.headers.authorization);
    const { currentPassword, newPassword } = req.body;

    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: "La contraseña actual es incorrecta" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// Cambiar username
app.put("/api/users/username", async (req, res) => {
  try {
    const userId = verifyTokenAndGetId(req.headers.authorization);
    const { newUsername } = req.body;

    if (!newUsername) {
      return res.status(400).json({ message: "El username es requerido" });
    }

    // Verificar que el username no esté en uso
    const existing = await db.get("SELECT id FROM users WHERE username = ? AND id != ?", [newUsername, userId]);
    if (existing) {
      return res.status(400).json({ message: "Este username ya está en uso" });
    }

    // Validar formato del username
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
      return res.status(400).json({ message: "El username debe tener entre 3-20 caracteres y solo puede contener letras, números y guiones bajos" });
    }

    await db.run("UPDATE users SET username = ? WHERE id = ?", [newUsername, userId]);

    const user = await db.get("SELECT id, name, username, bio, avatar FROM users WHERE id = ?", [userId]);

    res.json({ message: "Username actualizado correctamente", user });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// -------------------- POSTS --------------------

// Crear post
app.post("/api/posts", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const decodedId = verifyTokenAndGetId(header);
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Contenido vacío" });

    const result = await db.run(
      "INSERT INTO posts (user_id, content) VALUES (?, ?)",
      [decodedId, content]
    );
    res.json({
      message: "Post creado correctamente",
      post: { id: result.lastID, content, user_id: decodedId },
    });
  } catch (err) {
    const status = err.status || 401;
    res.status(status).json({ message: err.message || "Error al crear post" });
  }
});

// ========== ACTUALIZAR ENDPOINT DE POSTS ==========

// Reemplazar el GET /api/posts existente con este:
// Reemplazar el GET /api/posts existente con este:
app.get("/api/posts", async (req, res) => {
  const header = req.headers.authorization;
  let currentUserId = null;

  if (header) {
    try {
      currentUserId = verifyTokenAndGetId(header);
    } catch (err) {}
  }

  try {
    // Posts originales + reposts
    const posts = await db.all(`
      SELECT 
        p.id, 
        p.content, 
        p.created_at,
        p.user_id as original_user_id,
        u.username, 
        u.name, 
        u.avatar,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as reposts,
        NULL as reposted_by_id,
        NULL as reposted_by_name,
        NULL as reposted_by_username,
        p.created_at as sort_date,
        'original' as post_type
      FROM posts p
      JOIN users u ON u.id = p.user_id
      
      UNION ALL
      
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.user_id as original_user_id,
        u.username,
        u.name,
        u.avatar,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as reposts,
        r.user_id as reposted_by_id,
        ru.name as reposted_by_name,
        ru.username as reposted_by_username,
        r.created_at as sort_date,
        'repost' as post_type
      FROM reposts r
      JOIN posts p ON p.id = r.post_id
      JOIN users u ON u.id = p.user_id
      JOIN users ru ON ru.id = r.user_id
      
      ORDER BY sort_date DESC
    `);

    // Si hay usuario autenticado, verificar likes y reposts
    if (currentUserId) {
      const userLikes = await db.all(
        "SELECT post_id FROM post_likes WHERE user_id = ?",
        [currentUserId]
      );
      const userReposts = await db.all(
        "SELECT post_id FROM reposts WHERE user_id = ?",
        [currentUserId]
      );

      const likedIds = new Set(userLikes.map(l => l.post_id));
      const repostedIds = new Set(userReposts.map(r => r.post_id));

      posts.forEach(post => {
        post.userHasLiked = likedIds.has(post.id);
        post.userHasReposted = repostedIds.has(post.id);
      });
    } else {
      posts.forEach(post => {
        post.userHasLiked = false;
        post.userHasReposted = false;
      });
    }

    res.json(posts);
  } catch (err) {
    console.error('Error en /api/posts:', err);
    res.status(500).json({ message: "Error al obtener posts", error: err.message });
  }
});

// -------------------- COMMENTS --------------------

// Crear comentario
app.post("/api/comments", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const decodedId = verifyTokenAndGetId(header);
    const { post_id, text } = req.body;
    if (!post_id || !text) return res.status(400).json({ message: "Faltan datos" });

    const result = await db.run(
      "INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)",
      [post_id, decodedId, text]
    );
    res.json({ message: "Comentario agregado", commentId: result.lastID });
  } catch (err) {
    const status = err.status || 401;
    res.status(status).json({ message: err.message || "Error al comentar" });
  }
});

// Obtener comentarios de un post
app.get("/api/comments/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await db.all(
      `SELECT c.id, c.text, c.created_at, u.username, u.name, u.avatar
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener comentarios", error: err.message });
  }
});

// -------------------- FOLLOWS --------------------

// Seguir usuario
app.post("/api/follow/:id", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const decodedId = verifyTokenAndGetId(header);
    const followedId = Number(req.params.id);

    if (decodedId === followedId)
      return res.status(400).json({ message: "No puedes seguirte a ti mismo" });

    const exists = await db.get(
      "SELECT id FROM follows WHERE follower_id = ? AND followed_id = ?",
      [decodedId, followedId]
    );
    if (exists) return res.status(400).json({ message: "Ya sigues a este usuario" });

    await db.run(
      "INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)",
      [decodedId, followedId]
    );
    res.json({ message: "Siguiendo usuario" });
  } catch (err) {
    const status = err.status || 401;
    res.status(status).json({ message: err.message || "Error al seguir" });
  }
});

// Dejar de seguir
app.delete("/api/follow/:id", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const decodedId = verifyTokenAndGetId(header);
    const followedId = Number(req.params.id);

    await db.run(
      "DELETE FROM follows WHERE follower_id = ? AND followed_id = ?",
      [decodedId, followedId]
    );
    res.json({ message: "Dejaste de seguir" });
  } catch (err) {
    const status = err.status || 401;
    res.status(status).json({ message: err.message || "Error al dejar de seguir" });
  }
});

// -------------------- USERS --------------------

// ========== USUARIOS SUGERIDOS (DEBE IR PRIMERO) ==========
app.get("/api/users/suggestions", async (req, res) => {
  const header = req.headers.authorization;
  let currentUserId = null;

  // Intentar obtener el usuario autenticado (si existe)
  if (header) {
    try {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, SECRET);
      currentUserId = decoded.id;
    } catch (err) {
      console.log('Token inválido o no proporcionado para sugerencias');
    }
  }

  try {
    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.username, 
        u.avatar,
        (SELECT COUNT(*) FROM follows WHERE followed_id = u.id) as followers
      FROM users u
      WHERE 1=1
    `;

    const params = [];

    // Excluir al usuario actual si está autenticado
    if (currentUserId) {
      query += ` AND u.id != ?`;
      params.push(currentUserId);
      
      // Excluir usuarios que ya sigue
      query += ` AND u.id NOT IN (
        SELECT followed_id FROM follows WHERE follower_id = ?
      )`;
      params.push(currentUserId);
    }

    query += ` ORDER BY RANDOM() LIMIT 3`;

    console.log('Query de sugerencias:', query);
    console.log('Params:', params);

    const suggestions = await db.all(query, params);

    console.log('Sugerencias encontradas:', suggestions.length);

    // Marcar todos como no nuevos (sin created_at)
    suggestions.forEach(user => {
      user.daysAgo = 999;
      user.isNew = false;
    });

    res.json(suggestions);
  } catch (err) {
    console.error('Error en sugerencias:', err);
    res.status(500).json({ message: "Error al obtener sugerencias", error: err.message });
  }
});

// ========== ENDPOINT PARA DEBUG ==========

// Endpoint de debug para ver todos los usuarios
app.get("/api/users/all", async (req, res) => {
  try {
    const users = await db.all(`
      SELECT id, name, username, avatar,
      (SELECT COUNT(*) FROM follows WHERE followed_id = u.id) as followers
      FROM users u
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// ========== REPOSTS DEL USUARIO (PARA PERFIL) ==========

// Obtener reposts de un usuario específico
app.get("/api/users/:id/reposts", async (req, res) => {
  const userId = Number(req.params.id);
  
  try {
    const reposts = await db.all(`
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.user_id as original_user_id,
        u.name as original_name,
        u.username as original_username,
        u.avatar as original_avatar,
        r.created_at as repost_created_at,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes
      FROM reposts r
      JOIN posts p ON p.id = r.post_id
      JOIN users u ON u.id = p.user_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);
    
    res.json(reposts);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener reposts", error: err.message });
  }
});

// Obtener seguidores
app.get("/api/users/:id/followers", async (req, res) => {
  const { id } = req.params;
  try {
    const followers = await db.all(
      `SELECT u.id, u.name, u.username
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.followed_id = ?`,
      [id]
    );
    res.json(followers);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener followers", error: err.message });
  }
});

// Obtener siguiendo
app.get("/api/users/:id/following", async (req, res) => {
  const { id } = req.params;
  try {
    const following = await db.all(
      `SELECT u.id, u.name, u.username
       FROM follows f
       JOIN users u ON u.id = f.followed_id
       WHERE f.follower_id = ?`,
      [id]
    );
    res.json(following);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener following", error: err.message });
  }
});

// Obtener perfil de usuario
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const header = req.headers.authorization;
  
  try {
    const user = await db.get(
      `SELECT 
        u.id, u.name, u.username, u.bio, u.avatar,
        (SELECT COUNT(*) FROM follows WHERE followed_id = u.id) AS followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following
      FROM users u
      WHERE u.id = ?`,
      [id]
    );

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const posts = await db.all(
      `SELECT id, content, created_at
       FROM posts
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    let isFollowing = false;
    if (header) {
      try {
        const currentUserId = verifyTokenAndGetId(header);
        const follow = await db.get(
          `SELECT id FROM follows WHERE follower_id = ? AND followed_id = ?`,
          [currentUserId, id]
        );
        isFollowing = !!follow;
      } catch (err) {}
    }

    res.json({ ...user, posts, isFollowing });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuario", error: err.message });
  }
});

// -------------------- PROJECTS --------------------

// Crear proyecto
app.post("/api/projects", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const decodedId = verifyTokenAndGetId(header);
    const { title, description, github_url, demo_url, technologies } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: "Título y descripción son requeridos" });
    }

    const result = await db.run(
      "INSERT INTO projects (user_id, title, description, github_url, demo_url, technologies) VALUES (?, ?, ?, ?, ?, ?)",
      [decodedId, title, description, github_url, demo_url, technologies]
    );
    
    res.json({ 
      message: "Proyecto creado", 
      projectId: result.lastID 
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al crear proyecto" });
  }
});

// Obtener todos los proyectos
app.get("/api/projects", async (req, res) => {
  const header = req.headers.authorization;
  let currentUserId = null;
  
  // Intentar obtener el usuario autenticado (si existe)
  if (header) {
    try {
      currentUserId = verifyTokenAndGetId(header);
    } catch (err) {
      // Usuario no autenticado, continuar sin ID
    }
  }

  try {
    const projects = await db.all(`
      SELECT 
        p.*, 
        u.username, 
        u.name, 
        u.avatar,
        (SELECT COUNT(*) FROM project_likes WHERE project_id = p.id) as likes,
        (SELECT COUNT(*) FROM project_comments WHERE project_id = p.id) as comments_count
      FROM projects p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `);

    // Si hay usuario autenticado, verificar qué proyectos tiene con like
    if (currentUserId) {
      const userLikes = await db.all(
        `SELECT project_id FROM project_likes WHERE user_id = ?`,
        [currentUserId]
      );
      const likedProjectIds = new Set(userLikes.map(like => like.project_id));
      
      projects.forEach(project => {
        project.userHasLiked = likedProjectIds.has(project.id);
      });
    } else {
      projects.forEach(project => {
        project.userHasLiked = false;
      });
    }

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener proyectos", error: err.message });
  }
});

// Obtener proyecto por ID
app.get("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  const header = req.headers.authorization;
  let currentUserId = null;

  // Intentar obtener el usuario autenticado (si existe)
  if (header) {
    try {
      currentUserId = verifyTokenAndGetId(header);
    } catch (err) {
      // Usuario no autenticado, continuar sin ID
    }
  }

  try {
    const project = await db.get(
      `SELECT 
        p.*, 
        u.username, 
        u.name, 
        u.avatar,
        (SELECT COUNT(*) FROM project_likes WHERE project_id = p.id) as likes,
        (SELECT COUNT(*) FROM project_comments WHERE project_id = p.id) as comments_count
      FROM projects p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = ?`,
      [id]
    );
    
    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // Verificar si el usuario actual dio like
    if (currentUserId) {
      const userLike = await db.get(
        `SELECT id FROM project_likes WHERE project_id = ? AND user_id = ?`,
        [id, currentUserId]
      );
      project.userHasLiked = !!userLike;
    } else {
      project.userHasLiked = false;
    }
    
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener proyecto", error: err.message });
  }
});

// Dar like a un proyecto
app.post("/api/projects/:id/like", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const decodedId = verifyTokenAndGetId(header);
    const projectId = Number(req.params.id);

    const exists = await db.get(
      "SELECT id FROM project_likes WHERE project_id = ? AND user_id = ?",
      [projectId, decodedId]
    );

    if (exists) {
      return res.status(400).json({ message: "Ya diste like a este proyecto" });
    }

    await db.run(
      "INSERT INTO project_likes (project_id, user_id) VALUES (?, ?)",
      [projectId, decodedId]
    );
    
    res.json({ message: "Like agregado" });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al dar like" });
  }
});

// Quitar like de un proyecto
app.delete("/api/projects/:id/like", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const decodedId = verifyTokenAndGetId(header);
    const projectId = Number(req.params.id);

    await db.run(
      "DELETE FROM project_likes WHERE project_id = ? AND user_id = ?",
      [projectId, decodedId]
    );
    
    res.json({ message: "Like removido" });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al quitar like" });
  }
});

// -------------------- PROJECT COMMENTS --------------------

// Crear comentario en proyecto
app.post("/api/projects/:id/comments", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const decodedId = verifyTokenAndGetId(header);
    const projectId = Number(req.params.id);
    const { text } = req.body;
    
    if (!text) return res.status(400).json({ message: "El comentario no puede estar vacío" });

    const result = await db.run(
      "INSERT INTO project_comments (project_id, user_id, text) VALUES (?, ?, ?)",
      [projectId, decodedId, text]
    );
    
    res.json({ message: "Comentario agregado", commentId: result.lastID });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al comentar" });
  }
});

app.get("/api/projects/:id/comments", async (req, res) => {
  const projectId = Number(req.params.id);
  try {
    const comments = await db.all(
      `SELECT c.id, c.text, c.created_at, u.username, u.name, u.avatar
       FROM project_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.project_id = ?
       ORDER BY c.created_at ASC`,
      [projectId]
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener comentarios", error: err.message });
  }
});

// ========== REPOSTS ==========

// Crear repost
app.post("/api/posts/:id/repost", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const userId = verifyTokenAndGetId(header);
    const postId = Number(req.params.id);

    // Verificar que el post existe
    const post = await db.get("SELECT id FROM posts WHERE id = ?", [postId]);
    if (!post) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    // Verificar si ya hizo repost
    const existing = await db.get(
      "SELECT id FROM reposts WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    if (existing) {
      return res.status(400).json({ message: "Ya hiciste repost de esto" });
    }

    await db.run(
      "INSERT INTO reposts (user_id, post_id) VALUES (?, ?)",
      [userId, postId]
    );

    res.json({ message: "Repost creado" });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al hacer repost" });
  }
});

// Eliminar repost
app.delete("/api/posts/:id/repost", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const userId = verifyTokenAndGetId(header);
    const postId = Number(req.params.id);

    await db.run(
      "DELETE FROM reposts WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    res.json({ message: "Repost eliminado" });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al eliminar repost" });
  }
});

// ========== LIKES EN POSTS ==========

// Dar like a post
app.post("/api/posts/:id/like", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const userId = verifyTokenAndGetId(header);
    const postId = Number(req.params.id);

    const existing = await db.get(
      "SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    if (existing) {
      return res.status(400).json({ message: "Ya diste like a este post" });
    }

    await db.run(
      "INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)",
      [userId, postId]
    );

    res.json({ message: "Like agregado" });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al dar like" });
  }
});

// Quitar like de post
app.delete("/api/posts/:id/like", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const userId = verifyTokenAndGetId(header);
    const postId = Number(req.params.id);

    await db.run(
      "DELETE FROM post_likes WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    res.json({ message: "Like removido" });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al quitar like" });
  }
});

// ========== TENDENCIAS DE TECNOLOGÍAS ==========

// Obtener tecnologías en tendencia basadas en proyectos
app.get("/api/trending/technologies", async (req, res) => {
  try {
    // Obtener todas las tecnologías y contar proyectos
    const result = await db.all(`
      SELECT 
        TRIM(value) as technology,
        COUNT(*) as project_count,
        GROUP_CONCAT(DISTINCT p.id) as project_ids
      FROM projects p,
      json_each('["' || REPLACE(REPLACE(p.technologies, ',', '","'), ' ', '') || '"]') 
      WHERE p.technologies IS NOT NULL AND p.technologies != ''
      GROUP BY LOWER(TRIM(value))
      HAVING technology != ''
      ORDER BY project_count DESC, technology ASC
      LIMIT 10
    `);

    // Formatear resultados
    const trending = result.map((row, index) => ({
      rank: index + 1,
      name: row.technology,
      count: row.project_count,
      category: categorizeTech(row.technology)
    }));

    res.json(trending);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener tendencias", error: err.message });
  }
});

// Helper para categorizar tecnologías
function categorizeTech(tech) {
  const techLower = tech.toLowerCase();
  
  const categories = {
    frontend: ['react', 'angular', 'vue', 'svelte', 'nextjs', 'nuxt', 'html', 'css', 'tailwind', 'bootstrap'],
    backend: ['node', 'express', 'fastify', 'nest', 'django', 'flask', 'spring', 'laravel', 'rails'],
    database: ['mongodb', 'postgres', 'mysql', 'redis', 'sqlite', 'firebase', 'supabase'],
    mobile: ['react native', 'flutter', 'ionic', 'swift', 'kotlin'],
    devops: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'vercel', 'netlify']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => techLower.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}
// -------------------- ENDPOINTS DE MENSAJERÍA --------------------
// -------------------- ENDPOINTS DE MENSAJERÍA --------------------

// Obtener o crear una conversación
app.post("/api/conversations", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const currentUserId = verifyTokenAndGetId(header);
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId es requerido" });
    }

    if (currentUserId === otherUserId) {
      return res.status(400).json({ message: "No puedes crear una conversación contigo mismo" });
    }

    // Buscar conversación existente (en cualquier orden)
    let conversation = await db.get(
      `SELECT * FROM conversations 
       WHERE (user1_id = ? AND user2_id = ?) 
          OR (user1_id = ? AND user2_id = ?)`,
      [currentUserId, otherUserId, otherUserId, currentUserId]
    );

    // Si no existe, crearla
    if (!conversation) {
      const result = await db.run(
        `INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)`,
        [Math.min(currentUserId, otherUserId), Math.max(currentUserId, otherUserId)]
      );
      conversation = await db.get(
        `SELECT * FROM conversations WHERE id = ?`,
        [result.lastID]
      );
    }

    res.json(conversation);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al crear conversación" });
  }
});

// Obtener todas las conversaciones del usuario
app.get("/api/conversations", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const currentUserId = verifyTokenAndGetId(header);

    const conversations = await db.all(
      `SELECT 
        c.id,
        c.last_message_at,
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id 
          ELSE c.user1_id 
        END as other_user_id,
        CASE 
          WHEN c.user1_id = ? THEN u2.name 
          ELSE u1.name 
        END as other_user_name,
        CASE 
          WHEN c.user1_id = ? THEN u2.username 
          ELSE u1.username 
        END as other_user_username,
        CASE 
          WHEN c.user1_id = ? THEN u2.avatar 
          ELSE u1.avatar 
        END as other_user_avatar,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = ? AND is_read = 0) as unread_count
      FROM conversations c
      LEFT JOIN users u1 ON c.user1_id = u1.id
      LEFT JOIN users u2 ON c.user2_id = u2.id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.last_message_at DESC`,
      [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId]
    );

    res.json(conversations);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al obtener conversaciones" });
  }
});

// Enviar mensaje
app.post("/api/messages", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const senderId = verifyTokenAndGetId(header);
    const { conversationId, receiverId, content } = req.body;

    if (!conversationId || !receiverId || !content) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    // Verificar que la conversación existe y el usuario es parte de ella
    const conversation = await db.get(
      `SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)`,
      [conversationId, senderId, senderId]
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversación no encontrada" });
    }

    // Insertar mensaje
    const result = await db.run(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, content) 
       VALUES (?, ?, ?, ?)`,
      [conversationId, senderId, receiverId, content]
    );

    // Actualizar última actividad de la conversación
    await db.run(
      `UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [conversationId]
    );

    // Obtener el mensaje completo
    const message = await db.get(
      `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.id = ?`,
      [result.lastID]
    );

    res.json(message);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al enviar mensaje" });
  }
});

// Obtener mensajes de una conversación
app.get("/api/conversations/:id/messages", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const currentUserId = verifyTokenAndGetId(header);
    const conversationId = req.params.id;

    // Verificar que el usuario es parte de la conversación
    const conversation = await db.get(
      `SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)`,
      [conversationId, currentUserId, currentUserId]
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversación no encontrada" });
    }

    // Obtener mensajes
    const messages = await db.all(
      `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.conversation_id = ? 
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    // Marcar mensajes como leídos
    await db.run(
      `UPDATE messages SET is_read = 1 
       WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0`,
      [conversationId, currentUserId]
    );

    res.json(messages);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al obtener mensajes" });
  }
});

// Obtener contador de mensajes no leídos
app.get("/api/messages/unread/count", async (req, res) => {
  const header = req.headers.authorization;
  try {
    const currentUserId = verifyTokenAndGetId(header);

    const result = await db.get(
      `SELECT COUNT(*) as count FROM messages 
       WHERE receiver_id = ? AND is_read = 0`,
      [currentUserId]
    );

    res.json({ count: result.count });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error al obtener contador" });
  }
});
// -------------------- SERVIDOR --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});