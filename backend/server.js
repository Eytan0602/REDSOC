import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret12345";
const app = express();
app.use(cors());
app.use(express.json());

//incializar con firebase
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error("ERROR: Faltan variables de entorno de Firebase. Revisa tu archivo .env");
  process.exit(1);
}

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

console.log("Firebase inicializado correctamente");

// -------------------- HELPERS --------------------
const verifyToken = (header) => {
  if (!header) throw { status: 401, message: "No hay token" };
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded.uid;
  } catch (err) {
    throw { status: 401, message: "Token inválido o expirado", error: err.message };
  }
};

// -------------------- AUTH --------------------

// Registro con email/password
app.post("/api/auth/register", async (req, res) => {
  const { name, username, password } = req.body;
  
  if (!name || !username || !password) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    // Verificar si el username ya existe
    const usernameCheck = await db
      .collection("users")
      .where("username", "==", username)
      .get();

    if (!usernameCheck.empty) {
      return res.status(400).json({ message: "El username ya está en uso" });
    }

    const email = username + "@devfolio.temp";

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Crear documento en Firestore
    await db.collection("users").doc(userRecord.uid).set({
      name,
      username,
      email,
      bio: "",
      avatar: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      authProvider: "email",
    });

    // Generar token personalizado
    const token = jwt.sign({ uid: userRecord.uid }, SECRET, { expiresIn: "7d" });
res.json({
  message: "Usuario registrado correctamente",
  token: token,
  user: {
    id: userRecord.uid,
    uid: userRecord.uid,
    name,
    username,
    email,
  },
});

  } catch (err) {
    console.error("Error en registro:", err);
    res.status(400).json({ 
      message: "Error al registrar usuario", 
      error: err.message 
    });
  }
});

// Login con username/password
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const userSnapshot = await db
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const userData = userSnapshot.docs[0].data();
    const uid = userSnapshot.docs[0].id;

    try {
      await auth.getUser(uid);
      const token = jwt.sign({ uid }, SECRET, { expiresIn: "7d" });
res.json({
  message: "Login exitoso",
  token: token,
  user: {
    id: uid,
    uid,
    name: userData.name,
    username: userData.username,
    email: userData.email,
    avatar: userData.avatar,
  },
});
    } catch (authError) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ 
      message: "Error al iniciar sesión", 
      error: err.message 
    });
  }
});

// Login/Registro con Google o GitHub (OAuth)
/*app.post("/api/auth/social", async (req, res) => {
  const { idToken } = req.body;
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRecord = await auth.getUser(uid);
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      const provider = userRecord.providerData[0]?.providerId || "unknown";
      const username = userRecord.email?.split("@")[0] + Math.floor(Math.random() * 1000);
      
      await db.collection("users").doc(uid).set({
        name: userRecord.displayName || "Usuario",
        username,
        email: userRecord.email || "",
        bio: "",
        avatar: userRecord.photoURL || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        authProvider: provider,
      });
      
      return res.json({
        message: "Usuario registrado correctamente",
        user: {
          uid,
          name: userRecord.displayName,
          username,
          email: userRecord.email,
          avatar: userRecord.photoURL,
        },
        isNewUser: true,
      });
    }
    
    const userData = userDoc.data();
    
    res.json({
      message: "Login exitoso",
      user: {
        uid,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
      },
      isNewUser: false,
    });
  } catch (err) {
    console.error("Error en login social:", err);
    res.status(401).json({ 
      message: "Error en autenticación social", 
      error: err.message 
    });
  }
});*/
// ==================== AUTENTICACIÓN OAUTH ====================
// Login con Google
app.post("/api/auth/google", async (req, res) => {
  try {
    const { uid, email, name, avatar } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "UID es requerido" });
    }

    const userEmail = email || `google_${uid}@devfolio.app`;

    // Buscar o crear usuario
    const usersRef = db.collection("users");
    const userQuery = await usersRef.where("email", "==", userEmail).limit(1).get();

    let userId;
    let userData;

    if (userQuery.empty) {
      // Crear nuevo usuario
      const username = (name || "google_user").toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000);
      
      const newUser = {
        name: name || "Usuario Google",
        username,
        email: userEmail,
        avatar: avatar || "",
        bio: "",
        location: "",
        website: "",
        github: "",
        twitter: "",
        linkedin: "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        authProvider: "google",
      };

      // Usar el UID de Firebase como ID del documento
      await usersRef.doc(uid).set(newUser);
      userId = uid;
      userData = newUser;
    } else {
      // Usuario existente
      const userDoc = userQuery.docs[0];
      userId = userDoc.id;
      userData = userDoc.data();
    }

    // Generar token JWT
    const token = jwt.sign({ uid: userId }, SECRET, { expiresIn: "7d" });

    res.json({
      token: token,
      user: {
        id: userId,
        uid: userId,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email,
      },
    });
  } catch (err) {
    console.error("Error en Google Auth:", err);
    res.status(500).json({ message: "Error al autenticar con Google", error: err.message });
  }
});

