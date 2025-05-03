// This file contains the API endpoints for the application.
const apiList = {
  //Auth Routes
  login: `${process.env.NEXT_PUBLIC_BASE_URL}admin/login`,
  signup: `${process.env.NEXT_PUBLIC_BASE_URL}auth/userreg`,
  verifyOTP: `${process.env.NEXT_PUBLIC_BASE_URL}auth/verify-otp`,
  resendOTP: `${process.env.NEXT_PUBLIC_BASE_URL}auth/resend-otp`,
  forgetPassword: `${process.env.NEXT_PUBLIC_BASE_URL}auth/forget-password`,

  // List Item Routes

  readBusinessStage: `${process.env.NEXT_PUBLIC_BASE_URL}api/business-stages`,
  readIndustry: `${process.env.NEXT_PUBLIC_BASE_URL}api/industries`,
  readBusinessTypes: `${process.env.NEXT_PUBLIC_BASE_URL}api/business-types`,

  // Company Routes
  company: `${process.env.NEXT_PUBLIC_BASE_URL}admin/company`,
  createCompany: `${process.env.NEXT_PUBLIC_BASE_URL}admin/company/pat/create/`,
  findCompanyById: `${process.env.NEXT_PUBLIC_BASE_URL}admin/company/pat/find/`,
  findCompany: `${process.env.NEXT_PUBLIC_BASE_URL}admin/company/find/`,
  companySearch: `${process.env.NEXT_PUBLIC_BASE_URL}admin/company/search?query=`,
  companyLogo: `${process.env.NEXT_PUBLIC_BASE_URL}upload/image/upload-logo/`,

  // Onboarding Questions Routes
  onboardingQ: `${process.env.NEXT_PUBLIC_BASE_URL}api/onboarding-questions`,
  onboardingA: `/onboarding-answers`,
  onboardUser: `${process.env.NEXT_PUBLIC_BASE_URL}api/onboarding-questions/user/onboard/`,

  // Plan Routes
  plans: `${process.env.NEXT_PUBLIC_BASE_URL}api/plans`,

  // User Routes
  findUser: `${process.env.NEXT_PUBLIC_BASE_URL}admin/users/find/`,
  singleUser: `${process.env.NEXT_PUBLIC_BASE_URL}admin/users/`,

  // Profile Routes
  updateProfile: `/update-profile`,
  onboardingAnswers: `${process.env.NEXT_PUBLIC_BASE_URL}admin/users/onboarding-answers/`,
  onboardingQuestions: `${process.env.NEXT_PUBLIC_BASE_URL}api/onboarding-questions`,
  updateOnboardingAnswer: `${process.env.NEXT_PUBLIC_BASE_URL}admin/users/onboarding-answers`,

  // External Routes

  ipify: `${process.env.NEXT_PUBLIC_IPIFY_URL}`,
  calendly: `${process.env.NEXT_PUBLIC_CALENDLY_URL}`,

  // Assessment Routes
  questionnaire: `${process.env.NEXT_PUBLIC_BASE_URL}api/questionnaire/pat/67cef37ebe59db58ec0de026`,
  createAssessment: `${process.env.NEXT_PUBLIC_BASE_URL}api/assessment/`,
  getAssessment: `${process.env.NEXT_PUBLIC_BASE_URL}api/assessment/user/`,
  // getAllAssessmentForUser: `${process.env.NEXT_PUBLIC_BASE_URL}api/assessment/userc/`,
  updateAssessment: `${process.env.NEXT_PUBLIC_BASE_URL}api/assessment/update/`,
  fetchSingleAssessment: `${process.env.NEXT_PUBLIC_BASE_URL}api/assessment/`,
  getAllAssessmentForUser: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/assessment/`,

  // Support & Ticket Routes
  createTicket: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/tickets/create`,
  getAllTickets: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/tickets/my-tickets`,
  getSingleTicket: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/tickets/`,
  addComment: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/tickets/comment`,

  //Special Routes
  getUserDetails: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/user`,
  getCompanyDetails: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/company`,
  addUser: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/userManagement/user/add`,
  getUserList: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/userManagement/users`,
  updateUserRole: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/userManagement/user/`, // + userId + '/role', // PUT request with role in body to update user role by Company admin
  deleteUser: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/userManagement/user/`, // + userId, // DELETE request to delete user by Company admin
  updateUsersRole: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/userManagement/user/`, // + userId + '/role', // PUT request with role in body to update user role by Company admin
  generatePdf: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/userManagement/generate-pdf`, // + assessmentId, // GET request to generate PDF for a specific assessment
  createChat: `${process.env.NEXT_PUBLIC_BASE_URL}api/chatroute`,
  getsingleChat: `${process.env.NEXT_PUBLIC_BASE_URL}api/chatroute`,
  deleteSingleChat: `${process.env.NEXT_PUBLIC_BASE_URL}api/chatroute`,
  //Feedback Routes
  getFeedback: function (feedbackFormId) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/feedbackSubmission/${feedbackFormId}`;
  },

  // Post feedback remains a static URL:
  postFeedback: `${process.env.NEXT_PUBLIC_BASE_URL}api/pat/feedbackSubmission/create`,

  // Standard Reports Endpoints
  createReport: `${process.env.NEXT_PUBLIC_BASE_URL}api/standard-reports/`,
  getReports: `${process.env.NEXT_PUBLIC_BASE_URL}api/standard-reports/`,

  getReport: `${process.env.NEXT_PUBLIC_BASE_URL}api/standard-reports/`, // Append report id
  updateReport: `${process.env.NEXT_PUBLIC_BASE_URL}api/standard-reports/`, // Append report id
  deleteReport: `${process.env.NEXT_PUBLIC_BASE_URL}api/standard-reports/`, // Append report id

  // PlanBuy Routes for Users
  planBuyUser: `${process.env.NEXT_PUBLIC_BASE_URL}api/purchase/plan/buy`, // User's plan buying route

  // PlanBuy Routes for Admin
  planBuyAdmin: `${process.env.NEXT_PUBLIC_BASE_URL}admin/purchase/plan`, // Admin's plan buying route
};

export default apiList;
