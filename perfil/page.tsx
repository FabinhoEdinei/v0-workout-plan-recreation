import { User, History, Settings, Target } from 'lucide-react';
import Link from 'next/link';

// ... dentro do seu componente

<div className="flex gap-4 justify-center p-4">
  <Link href="/perfil" className="hover:text-blue-400 flex flex-col items-center">
    <User size={24} />
    <span className="text-xs">Perfil</span>
  </Link>
  
  <Link href="/historico" className="hover:text-blue-400 flex flex-col items-center">
    <History size={24} />
    <span className="text-xs">Histórico</span>
  </Link>

  <Link href="/metas" className="hover:text-blue-400 flex flex-col items-center">
    <Target size={24} />
    <span className="text-xs">Metas</span>
  </Link>

  <Link href="/config" className="hover:text-blue-400 flex flex-col items-center">
    <Settings size={24} />
    <span className="text-xs">Ajustes</span>
  </Link>
</div>
