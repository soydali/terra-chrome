import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { message: 'Çıkış başarılı' },
    { status: 200 }
  );

  // auth-token cookie'sini sil
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });

  return response;
} 