// Login con GitHub
app.post("/api/auth/github", async (req, res) => {
  try {
    const { uid, email, name, avatar } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "UID es requerido" });
    }

    const userEmail = email || `github_${uid}@devfolio.app`;

    // Buscar o crear usuario
    const usersRef = db.collection("users");
    const userQuery = await usersRef.where("email", "==", userEmail).limit(1).get();

    let userId;
    let userData;

    if (userQuery.empty) {
      // Crear nuevo usuario
      const username = (name || "github_user").toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000);
      
      const newUser = {
        name: name || "Usuario GitHub",
        username,
        email: userEmail,
        avatar: avatar || "",
        bio: "",
        location: "",
        website: "",
        github: "",
        twitter: "",
        linkedin: "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        authProvider: "github",
      };

      // Usar el UID de Firebase como ID del documento
      await usersRef.doc(uid).set(newUser);
      userId = uid;
      userData = newUser;
    } else {
      // Usuario existente
      const userDoc = userQuery.docs[0];
      userId = userDoc.id;
      userData = userDoc.data();
    }

    // Generar token JWT
    const token = jwt.sign({ uid: userId }, SECRET, { expiresIn: "7d" });

    res.json({
      token: token,
      user: {
        id: userId,
        uid: userId,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email,
      },
    });
  } catch (err) {
    console.error("Error en GitHub Auth:", err);
    res.status(500).json({ message: "Error al autenticar con GitHub", error: err.message });
  }
});
// Obtener perfil autenticado
app.get("/api/auth/me", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    const userData = userDoc.data();
    
    const followersSnap = await db
      .collection("follows")
      .where("followedId", "==", uid)
      .get();
    
    const followingSnap = await db
      .collection("follows")
      .where("followerId", "==", uid)
      .get();
    
    const postsSnap = await db
      .collection("posts")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();
    
    const posts = postsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().createdAt?.toDate?.()?.toISOString(),
    }));
    
    res.json({
      id: uid,
      uid,
      ...userData,
      followers: followersSnap.size,
      following: followingSnap.size,
      posts,
    });
  } catch (err) {
    const status = err.status || 401;
    res.status(status).json({ message: err.message || "Token inválido" });
  }
});

