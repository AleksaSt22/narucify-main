import { Link  } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft, ShoppingBag, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <p className="text-[140px] md:text-[180px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-800 to-zinc-900 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-orange-500/20 animate-bounce">
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Stranica nije pronađena
        </h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Izgleda da ova stranica ne postoji ili je premeštena. Proveri URL ili se vrati na početnu.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white px-6 h-12 rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-300">
              <Home className="w-4 h-4 mr-2" />
              Početna stranica
            </Button>
          </Link>
          <button onClick={() => window.history.back()}>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/[0.06] px-6 h-12 rounded-xl transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nazad
            </Button>
          </button>
        </div>
      </div>
    </div>
  );
}
