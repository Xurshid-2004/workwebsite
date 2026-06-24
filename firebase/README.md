# Firebase setup

## Collections

| Collection | Document ID | Notes |
|------------|-------------|-------|
| `profiles` | Firebase Auth UID | User profile |
| `jobs` | job id | Job listings |
| `categories` | category id | Job categories |
| `locations` | location id | Filter locations |
| `favorites` | `{userId}_{jobId}` | Saved jobs |
| `chats` | chat id | `participant_ids` array |
| `chats/{id}/messages` | message id | Chat messages |
| `reports` | report id | User reports |

## Admin user

After first sign-up, set `role: "admin"` on the profile document in Firestore Console.

## Deploy rules

```bash
firebase deploy --only firestore:rules
```

(Requires Firebase CLI and `firebase init` in this folder.)
