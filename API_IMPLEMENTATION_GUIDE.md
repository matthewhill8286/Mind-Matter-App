### API Implementation Guide for Mind & Matter App

This document provides a comprehensive guide for implementing the backend endpoints for the Mind & Matter application. The app currently uses a client-side state management system (Zustand with persistence to AsyncStorage) and needs to migrate to a centralized Node.js/Express (or similar) backend.

---

### 1. General Principles

- **Authentication**: All requests should include a way to identify the user (e.g., a `userId` from a session or JWT). In the client-side code, this is handled via `userScopedKey` from `lib/storage.ts`.
- **Data Format**: All endpoints should use JSON for both requests and responses.
- **Timestamps**: All dates/times are currently stored as ISO strings.

---

### 2. Core Data Models

The following data types are used throughout the application:

#### Mood Check-In
```typescript
interface MoodCheckIn {
  id: string;
  created_at: string; // ISO string
  mood: 'Great' | 'Good' | 'Okay' | 'Low' | 'Bad';
  energy: 1 | 2 | 3 | 4 | 5;
  stress: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  note?: string;
  tags?: string[];
}
```

#### Journal Entry
```typescript
interface JournalEntry {
  id: string;
  created_at: string; // ISO string
  updatedAt: string; // ISO string
  title: string;
  content: string;
  mood?: string | null;
  tags?: string[];
  promptId?: string | null;
}
```

#### Stress Relief Kit
```typescript
interface StressKit {
  quickPhrase?: string;
  triggers: string[];
  helpfulActions: string[];
  people: string[];
  notes?: string;
  level?: number;
  lastCheckIn?: string; // ISO string
}
```

#### Stress Exercise Completion
```typescript
interface StressCompletion {
  exerciseId: string;
  title: string;
  date: string; // ISO string
}
```

#### Mindfulness Entry
```typescript
interface MindfulEntry {
  id: string;
  seconds: number; // duration in seconds
  date_iso: string;
  note?: string;
}
```

#### Sleep Entry
```typescript
interface SleepEntry {
  id: string;
  startISO: string; // bedtime
  endISO: string; // wake time
  quality?: 1 | 2 | 3 | 4 | 5;
  awakenings?: number;
  notes?: string;
  created_at: string;
}
```

#### User Profile
```typescript
interface UserProfile {
  name?: string | null;
  intention?: string | null;
  routine?: string | null;
  selectedIssues?: string[]; // E.g., ['Anxiety', 'Stress']
  updatedAt: string; // ISO string
}
```

---

### 3. API Endpoints

#### 3.1. User Profile & Assessment

- **GET `/profile`**
  - **Description**: Retrieves the user's profile information.
  - **Response**: `UserProfile` object.

- **POST/PUT `/profile`**
  - **Description**: Saves or updates the user's profile.
  - **Body**: Partial or full `UserProfile` object.
  - **Response**: The updated `UserProfile` object.

- **GET `/assessment`**
  - **Description**: Retrieves the user's initial onboarding assessment results.
  - **Response**: The assessment JSON object.

- **POST `/assessment`**
  - **Description**: Saves the user's onboarding assessment.
  - **Body**: Assessment JSON object.
  - **Response**: Success status.

#### 3.2. Activity Tracking (Mood, Journal, Stress, Sleep, Mindfulness)

##### Mood
- **GET `/mood`**: List all mood check-ins for the user.
- **POST `/mood`**: Add a new mood check-in. (Body: `Omit<MoodCheckIn, 'id' | 'created_at'>`).
- **DELETE `/mood/:id`**: Remove a mood check-in.

##### Journaling
- **GET `/journal`**: List all journal entries.
- **POST `/journal`**: Create a new journal entry. (Body: `Omit<JournalEntry, 'id' | 'created_at' | 'updatedAt'>`).
- **PUT `/journal/:id`**: Update an existing journal entry. (Body: `JournalEntry`).
- **DELETE `/journal/:id`**: Delete a journal entry.

##### Stress Management
- **GET `/stress/kit`**: Get the user's stress relief kit. (Response: `StressKit` or default kit).
- **PUT `/stress/kit`**: Update the stress relief kit. (Body: `StressKit`).
- **GET `/stress/history`**: List completed stress relief exercises. (Response: `StressCompletion[]`).
- **POST `/stress/history`**: Record a completed exercise. (Body: `{ exerciseId: string, title: string }`).

##### Mindfulness
- **GET `/mindfulness`**: List mindfulness sessions history. (Response: `MindfulEntry[]`).
- **POST `/mindfulness`**: Record a new mindfulness session. (Body: `{ seconds: number, note?: string }`).

##### Sleep
- **GET `/sleep`**: List all sleep logs.
- **POST `/sleep`**: Add a new sleep entry. (Body: `Omit<SleepEntry, 'id' | 'created_at'>`).
- **DELETE `/sleep/:id`**: Delete a sleep entry.

#### 3.3. AI Chat Support

The application already includes a basic implementation in `lib/chat.ts` pointing to `http://localhost:4000/chat`.

- **POST `/chat`**
  - **Description**: Send a conversation to an AI model for a response.
  - **Request Body**:
    ```json
    {
      "issueTitle": "Issue Category Name",
      "issueTags": ["Tag1", "Tag2"],
      "messages": [
        { "role": "user", "content": "The user message..." },
        { "role": "assistant", "content": "Previous AI response..." }
      ]
    }
    ```
  - **Response Body**:
    ```json
    { "text": "The AI generated response content" }
    ```

- **Chat History Management**:
  - The client currently stores chat history per `issueKey`. 
  - **GET `/chat/history/:issueKey`**: Retrieve history for a specific issue.
  - **POST `/chat/history/:issueKey`**: Append a new message to the history.
  - **DELETE `/chat/history/:issueKey`**: Clear history for an issue.

---

### 4. Implementation Notes

1. **ID Generation**: The client currently generates IDs (usually using `Math.random().toString(36)` or similar). It's recommended to shift ID generation to the server (e.g., UUIDs).
2. **Batch Synchronization**: Since the app uses Zustand/AsyncStorage, users might go offline. Consider implementing a sync endpoint (e.g., `POST /sync`) that takes a batch of local changes and merges them with the server state.
3. **Data Integrity**: Ensure that `updatedAt` and `created_at` are properly handled, especially when syncing across multiple devices.
4. **Error Handling**: Standardize error responses (e.g., `{ error: "Error message detail" }`) to match the client's `error: string | null` state in the stores.
