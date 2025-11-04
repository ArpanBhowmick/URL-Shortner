










import { IoIosLink } from "react-icons/io";
import { TiArrowRightOutline } from "react-icons/ti";


const Header = () => {

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 enter show">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-4">
        {/* Neon logo box */}
        <div className="relative w-16 h-16 neon-card flex items-center justify-center rounded-xl ">

          

          <IoIosLink className="absolute right-[39%] rotate-[-15deg] h-7 w-7 text-cyan-300 drop-shadow-[0_0_4px_#06b6d4]"/>
          <TiArrowRightOutline className="absolute right-[-1%] text-violet-400 h-7 w-7 opacity-90 drop-shadow-[0_0_4px_#3b82f6]" />

        </div>

        {/* Title + Subtitle */}
        <div>
          <h1 className="text-3xl font-extrabold neon-text">URL Shortener</h1>
          <p className="text-slate-400 text-sm">
            Futuristic URL shortener — Transforming long links into a seamless digital experience.
          </p>
        </div>
      </div>

      
    </header>
  );
};

export default Header;
