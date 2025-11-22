// app/api/categories/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/categories?userId=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (err) {
    console.error('GET /api/categories error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/categories  { userId, name }
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, name } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 401 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const trimmed = name.trim();

    // Optional: avoid exact duplicates per user
    const existing = await prisma.category.findFirst({
      where: { userId, name: trimmed },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a category with that name' },
        { status: 400 }
      );
    }

    const created = await prisma.category.create({
      data: {
        userId,
        name: trimmed,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('POST /api/categories error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories  { userId, id }
export async function DELETE(request) {
  try{
    const body = await request.json();
    const { userId, id } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Missing category id' },
        { status: 400 }
      );
    }

    await prisma.category.deleteMany({
      where: {
        id: Number(id),
        userId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/categories error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}