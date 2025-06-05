import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Yetkilendirme başarısız' },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.userId || typeof payload.userId !== 'string') {
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı bilgisi' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('JWT')) {
        return NextResponse.json(
          { message: 'Geçersiz oturum. Lütfen tekrar giriş yapın.' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('MongoDB')) {
        return NextResponse.json(
          { message: 'Veritabanı bağlantı hatası' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Kullanıcı bilgileri alınamadı' },
      { status: 500 }
    );
  }
} 