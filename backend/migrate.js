import admin from "firebase-admin";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { readFileSync } from "fs";

// -------------------- INICIALIZAR FIREBASE --------------------
const serviceAccount = JSON.parse(readFileSync("./firebase-config.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();
const auth = admin.auth();

console.log("🔥 Firebase inicializado correctamente\n");

// -------------------- ABRIR SQLITE --------------------
let sqliteDb;

const initSQLite = async () => {
  sqliteDb = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
  console.log("SQLite conectado\n");
};

// -------------------- FUNCIONES DE MIGRACIÓN --------------------

// 1️MIGRAR USUARIOS
const migrateUsers = async () => {
  console.log("📦 Migrando usuarios...");
  
  const users = await sqliteDb.all("SELECT * FROM users");
  const userMapping = {}; // Mapeo de SQLite ID → Firebase UID
  
  let migratedCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      // Crear usuario en Firebase Auth
      let userRecord;
      const email = user.username + "@devfolio.app"; // Email temporal
      const password = Math.random().toString(36).slice(-10) + "A1!"; // Password temporal seguro
      
      try {
        userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: user.name,
        });
      } catch (authError) {
        // Si falla, intentar con email diferente
        const altEmail = user.username + Math.floor(Math.random() * 10000) + "@devfolio.app";
        userRecord = await auth.createUser({
          email: altEmail,
          password: password,
          displayName: user.name,
        });
      }

      // Guardar mapeo
      userMapping[user.id] = userRecord.uid;

      // Crear documento en Firestore
      await firestore.collection("users").doc(userRecord.uid).set({
        name: user.name || "Usuario",
        username: user.username,
        bio: user.bio || "",
        avatar: user.avatar || "",
        email: email,
        authProvider: "migrated",
        migratedFromSQLite: true,
        originalSQLiteId: user.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      migratedCount++;
      console.log(`${user.username} → ${userRecord.uid}`);
    } catch (error) {
      errorCount++;
      console.error(`Error: ${user.username} - ${error.message}`);
    }
  }

  console.log(`\nUsuarios: ${migratedCount} migrados, ${errorCount} errores\n`);
  return userMapping;
};

