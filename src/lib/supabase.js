import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - Templo Verde
const supabaseUrl = 'https://ubhyhlrwaggpsqixbzwf.supabase.co';
const supabaseAnonKey = 'sb_publishable_xJg1Pw8aCvom9TTXAmPAAQ_aEVQfi88';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para obtener el usuario actual
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// Helper para obtener el rol del usuario
export const getUserRole = async () => {
    const user = await getCurrentUser();
    return user?.user_metadata?.role || null;
};

// Helper para verificar si es admin
export const isAdmin = async () => {
    const role = await getUserRole();
    return role === 'admin';
};

// Helper para verificar si es operator o admin
export const isOperator = async () => {
    const role = await getUserRole();
    return role === 'operator' || role === 'admin';
};
