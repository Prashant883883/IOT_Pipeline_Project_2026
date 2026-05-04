import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import { ApplicationStatus } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.statusHistory.deleteMany();
  await prisma.recruiterNote.deleteMany();
  await prisma.application.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.student.deleteMany();
  await prisma.company.deleteMany();

  console.log('Cleared existing data');

  // Create demo company
  const demoCompany = await prisma.company.create({
    data: {
      name: 'TechCorp Solutions',
      email: 'recruiter@techcorp.com',
      password: await hashPassword('password123'),
      industry: 'Technology',
      location: 'San Francisco, CA',
      website: 'https://techcorp.com',
      contactPerson: 'John Smith',
    },
  });

  console.log('Created demo company:', demoCompany.email);

  // Create students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@university.edu',
        skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'Python']),
        bio: 'Computer Science student passionate about web development',
      },
    }),
    prisma.student.create({
      data: {
        name: 'Bob Williams',
        email: 'bob@university.edu',
        skills: JSON.stringify(['Java', 'Spring Boot', 'SQL', 'AWS']),
        bio: 'Backend developer with cloud experience',
      },
    }),
    prisma.student.create({
      data: {
        name: 'Carol Davis',
        email: 'carol@university.edu',
        skills: JSON.stringify(['UI/UX Design', 'Figma', 'Adobe XD', 'HTML/CSS']),
        bio: 'Design student focused on user experience',
      },
    }),
    prisma.student.create({
      data: {
        name: 'David Miller',
        email: 'david@university.edu',
        skills: JSON.stringify(['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis']),
        bio: 'AI/ML enthusiast with strong math background',
      },
    }),
    prisma.student.create({
      data: {
        name: 'Emma Wilson',
        email: 'emma@university.edu',
        skills: JSON.stringify(['JavaScript', 'Vue.js', 'MongoDB', 'Express']),
        bio: 'Full-stack developer with startup experience',
      },
    }),
  ]);

  console.log('Created', students.length, 'students');

  // Create proposals
  const proposals = await Promise.all([
    prisma.proposal.create({
      data: {
        title: 'E-commerce Platform Redesign',
        summary: 'Modernizing an existing e-commerce platform with React and Node.js',
        description: 'This proposal outlines a complete redesign of an e-commerce platform using modern technologies. The project includes frontend development with React, backend API with Node.js/Express, and database design with PostgreSQL.\n\nKey features:\n- Responsive design\n- Shopping cart functionality\n- Payment integration\n- Admin dashboard\n- Analytics reporting',
        skills: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Stripe API']),
        studentId: students[0].id,
      },
    }),
    prisma.proposal.create({
      data: {
        title: 'Machine Learning Model for Predictive Analytics',
        summary: 'Building a predictive analytics model for business forecasting',
        description: 'A comprehensive machine learning project focused on business forecasting. The model uses historical data to predict future trends and help with decision making.\n\nTechnologies used:\n- Python\n- TensorFlow\n- Pandas\n- Scikit-learn\n- Jupyter Notebooks',
        skills: JSON.stringify(['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis']),
        studentId: students[3].id,
      },
    }),
    prisma.proposal.create({
      data: {
        title: 'Mobile App UI/UX Design',
        summary: 'Complete UI/UX design for a fitness tracking mobile application',
        description: 'This proposal presents a complete design system for a fitness tracking app. Includes user research, wireframes, high-fidelity mockups, and interactive prototypes.\n\nDeliverables:\n- User personas\n- Journey maps\n- Wireframes\n- UI kit\n- Interactive prototype',
        skills: JSON.stringify(['UI/UX Design', 'Figma', 'Prototyping', 'User Research']),
        studentId: students[2].id,
      },
    }),
    prisma.proposal.create({
      data: {
        title: 'Cloud Infrastructure Automation',
        summary: 'AWS infrastructure automation using Terraform and CI/CD pipelines',
        description: 'Infrastructure as Code project for automating cloud resource provisioning. Includes Terraform modules, CI/CD pipelines with GitHub Actions, and monitoring setup.\n\nComponents:\n- VPC and networking\n- EC2 auto-scaling\n- RDS databases\n- S3 buckets\n- CloudWatch monitoring',
        skills: JSON.stringify(['AWS', 'Terraform', 'CI/CD', 'Docker']),
        studentId: students[1].id,
      },
    }),
    prisma.proposal.create({
      data: {
        title: 'Real-time Chat Application',
        summary: 'Full-stack chat application with WebSocket support',
        description: 'A modern real-time chat application built with Vue.js and Socket.io. Features include private messaging, group chats, file sharing, and message encryption.\n\nStack:\n- Vue.js 3\n- Socket.io\n- MongoDB\n- Redis\n- Express.js',
        skills: JSON.stringify(['Vue.js', 'Socket.io', 'MongoDB', 'Redis']),
        studentId: students[4].id,
      },
    }),
    prisma.proposal.create({
      data: {
        title: 'Data Visualization Dashboard',
        summary: 'Interactive dashboard for visualizing complex datasets',
        description: 'A React-based dashboard for visualizing large datasets with interactive charts and graphs. Includes data filtering, export functionality, and real-time updates.\n\nFeatures:\n- D3.js visualizations\n- Interactive filters\n- CSV/Excel export\n- Real-time data updates\n- Responsive layout',
        skills: JSON.stringify(['React', 'D3.js', 'TypeScript', 'REST APIs']),
        studentId: students[0].id,
      },
    }),
    prisma.proposal.create({
      data: {
        title: 'API Gateway Microservice',
        summary: 'Scalable API gateway for microservices architecture',
        description: 'A high-performance API gateway built with Spring Boot. Handles authentication, rate limiting, request routing, and load balancing for microservices.\n\nCapabilities:\n- JWT authentication\n- Rate limiting\n- Request/response transformation\n- Load balancing\n- Circuit breaker pattern',
        skills: JSON.stringify(['Java', 'Spring Boot', 'Redis', 'Docker']),
        studentId: students[1].id,
      },
    }),
    prisma.proposal.create({
      data: {
        title: 'AI-Powered Content Recommendation',
        summary: 'Content recommendation system using collaborative filtering',
        description: 'Machine learning-based recommendation engine for content platforms. Uses collaborative filtering and content-based algorithms to suggest relevant items.\n\nAlgorithms:\n- Collaborative filtering\n- Content-based filtering\n- Matrix factorization\n- Deep learning approaches',
        skills: JSON.stringify(['Python', 'Machine Learning', 'NLP', 'Recommendation Systems']),
        studentId: students[3].id,
      },
    }),
  ]);

  console.log('Created', proposals.length, 'proposals');

  // Create applications with various statuses
  const statuses = [
    ApplicationStatus.NEW,
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.SELECTED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.NEW,
    ApplicationStatus.UNDER_REVIEW,
  ];

  const applications = await Promise.all(
    proposals.map((proposal, index) =>
      prisma.application.create({
        data: {
          companyId: demoCompany.id,
          studentId: proposal.studentId,
          proposalId: proposal.id,
          currentStatus: statuses[index],
          submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        },
      })
    )
  );

  console.log('Created', applications.length, 'applications');

  // Create status history for each application
  for (let i = 0; i < applications.length; i++) {
    const app = applications[i];
    const currentStatus = statuses[i];
    
    // Always create NEW entry
    await prisma.statusHistory.create({
      data: {
        applicationId: app.id,
        status: ApplicationStatus.NEW,
        changedBy: demoCompany.id,
        notes: 'Application submitted',
        createdAt: app.submittedAt,
      },
    });

    // Add intermediate statuses based on current status
    if (currentStatus === ApplicationStatus.UNDER_REVIEW || 
        currentStatus === ApplicationStatus.SHORTLISTED ||
        currentStatus === ApplicationStatus.INTERVIEW ||
        currentStatus === ApplicationStatus.SELECTED ||
        currentStatus === ApplicationStatus.REJECTED) {
      await prisma.statusHistory.create({
        data: {
          applicationId: app.id,
          status: ApplicationStatus.UNDER_REVIEW,
          changedBy: demoCompany.id,
          notes: 'Moved to under review',
          createdAt: new Date(app.submittedAt.getTime() + 24 * 60 * 60 * 1000),
        },
      });
    }

    if (currentStatus === ApplicationStatus.SHORTLISTED ||
        currentStatus === ApplicationStatus.INTERVIEW ||
        currentStatus === ApplicationStatus.SELECTED) {
      await prisma.statusHistory.create({
        data: {
          applicationId: app.id,
          status: ApplicationStatus.SHORTLISTED,
          changedBy: demoCompany.id,
          notes: 'Candidate shortlisted',
          createdAt: new Date(app.submittedAt.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (currentStatus === ApplicationStatus.INTERVIEW ||
        currentStatus === ApplicationStatus.SELECTED) {
      await prisma.statusHistory.create({
        data: {
          applicationId: app.id,
          status: ApplicationStatus.INTERVIEW,
          changedBy: demoCompany.id,
          notes: 'Interview scheduled',
          createdAt: new Date(app.submittedAt.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (currentStatus === ApplicationStatus.SELECTED) {
      await prisma.statusHistory.create({
        data: {
          applicationId: app.id,
          status: ApplicationStatus.SELECTED,
          changedBy: demoCompany.id,
          notes: 'Candidate selected!',
          createdAt: new Date(app.submittedAt.getTime() + 5 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (currentStatus === ApplicationStatus.REJECTED) {
      await prisma.statusHistory.create({
        data: {
          applicationId: app.id,
          status: ApplicationStatus.REJECTED,
          changedBy: demoCompany.id,
          notes: 'Not a fit at this time',
          createdAt: new Date(app.submittedAt.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('Created status history entries');

  // Create some recruiter notes
  await Promise.all([
    prisma.recruiterNote.create({
      data: {
        applicationId: applications[0].id,
        companyId: demoCompany.id,
        content: 'Strong React skills, good communication',
      },
    }),
    prisma.recruiterNote.create({
      data: {
        applicationId: applications[2].id,
        companyId: demoCompany.id,
        content: 'Portfolio looks impressive, schedule interview',
      },
    }),
    prisma.recruiterNote.create({
      data: {
        applicationId: applications[4].id,
        companyId: demoCompany.id,
        content: 'Good full-stack experience, check references',
      },
    }),
  ]);

  console.log('Created recruiter notes');

  console.log('\n✅ Seed completed successfully!');
  console.log('\nDemo login credentials:');
  console.log('Email: recruiter@techcorp.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
