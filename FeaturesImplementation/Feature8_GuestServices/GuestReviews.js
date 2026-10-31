// Feature 8: Guest Reviews & Post-Stay Feedback Module

/**
 * GuestReviews module manages post-stay ratings, feedback, and customer satisfaction metrics
 */

function addGuestReview(confirmationNumber, rating, comment = '') {
  if (!confirmationNumber) {
    return { success: false, message: 'Confirmation number is required' };
  }

  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return { success: false, message: 'Rating must be an integer between 1 and 5' };
  }

  const review = {
    id: 'REV_' + Date.now(),
    confirmationNumber,
    rating: parsedRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    message: 'Guest review submitted successfully',
    review
  };
}

function calculateAverageRating(reviews = []) {
  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }

  const total = reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0);
  const average = (total / reviews.length).toFixed(1);

  return {
    averageRating: parseFloat(average),
    totalReviews: reviews.length
  };
}

module.exports = {
  addGuestReview,
  calculateAverageRating
};
