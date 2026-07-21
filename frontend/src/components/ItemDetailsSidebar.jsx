import React from 'react';

const ItemDetailsSidebar = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <aside className="fixed top-0 right-0 h-full w-full md:w-[30%] bg-[#0e0a17] border-l border-white/10 p-6 flex flex-col gap-6 transform translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto z-40">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-xl font-bold">Item Details</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="bg-center bg-no-repeat aspect-video bg-cover rounded-xl" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAqPyvn8RZ7PlnhplberBH2SyDtbDkfZmKqrH1Ay3XcHSFibYZUzTurgqTyckz52aqrRF10mAp4ICBBb_bLUNa-qDnw_VrHMTP5TNyHlIombNLm51BC9m8y37JzFNYgD02bV7XkCporLmERrrUCrnixF8XFan9d4cUcyI4QlmX_keCwP6TmhymNxin2UQ13ucZCoiarOA3vZmhR0CcdBsXmpbRDxOJG4M7-t0gA9WxA6dRBhbjV5MUAMRXoVFO26YCsrPKj6Ker4sM")'}}></div>
      <div>
        <h4 className="text-white text-lg font-bold">Dell UltraSharp U2721DE</h4>
        <p className="text-white/60 text-sm">by Dell</p>
      </div>
      <p className="text-white/80 text-sm">This 27-inch QHD USB-C Hub Monitor allows you to see consistent color and vibrant details from a wide viewing angle. It serves as a productivity hub with RJ45 for Ethernet connectivity and USB-C providing up to 90W power delivery.</p>
      <div>
        <h5 className="text-white text-md font-semibold mb-2">Specifications</h5>
        <ul className="text-sm text-white/60 space-y-1">
          <li><span className="font-medium text-white/80">Resolution:</span> 2560 x 1440</li>
          <li><span className="font-medium text-white/80">Refresh Rate:</span> 60Hz</li>
          <li><span className="font-medium text-white/80">Panel Type:</span> IPS</li>
          <li><span className="font-medium text-white/80">Connectivity:</span> HDMI, DisplayPort, USB-C</li>
        </ul>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
          <span className="truncate">Buy on Amazon</span>
        </button>
        <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-white/5 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-colors">
          <span className="truncate">View on Manufacturer's Site</span>
        </button>
      </div>
    </aside>
  );
};

export default ItemDetailsSidebar;