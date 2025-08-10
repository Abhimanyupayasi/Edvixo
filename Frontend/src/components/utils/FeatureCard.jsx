import React from 'react';
import { Link } from 'react-router-dom';

// A mapping from feature keys to their corresponding management routes and button labels.
const featureLinks = {
  // Website Features
  prebuilt_basic_website: { to: '/dashboard/website-builder/basic', label: 'Build Your Website' },
  customizable_website: { to: '/dashboard/website-builder/custom', label: 'Design Your Website' },
  premium_custom_website: { to: '/dashboard/website-builder/premium', label: 'Create Premium Website' },
  prebuilt_school_website: { to: '/dashboard/website-builder/school', label: 'Build School Website' },
  custom_school_website: { to: '/dashboard/website-builder/school-custom', label: 'Design School Website' },
  prebuilt_college_website: { to: '/dashboard/website-builder/college', label: 'Build College Website' },
  custom_college_website: { to: '/dashboard/website-builder/college-custom', label: 'Design College Website' },

  // Student & Staff Management
  student_management: { to: '/dashboard/students', label: 'Manage Students' },
  student_database: { to: '/dashboard/students', label: 'Manage Student Database' },
  student_lifecycle: { to: '/dashboard/students/lifecycle', label: 'Manage Student Lifecycle' },
  full_staff_management: { to: '/dashboard/staff', label: 'Manage Staff' },
  teacher_management: { to: '/dashboard/staff/teachers', label: 'Manage Teachers' },
  faculty_management: { to: '/dashboard/staff/faculty', label: 'Manage Faculty' },

  // Financial Features
  online_fees_payment: { to: '/dashboard/payments/online', label: 'Manage Online Payments' },
  offline_payment_tracking: { to: '/dashboard/payments/offline', label: 'Track Offline Payments' },
  fee_management: { to: '/dashboard/payments/fees', label: 'Manage Fees' },
  fee_automation: { to: '/dashboard/payments/fees', label: 'Automate Fees' },
  flexible_fee_structures: { to: '/dashboard/payments/structures', label: 'Manage Fee Structures' },
  receipt_generation: { to: '/dashboard/payments/receipts', label: 'Generate Receipts' },

  // Academic & Engagement Features
  smart_attendance: { to: '/dashboard/academics/attendance', label: 'Manage Attendance' },
  digital_attendance: { to: '/dashboard/academics/attendance', label: 'Manage Attendance' },
  batch_management: { to: '/dashboard/academics/batches', label: 'Manage Batches' },
  homework_system: { to: '/dashboard/academics/homework', label: 'Manage Homework' },
  assignment_system: { to: '/dashboard/academics/assignments', label: 'Manage Assignments' },
  online_test_platform: { to: '/dashboard/academics/tests', label: 'Manage Tests' },
  examination_system: { to: '/dashboard/academics/exams', label: 'Manage Examinations' },
  learning_management: { to: '/dashboard/learning/lms', label: 'Manage Learning Content' },
  video_library: { to: '/dashboard/learning/videos', label: 'Manage Video Library' },
  virtual_classroom: { to: '/dashboard/learning/live', label: 'Go to Virtual Classroom' },

  // Communication & Portals
  smsemail_alerts: { to: '/dashboard/communications/alerts', label: 'Configure Alerts' },
  student_portal: { to: '/dashboard/portals/student', label: 'View Student Portal' },
  parent_portal: { to: '/dashboard/portals/parent', label: 'View Parent Portal' },
  class_teacher_portal: { to: '/dashboard/portals/teacher', label: 'View Teacher Portal' },
  department_portals: { to: '/dashboard/portals/department', label: 'Manage Department Portals' },
  placement_portal: { to: '/dashboard/portals/placements', label: 'Manage Placements' },
  alumni_network: { to: '/dashboard/portals/alumni', label: 'Manage Alumni Network' },

  // Apps & Logins
  teacher_app: { to: '/dashboard/apps/teacher', label: 'Get Teacher App' },
  teacher_mobile_app: { to: '/dashboard/apps/teacher', label: 'Get Teacher App' },
  faculty_mobile_app: { to: '/dashboard/apps/faculty', label: 'Get Faculty App' },
  student_app: { to: '/dashboard/apps/student', label: 'Get Student App' },
  '2_receptionist_logins': { to: '/dashboard/staff/receptionists', label: 'Manage Logins' },
  '4_receptionist_logins': { to: '/dashboard/staff/receptionists', label: 'Manage Logins' },
  '6_receptionist_logins': { to: '/dashboard/staff/receptionists', label: 'Manage Logins' },

  // Reporting & Analytics
  basic_reports: { to: '/dashboard/reports/basic', label: 'View Reports' },
  admin_dashboard: { to: '/dashboard/reports/analytics', label: 'View Analytics' },

  // Meta-Features (usually don't need a button, but can have one)
  all_silver_features: { to: '/pricing', label: 'View Plan Details' },
  all_gold_features: { to: '/pricing', label: 'View Plan Details' },
  all_premium_features: { to: '/pricing', label: 'View Plan Details' },
};


const FeatureCard = ({ feature }) => {
  const linkInfo = featureLinks[feature.key];

  return (
    <div className="card bg-base-200 shadow-xl transition-transform duration-300 hover:scale-105">
      <div className="card-body">
        <h2 className="card-title text-lg font-bold">{feature.title}</h2>
        <p className="text-sm text-base-content/80">{feature.description}</p>
        <div className="card-actions justify-end mt-4">
          {linkInfo ? (
            <Link to={linkInfo.to} className="btn btn-primary btn-sm">
              {linkInfo.label}
            </Link>
          ) : (
            <button className="btn btn-disabled btn-sm">Not Available</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
