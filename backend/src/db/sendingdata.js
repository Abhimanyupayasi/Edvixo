import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan.js';

dotenv.config();

const plans = [
  {
    type: "Coaching",
    description: "Transform your coaching center with our all-in-one management platform. Streamline operations, engage students, and grow your business effortlessly.",
    plans: [
      {
        name: "Silver Plan",
        description: "Perfect for small coaching centers getting started with digital management",
        features: [
          {
            title: "Pre-built Basic Website",
            description: "Ready-to-use website template (non-customizable) with your branding",
            isIncluded: true
          },
          {
            title: "Student Management",
            description: "Add/edit/remove students, track enrollments and batches",
            isIncluded: true
          },
          {
            title: "Online Fees Payment",
            description: "Secure payment gateway integration for fee collection",
            isIncluded: true
          },
          {
            title: "Offline Payment Tracking",
            description: "Record cash/check payments with receipts",
            isIncluded: true
          },
          {
            title: "Flexible Fee Structures",
            description: "Create monthly/quarterly plans with discounts for lump-sum payments",
            isIncluded: true
          },
          {
            title: "Student Portal",
            description: "Students can view dues/payments via enrollment number & DOB",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Up to 100 students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 1,
            basePrice: 2999,
            discountPrice: 2499,
            currency: "INR",
            note: "Best for trial"
          },
          {
            duration: 3,
            basePrice: 8997,
            discountPrice: 6999,
            currency: "INR",
            note: "Save ₹500/month"
          },
          {
            duration: 6,
            basePrice: 17994,
            discountPrice: 11999,
            currency: "INR",
            note: "Save ₹1000/month"
          },
          {
            duration: 12,
            basePrice: 35988,
            discountPrice: 19999,
            currency: "INR",
            note: "Save ₹1500/month"
          }
        ],
        isActive: true
      },
      {
        name: "Gold Plan",
        description: "For growing coaching centers needing better student engagement",
        features: [
          {
            title: "Pre-built Basic Website",
            description: "Ready-to-use website template (non-customizable) with your branding",
            isIncluded: true
          },
          {
            title: "All Silver Features",
            description: "Student management, fee collection, payment tracking, flexible fee structures, student portal",
            isIncluded: true
          },
          {
            title: "Smart Attendance",
            description: "Digital attendance with SMS alerts to parents",
            isIncluded: true
          },
          {
            title: "Batch Management",
            description: "Organize students into batches with separate schedules",
            isIncluded: true
          },
          {
            title: "Basic Reports",
            description: "Collection reports, attendance summaries",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Up to 250 students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 1,
            basePrice: 4999,
            discountPrice: 4499,
            currency: "INR"
          },
          {
            duration: 3,
            basePrice: 14997,
            discountPrice: 11999,
            currency: "INR",
            note: "Save ₹1000/month"
          },
          {
            duration: 6,
            basePrice: 29994,
            discountPrice: 20999,
            currency: "INR",
            note: "Save ₹1500/month"
          },
          {
            duration: 12,
            basePrice: 59988,
            discountPrice: 34999,
            currency: "INR",
            note: "Save ₹2500/month"
          }
        ],
        isActive: true
      },
      {
        name: "Premium Plan",
        description: "Advanced features for established coaching centers",
        features: [
          {
            title: "Customizable Website",
            description: "Professionally designed website tailored to your brand",
            isIncluded: true
          },
          {
            title: "All Gold Features",
            description: "Basic website, student management, attendance, batch management, basic reports",
            isIncluded: true
          },
          {
            title: "Homework System",
            description: "Assign 10 homework tasks/day with attachments",
            isIncluded: true
          },
          {
            title: "SMS/Email Alerts",
            description: "Automated notifications for fees, attendance, homework",
            isIncluded: true
          },
          {
            title: "Teacher App",
            description: "Dedicated mobile app for faculty",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Up to 500 students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 1,
            basePrice: 7999,
            discountPrice: 6999,
            currency: "INR"
          },
          {
            duration: 3,
            basePrice: 23997,
            discountPrice: 18999,
            currency: "INR",
            note: "Save ₹1666/month"
          },
          {
            duration: 6,
            basePrice: 47994,
            discountPrice: 32999,
            currency: "INR",
            note: "Save ₹2333/month"
          },
          {
            duration: 12,
            basePrice: 95988,
            discountPrice: 54999,
            currency: "INR",
            note: "Save ₹3500/month"
          }
        ],
        isActive: true
      },
      {
        name: "Diamond Plan",
        description: "Complete enterprise solution for premium coaching institutes",
        features: [
          {
            title: "Premium Custom Website",
            description: "Fully customized website with premium design and CMS",
            isIncluded: true
          },
          {
            title: "All Premium Features",
            description: "Custom website, homework system, alerts, teacher app",
            isIncluded: true
          },
          {
            title: "Full Staff Management",
            description: "Teachers, receptionists (4 logins), payroll system",
            isIncluded: true
          },
          {
            title: "Unlimited Homework",
            description: "No daily limits on assignments",
            isIncluded: true
          },
          {
            title: "Online Test Platform",
            description: "Create and conduct digital exams",
            isIncluded: true
          },
          {
            title: "Parent Portal",
            description: "Dedicated access for parents with performance tracking",
            isIncluded: true
          },
          {
            title: "Video Library",
            description: "Upload reference videos/lectures",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Unlimited students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 1,
            basePrice: 12999,
            discountPrice: 10999,
            currency: "INR"
          },
          {
            duration: 3,
            basePrice: 38997,
            discountPrice: 29999,
            currency: "INR",
            note: "Save ₹3333/month"
          },
          {
            duration: 6,
            basePrice: 77994,
            discountPrice: 54999,
            currency: "INR",
            note: "Save ₹4166/month"
          },
          {
            duration: 12,
            basePrice: 155988,
            discountPrice: 99999,
            currency: "INR",
            note: "Save ₹5000/month"
          }
        ],
        isActive: true
      }
    ]
  },
  {
    type: "School",
    description: "Modernize your school administration with our comprehensive digital platform",
    plans: [
      {
        name: "Silver Plan",
        description: "Essential digital tools for small schools",
        features: [
          {
            title: "Pre-built School Website",
            description: "Standard template (non-customizable) with basic info pages",
            isIncluded: true
          },
          {
            title: "Student Database",
            description: "Manage admissions, classes, sections",
            isIncluded: true
          },
          {
            title: "Teacher Management",
            description: "Faculty profiles, subject allocation",
            isIncluded: true
          },
          {
            title: "Fee Management",
            description: "Multiple fee structures, online/offline payments",
            isIncluded: true
          },
          {
            title: "Receipt Generation",
            description: "Automated fee receipts",
            isIncluded: true
          },
          {
            title: "2 Receptionist Logins",
            description: "For front office operations",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Up to 200 students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 3,
            basePrice: 17997,
            discountPrice: 14999,
            currency: "INR"
          },
          {
            duration: 6,
            basePrice: 35994,
            discountPrice: 26999,
            currency: "INR",
            note: "Save ₹1500/month"
          },
          {
            duration: 12,
            basePrice: 59999,
            discountPrice: 49999,
            currency: "INR",
            note: "Save ₹2000/month"
          }
        ],
        isActive: true
      },
      {
        name: "Gold Plan",
        description: "Enhanced features for medium-sized schools",
        features: [
          {
            title: "Pre-built School Website",
            description: "Standard template (non-customizable) with basic info pages",
            isIncluded: true
          },
          {
            title: "All Silver Features",
            description: "Student database, teacher management, fee system, receipt generation",
            isIncluded: true
          },
          {
            title: "Digital Attendance",
            description: "Class-wise tracking with SMS alerts to parents",
            isIncluded: true
          },
          {
            title: "Class Teacher Portal",
            description: "Send notices, announcements to students",
            isIncluded: true
          },
          {
            title: "Admin Dashboard",
            description: "Comprehensive analytics and reporting",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Up to 500 students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 3,
            basePrice: 26997,
            discountPrice: 22499,
            currency: "INR"
          },
          {
            duration: 6,
            basePrice: 53994,
            discountPrice: 39999,
            currency: "INR",
            note: "Save ₹2250/month"
          },
          {
            duration: 12,
            basePrice: 89999,
            discountPrice: 74999,
            currency: "INR",
            note: "Save ₹3000/month"
          }
        ],
        isActive: true
      },
      {
        name: "Premium Plan",
        description: "Complete solution for large schools",
        features: [
          {
            title: "Custom School Website",
            description: "Tailored design with content management system",
            isIncluded: true
          },
          {
            title: "All Gold Features",
            description: "Attendance system, class teacher portal, admin dashboard",
            isIncluded: true
          },
          {
            title: "Homework System",
            description: "Assign and track assignments",
            isIncluded: true
          },
          {
            title: "4 Receptionist Logins",
            description: "For efficient front office operations",
            isIncluded: true
          },
          {
            title: "Teacher Mobile App",
            description: "For attendance and assignment management",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Up to 1000 students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 3,
            basePrice: 38997,
            discountPrice: 32999,
            currency: "INR"
          },
          {
            duration: 6,
            basePrice: 77994,
            discountPrice: 59999,
            currency: "INR",
            note: "Save ₹3000/month"
          },
          {
            duration: 12,
            basePrice: 129999,
            discountPrice: 109999,
            currency: "INR",
            note: "Save ₹4000/month"
          }
        ],
        isActive: true
      },
      {
        name: "Diamond Plan",
        description: "Premium enterprise solution for elite institutions",
        features: [
          {
            title: "Premium Custom Website",
            description: "Advanced website with custom features and integrations",
            isIncluded: true
          },
          {
            title: "All Premium Features",
            description: "Homework system, teacher app, custom website",
            isIncluded: true
          },
          {
            title: "Examination System",
            description: "Create, conduct and evaluate digital tests",
            isIncluded: true
          },
          {
            title: "Parent Portal",
            description: "Performance tracking, fee payment, communication",
            isIncluded: true
          },
          {
            title: "6 Receptionist Logins",
            description: "For large administrative teams",
            isIncluded: true
          },
          {
            title: "Learning Management",
            description: "Upload study materials, videos, references",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Unlimited students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 3,
            basePrice: 59997,
            discountPrice: 49999,
            currency: "INR"
          },
          {
            duration: 6,
            basePrice: 119994,
            discountPrice: 89999,
            currency: "INR",
            note: "Save ₹5000/month"
          },
          {
            duration: 12,
            basePrice: 199999,
            discountPrice: 169999,
            currency: "INR",
            note: "Save ₹6000/month"
          }
        ],
        isActive: true
      }
    ]
  },
  {
    type: "College",
    description: "Comprehensive digital transformation for higher education institutions",
    plans: [
      {
        name: "Silver Plan",
        description: "Foundational digital management for colleges",
        features: [
          {
            title: "Pre-built College Website",
            description: "Standard template (non-customizable) with basic info pages",
            isIncluded: true
          },
          {
            title: "Student Lifecycle",
            description: "Admission to graduation tracking",
            isIncluded: true
          },
          {
            title: "Faculty Management",
            description: "Department-wise faculty profiles",
            isIncluded: true
          },
          {
            title: "Fee Automation",
            description: "Course-wise fee structures with online payment",
            isIncluded: true
          },
          {
            title: "3 Receptionist Logins",
            description: "For administrative staff",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Up to 500 students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 3,
            basePrice: 23997,
            discountPrice: 19999,
            currency: "INR"
          },
          {
            duration: 6,
            basePrice: 47994,
            discountPrice: 34999,
            currency: "INR",
            note: "Save ₹2500/month"
          },
          {
            duration: 12,
            basePrice: 79999,
            discountPrice: 69999,
            currency: "INR",
            note: "Save ₹3000/month"
          }
        ],
        isActive: true
      },
      {
        name: "Gold Plan",
        description: "Enhanced academic management system",
        features: [
          {
            title: "Pre-built College Website",
            description: "Standard template (non-customizable) with basic info pages",
            isIncluded: true
          },
          {
            title: "All Silver Features",
            description: "Student lifecycle, faculty management, fee automation",
            isIncluded: true
          },
          {
            title: "Smart Attendance",
            description: "Lecture-wise tracking with biometric options",
            isIncluded: true
          },
          {
            title: "Assignment System",
            description: "Create and evaluate coursework",
            isIncluded: true
          },
          {
            title: "Department Portals",
            description: "Separate access for each department",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Up to 1000 students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 3,
            basePrice: 35997,
            discountPrice: 29999,
            currency: "INR"
          },
          {
            duration: 6,
            basePrice: 71994,
            discountPrice: 54999,
            currency: "INR",
            note: "Save ₹3000/month"
          },
          {
            duration: 12,
            basePrice: 119999,
            discountPrice: 99999,
            currency: "INR",
            note: "Save ₹4000/month"
          }
        ],
        isActive: true
      },
      {
        name: "Premium Plan",
        description: "Advanced college administration platform",
        features: [
          {
            title: "Custom College Website",
            description: "Professional design reflecting your institution's brand",
            isIncluded: true
          },
          {
            title: "All Gold Features",
            description: "Attendance, assignments, department portals",
            isIncluded: true
          },
          {
            title: "Examination System",
            description: "Create timetables, manage evaluations",
            isIncluded: true
          },
          {
            title: "Faculty Mobile App",
            description: "For attendance and assignment management",
            isIncluded: true
          },
          {
            title: "Student App",
            description: "Access timetable, results, notices",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Up to 2000 students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 3,
            basePrice: 50997,
            discountPrice: 44999,
            currency: "INR"
          },
          {
            duration: 6,
            basePrice: 101994,
            discountPrice: 79999,
            currency: "INR",
            note: "Save ₹4000/month"
          },
          {
            duration: 12,
            basePrice: 169999,
            discountPrice: 149999,
            currency: "INR",
            note: "Save ₹5000/month"
          }
        ],
        isActive: true
      },
      {
        name: "Diamond Plan",
        description: "Complete digital campus solution",
        features: [
          {
            title: "Premium Custom Website",
            description: "Advanced website with custom features and integrations",
            isIncluded: true
          },
          {
            title: "All Premium Features",
            description: "Examination system, faculty/student apps, custom website",
            isIncluded: true
          },
          {
            title: "Learning Management",
            description: "Upload lectures, assignments, references",
            isIncluded: true
          },
          {
            title: "Virtual Classroom",
            description: "Live online classes with recording",
            isIncluded: true
          },
          {
            title: "Placement Portal",
            description: "Manage campus recruitment",
            isIncluded: true
          },
          {
            title: "Alumni Network",
            description: "Engagement platform for graduates",
            isIncluded: true
          },
          {
            title: "Max Capacity",
            description: "Unlimited students",
            isIncluded: true
          }
        ],
        pricingTiers: [
          {
            duration: 3,
            basePrice: 74997,
            discountPrice: 64999,
            currency: "INR"
          },
          {
            duration: 6,
            basePrice: 149994,
            discountPrice: 119999,
            currency: "INR",
            note: "Save ₹5000/month"
          },
          {
            duration: 12,
            basePrice: 249999,
            discountPrice: 219999,
            currency: "INR",
            note: "Save ₹6000/month"
          }
        ],
        isActive: true
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log('Connected to MongoDB');

    // Delete all existing plans
    await Plan.deleteMany({});
    console.log('Deleted all existing plans');

    // Insert new plans
    const result = await Plan.insertMany(plans);
    console.log(`Successfully inserted ${result.length} plans`);

    // Close connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Execute the seeding function
seedDatabase();