export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">404 - Página não encontrada</h2>
      <p className="mt-4">A página que você procura não existe.</p>
      <a href="/" className="mt-4 text-blue-500 hover:underline">
        Voltar para a página inicial
      </a>
    </div>
  )
}