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

export const getBookings = async () => {
  try {
    const dbBookings = await getDbBookings();
    const localBookings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('local_bookings') || '[]') : [];
    
    // Combine and remove duplicates based on ID
    const combined = [...dbBookings, ...localBookings];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    return unique.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (e) {
    console.error('DB Bookings fetch failed, falling back to local storage:', e);
    return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('local_bookings') || '[]') : [];
  }
};

export const saveBooking = async (booking: any) => {
  try {
    return await saveDbBooking(booking);
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
    return await updateDbBookingStatus(id, updates);
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
  const units = await getSystemUnits();
  return units.filter((u: any) => u.type === 'studio');
};
