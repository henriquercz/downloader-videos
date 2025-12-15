import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
            {/* Header */}
            <header className="w-full py-6 px-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Universal Downloader
                        </h1>
                    </div>
                    <nav className="hidden md:flex gap-4 text-sm font-medium text-slate-400">
                        <a href="#" className="hover:text-indigo-400 transition-colors">Como funciona</a>
                        <a href="#" className="hover:text-indigo-400 transition-colors">Formatos</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
                {children}
            </main>

            {/* Footer */}
            <footer className="w-full py-8 border-t border-slate-800 mt-auto bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} Universal Video Downloader. Projeto Educacional.</p>
                    <p className="mt-2 text-xs">Suporta YouTube, TikTok, Instagram e mais. Uso pessoal apenas.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
