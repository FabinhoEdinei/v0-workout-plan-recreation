"use client";

import Link from "next/link"; // Importação importante

export default function Page() {
  return (
    <main>
      <nav>
        <ul>
          <li><Link href="/perfil">Perfil</Link></li>
          <li><Link href="/historico">Histórico</Link></li>
          <li><Link href="/metas">Metas</Link></li>
          <li><Link href="/ajustes">Ajustes</Link></li>
        </ul>
      </nav>
    </main>
  );
}
