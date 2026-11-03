export const getAverageRating = (id: string, ratingsAndReviews: Record<string, any>) => {
  const data = ratingsAndReviews[id];
  if (!data || !data.ratings || data.ratings.length === 0) return { avg: 0, count: 0 };
  const sum = data.ratings.reduce((a: number, b: number) => a + b, 0);
  return { avg: Math.round((sum / data.ratings.length) * 10) / 10, count: data.ratings.length };
};
