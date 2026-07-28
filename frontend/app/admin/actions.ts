'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function authenticateAdmin(formData: FormData) {
  const password = formData.get('password');

  // Para este MVP usaremos una contraseña fija. -> .env
  if (password === 'zerogate2026') {
    const cookieStore = await cookies();
    cookieStore.set('zerogate_admin_session', 'active', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    redirect('/dashboard/devices');
  }

  return { error: "Access denied" };
}