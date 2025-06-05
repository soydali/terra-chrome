import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
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

    await connectDB();
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const { username, email, currentPassword, newPassword, confirmPassword } = await request.json();

    // Kullanıcı adı ve email güncelleme
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Bu kullanıcı adı zaten kullanılıyor' },
          { status: 400 }
        );
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Bu email adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }
      user.email = email;
    }

    // Şifre değiştirme
    if (currentPassword && newPassword) {
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        return NextResponse.json(
          { message: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { message: 'Yeni şifreler eşleşmiyor' },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 