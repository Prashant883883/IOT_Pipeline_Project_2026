import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated' 
        },
        { status: 401 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: session.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        industry: true,
        location: true,
        website: true,
        contactPerson: true,
        createdAt: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Company not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { company },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred.' 
      },
      { status: 500 }
    );
  }
}
