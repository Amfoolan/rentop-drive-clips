import { supabase } from '@/integrations/supabase/client';

export async function clearTestData(): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('clear-test-data', {
      body: {}
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error clearing test data:', error);
    throw new Error('Impossible de supprimer les données de test');
  }
}