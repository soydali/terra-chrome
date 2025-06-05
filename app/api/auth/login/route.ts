import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return NextResponse.json(
        { message: 'Geçersiz şifre' },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const userId = user._id.toString();
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { message: 'Kullanıcı kimliği geçersiz' },
        { status: 500 }
      );
    }

    const tokenPayload = {
      userId: userId,
      role: user.role
    };

    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json(
      { 
        message: 'Giriş başarılı',
        user: {
          _id: userId,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      { status: 200 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 saat
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Giriş sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 