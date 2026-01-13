import { configureStore, createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MoodCheckIn, listMoodCheckIns, addMoodCheckIn as apiAddMoodCheckIn, deleteMoodCheckIn as apiDeleteMoodCheckIn } from "@/lib/mood";
import { JournalEntry, listEntries, upsertEntry as apiUpsertEntry, deleteEntry as apiDeleteEntry } from "@/lib/journal";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AlertAction {
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
}

export interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    actions: AlertAction[];
}

interface AppState {
    moodCheckIns: MoodCheckIn[];
    journalEntries: JournalEntry[];
    assessment: any | null;
    isLoading: boolean;
    alert: AlertState;
}

const initialState: AppState = {
    moodCheckIns: [],
    journalEntries: [],
    assessment: null,
    isLoading: false,
    alert: {
        visible: false,
        title: "",
        message: "",
        actions: [],
    },
};

// Async Thunks
export const fetchMoodCheckIns = createAsyncThunk("app/fetchMoodCheckIns", async () => {
    return await listMoodCheckIns();
});

export const addMoodCheckIn = createAsyncThunk("app/addMoodCheckIn", async (item: MoodCheckIn, { dispatch }) => {
    await apiAddMoodCheckIn(item);
    dispatch(fetchMoodCheckIns());
});

export const deleteMoodCheckIn = createAsyncThunk("app/deleteMoodCheckIn", async (id: string, { dispatch }) => {
    await apiDeleteMoodCheckIn(id);
    dispatch(fetchMoodCheckIns());
});

export const fetchJournalEntries = createAsyncThunk("app/fetchJournalEntries", async () => {
    return await listEntries();
});

export const upsertJournalEntry = createAsyncThunk("app/upsertJournalEntry", async (entry: JournalEntry, { dispatch }) => {
    await apiUpsertEntry(entry);
    dispatch(fetchJournalEntries());
});

export const deleteJournalEntry = createAsyncThunk("app/deleteJournalEntry", async (id: string, { dispatch }) => {
    await apiDeleteEntry(id);
    dispatch(fetchJournalEntries());
});

export const fetchAssessment = createAsyncThunk("app/fetchAssessment", async () => {
    const raw = await AsyncStorage.getItem("assessment:v1");
    return raw ? JSON.parse(raw) : null;
});

export const setAssessment = createAsyncThunk("app/setAssessment", async (assessment: any) => {
    await AsyncStorage.setItem("assessment:v1", JSON.stringify(assessment));
    return assessment;
});

export const fetchAll = createAsyncThunk("app/fetchAll", async (_, { dispatch }) => {
    await Promise.all([
        dispatch(fetchMoodCheckIns()),
        dispatch(fetchJournalEntries()),
        dispatch(fetchAssessment()),
    ]);
});

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        showAlert: (state, action: PayloadAction<{ title: string; message: string; actions?: AlertAction[] }>) => {
            state.alert = {
                visible: true,
                title: action.payload.title,
                message: action.payload.message,
                actions: action.payload.actions || [{ text: "OK" }],
            };
        },
        hideAlert: (state) => {
            state.alert.visible = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMoodCheckIns.fulfilled, (state, action) => {
                state.moodCheckIns = action.payload;
            })
            .addCase(fetchJournalEntries.fulfilled, (state, action) => {
                state.journalEntries = action.payload;
            })
            .addCase(fetchAssessment.fulfilled, (state, action) => {
                state.assessment = action.payload;
            })
            .addCase(setAssessment.fulfilled, (state, action) => {
                state.assessment = action.payload;
            })
            .addCase(fetchAll.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAll.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(fetchAll.rejected, (state) => {
                state.isLoading = false;
            });
    },
});

export const { showAlert, hideAlert } = appSlice.actions;

export const store = configureStore({
    reducer: {
        app: appSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these paths in the state and actions because they contain functions (onPress)
                ignoredActions: ["app/showAlert"],
                ignoredPaths: ["app.alert.actions"],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
