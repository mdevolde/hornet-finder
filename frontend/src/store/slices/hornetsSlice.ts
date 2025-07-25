import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types pour les modes d'affichage des frelons
export type HornetDisplayMode = 'full' | 'hornets-only' | 'hidden';

// Interface pour les paramètres de géolocalisation
export interface GeolocationParams {
  lat: number;
  lon: number;
  radius?: number;
}

// Types pour les données de frelon
export interface Hornet {
  id?: number;
  latitude: number;
  longitude: number;
  direction: number;
  duration?: number; // Durée en secondes entre retour au nid et réapparition
  mark_color_1?: string; // Première couleur de marquage
  mark_color_2?: string; // Deuxième couleur de marquage
  created_at?: string;
  updated_at?: string;
  user_id?: number;
  created_by?: string; // Email de l'utilisateur qui a créé le frelon
}

// État initial du slice
interface HornetsState {
  hornets: Hornet[];
  loading: boolean;
  error: string | null;
  displayMode: HornetDisplayMode; // Mode d'affichage des frelons et zones
}

const initialState: HornetsState = {
  hornets: [],
  loading: false,
  error: null,
  displayMode: 'full', // Par défaut, tout est affiché (frelons + zones)
};

// Thunk async pour récupérer les frelons avec authentification
export const fetchHornets = createAsyncThunk(
  'hornets/fetchHornets',
  async ({ accessToken, geolocation }: { 
    accessToken: string; 
    geolocation: GeolocationParams 
  }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        lat: geolocation.lat.toString(),
        lon: geolocation.lon.toString(),
        ...(geolocation.radius && { radius: geolocation.radius.toString() })
      });

      const response = await fetch(`/api/hornets?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as Hornet[];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  }
);

// Thunk async pour récupérer les frelons (public, sans authentification)
export const fetchHornetsPublic = createAsyncThunk(
  'hornets/fetchHornetsPublic',
  async (geolocation: GeolocationParams, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        lat: geolocation.lat.toString(),
        lon: geolocation.lon.toString(),
        ...(geolocation.radius && { radius: geolocation.radius.toString() })
      });

      const response = await fetch(`/api/hornets?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as Hornet[];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  }
);

