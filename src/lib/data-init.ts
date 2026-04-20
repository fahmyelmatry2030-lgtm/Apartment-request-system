import { units as staticUnits } from './data';
import { 
  getDbBookings, 
  saveDbBooking, 
  updateDbBookingStatus, 
  getDbUnits, 
  updateDbUnitDetails 
} from './actions/db';

export const STORAGE_KEYS = {
  BOOKINGS: 'bookings',
  STUDIOS: 'studios',
};

// --- INITIALIZATION ---

export const initializeData = async () => {
  if (typeof window === 'undefined') return;
  
  // Note: Since we are moving to server-side JSON, 
  // initialization of JSON files is handled by the model manually once.
  // We can still use this to sync local cache if needed.
};

// --- UNITS ---

export const getSystemUnits = async () => {
  let units = staticUnits;

  // Try server-side first
  try {
    const dbUnits = await getDbUnits();
    if (dbUnits && dbUnits.length > 0) {
      // Merge static UI data with dynamic DB data to prevent missing media properties
      units = dbUnits.map((dbUnit: any) => {
        const baseUnit = staticUnits.find(u => u.id === dbUnit.id) || {};
        return {
          ...baseUnit,
          ...dbUnit
        };
      });
    }
  } catch (e) {
    console.warn('DB Fetch failed, falling back to static');
  }

  // Merge with LocalStorage updates (if any)
  if (typeof window !== 'undefined') {
    try {
      const localUnits = JSON.parse(localStorage.getItem('local_units') || '[]');
      units = units.map(u => {
        const local = localUnits.find((l: any) => l.id === u.id);
        return local ? { ...u, ...local } : u;
      });
    } catch (e) {
      console.warn('Failed to merge local units');
    }
  }

  return units;
};

// Returns only the 7 display categories (hides the 24 physical studios)
export const getPublicSystemUnits = async () => {
  const allUnits = await getSystemUnits();
  return allUnits.filter(u => !u.id.startsWith('b1-s') && !u.id.startsWith('b2-s'));
};

export const updateUnitDetails = async (id: string, updates: any) => {
  try {
    return await updateDbUnitDetails(id, updates);
  } catch (e) {
    console.warn(`Failed to update unit details for ${id} in DB, applying locally:`, e);
    
    // Optional: save to localStorage to persist across refreshes during demo
    if (typeof window !== 'undefined') {
      const localUnits = JSON.parse(localStorage.getItem('local_units') || '[]');
      const index = localUnits.findIndex((u: any) => u.id === id);
      if (index !== -1) {
          localUnits[index] = { ...localUnits[index], ...updates };
      } else {
          localUnits.push({ id, ...updates });
      }
      localStorage.setItem('local_units', JSON.stringify(localUnits));
    }
    
    return await getSystemUnits();
  }
};

// --- BOOKINGS ---

export const getBookings = async (nonce?: string) => {
  try {
    const dbBookings = await getFreshDbBookings(nonce);
    const localBookings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('local_bookings') || '[]') : [];
    
    // Combine: Filter out nulls/no-id
    const combined = [...localBookings, ...dbBookings].filter(b => b && b.id);
    
    // Deduplicate by ID, keeping the one with the newest timestamp
    const uniqueMap = new Map();
    combined.forEach(item => {
      const existing = uniqueMap.get(item.id);
      const itemTime = item.timestamp ? new Date(item.timestamp).getTime() : 0;
      const existingTime = existing?.timestamp ? new Date(existing.timestamp).getTime() : 0;
      
      if (!existing || itemTime > existingTime) {
        uniqueMap.set(item.id, item);
      }
    });

    const unique = Array.from(uniqueMap.values());
    
    // Cleanup LocalStorage: If a record is in DB, we don't need it in LocalStorage anymore
    if (typeof window !== 'undefined' && dbBookings.length > 0) {
      const local = JSON.parse(localStorage.getItem('local_bookings') || '[]');
      const dbIds = new Set(dbBookings.map(b => b.id));
      const filteredLocal = local.filter((b: any) => !dbIds.has(b.id));
      if (local.length !== filteredLocal.length) {
        localStorage.setItem('local_bookings', JSON.stringify(filteredLocal));
      }
    }
    
    return unique.sort((a: any, b: any) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
    });
  } catch (e) {
    console.error('DB Bookings fetch failed, falling back to local storage:', e);
    return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('local_bookings') || '[]') : [];
  }
};

export const saveBooking = async (booking: any) => {
  try {
    const result = await saveDbBooking(booking);
    
    // Cleanup: If DB save succeeded, remove any local backup to avoid shadowing
    if (typeof window !== 'undefined' && result?.id) {
       const local = JSON.parse(localStorage.getItem('local_bookings') || '[]');
       const filtered = local.filter((b: any) => b.id !== result.id);
       if (local.length !== filtered.length) {
         localStorage.setItem('local_bookings', JSON.stringify(filtered));
       }
    }
    
    return result;
  } catch (e) {
    console.warn('Database save failed, falling back to LocalStorage:', e);
    
    // Create local booking object
    const newBooking = {
      ...booking,
      id: `L-${Date.now()}`,
      status: 'رد جديد',
      timestamp: new Date().toISOString(),
    };
    
    if (typeof window !== 'undefined') {
      const local = JSON.parse(localStorage.getItem('local_bookings') || '[]');
      local.unshift(newBooking);
      localStorage.setItem('local_bookings', JSON.stringify(local));
    }
    
    return newBooking;
  }
};

export const updateBookingStatus = async (id: string, updates: any) => {
  try {
    const result = await updateDbBookingStatus(id, updates);
    
    // Cleanup: If DB update succeeded, remove any stale copy from LocalStorage
    if (typeof window !== 'undefined') {
      const local = JSON.parse(localStorage.getItem('local_bookings') || '[]');
      const filtered = local.filter((b: any) => b.id !== id);
      if (local.length !== filtered.length) {
        localStorage.setItem('local_bookings', JSON.stringify(filtered));
      }
    }
    
    return result;
  } catch (e) {
    console.warn('DB Update failed, applying to LocalStorage:', e);
    
    if (typeof window !== 'undefined') {
      const local = JSON.parse(localStorage.getItem('local_bookings') || '[]');
      const index = local.findIndex((b: any) => b.id === id);
      if (index !== -1) {
          local[index] = { ...local[index], ...updates };
      } else {
          // Adopt the booking from the current view into LocalStorage to override the DB state
          try {
            const all = await getBookings();
            const target = all.find((b: any) => b.id === id);
            if (target) {
              local.unshift({ ...target, ...updates });
            }
          } catch (innerError) {
            console.error('Failed to adopt booking locally:', innerError);
          }
      }
      localStorage.setItem('local_bookings', JSON.stringify(local));
    }
    
    return await getBookings();
  }
};

export const getStudios = async () => {
  const units = await getPublicSystemUnits();
  return units.filter((u: any) => u.type === 'studio');
};
