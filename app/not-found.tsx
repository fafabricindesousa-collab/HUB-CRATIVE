import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#eff5ff] text-[#3478F6] flex items-center justify-center font-bold text-xl mb-4 border border-[#d6e5fd]">
        404
      </div>
      <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Página não encontrada</h2>
      <p className="text-sm text-[#737373] max-w-sm mb-6">
        O criativo ou recurso que você estava procurando não foi encontrado ou foi movido.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-full bg-[#3478F6] hover:bg-[#2c65cf] text-white text-xs font-semibold shadow-xs transition-colors"
      >
        Voltar para os Projetos
      </Link>
    </div>
  );
}
