
import React from 'react';
import Icon from './Icon';

interface UserImageViewProps {
  image: string;
  onClear: () => void;
}

const TRASH_ICON_PATH = "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z";

const UserImageView: React.FC<UserImageViewProps> = ({ image, onClear }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full aspect-square flex flex-col justify-center items-center relative">
      <img src={image} alt="Your selected photo" className="w-full h-full object-cover" />
      <button
        onClick={onClear}
        className="absolute top-4 right-4 p-2 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 transition-all"
        title="Change Photo"
      >
        <Icon path={TRASH_ICON_PATH} className="w-6 h-6" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-center text-sm font-semibold text-white drop-shadow-lg">Your Photo</p>
      </div>
    </div>
  );
};

export default UserImageView;
