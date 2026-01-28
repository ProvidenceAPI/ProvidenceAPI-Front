export interface Testimonial {
  id: string;
  comment: string;
  profession?: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    lastname?: string;
  };
}

export interface TestimonialResponse {
  testimonials: Testimonial[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EligibilityResponse {
  canCreateTestimonial: boolean;
  completedActivities: number;
  hasExistingTestimonial: boolean;
}
