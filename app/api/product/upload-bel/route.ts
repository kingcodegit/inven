import { NextResponse } from 'next/server';
import { PrismaClient } from '@/prisma/generated/offline';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const {products} = await req.json();


  try {
    const created = await prisma.product.createMany({
      data: products,
      skipDuplicates: true, // In case barcode is unique
    });

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('Error saving products:', error);
    return NextResponse.json({ success: false, error });
  }
}