// Thunk async pour mettre à jour la durée d'un frelon
export const updateHornetDuration = createAsyncThunk(
  'hornets/updateHornetDuration',
  async ({ hornetId, duration, accessToken }: { hornetId: number; duration: number; accessToken: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/hornets/${hornetId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedHornet = await response.json();
      return { hornetId, updatedHornet } as { hornetId: number; updatedHornet: Hornet };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  }
);

// Thunk async pour mettre à jour les couleurs de marquage d'un frelon
export const updateHornetColors = createAsyncThunk(
  'hornets/updateHornetColors',
  async ({ hornetId, markColor1, markColor2, accessToken }: { 
    hornetId: number; 
    markColor1: string; 
    markColor2: string; 
    accessToken: string 
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/hornets/${hornetId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mark_color_1: markColor1, 
          mark_color_2: markColor2 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedHornet = await response.json();
      return { hornetId, updatedHornet } as { hornetId: number; updatedHornet: Hornet };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors de la mise à jour des couleurs');
    }
  }
);

// Thunk async pour créer un nouveau frelon
export const createHornet = createAsyncThunk(
  'hornets/createHornet',
  async ({ 
    latitude, 
    longitude, 
    direction, 
    duration, 
    mark_color_1, 
    mark_color_2, 
    accessToken 
  }: { 
    latitude: number; 
    longitude: number; 
    direction: number; 
    duration?: number; 
    mark_color_1?: string; 
    mark_color_2?: string; 
    accessToken: string 
  }, { rejectWithValue }) => {
    try {
      const requestBody: {
        latitude: number;
        longitude: number;
        direction: number;
        duration?: number;
        mark_color_1?: string;
        mark_color_2?: string;
      } = {
        latitude,
        longitude,
        direction,
      };

      // Ajouter les champs optionnels seulement s'ils sont définis
      if (duration !== undefined) {
        requestBody.duration = duration;
      }
      if (mark_color_1) {
        requestBody.mark_color_1 = mark_color_1;
      }
      if (mark_color_2) {
        requestBody.mark_color_2 = mark_color_2;
      }

      const response = await fetch('/api/hornets/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const newHornet = await response.json();
      return newHornet as Hornet;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors de la création du frelon');
    }
  }
);

// Thunk async pour supprimer un frelon
export const deleteHornet = createAsyncThunk(
  'hornets/deleteHornet',
  async ({ 
    hornetId, 
    accessToken 
  }: { 
    hornetId: number; 
    accessToken: string 
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/hornets/${hornetId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return hornetId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression');
    }
  }
);

// Slice pour les frelons
const hornetsSlice = createSlice({
  name: 'hornets',
  initialState,
  reducers: {
    // Actions synchrones si nécessaire
    clearError: (state) => {
      state.error = null;
    },
    clearHornets: (state) => {
      state.hornets = [];
    },
    // Action pour ajouter un frelon localement (pour l'ajout en temps réel)
    addHornet: (state, action) => {
      state.hornets.push(action.payload);
    },
    // Cycle entre les 3 modes d'affichage : full -> hornets-only -> hidden -> full
    cycleDisplayMode: (state) => {
      switch (state.displayMode) {
        case 'full':
          state.displayMode = 'hornets-only';
          break;
        case 'hornets-only':
          state.displayMode = 'hidden';
          break;
        case 'hidden':
          state.displayMode = 'full';
          break;
        default:
          state.displayMode = 'full';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Cas de fetchHornets
      .addCase(fetchHornets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHornets.fulfilled, (state, action) => {
        state.loading = false;
        state.hornets = action.payload;
      })
      .addCase(fetchHornets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cas de fetchHornetsPublic
      .addCase(fetchHornetsPublic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHornetsPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.hornets = action.payload;
      })
      .addCase(fetchHornetsPublic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cas de updateHornetDuration
      .addCase(updateHornetDuration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHornetDuration.fulfilled, (state, action) => {
        state.loading = false;
        const { hornetId, updatedHornet } = action.payload;
        const index = state.hornets.findIndex(hornet => hornet.id === hornetId);
        if (index !== -1) {
          state.hornets[index] = updatedHornet;
        }
      })
      .addCase(updateHornetDuration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cas de updateHornetColors
      .addCase(updateHornetColors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHornetColors.fulfilled, (state, action) => {
        state.loading = false;
        const { hornetId, updatedHornet } = action.payload;
        const index = state.hornets.findIndex(hornet => hornet.id === hornetId);
        if (index !== -1) {
          state.hornets[index] = updatedHornet;
        }
      })
      .addCase(updateHornetColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cas de createHornet
      .addCase(createHornet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHornet.fulfilled, (state, action) => {
        state.loading = false;
        state.hornets.push(action.payload);
      })
      .addCase(createHornet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cas de deleteHornet
      .addCase(deleteHornet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHornet.fulfilled, (state, action) => {
        state.loading = false;
        const hornetId = action.payload;
        state.hornets = state.hornets.filter(hornet => hornet.id !== hornetId);
      })
      .addCase(deleteHornet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Sélecteurs
export const selectHornets = (state: { hornets: HornetsState }) => state.hornets.hornets;
export const selectHornetsLoading = (state: { hornets: HornetsState }) => state.hornets.loading;
export const selectHornetsError = (state: { hornets: HornetsState }) => state.hornets.error;
export const selectDisplayMode = (state: { hornets: HornetsState }) => state.hornets.displayMode;

// Sélecteurs dérivés pour faciliter l'utilisation
export const selectShowHornets = (state: { hornets: HornetsState }) => 
  state.hornets.displayMode !== 'hidden';

export const selectShowReturnZones = (state: { hornets: HornetsState }) => 
  state.hornets.displayMode === 'full';

export const { clearError, clearHornets, addHornet, cycleDisplayMode } = hornetsSlice.actions;
export default hornetsSlice.reducer;