// MIGRAR POSTS
const migratePosts = async (userMapping) => {
  console.log("📦 Migrando posts...");
  
  const posts = await sqliteDb.all("SELECT * FROM posts");
  const postMapping = {};
  
  let migratedCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    try {
      const firebaseUid = userMapping[post.user_id];
      
      if (!firebaseUid) {
        console.warn(`Post ${post.id} - usuario no encontrado`);
        continue;
      }

      const postRef = await firestore.collection("posts").add({
        userId: firebaseUid,
        content: post.content,
        createdAt: post.created_at ? admin.firestore.Timestamp.fromDate(new Date(post.created_at)) : admin.firestore.FieldValue.serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        repostsCount: 0,
        migratedFromSQLite: true,
        originalSQLiteId: post.id,
      });

      postMapping[post.id] = postRef.id;
      migratedCount++;
      
      if (migratedCount % 10 === 0) {
        console.log(`${migratedCount} posts migrados...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`Error post ${post.id}: ${error.message}`);
    }
  }

  console.log(`\nPosts: ${migratedCount} migrados, ${errorCount} errores\n`);
  return postMapping;
};

// MIGRAR PROJECTS
const migrateProjects = async (userMapping) => {
  console.log("Migrando proyectos...");
  
  const projects = await sqliteDb.all("SELECT * FROM projects");
  const projectMapping = {};
  
  let migratedCount = 0;
  let errorCount = 0;

  for (const project of projects) {
    try {
      const firebaseUid = userMapping[project.user_id];
      
      if (!firebaseUid) {
        console.warn(`Proyecto ${project.id} - usuario no encontrado`);
        continue;
      }

      const projectRef = await firestore.collection("projects").add({
        userId: firebaseUid,
        title: project.title,
        description: project.description,
        github_url: project.github_url || "",
        demo_url: project.demo_url || "",
        technologies: project.technologies || "",
        createdAt: project.created_at ? admin.firestore.Timestamp.fromDate(new Date(project.created_at)) : admin.firestore.FieldValue.serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        migratedFromSQLite: true,
        originalSQLiteId: project.id,
      });

      projectMapping[project.id] = projectRef.id;
      migratedCount++;
      console.log(`Proyecto: ${project.title}`);
    } catch (error) {
      errorCount++;
      console.error(`Error proyecto ${project.id}: ${error.message}`);
    }
  }

  console.log(`\nProyectos: ${migratedCount} migrados, ${errorCount} errores\n`);
  return projectMapping;
};

//MIGRAR COMMENTS
const migrateComments = async (userMapping, postMapping) => {
  console.log("Migrando comentarios de posts...");
  
  const comments = await sqliteDb.all("SELECT * FROM comments");
  
  let migratedCount = 0;
  let errorCount = 0;

  for (const comment of comments) {
    try {
      const firebaseUid = userMapping[comment.user_id];
      const firebasePostId = postMapping[comment.post_id];
      
      if (!firebaseUid || !firebasePostId) {
        continue;
      }

      await firestore.collection("comments").add({
        postId: firebasePostId,
        userId: firebaseUid,
        text: comment.text,
        createdAt: comment.created_at ? admin.firestore.Timestamp.fromDate(new Date(comment.created_at)) : admin.firestore.FieldValue.serverTimestamp(),
        migratedFromSQLite: true,
        originalSQLiteId: comment.id,
      });

      // Incrementar contador en el post
      await firestore.collection("posts").doc(firebasePostId).update({
        commentsCount: admin.firestore.FieldValue.increment(1),
      });

      migratedCount++;
    } catch (error) {
      errorCount++;
    }
  }

  console.log(`Comentarios: ${migratedCount} migrados, ${errorCount} errores\n`);
};

// MIGRAR PROJECT COMMENTS
const migrateProjectComments = async (userMapping, projectMapping) => {
  console.log("Migrando comentarios de proyectos...");
  
  const comments = await sqliteDb.all("SELECT * FROM project_comments");
  
  let migratedCount = 0;
  let errorCount = 0;

  for (const comment of comments) {
    try {
      const firebaseUid = userMapping[comment.user_id];
      const firebaseProjectId = projectMapping[comment.project_id];
      
      if (!firebaseUid || !firebaseProjectId) {
        continue;
      }

      await firestore.collection("project_comments").add({
        projectId: firebaseProjectId,
        userId: firebaseUid,
        text: comment.text,
        createdAt: comment.created_at ? admin.firestore.Timestamp.fromDate(new Date(comment.created_at)) : admin.firestore.FieldValue.serverTimestamp(),
        migratedFromSQLite: true,
        originalSQLiteId: comment.id,
      });

      // Incrementar contador
      await firestore.collection("projects").doc(firebaseProjectId).update({
        commentsCount: admin.firestore.FieldValue.increment(1),
      });

      migratedCount++;
    } catch (error) {
      errorCount++;
    }
  }

  console.log(`Comentarios de proyectos: ${migratedCount} migrados, ${errorCount} errores\n`);
};

// MIGRAR LIKES DE POSTS
const migratePostLikes = async (userMapping, postMapping) => {
  console.log("Migrando likes de posts...");
  
  const likes = await sqliteDb.all("SELECT * FROM post_likes");
  
  let migratedCount = 0;
  let errorCount = 0;

  for (const like of likes) {
    try {
      const firebaseUid = userMapping[like.user_id];
      const firebasePostId = postMapping[like.post_id];
      
      if (!firebaseUid || !firebasePostId) {
        continue;
      }

      await firestore.collection("likes").add({
        userId: firebaseUid,
        postId: firebasePostId,
        createdAt: like.created_at ? admin.firestore.Timestamp.fromDate(new Date(like.created_at)) : admin.firestore.FieldValue.serverTimestamp(),
      });

      // Incrementar contador
      await firestore.collection("posts").doc(firebasePostId).update({
        likesCount: admin.firestore.FieldValue.increment(1),
      });

      migratedCount++;
    } catch (error) {
      errorCount++;
    }
  }

  console.log(`Likes de posts: ${migratedCount} migrados, ${errorCount} errores\n`);
};

// MIGRAR LIKES DE PROYECTOS
const migrateProjectLikes = async (userMapping, projectMapping) => {
  console.log("Migrando likes de proyectos...");
  
  const likes = await sqliteDb.all("SELECT * FROM project_likes");
  
  let migratedCount = 0;
  let errorCount = 0;

  for (const like of likes) {
    try {
      const firebaseUid = userMapping[like.user_id];
      const firebaseProjectId = projectMapping[like.project_id];
      
      if (!firebaseUid || !firebaseProjectId) {
        continue;
      }

      await firestore.collection("project_likes").add({
        userId: firebaseUid,
        projectId: firebaseProjectId,
        createdAt: like.created_at ? admin.firestore.Timestamp.fromDate(new Date(like.created_at)) : admin.firestore.FieldValue.serverTimestamp(),
      });

      // Incrementar contador
      await firestore.collection("projects").doc(firebaseProjectId).update({
        likesCount: admin.firestore.FieldValue.increment(1),
      });

      migratedCount++;
    } catch (error) {
      errorCount++;
    }
  }

  console.log(`Likes de proyectos: ${migratedCount} migrados, ${errorCount} errores\n`);
};

// MIGRAR FOLLOWS
const migrateFollows = async (userMapping) => {
  console.log("Migrando follows...");
  
  const follows = await sqliteDb.all("SELECT * FROM follows");
  
  let migratedCount = 0;
  let errorCount = 0;

  for (const follow of follows) {
    try {
      const followerUid = userMapping[follow.follower_id];
      const followedUid = userMapping[follow.followed_id];
      
      if (!followerUid || !followedUid) {
        continue;
      }

      await firestore.collection("follows").add({
        followerId: followerUid,
        followedId: followedUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      migratedCount++;
    } catch (error) {
      errorCount++;
    }
  }

  console.log(`Follows: ${migratedCount} migrados, ${errorCount} errores\n`);
};

// MIGRAR REPOSTS
const migrateReposts = async (userMapping, postMapping) => {
  console.log("Migrando reposts...");
  
  const reposts = await sqliteDb.all("SELECT * FROM reposts");
  
  let migratedCount = 0;
  let errorCount = 0;

  for (const repost of reposts) {
    try {
      const firebaseUid = userMapping[repost.user_id];
      const firebasePostId = postMapping[repost.post_id];
      
      if (!firebaseUid || !firebasePostId) {
        continue;
      }

      await firestore.collection("reposts").add({
        userId: firebaseUid,
        postId: firebasePostId,
        createdAt: repost.created_at ? admin.firestore.Timestamp.fromDate(new Date(repost.created_at)) : admin.firestore.FieldValue.serverTimestamp(),
      });

      // Incrementar contador
      await firestore.collection("posts").doc(firebasePostId).update({
        repostsCount: admin.firestore.FieldValue.increment(1),
      });

      migratedCount++;
    } catch (error) {
      errorCount++;
    }
  }

  console.log(`Reposts: ${migratedCount} migrados, ${errorCount} errores\n`);
};

//MIGRAR CONVERSACIONES Y MENSAJES
const migrateConversations = async (userMapping) => {
  console.log("Migrando conversaciones y mensajes...");
  
  const conversations = await sqliteDb.all("SELECT * FROM conversations");
  const conversationMapping = {};
  
  let migratedConvCount = 0;
  let migratedMsgCount = 0;
  let errorCount = 0;

  for (const conv of conversations) {
    try {
      const user1Uid = userMapping[conv.user1_id];
      const user2Uid = userMapping[conv.user2_id];
      
      if (!user1Uid || !user2Uid) {
        continue;
      }

      const convRef = await firestore.collection("conversations").add({
        user1Id: user1Uid,
        user2Id: user2Uid,
        lastMessageAt: conv.last_message_at ? admin.firestore.Timestamp.fromDate(new Date(conv.last_message_at)) : admin.firestore.FieldValue.serverTimestamp(),
        createdAt: conv.created_at ? admin.firestore.Timestamp.fromDate(new Date(conv.created_at)) : admin.firestore.FieldValue.serverTimestamp(),
      });

      conversationMapping[conv.id] = convRef.id;
      migratedConvCount++;

      // Migrar mensajes de esta conversación
      const messages = await sqliteDb.all("SELECT * FROM messages WHERE conversation_id = ?", [conv.id]);
      
      for (const msg of messages) {
        const senderUid = userMapping[msg.sender_id];
        const receiverUid = userMapping[msg.receiver_id];
        
        if (!senderUid || !receiverUid) continue;

        await firestore.collection("messages").add({
          conversationId: convRef.id,
          senderId: senderUid,
          receiverId: receiverUid,
          content: msg.content,
          isRead: msg.is_read === 1,
          createdAt: msg.created_at ? admin.firestore.Timestamp.fromDate(new Date(msg.created_at)) : admin.firestore.FieldValue.serverTimestamp(),
        });

        migratedMsgCount++;
      }
    } catch (error) {
      errorCount++;
    }
  }

  console.log(`Conversaciones: ${migratedConvCount} migradas`);
  console.log(`Mensajes: ${migratedMsgCount} migrados, ${errorCount} errores\n`);
};

// -------------------- EJECUTAR MIGRACIÓN --------------------
const runMigration = async () => {
  const startTime = Date.now();
  
  try {
    console.log("MIGRACIÓN SQLite → Firebase\n");
    console.log("NO CIERRES ESTE PROCESO\n");

    await initSQLite();

    // ORDEN IMPORTANTE: primero usuarios, luego el resto
    const userMapping = await migrateUsers();
    const postMapping = await migratePosts(userMapping);
    const projectMapping = await migrateProjects(userMapping);
    
    await migrateComments(userMapping, postMapping);
    await migrateProjectComments(userMapping, projectMapping);
    await migratePostLikes(userMapping, postMapping);
    await migrateProjectLikes(userMapping, projectMapping);
    await migrateFollows(userMapping);
    await migrateReposts(userMapping, postMapping);
    await migrateConversations(userMapping);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log("MIGRACIÓN COMPLETADA\n");
    console.log(`Tiempo total: ${duration} segundos\n`);
    console.log(" Resumen:");
    console.log(`   - ${Object.keys(userMapping).length} usuarios`);
    console.log(`   - ${Object.keys(postMapping).length} posts`);
    console.log(`   - ${Object.keys(projectMapping).length} proyectos\n`);
    console.log("Firebase está listo para usarse\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\nERROR FATAL:", error);
    process.exit(1);
  }
};

// EJECUTAR
runMigration();