import React from 'react';

const AddToCollectionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex h-full w-full items-center justify-center bg-black/60 p-4 z-50">
      <div className="relative flex w-full max-w-md flex-col rounded-xl bg-background-dark text-gray-300 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <h1 className="text-white tracking-tight text-2xl font-bold text-left pb-4">Add to Collection</h1>
          <div className="flex flex-col gap-2 py-4 border-y border-white/10">
            <div className="flex items-center gap-4 px-2 min-h-14 justify-between">
              <div className="flex items-center gap-4">
                <div className="text-white flex items-center justify-center rounded-lg bg-white/5 shrink-0 size-10">
                  <span className="material-symbols-outlined text-gray-400">bookmark</span>
                </div>
                <p className="text-white text-base font-normal leading-normal flex-1 truncate">Dream Desk Setup</p>
              </div>
              <div className="shrink-0">
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-black text-sm font-bold leading-normal transition-colors hover:bg-primary/80">
                  <span className="truncate">Add</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 px-2 min-h-14 justify-between">
              <div className="flex items-center gap-4">
                <div className="text-white flex items-center justify-center rounded-lg bg-white/5 shrink-0 size-10">
                  <span className="material-symbols-outlined text-gray-400">bookmark</span>
                </div>
                <p className="text-white text-base font-normal leading-normal flex-1 truncate">Audio Gear</p>
              </div>
              <div className="shrink-0">
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-white/10 text-white text-sm font-medium leading-normal transition-colors hover:bg-white/20">
                  <span className="truncate">Add</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 px-2 min-h-14 justify-between">
              <div className="flex items-center gap-4">
                <div className="text-white flex items-center justify-center rounded-lg bg-white/5 shrink-0 size-10">
                  <span className="material-symbols-outlined text-gray-400">bookmark</span>
                </div>
                <p className="text-white text-base font-normal leading-normal flex-1 truncate">Minimalist Inspiration</p>
              </div>
              <div className="shrink-0">
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-white/10 text-white text-sm font-medium leading-normal transition-colors hover:bg-white/20">
                  <span className="truncate">Add</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 pt-6">
            <label className="flex flex-col w-full">
              <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-[#2A2A2A] h-12 placeholder:text-gray-500 p-4 text-base font-normal leading-normal" placeholder="New collection name..." defaultValue=""/>
            </label>
            <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-primary text-black text-sm font-bold leading-normal transition-colors hover:bg-primary/80">
              <span className="truncate">Create & Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCollectionModal;