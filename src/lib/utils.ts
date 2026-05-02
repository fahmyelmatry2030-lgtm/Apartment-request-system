export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  let cleanPhone = phone.replace(/[^0-9]/g, '');

  // Handle double zero prefix
  if (cleanPhone.startsWith('00')) {
    cleanPhone = cleanPhone.substring(2);
  }

  // SELF-HEALING: If it starts with 20966, it's almost certainly a Saudi number 
  // that was incorrectly prefixed with Egyptian 20 (20 + 966...)
  if (cleanPhone.startsWith('20966')) {
    return cleanPhone.substring(2);
  }

  // Handle leading zero
  if (cleanPhone.startsWith('0')) {
    // Saudi Arabia numbers often start with 05... or 0966...
    if (cleanPhone.startsWith('0966')) {
      return cleanPhone.substring(1); // Remove leading 0 from 0966...
    }
    
    // Saudi mobile numbers are 10 digits starting with 05...
    if (cleanPhone.length === 10 && cleanPhone.startsWith('05')) {
      return '966' + cleanPhone.substring(1);
    }

    // Default to Egypt if starts with 0 (like 010...)
    return '20' + cleanPhone.substring(1);
  }

  // If it starts with 966, return as is (Saudi)
  if (cleanPhone.startsWith('966')) {
    return cleanPhone;
  }

  // If it starts with 20, return as is (Egypt)
  if (cleanPhone.startsWith('20')) {
    return cleanPhone;
  }

  // Fallback: If no known prefix and not starting with 0, assume Egypt for this application
  if (cleanPhone.length >= 8 && cleanPhone.length <= 12) {
    return '20' + cleanPhone;
  }

  return cleanPhone;
}
