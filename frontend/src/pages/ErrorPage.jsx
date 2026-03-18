import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, RefreshCw, ShoppingBag, AlertTriangle } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Error icon */}
        <div className="relative mb-8">
          <p className="text-[140px] md:text-[180px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-800 to-zinc-900 select-none">
            500
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/20">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Nešto je pošlo po zlu
        </h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Server trenutno nije dostupan. Moguće je da se upravo pokreće — probaj ponovo za par sekundi.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => window.location.reload()}>
            <Button className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white px-6 h-12 rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Probaj ponovo
            </Button>
          </button>
          <Link to="/">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/[0.06] px-6 h-12 rounded-xl transition-all duration-300">
              <Home className="w-4 h-4 mr-2" />
              Početna stranica
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
