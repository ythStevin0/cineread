const StarRating = ({ rating }) => {
  if (!rating) return <span className="text-gray-500 text-sm">No rating</span>;
  return (
    <span className="flex items-center gap-1 text-gold text-sm font-semibold">
      ⭐ {rating}
    </span>
  );
};

export default StarRating;