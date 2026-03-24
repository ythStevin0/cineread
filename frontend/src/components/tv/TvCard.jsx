import StarRating from '../ui/StarRating';

const TvCard = ({ show, onClick }) => (
  <div
    className="flex-shrink-0 w-36 cursor-pointer group/card transition-colors duration-300"
    onClick={() => onClick(show)}
  >
    <div className="relative rounded-xl overflow-hidden bg-surface aspect-[2/3] border-2 border-transparent group-hover/card:border-accent transition-colors duration-300 shadow-lg group-hover/card:shadow-accent/40">
      {show.poster ? (
        <img
          src={show.poster}
          alt={show.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">📺</div>
      )}
      {/* TV badge */}
      <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
        TV
      </div>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
    </div>
    <div className="mt-2 px-1">
      <p className="text-xs text-white font-medium truncate">{show.title}</p>
      <div className="flex items-center justify-between mt-1">
        <StarRating rating={show.rating} />
        <span className="text-xs text-gray-500">{show.releaseYear}</span>
      </div>
    </div>
  </div>
);

export default TvCard;
