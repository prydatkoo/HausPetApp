import { Pet, MedicalRecord, Vaccination, Medication } from '../../types';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../constants';
import apiClient from './apiClient';
import * as SecureStore from 'expo-secure-store';

async function readLocalPets(): Promise<Pet[]> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.PETS_DATA);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalPets(pets: Pet[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.PETS_DATA, JSON.stringify(pets));
  } catch {
    // ignore
  }
}

class PetService {
  async getAllPets(): Promise<Pet[]> {
    try {
      const pets = await apiClient.get<Pet[]>(API_ENDPOINTS.PETS.LIST);
      // Mirror to local cache
      await writeLocalPets(pets);
      return pets;
    } catch (e) {
      // Fallback to local cache when server is unavailable or 404
      const local = await readLocalPets();
      return local;
    }
  }

  async createPet(petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pet> {
    try {
      const response = await apiClient.post<{ pet: Pet }>(API_ENDPOINTS.PETS.CREATE, petData);
      const created = response.pet;
      const local = await readLocalPets();
      await writeLocalPets([...local, created]);
      return created;
    } catch (e) {
      // Offline/404 fallback: create a local pet
      const offlinePet: Pet = {
        ...(petData as any),
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const local = await readLocalPets();
      await writeLocalPets([...local, offlinePet]);
      return offlinePet;
    }
  }

  async updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
    const endpoint = API_ENDPOINTS.PETS.UPDATE.replace(':id', id);
    try {
      const response = await apiClient.put<{ pet: Pet }>(endpoint, data);
      const updated = response.pet;
      // Update local cache
      const local = await readLocalPets();
      const idx = local.findIndex(p => p.id === id);
      if (idx !== -1) {
        local[idx] = updated;
        await writeLocalPets(local);
      }
      return updated;
    } catch (e) {
      // Update locally when server fails
      const local = await readLocalPets();
      const idx = local.findIndex(p => p.id === id);
      if (idx !== -1) {
        const updated: Pet = { ...local[idx], ...data, updatedAt: new Date() as any };
        local[idx] = updated;
        await writeLocalPets(local);
        return updated;
      }
      // If not found locally, synthesize
      const synthesized: Pet = { id, ...(data as any), createdAt: new Date() as any, updatedAt: new Date() as any };
      await writeLocalPets([...local, synthesized]);
      return synthesized;
    }
  }

  async deletePet(id: string): Promise<void> {
    const endpoint = API_ENDPOINTS.PETS.DELETE.replace(':id', id);
    try {
      await apiClient.delete(endpoint);
    } finally {
      // Always remove from local cache
      const local = await readLocalPets();
      const next = local.filter(p => p.id !== id);
      await writeLocalPets(next);
    }
  }

  async addMedicalRecord(petId: string, record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> {
    const endpoint = `${API_ENDPOINTS.PETS.LIST}/${petId}/medical`;
    try {
      const created = await apiClient.post<MedicalRecord>(endpoint, record);
      return { ...created, date: new Date(created.date), nextAppointment: created.nextAppointment ? new Date(created.nextAppointment) : undefined };
    } catch {
      const local = await readLocalPets();
      const pet = local.find(p => p.id === petId);
      const offline: MedicalRecord = {
        ...(record as MedicalRecord),
        id: Date.now().toString(),
      };
      if (pet) {
        pet.medicalHistory.push(offline);
        await writeLocalPets(local);
      }
      return offline;
    }
  }

  async addVaccination(petId: string, vaccination: Omit<Vaccination, 'id'>): Promise<Vaccination> {
    const endpoint = `${API_ENDPOINTS.PETS.LIST}/${petId}/vaccinations`;
    try {
      const created = await apiClient.post<Vaccination>(endpoint, vaccination);
      return { ...created, date: new Date(created.date), expiryDate: new Date(created.expiryDate), nextDue: created.nextDue ? new Date(created.nextDue) : undefined };
    } catch {
      const local = await readLocalPets();
      const pet = local.find(p => p.id === petId);
      const offline: Vaccination = {
        ...(vaccination as Vaccination),
        id: Date.now().toString(),
        expiryDate: (vaccination as Vaccination).expiryDate ?? new Date(),
      };
      if (pet) {
        pet.vaccinations.push(offline);
        await writeLocalPets(local);
      }
      return offline;
    }
  }

  async addMedication(petId: string, medication: Omit<Medication, 'id'>): Promise<Medication> {
    const endpoint = `${API_ENDPOINTS.PETS.LIST}/${petId}/medications`;
    try {
      const created = await apiClient.post<Medication>(endpoint, medication);
      return { ...created, startDate: new Date(created.startDate), endDate: created.endDate ? new Date(created.endDate) : undefined };
    } catch {
      const local = await readLocalPets();
      const pet = local.find(p => p.id === petId);
      const offline: Medication = {
        ...(medication as Medication),
        id: Date.now().toString(),
        isActive: (medication as Medication).isActive ?? true,
      };
      if (pet) {
        pet.medications.push(offline);
        await writeLocalPets(local);
      }
      return offline;
    }
  }
}

export default new PetService();
