# Guia de Configuração do Firebase — Motor-Link V2

Este guia descreve os passos necessários no **Firebase Console** e na **Vercel** para que a Versão 2 (Autenticação, RBAC e Concorrência Isolada) funcione perfeitamente.

---

## 1. Firebase Authentication
1. Acesse o [Firebase Console](https://console.firebase.google.com/) e selecione o projeto `motor-link`.
2. Vá em **Build > Authentication > Sign-in method**.
3. Ative o provedor **Email/Password (E-mail/senha)**.

---

## 2. Cloud Firestore (Perfis de Usuários)
1. Vá em **Build > Firestore Database**.
2. Crie a coleção raiz com o nome: `users`.
3. Para cada usuário cadastrado no Authentication, crie um documento com o **ID igual ao UID do Firebase Auth**:

### Exemplo — Documento do Administrador (Professor)
- **ID do Documento:** `<UID_DO_PROFESSOR>`
- **Campos:**
  ```json
  {
    "uid": "<UID_DO_PROFESSOR>",
    "displayName": "Professor Coordenador",
    "email": "professor@senai.br",
    "role": "admin",
    "assignedPanel": null,
    "createdAt": 1740000000000,
    "updatedAt": 1740000000000
  }
  ```

### Exemplo — Documento do Aluno
- **ID do Documento:** `<UID_DO_ALUNO>`
- **Campos:**
  ```json
  {
    "uid": "<UID_DO_ALUNO>",
    "displayName": "Aluno Exemplo",
    "email": "aluno@senai.br",
    "role": "student",
    "assignedPanel": 1,
    "createdAt": 1740000000000,
    "updatedAt": 1740000000000
  }
  ```
> **Nota:** Pelo painel do Administrador em `/admin/turma`, o professor pode reatribuir o `assignedPanel` (de 1 a 12) em tempo real.

---

## 3. Regras de Segurança (Security Rules)

### Cloud Firestore Rules
No console do Firestore, cole as regras presentes no arquivo `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin();
    }
  }
}
```

### Realtime Database Rules
No console do Realtime Database, vá na aba **Rules** e cole as regras de `database.rules.json`:
```json
{
  "rules": {
    "panels": {
      "$panelId": {
        "state": {
          ".read": "auth != null",
          ".write": "auth != null"
        },
        "command": {
          ".read": "auth != null",
          ".write": "auth != null"
        },
        "meta": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    },
    "global": {
      "emergency": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "bancadas": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## 4. Variáveis de Ambiente na Vercel
Nas configurações do seu projeto na **Vercel** (`Settings > Environment Variables`), certifique-se de configurar:

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Chave de API do Firebase Web |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Ex: `motor-link-senai.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Ex: `motor-link-senai` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Ex: `motor-link-senai.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| Ex: `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Ex: `1:123456789012:web:abcdef...` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Ex: `https://motor-link-senai-default-rtdb.firebaseio.com` |

---

## 5. Rotas e Permissões Implementadas

- `/` (Home) — Acesso público
- `/ensino` — Conteúdo didático aberto
- `/login` — Login de usuários (Aluno/Admin)
- `/controle` — IHM de acionamento do motor (Alunos acessam somente sua bancada; Admin acessa qualquer bancada)
- `/bancada` — Conexão USB/Web Serial com o Arduino (Exclusivo Admin/Instrutor)
- `/supervisor` — Cockpit com os 12 painéis simultâneos e Corte Geral (Exclusivo Admin)
- `/admin/turma` — Gestão e atribuição de bancadas em tempo real (Exclusivo Admin)
