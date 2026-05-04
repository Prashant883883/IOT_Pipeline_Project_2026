import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors 
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find company by email
    const company = await prisma.company.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!company) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, company.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({
      companyId: company.id,
      email: company.email,
      name: company.name,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          company: {
            id: company.id,
            name: company.name,
            email: company.email,
            industry: company.industry,
            location: company.location,
            website: company.website,
            contactPerson: company.contactPerson,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    );
  }
}
