import { apiClient } from "./apiClient";
import {
  Testimonial,
  TestimonialResponse,
  EligibilityResponse,
} from "src/interfaces/Testimonial";

export const testimonialService = {
  getApprovedTestimonials: async (
    page: number = 1,
    limit: number = 6,
  ): Promise<TestimonialResponse> => {
    const { data } = await apiClient.get(
      `/api/testimonials/approved?page=${page}&limit=${limit}`,
    );
    return data;
  },

  checkEligibility: async (): Promise<EligibilityResponse> => {
    const { data } = await apiClient.get("/api/testimonials/check-eligibility");
    return data;
  },

  createTestimonial: async (testimonial: {
    comment: string;
    rating: number;
  }): Promise<Testimonial> => {
    const { data } = await apiClient.post("/api/testimonials", testimonial);
    return data;
  },
};
