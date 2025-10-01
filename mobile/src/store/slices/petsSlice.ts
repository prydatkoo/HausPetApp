import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Pet, MedicalRecord, Vaccination, Medication } from '../../types';
import PetService from '../../services/api/petService';

interface PetsState {
  pets: Pet[];
  selectedPet: Pet | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PetsState = {
  pets: [],
  selectedPet: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPets = createAsyncThunk(
  'pets/fetchPets',
  async (_, { rejectWithValue }) => {
    try {
      const pets = await PetService.getAllPets();
      return pets;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pets');
    }
  }
);

export const createPet = createAsyncThunk(
  'pets/createPet',
  async (petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const pet = await PetService.createPet(petData);
      return pet;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create pet');
    }
  }
);

export const updatePet = createAsyncThunk(
  'pets/updatePet',
  async ({ id, data }: { id: string; data: Partial<Pet> }, { rejectWithValue }) => {
    try {
      const pet = await PetService.updatePet(id, data);
      return pet;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update pet');
    }
  }
);

export const addPet = createAsyncThunk(
  'pets/addPet',
  async (petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>, { dispatch }) => {
    const newPet = await dispatch(createPet(petData)).unwrap();
    return newPet;
  }
);

export const deletePet = createAsyncThunk(
  'pets/deletePet',
  async (petId: string, { rejectWithValue }) => {
    try {
      await PetService.deletePet(petId);
      return petId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete pet');
    }
  }
);

export const addMedicalRecord = createAsyncThunk(
  'pets/addMedicalRecord',
  async ({ petId, record }: { petId: string; record: Omit<MedicalRecord, 'id'> }, { rejectWithValue }) => {
    try {
      const medicalRecord = await PetService.addMedicalRecord(petId, record);
      return { petId, medicalRecord };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add medical record');
    }
  }
);

export const addVaccination = createAsyncThunk(
  'pets/addVaccination',
  async ({ petId, vaccination }: { petId: string; vaccination: Omit<Vaccination, 'id'> }, { rejectWithValue }) => {
    try {
      const newVaccination = await PetService.addVaccination(petId, vaccination);
      return { petId, vaccination: newVaccination };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add vaccination');
    }
  }
);

export const addMedication = createAsyncThunk(
  'pets/addMedication',
  async ({ petId, medication }: { petId: string; medication: Omit<Medication, 'id'> }, { rejectWithValue }) => {
    try {
      const newMedication = await PetService.addMedication(petId, medication);
      return { petId, medication: newMedication };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add medication');
    }
  }
);

const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    selectPet: (state, action: PayloadAction<Pet | null>) => {
      state.selectedPet = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePetLocally: (state, action: PayloadAction<Pet>) => {
      const index = state.pets.findIndex(pet => pet.id === action.payload.id);
      if (index !== -1) {
        state.pets[index] = action.payload;
      }
      if (state.selectedPet?.id === action.payload.id) {
        state.selectedPet = action.payload;
      }
    },

  },
  extraReducers: (builder) => {
    // Fetch pets
    builder
      .addCase(fetchPets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets = action.payload;
        state.error = null;
        if (action.payload.length > 0 && !state.selectedPet) {
          state.selectedPet = action.payload[0];
        }
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add pet
    builder
      .addCase(addPet.fulfilled, (state, action) => {
        state.pets.push(action.payload);
        if (!state.selectedPet) {
          state.selectedPet = action.payload;
        }
      });
      
    // Create pet
    builder
      .addCase(createPet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets.push(action.payload);
        if (!state.selectedPet) {
          state.selectedPet = action.payload;
        }
        state.error = null;
      })
      .addCase(createPet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update pet
    builder
      .addCase(updatePet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.pets.findIndex(pet => pet.id === action.payload.id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
        if (state.selectedPet?.id === action.payload.id) {
          state.selectedPet = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete pet
    builder
      .addCase(deletePet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets = state.pets.filter(pet => pet.id !== action.payload);
        if (state.selectedPet?.id === action.payload) {
          state.selectedPet = state.pets.length > 0 ? state.pets[0] : null;
        }
        state.error = null;
      })
      .addCase(deletePet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add medical record
    builder
      .addCase(addMedicalRecord.fulfilled, (state, action) => {
        const { petId, medicalRecord } = action.payload;
        const pet = state.pets.find(p => p.id === petId);
        if (pet) {
          pet.medicalHistory.push(medicalRecord);
        }
        if (state.selectedPet?.id === petId) {
          state.selectedPet.medicalHistory.push(medicalRecord);
        }
      });

    // Add vaccination
    builder
      .addCase(addVaccination.fulfilled, (state, action) => {
        const { petId, vaccination } = action.payload;
        const pet = state.pets.find(p => p.id === petId);
        if (pet) {
          pet.vaccinations.push(vaccination);
        }
        if (state.selectedPet?.id === petId) {
          state.selectedPet.vaccinations.push(vaccination);
        }
      });

    // Add medication
    builder
      .addCase(addMedication.fulfilled, (state, action) => {
        const { petId, medication } = action.payload;
        const pet = state.pets.find(p => p.id === petId);
        if (pet) {
          pet.medications.push(medication);
        }
        if (state.selectedPet?.id === petId) {
          state.selectedPet.medications.push(medication);
        }
      });
  },
});

export const { selectPet, clearError, updatePetLocally } = petsSlice.actions;
export default petsSlice.reducer;