'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getCookie(name: string): string | undefined {
  const match = document(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : undefined;
}

export default function PerfilPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getCookie('auth_token');
    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
>Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb4">Perfil</h1>
      <p className="text-gray-600 mb-6">Bem-vindo! Aqui você gerencia seu perfil.</p>
      <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
        <p><strong>Nome:</strong> Usuário Teste</p>
        <p><strong>Email:</strong> teste@example.com</p>
      </div>
    </div>
  );
}