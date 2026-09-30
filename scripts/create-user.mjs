import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Carrega variáveis do arquivo .env.local de forma segura (sem expor credenciais no código)
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
          process.env[key.trim()] = rest.join('=').trim();
        }
      }
    }
  }
}

loadEnv();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('ERRO: Variáveis de ambiente não encontradas no .env.local.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const [email, password, role, displayName, panelStr] = process.argv.slice(2);

if (!email || !password || !role) {
  console.log(`
Uso:
  node scripts/create-user.mjs <email> <senha> <admin|student> "<Nome>" [painel]

Exemplos:
  node scripts/create-user.mjs professor@senai.br senha123 admin "Professor Carlos"
  node scripts/create-user.mjs aluno1@senai.br senha123 student "Joao Silva" 1
`);
  process.exit(0);
}

const assignedPanel = role === 'student' ? Number(panelStr || 1) : null;

async function run() {
  try {
    let uid = null;
    console.log(`[1/2] Verificando/Criando usuário no Firebase Authentication (${email})...`);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
      console.log(`✓ Conta criada com UID: ${uid}`);
    } catch (authErr) {
      if (authErr.code === 'auth/email-already-in-use') {
        console.log(`ℹ A conta já existe no Authentication. Autenticando com a senha informada...`);
        const cred = await signInWithEmailAndPassword(auth, email, password);
        uid = cred.user.uid;
        console.log(`✓ Autenticado com sucesso! UID: ${uid}`);
      } else {
        throw authErr;
      }
    }

    console.log(`[2/2] Gravando perfil no Firestore (users/${uid})...`);
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      role,
      assignedPanel,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    console.log(`✓ Perfil gravado com sucesso como '${role}' ${assignedPanel ? `(Bancada ${assignedPanel})` : ''}!`);
    console.log('\n🎉 Concluído com sucesso! Agora você já pode acessar a tela de login.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Erro:', err.message || err);
    process.exit(1);
  }
}

run();
