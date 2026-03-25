import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] py-6 px-4 md:px-8 mt-auto relative">
      <div className="absolute inset-0 border-t border-[#2a2a2a] w-[70%] mx-auto left-1/2 -translate-x-1/2 top-0"></div>
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="text-sm text-gray-400 mb-1">
          © 2026 CineRead. Dibuat dengan ❤️ oleh Stevino. Hak Cipta Dilindungi.
        </div>
        <div className="text-xs text-gray-500">
          Powered by TMDB, Google Books API & Vidbox Integration
        </div>
      </div>
    </footer>
  );
};

export default Footer;