// Actualizar perfil
app.put("/api/users/profile", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const { name, bio, avatar } = req.body;
    
    await db.collection("users").doc(uid).update({
      name,
      bio,
      avatar,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    const userDoc = await db.collection("users").doc(uid).get();
    
    res.json({ 
      message: "Perfil actualizado", 
      user: { id: uid, uid, ...userDoc.data() } 
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Cambiar username
app.put("/api/users/username", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const { newUsername } = req.body;
    
    if (!newUsername) {
      return res.status(400).json({ message: "El username es requerido" });
    }
    
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
      return res.status(400).json({ 
        message: "El username debe tener entre 3-20 caracteres" 
      });
    }
    
    const usernameCheck = await db
      .collection("users")
      .where("username", "==", newUsername)
      .get();
    
    if (!usernameCheck.empty && usernameCheck.docs[0].id !== uid) {
      return res.status(400).json({ message: "Este username ya está en uso" });
    }
    
    await db.collection("users").doc(uid).update({
      username: newUsername,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    const userDoc = await db.collection("users").doc(uid).get();
    
    res.json({ 
      message: "Username actualizado", 
      user: { id: uid, uid, ...userDoc.data() } 
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Crear post
app.post("/api/posts", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Contenido vacío" });
    }
    
    const postRef = await db.collection("posts").add({
      userId: uid,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
    });
    
    res.json({
      message: "Post creado correctamente",
      post: {
        id: postRef.id,
        content,
        user_id: uid,
        userId: uid,
      },
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});
app.delete("/api/posts/:id", async (req, res) => {
  console.log("\nDELETE POST INICIADO");
  
  try {
    console.log("Verificando token...");
    const currentUid = await verifyToken(req.headers.authorization);
    console.log("Token válido, UID:", currentUid);
    
    const postId = req.params.id;
    console.log("Post ID recibido:", postId);

    console.log("Buscando post en Firestore...");
    const postDoc = await db.collection("posts").doc(postId).get();
    console.log("   Post existe?", postDoc.exists);

    if (!postDoc.exists) {
      console.log(" POST NO ENCONTRADO EN FIRESTORE");
      console.log("   ID buscado:", postId);
      return res.status(404).json({ message: "Post no encontrado" });
    }

    const postData = postDoc.data();
    console.log("Datos del post:");
    console.log("   - Owner UID:", postData.userId);
    console.log("   - Current UID:", currentUid);
    console.log("   - Son iguales?", postData.userId === currentUid);

    if (postData.userId !== currentUid) {
      console.log("PERMISO DENEGADO");
      return res.status(403).json({ message: "No tienes permiso para eliminar este post" });
    }

    console.log("Eliminando post de Firestore...");
    await db.collection("posts").doc(postId).delete();
    console.log("Post eliminado exitosamente de Firebase");

    console.log("DELETE POST COMPLETADO\n");
    res.json({ message: "Post eliminado correctamente", id: postId });

  } catch (err) {
    console.error("\nERROR EN DELETE POST");
    console.error("Tipo de error:", err.name);
    console.error("Mensaje:", err.message);
    console.error("Status:", err.status);
    console.error("Stack:", err.stack);
    console.error("\n");
    
    res.status(500).json({ 
      message: "Error al eliminar post", 
      error: err.message 
    });
  }
});
// Obtener posts
app.get("/api/posts", async (req, res) => {
  try {
    let currentUid = null;
    
    if (req.headers.authorization) {
      try {
        currentUid = await verifyToken(req.headers.authorization);
      } catch (err) {}
    }
    
    const postsSnap = await db
      .collection("posts")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    
    const repostsSnap = await db
      .collection("reposts")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    
    const posts = [];
    
    for (const doc of postsSnap.docs) {
      const postData = doc.data();
      const userDoc = await db.collection("users").doc(postData.userId).get();
      const userData = userDoc.data() || {};
      
      let userHasLiked = false;
      let userHasReposted = false;
      
      if (currentUid) {
        const likeSnap = await db
          .collection("likes")
          .where("userId", "==", currentUid)
          .where("postId", "==", doc.id)
          .limit(1)
          .get();
        
        const repostSnap = await db
          .collection("reposts")
          .where("userId", "==", currentUid)
          .where("postId", "==", doc.id)
          .limit(1)
          .get();
        
        userHasLiked = !likeSnap.empty;
        userHasReposted = !repostSnap.empty;
      }
      
      posts.push({
        id: doc.id,
        content: postData.content,
        created_at: postData.createdAt?.toDate?.()?.toISOString(),
        original_user_id: postData.userId,
        username: userData.username,
        name: userData.name,
        avatar: userData.avatar,
        comments_count: postData.commentsCount || 0,
        likes: postData.likesCount || 0,
        reposts: postData.repostsCount || 0,
        userHasLiked,
        userHasReposted,
        post_type: 'original',
        sort_date: postData.createdAt,
      });
    }
    
    for (const repostDoc of repostsSnap.docs) {
      const repostData = repostDoc.data();
      const postDoc = await db.collection("posts").doc(repostData.postId).get();
      
      if (!postDoc.exists) continue;
      
      const postData = postDoc.data();
      const originalUserDoc = await db.collection("users").doc(postData.userId).get();
      const repostedByUserDoc = await db.collection("users").doc(repostData.userId).get();
      
      const originalUserData = originalUserDoc.data() || {};
      const repostedByUserData = repostedByUserDoc.data() || {};
      
      let userHasLiked = false;
      let userHasReposted = false;
      
      if (currentUid) {
        const likeSnap = await db
          .collection("likes")
          .where("userId", "==", currentUid)
          .where("postId", "==", postDoc.id)
          .limit(1)
          .get();
        
        const repostSnap = await db
          .collection("reposts")
          .where("userId", "==", currentUid)
          .where("postId", "==", postDoc.id)
          .limit(1)
          .get();
        
        userHasLiked = !likeSnap.empty;
        userHasReposted = !repostSnap.empty;
      }
      
      posts.push({
        id: postDoc.id,
        content: postData.content,
        created_at: postData.createdAt?.toDate?.()?.toISOString(),
        original_user_id: postData.userId,
        username: originalUserData.username,
        name: originalUserData.name,
        avatar: originalUserData.avatar,
        comments_count: postData.commentsCount || 0,
        likes: postData.likesCount || 0,
        reposts: postData.repostsCount || 0,
        reposted_by_id: repostData.userId,
        reposted_by_name: repostedByUserData.name,
        reposted_by_username: repostedByUserData.username,
        userHasLiked,
        userHasReposted,
        post_type: 'repost',
        sort_date: repostData.createdAt,
      });
    }
    
    posts.sort((a, b) => {
      const dateA = a.sort_date?.toDate?.() || new Date(0);
      const dateB = b.sort_date?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    res.json(posts);
  } catch (err) {
    console.error("Error en /api/posts:", err);
    res.status(500).json({ message: "Error al obtener posts", error: err.message });
  }
});

// Dar like a post
app.post("/api/posts/:id/like", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const postId = req.params.id;
    
    const likeCheck = await db
      .collection("likes")
      .where("userId", "==", uid)
      .where("postId", "==", postId)
      .get();
    
    if (!likeCheck.empty) {
      return res.status(400).json({ message: "Ya diste like a este post" });
    }
    
    await db.collection("likes").add({
      userId: uid,
      postId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    await db.collection("posts").doc(postId).update({
      likesCount: admin.firestore.FieldValue.increment(1),
    });
    
    res.json({ message: "Like agregado" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Quitar like
app.delete("/api/posts/:id/like", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const postId = req.params.id;
    
    const likeSnap = await db
      .collection("likes")
      .where("userId", "==", uid)
      .where("postId", "==", postId)
      .get();
    
    if (likeSnap.empty) {
      return res.status(400).json({ message: "No has dado like a este post" });
    }
    
    await likeSnap.docs[0].ref.delete();
    
    await db.collection("posts").doc(postId).update({
      likesCount: admin.firestore.FieldValue.increment(-1),
    });
    
    res.json({ message: "Like removido" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Crear repost
app.post("/api/posts/:id/repost", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const postId = req.params.id;
    
    const postDoc = await db.collection("posts").doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ message: "Post no encontrado" });
    }
    
    const repostCheck = await db
      .collection("reposts")
      .where("userId", "==", uid)
      .where("postId", "==", postId)
      .get();
    
    if (!repostCheck.empty) {
      return res.status(400).json({ message: "Ya hiciste repost de esto" });
    }
    
    await db.collection("reposts").add({
      userId: uid,
      postId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    await db.collection("posts").doc(postId).update({
      repostsCount: admin.firestore.FieldValue.increment(1),
    });
    
    res.json({ message: "Repost creado" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Eliminar repost
app.delete("/api/posts/:id/repost", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const postId = req.params.id;
    
    const repostSnap = await db
      .collection("reposts")
      .where("userId", "==", uid)
      .where("postId", "==", postId)
      .get();
    
    if (repostSnap.empty) {
      return res.status(400).json({ message: "No has hecho repost de esto" });
    }
    
    await repostSnap.docs[0].ref.delete();
    
    await db.collection("posts").doc(postId).update({
      repostsCount: admin.firestore.FieldValue.increment(-1),
    });
    
    res.json({ message: "Repost eliminado" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Crear comentario
app.post("/api/comments", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const { post_id, text } = req.body;
    
    if (!post_id || !text) {
      return res.status(400).json({ message: "Faltan datos" });
    }
    
    const commentRef = await db.collection("comments").add({
      postId: post_id,
      userId: uid,
      text,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    await db.collection("posts").doc(post_id).update({
      commentsCount: admin.firestore.FieldValue.increment(1),
    });
    
    res.json({ message: "Comentario agregado", commentId: commentRef.id });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Obtener comentarios
app.get("/api/comments/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    
    const commentsSnap = await db
      .collection("comments")
      .where("postId", "==", postId)
      .orderBy("createdAt", "asc")
      .get();
    
    const comments = await Promise.all(
      commentsSnap.docs.map(async (doc) => {
        const commentData = doc.data();
        const userDoc = await db.collection("users").doc(commentData.userId).get();
        const userData = userDoc.data() || {};
        
        return {
          id: userDoc.id,
          name: userData.name,
          username: userData.username,
        };
      })
    );
    
    res.json(comments);;
  } catch (err) {
    res.status(500).json({ message: "Error al obtener following", error: err.message });
  }
});

// Obtener reposts de un usuario
app.get("/api/users/:userId/reposts", async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("Obteniendo reposts del usuario:", userId);
    
    // Obtener reposts SIN orderBy
    const repostsSnap = await db
      .collection("reposts")
      .where("userId", "==", userId)
      .get();
    
    console.log("Reposts encontrados:", repostsSnap.size);
    
    if (repostsSnap.empty) {
      console.log("Usuario no tiene reposts");
      return res.json([]);
    }
    
    const reposts = [];
    
    for (const repostDoc of repostsSnap.docs) {
      const repostData = repostDoc.data();
      
      // Obtener el post original
      const postDoc = await db.collection("posts").doc(repostData.postId).get();
      
      if (!postDoc.exists) {
        console.log("Post no existe:", repostData.postId);
        continue;
      }
      
      const postData = postDoc.data();
      
      // Obtener usuario del post original
      const userDoc = await db.collection("users").doc(postData.userId).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      reposts.push({
        id: postDoc.id,
        content: postData.content,
        created_at: postData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        repost_created_at: repostData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        original_user_id: postData.userId,
        original_name: userData.name || "Usuario",
        original_username: userData.username || "username",
        original_avatar: userData.avatar || "",
        comments_count: postData.commentsCount || 0,
        likes: postData.likesCount || 0,
        reposts: postData.repostsCount || 0,
        // Para ordenar después
        repost_timestamp: repostData.createdAt?.toDate?.()?.getTime() || 0
      });
    }
    
    // Ordenar en memoria por fecha de repost (más reciente primero)
    reposts.sort((a, b) => b.repost_timestamp - a.repost_timestamp);
    
    // Eliminar el campo timestamp antes de enviar
    const cleanReposts = reposts.map(({ repost_timestamp, ...rest }) => rest);
    
    console.log("Reposts procesados:", cleanReposts.length);
    
    res.json(cleanReposts);
    
  } catch (err) {
    console.error("Error al obtener reposts:", err);
    res.status(500).json({ 
      message: "Error al obtener reposts", 
      error: err.message,
      stack: err.stack
    });
  }
});

// Crear proyecto
app.post("/api/projects", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const { title, description, github_url, demo_url, technologies } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: "Título y descripción son requeridos" });
    }
    
    const projectRef = await db.collection("projects").add({
      userId: uid,
      title,
      description,
      github_url: github_url || "",
      demo_url: demo_url || "",
      technologies: technologies || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      likesCount: 0,
      commentsCount: 0,
    });
    
    res.json({ 
      message: "Proyecto creado", 
      projectId: projectRef.id 
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Obtener todos los proyectos
app.get("/api/projects", async (req, res) => {
  try {
    let currentUid = null;
    
    if (req.headers.authorization) {
      try {
        currentUid = await verifyToken(req.headers.authorization);
      } catch (err) {}
    }
    
    const projectsSnap = await db
      .collection("projects")
      .orderBy("createdAt", "desc")
      .get();
    
    const projects = await Promise.all(
      projectsSnap.docs.map(async (doc) => {
        const projectData = doc.data();
        const userDoc = await db.collection("users").doc(projectData.userId).get();
        const userData = userDoc.data() || {};
        
        let userHasLiked = false;
        
        if (currentUid) {
          const likeSnap = await db
            .collection("project_likes")
            .where("userId", "==", currentUid)
            .where("projectId", "==", doc.id)
            .limit(1)
            .get();
          
          userHasLiked = !likeSnap.empty;
        }
        
        return {
          id: doc.id,
          ...projectData,
          user_id: projectData.userId,
          username: userData.username,
          name: userData.name,
          avatar: userData.avatar,
          likes: projectData.likesCount || 0,
          comments_count: projectData.commentsCount || 0,
          created_at: projectData.createdAt?.toDate?.()?.toISOString(),
          userHasLiked,
        };
      })
    );
    
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener proyectos", error: err.message });
  }
});

// Obtener proyecto por ID
app.get("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let currentUid = null;
    
    if (req.headers.authorization) {
      try {
        currentUid = await verifyToken(req.headers.authorization);
      } catch (err) {}
    }
    
    const projectDoc = await db.collection("projects").doc(id).get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }
    
    const projectData = projectDoc.data();
    const userDoc = await db.collection("users").doc(projectData.userId).get();
    const userData = userDoc.data() || {};
    
    let userHasLiked = false;
    
    if (currentUid) {
      const likeSnap = await db
        .collection("project_likes")
        .where("userId", "==", currentUid)
        .where("projectId", "==", id)
        .limit(1)
        .get();
      
      userHasLiked = !likeSnap.empty;
    }
    
    res.json({
      id: projectDoc.id,
      ...projectData,
      user_id: projectData.userId,
      username: userData.username,
      name: userData.name,
      avatar: userData.avatar,
      likes: projectData.likesCount || 0,
      comments_count: projectData.commentsCount || 0,
      created_at: projectData.createdAt?.toDate?.()?.toISOString(),
      userHasLiked,
    });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener proyecto", error: err.message });
  }
});

// Dar like a proyecto
app.post("/api/projects/:id/like", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const projectId = req.params.id;
    
    const likeCheck = await db
      .collection("project_likes")
      .where("userId", "==", uid)
      .where("projectId", "==", projectId)
      .get();
    
    if (!likeCheck.empty) {
      return res.status(400).json({ message: "Ya diste like a este proyecto" });
    }
    
    await db.collection("project_likes").add({
      userId: uid,
      projectId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    await db.collection("projects").doc(projectId).update({
      likesCount: admin.firestore.FieldValue.increment(1),
    });
    
    res.json({ message: "Like agregado" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Quitar like de proyecto
app.delete("/api/projects/:id/like", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const projectId = req.params.id;
    
    const likeSnap = await db
      .collection("project_likes")
      .where("userId", "==", uid)
      .where("projectId", "==", projectId)
      .get();
    
    if (likeSnap.empty) {
      return res.status(400).json({ message: "No has dado like a este proyecto" });
    }
    
    await likeSnap.docs[0].ref.delete();
    
    await db.collection("projects").doc(projectId).update({
      likesCount: admin.firestore.FieldValue.increment(-1),
    });
    
    res.json({ message: "Like removido" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Crear comentario en proyecto
app.post("/api/projects/:id/comments", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const projectId = req.params.id;
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "El comentario no puede estar vacío" });
    }
    
    const commentRef = await db.collection("project_comments").add({
      projectId,
      userId: uid,
      text,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    await db.collection("projects").doc(projectId).update({
      commentsCount: admin.firestore.FieldValue.increment(1),
    });
    
    res.json({ message: "Comentario agregado", commentId: commentRef.id });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Obtener comentarios de proyecto
app.get("/api/projects/:id/comments", async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const commentsSnap = await db
      .collection("project_comments")
      .where("projectId", "==", projectId)
      .orderBy("createdAt", "asc")
      .get();
    
    const comments = await Promise.all(
      commentsSnap.docs.map(async (doc) => {
        const commentData = doc.data();
        const userDoc = await db.collection("users").doc(commentData.userId).get();
        const userData = userDoc.data() || {};
        
        return {
          id: doc.id,
          text: commentData.text,
          created_at: commentData.createdAt?.toDate?.()?.toISOString(),
          username: userData.username,
          name: userData.name,
          avatar: userData.avatar,
        };
      })
    );
    
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener comentarios", error: err.message });
  }
});

// Obtener tecnologías en tendencia
app.get("/api/trending/technologies", async (req, res) => {
  try {
    const projectsSnap = await db.collection("projects").get();
    
    const techCount = {};
    
    projectsSnap.docs.forEach(doc => {
      const project = doc.data();
      if (project.technologies) {
        const techs = project.technologies.split(',').map(t => t.trim().toLowerCase());
        techs.forEach(tech => {
          if (tech) {
            techCount[tech] = (techCount[tech] || 0) + 1;
          }
        });
      }
    });
    
    const trending = Object.entries(techCount)
      .map(([name, count]) => ({
        name,
        count,
        category: categorizeTech(name),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
      }));
    
    res.json(trending);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener tendencias", error: err.message });
  }
});

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

// Crear o obtener conversación
app.post("/api/conversations", async (req, res) => {
  try {
    const currentUid = await verifyToken(req.headers.authorization);
    const { otherUserId } = req.body;
    
    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId es requerido" });
    }
    
    if (currentUid === otherUserId) {
      return res.status(400).json({ message: "No puedes crear una conversación contigo mismo" });
    }
    
    const conversationSnap = await db
      .collection("conversations")
      .where("user1Id", "in", [currentUid, otherUserId])
      .get();
    
    let conversation = null;
    
    for (const doc of conversationSnap.docs) {
      const data = doc.data();
      if (
        (data.user1Id === currentUid && data.user2Id === otherUserId) ||
        (data.user1Id === otherUserId && data.user2Id === currentUid)
      ) {
        conversation = { id: doc.id, ...data };
        break;
      }
    }
    
    if (!conversation) {
      const convRef = await db.collection("conversations").add({
        user1Id: currentUid < otherUserId ? currentUid : otherUserId,
        user2Id: currentUid < otherUserId ? otherUserId : currentUid,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      const newConvDoc = await convRef.get();
      conversation = { id: newConvDoc.id, ...newConvDoc.data() };
    }
    
    res.json(conversation);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Obtener conversaciones del usuario
// Obtener conversaciones del usuario
app.get("/api/conversations", async (req, res) => {
  try {
    const currentUid = await verifyToken(req.headers.authorization);
    
    console.log("Obteniendo conversaciones para:", currentUid);
    
    // Obtener TODAS las conversaciones (sin filtros complejos)
    const allConversationsSnap = await db
      .collection("conversations")
      .get();
    
    console.log("Total conversaciones en BD:", allConversationsSnap.size);
    
    // Filtrar manualmente las que pertenecen al usuario
    const userConversations = [];
    
    for (const doc of allConversationsSnap.docs) {
      const convData = doc.data();
      
      // Verificar si el usuario es parte de la conversación
      if (convData.user1Id === currentUid || convData.user2Id === currentUid) {
        const otherUserId = convData.user1Id === currentUid ? convData.user2Id : convData.user1Id;
        
        // Obtener datos del otro usuario
        const otherUserDoc = await db.collection("users").doc(otherUserId).get();
        const otherUserData = otherUserDoc.exists ? otherUserDoc.data() : {};
        
        // Obtener último mensaje (sin orderBy complejo)
        const allMessagesSnap = await db
          .collection("messages")
          .where("conversationId", "==", doc.id)
          .get();
        
        // Ordenar mensajes en memoria
        const messages = allMessagesSnap.docs
          .map(m => ({ id: m.id, ...m.data() }))
          .sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || new Date(0);
            const timeB = b.createdAt?.toDate?.() || new Date(0);
            return timeB - timeA;
          });
        
        const lastMessage = messages.length > 0 ? messages[0].content : null;
        
        // Contar no leídos manualmente
        const unreadCount = messages.filter(
          m => m.receiverId === currentUid && !m.isRead
        ).length;
        
        userConversations.push({
          id: doc.id,
          last_message_at: convData.lastMessageAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          other_user_id: otherUserId,
          other_user_name: otherUserData.name || "Usuario",
          other_user_username: otherUserData.username || "username",
          other_user_avatar: otherUserData.avatar || "",
          last_message: lastMessage,
          unread_count: unreadCount,
        });
      }
    }
    
    // Ordenar por fecha
    userConversations.sort((a, b) => {
      const dateA = new Date(a.last_message_at);
      const dateB = new Date(b.last_message_at);
      return dateB - dateA;
    });
    
    console.log("Conversaciones encontradas:", userConversations.length);
    
    res.json(userConversations);
    
  } catch (err) {
    console.error("Error al obtener conversaciones:", err);
    res.status(500).json({ 
      message: "Error al obtener conversaciones", 
      error: err.message 
    });
  }
});

// Enviar mensaje
app.post("/api/messages", async (req, res) => {
  try {
    const senderId = await verifyToken(req.headers.authorization);
    const { conversationId, receiverId, content } = req.body;
    
    if (!conversationId || !receiverId || !content) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    
    const convDoc = await db.collection("conversations").doc(conversationId).get();
    
    if (!convDoc.exists) {
      return res.status(404).json({ message: "Conversación no encontrada" });
    }
    
    const convData = convDoc.data();
    if (convData.user1Id !== senderId && convData.user2Id !== senderId) {
      return res.status(403).json({ message: "No eres parte de esta conversación" });
    }
    
    const messageRef = await db.collection("messages").add({
      conversationId,
      senderId,
      receiverId,
      content,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    await db.collection("conversations").doc(conversationId).update({
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    const messageDoc = await messageRef.get();
    const messageData = messageDoc.data();
    const senderDoc = await db.collection("users").doc(senderId).get();
    const senderData = senderDoc.data() || {};
    
    res.json({
      id: messageRef.id,
      ...messageData,
      sender_name: senderData.name,
      sender_avatar: senderData.avatar,
      created_at: messageData.createdAt?.toDate?.()?.toISOString(),
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Obtener mensajes de conversación
app.get("/api/conversations/:id/messages", async (req, res) => {
  try {
    const currentUid = await verifyToken(req.headers.authorization);
    const conversationId = req.params.id;
    
    console.log("📥 Obteniendo mensajes de conversación:", conversationId);
    console.log("👤 Usuario actual:", currentUid);
    
    // Verificar que la conversación existe
    const convDoc = await db.collection("conversations").doc(conversationId).get();
    
    if (!convDoc.exists) {
      console.log("Conversación no encontrada");
      return res.status(404).json({ message: "Conversación no encontrada" });
    }
    
    const convData = convDoc.data();
    console.log("Datos de conversación:", convData);
    
    // Verificar que el usuario es parte de la conversación
    if (convData.user1Id !== currentUid && convData.user2Id !== currentUid) {
      console.log("Usuario no es parte de la conversación");
      return res.status(403).json({ message: "No eres parte de esta conversación" });
    }
    
    // Obtener TODOS los mensajes sin orderBy (para evitar índices)
    const messagesSnap = await db
      .collection("messages")
      .where("conversationId", "==", conversationId)
      .get();
    
    console.log("Mensajes encontrados:", messagesSnap.size);
    
    // Procesar mensajes
    const messagesPromises = messagesSnap.docs.map(async (doc) => {
      const messageData = doc.data();
      
      // Obtener datos del sender
      let senderData = {};
      try {
        const senderDoc = await db.collection("users").doc(messageData.senderId).get();
        senderData = senderDoc.exists ? senderDoc.data() : {};
      } catch (err) {
        console.log("Error al obtener sender:", err.message);
      }
      
      return {
        id: doc.id,
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content,
        isRead: messageData.isRead || false,
        sender_name: senderData.name || "Usuario",
        sender_avatar: senderData.avatar || "",
        created_at: messageData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdAt: messageData.createdAt
      };
    });
    
    let messages = await Promise.all(messagesPromises);
    
    // Ordenar por fecha en memoria (más antiguos primero)
    messages.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || new Date(0);
      const timeB = b.createdAt?.toDate?.() || new Date(0);
      return timeA - timeB;
    });
    
    // Marcar como leídos los mensajes no leídos del usuario actual
    const batch = db.batch();
    let updatedCount = 0;
    
    messagesSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.receiverId === currentUid && !data.isRead) {
        batch.update(doc.ref, { isRead: true });
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`Marcados ${updatedCount} mensajes como leídos`);
    }
    
    // Limpiar el campo createdAt del objeto de respuesta
    messages = messages.map(({ createdAt, ...rest }) => rest);
    
    console.log("Enviando", messages.length, "mensajes");
    res.json(messages);
    
  } catch (err) {
    console.error("Error al obtener mensajes:", err);
    res.status(500).json({ 
      message: "Error al obtener mensajes", 
      error: err.message,
      stack: err.stack
    });
  }
});

// Obtener contador de mensajes no leídos
app.get("/api/messages/unread/count", async (req, res) => {
  try {
    const currentUid = await verifyToken(req.headers.authorization);
    
    const unreadSnap = await db
      .collection("messages")
      .where("receiverId", "==", currentUid)
      .where("isRead", "==", false)
      .get();
    
    res.json({ count: unreadSnap.size });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});
// Seguir usuario
app.post("/api/follow/:id", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const followedId = req.params.id;
    
    if (uid === followedId) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
    }
    
    const followCheck = await db
      .collection("follows")
      .where("followerId", "==", uid)
      .where("followedId", "==", followedId)
      .get();
    
    if (!followCheck.empty) {
      return res.status(400).json({ message: "Ya sigues a este usuario" });
    }
    
    await db.collection("follows").add({
      followerId: uid,
      followedId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.json({ message: "Siguiendo usuario" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Dejar de seguir
app.delete("/api/follow/:id", async (req, res) => {
  try {
    const uid = await verifyToken(req.headers.authorization);
    const followedId = req.params.id;
    
    const followSnap = await db
      .collection("follows")
      .where("followerId", "==", uid)
      .where("followedId", "==", followedId)
      .get();
    
    if (followSnap.empty) {
      return res.status(400).json({ message: "No sigues a este usuario" });
    }
    
    await followSnap.docs[0].ref.delete();
    
    res.json({ message: "Dejaste de seguir" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Usuarios sugeridos
app.get("/api/users/suggestions", async (req, res) => {
  try {
    let currentUid = null;
    
    if (req.headers.authorization) {
      try {
        currentUid = await verifyToken(req.headers.authorization);
      } catch (err) {}
    }
    
    let usersQuery = db.collection("users").limit(10);
    const usersSnap = await usersQuery.get();
    
    const suggestions = [];
    
    for (const doc of usersSnap.docs) {
      if (currentUid && doc.id === currentUid) continue;
      
      if (currentUid) {
        const followCheck = await db
          .collection("follows")
          .where("followerId", "==", currentUid)
          .where("followedId", "==", doc.id)
          .limit(1)
          .get();
        
        if (!followCheck.empty) continue;
      }
      
      const userData = doc.data();
      const followersSnap = await db
        .collection("follows")
        .where("followedId", "==", doc.id)
        .get();
      
      suggestions.push({
        id: doc.id,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        followers: followersSnap.size,
        isNew: false,
        daysAgo: 999,
      });
      
      if (suggestions.length >= 3) break;
    }
    
    res.json(suggestions);
  } catch (err) {
    console.error("Error en sugerencias:", err);
    res.status(500).json({ message: "Error al obtener sugerencias", error: err.message });
  }
});

// Obtener perfil de usuario
app.get("/api/users/:id", async (req, res) => {
  console.log("========================================");
  console.log("INICIO - Solicitud de perfil de usuario");
  console.log("ID solicitado:", req.params.id);
  console.log("========================================");
  
  try {
    const { id } = req.params;
    
    // PASO 1: Buscar usuario
    console.log("PASO 1: Buscando documento del usuario...");
    const userDoc = await db.collection("users").doc(id).get();
    console.log("Usuario existe?", userDoc.exists);
    
    if (!userDoc.exists) {
      console.log("Usuario no encontrado en Firestore");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    const userData = userDoc.data();
    console.log("Usuario encontrado:", userData.username);
    
    // PASO 2: Obtener followers
    console.log("PASO 2: Obteniendo followers...");
    const followersSnap = await db
      .collection("follows")
      .where("followedId", "==", id)
      .get();
    console.log("Followers encontrados:", followersSnap.size);
    
    // PASO 3: Obtener following
    console.log("PASO 3: Obteniendo following...");
    const followingSnap = await db
      .collection("follows")
      .where("followerId", "==", id)
      .get();
    console.log("Following encontrados:", followingSnap.size);
    
    // PASO 4: Obtener posts (sin orderBy)
    console.log("PASO 4: Obteniendo posts...");
    const postsSnap = await db
      .collection("posts")
      .where("userId", "==", id)
      .get();
    console.log("Posts encontrados:", postsSnap.size);
    
    // Ordenar manualmente
    const posts = postsSnap.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          created_at: data.createdAt?.toDate?.()?.toISOString(),
          timestamp: data.createdAt?.toDate?.()?.getTime() || 0
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(({ timestamp, ...post }) => post);
    
    console.log("Posts ordenados:", posts.length);
    
    // PASO 5: Verificar si lo sigue
    console.log("PASO 5: Verificando follow status...");
    let isFollowing = false;
    if (req.headers.authorization) {
      try {
        const currentUid = await verifyToken(req.headers.authorization);
        console.log("Usuario actual:", currentUid);
        
        const followCheck = await db
          .collection("follows")
          .where("followerId", "==", currentUid)
          .where("followedId", "==", id)
          .limit(1)
          .get();
        isFollowing = !followCheck.empty;
        console.log("¿Lo sigue?", isFollowing);
      } catch (err) {
        console.log("Error verificando follow:", err.message);
      }
    } else {
      console.log("No hay token de autorización");
    }
    
    // PASO 6: Enviar respuesta
    console.log("PASO 6: Enviando respuesta...");
    const response = {
      id,
      uid: id,
      ...userData,
      followers: followersSnap.size,
      following: followingSnap.size,
      posts,
      isFollowing,
    };
    
    console.log("Respuesta enviada exitosamente");
    console.log("========================================\n");
    
    res.json(response);
    
  } catch (err) {
    console.log("========================================");
    console.error("ERROR CAPTURADO");
    console.error("Mensaje:", err.message);
    console.error("Stack completo:", err.stack);
    console.log("========================================\n");
    
    res.status(500).json({ 
      message: "Error al obtener usuario", 
      error: err.message,
      details: err.stack
    });
  }
});

// Obtener todos los usuarios (debug)
app.get("/api/users/all", async (req, res) => {
  try {
    const usersSnap = await db.collection("users").get();
    
    const users = await Promise.all(
      usersSnap.docs.map(async (doc) => {
        const userData = doc.data();
        const followersSnap = await db
          .collection("follows")
          .where("followedId", "==", doc.id)
          .get();
        
        return {
          id: doc.id,
          name: userData.name,
          username: userData.username,
          avatar: userData.avatar,
          followers: followersSnap.size,
        };
      })
    );
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// Obtener seguidores
app.get("/api/users/:id/followers", async (req, res) => {
  try {
    const { id } = req.params;
    
    const followsSnap = await db
      .collection("follows")
      .where("followedId", "==", id)
      .get();
    
    const followers = await Promise.all(
      followsSnap.docs.map(async (doc) => {
        const followData = doc.data();
        const userDoc = await db.collection("users").doc(followData.followerId).get();
        const userData = userDoc.data() || {};
        
        return {
          id: userDoc.id,
          name: userData.name,
          username: userData.username,
        };
      })
    );
    
    res.json(followers);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener followers", error: err.message });
  }
});

// Obtener siguiendo
app.get("/api/users/:id/following", async (req, res) => {
  try {
    const { id } = req.params;
    
    const followsSnap = await db
      .collection("follows")
      .where("followerId", "==", id)
      .get();
    
    const following = await Promise.all(
      followsSnap.docs.map(async (doc) => {
        const followData = doc.data();
        const userDoc = await db.collection("users").doc(followData.followedId).get();
        const userData = userDoc.data() || {};
        
        return {
          id: userDoc.id,
          name: userData.name,
          username: userData.username,
        };
      })
    );
    
    res.json(following);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener following", error: err.message });
  }
});

// SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Firebase conectado correctamente`);
});