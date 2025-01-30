import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './types';

export const supabase = createClientComponentClient<Database>({
  options: {
    db: {
      schema: 'public'
    },
    global: {
      headers: { 'x-my-custom-header': 'my-app-name' }
    }
  }
}); 