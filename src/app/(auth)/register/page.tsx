'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  website?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    industry: '',
    location: '',
    website: '',
    contactPerson: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Registration failed' });
        }
        return;
      }

      setSuccessMessage('Registration successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your company account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {errors.general && (
            <div className="mb-4">
              <Alert variant="error">{errors.general}</Alert>
            </div>
          )}

          {successMessage && (
            <div className="mb-4">
              <Alert variant="success">{successMessage}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <Input
              label="Company name"
              name="name"
              type="text"
              autoComplete="organization"
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              helperText="This will be your login email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText="Must be at least 8 characters"
            />

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-sm font-medium text-gray-900 mb-4">
                Additional Information (Optional)
              </h2>

              <div className="space-y-4">
                <Input
                  label="Industry"
                  name="industry"
                  type="text"
                  value={formData.industry}
                  onChange={handleChange}
                />

                <Input
                  label="Location"
                  name="location"
                  type="text"
                  autoComplete="address-level1"
                  value={formData.location}
                  onChange={handleChange}
                />

                <Input
                  label="Website"
                  name="website"
                  type="url"
                  autoComplete="url"
                  value={formData.website}
                  onChange={handleChange}
                  error={errors.website}
                  placeholder="https://example.com"
                />

                <Input
                  label="Contact Person"
                  name="contactPerson"
                  type="text"
                  autoComplete="name"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create account
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
