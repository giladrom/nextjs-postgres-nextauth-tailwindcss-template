import { NextResponse } from 'next/server';
import { getSalesData } from '@/lib/salesData';

export async function GET() {
  try {
    const { salesWithDetails } = await getSalesData();

    return NextResponse.json({ sales: salesWithDetails });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}
