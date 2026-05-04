import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { companyRegistrationSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = companyRegistrationSchema.safeParse(body);
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

    const { name, email, password, industry, location, website, contactPerson } = result.data;

    // Check if email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingCompany) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'An account with this email already exists',
          errors: { email: ['Email already registered'] }
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        industry: industry || null,
        location: location || null,
        website: website || null,
        contactPerson: contactPerson || null,
      },
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
        message: 'Registration successful',
        data: { company },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An unexpected error occurred. Please try again.' 
      },
      { status: 500 }
    );
  }
}
