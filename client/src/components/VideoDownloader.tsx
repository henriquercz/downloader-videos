import React, { useState } from 'react';
import api from '../services/api';
import type { VideoMetadata, VideoFormat } from '../types';

const VideoDownloader: React.FC = () => {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'detecting' | 'ready' | 'downloading' | 'success' | 'error'>('idle');
    const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedFormat, setSelectedFormat] = useState<string>('');

    const handleDetect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setStatus('detecting');
        setErrorMsg('');
        setMetadata(null);

        try {
            const response = await api.post('/detect', { url });
            setMetadata(response.data.data);
            setStatus('ready');
            // Seleciona o melhor formato por padrão (geralmente o último ou primeiro da lista filtrada)
            if (response.data.data.formats?.length > 0) {
                setSelectedFormat(response.data.data.formats[0].format_id);
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.response?.data?.message || 'Falha ao detectar vídeo. Verifique o link.');
        }
    };

    const handleDownload = async () => {
        if (!metadata || !selectedFormat) return;

        setStatus('downloading');

        try {
            const response = await api.post('/download', {
                url,
                formatId: selectedFormat
            });

            if (response.data.success) {
                setStatus('success');
                // Iniciar download do arquivo físico
                // Construindo a URL completa caso o backend retorne caminho relativo
                const downloadUrl = response.data.downloadUrl.startsWith('http')
                    ? response.data.downloadUrl
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${response.data.downloadUrl}`;

                window.location.href = downloadUrl;
            }
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.response?.data?.message || 'Erro ao processar download.');
        }
    };

    return (
        <div className="w-full max-w-2xl flex flex-col gap-8">

            {/* Hero Section */}
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                    Baixe vídeos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">sem limites</span>
                </h2>
                <p className="text-slate-400 text-lg">
                    Cole o link do YouTube, Instagram, TikTok ou Twitter abaixo.
                </p>
            </div>

            {/* Input Area */}
            <form onSubmit={handleDetect} className="relative w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative flex items-center bg-slate-900 rounded-lg p-2">
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder-slate-500"
                        placeholder="Cole o link do vídeo aqui..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={status === 'detecting' || status === 'downloading'}
                    />
                    <button
                        type="submit"
                        disabled={status === 'detecting' || !url}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {status === 'detecting' ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processando
                            </>
                        ) : 'Detectar'}
                    </button>
                </div>
            </form>

            {/* Error Message */}
            {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Video Card Result */}
            {metadata && (
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-2xl animate-fade-in-up">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Thumbnail */}
                        <div className="w-full md:w-1/3 aspect-video bg-black rounded-lg overflow-hidden shadow-lg relative group">
                            <img
                                src={metadata.thumbnail}
                                alt={metadata.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                {metadata.platform.toUpperCase()}
                            </div>
                        </div>

                        {/* Info & Actions */}
                        <div className="flex-1 flex flex-col justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-white line-clamp-2" title={metadata.title}>
                                    {metadata.title}
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Duração: {metadata.duration ? `${Math.floor(metadata.duration / 60)}:${(metadata.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-300">Formato / Qualidade</label>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedFormat}
                                        onChange={(e) => setSelectedFormat(e.target.value)}
                                        className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                                    >
                                        {metadata.formats.map((fmt) => (
                                            <option key={fmt.format_id} value={fmt.format_id}>
                                                MP4 - {fmt.resolution} {fmt.filesize ? `(${(fmt.filesize / 1024 / 1024).toFixed(1)} MB)` : ''}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleDownload}
                                        disabled={status === 'downloading'}
                                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                                    >
                                        {status === 'downloading' ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Baixar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Features Grid (SEO filler) */}
            {!metadata && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                        <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center mb-4 text-2xl">
                            ⚡
                        </div>
                        <h3 className="font-bold text-white mb-2">Ultra Rápido</h3>
                        <p className="text-slate-400 text-sm">Processamento instantâneo para entregar seu vídeo em segundos.</p>
                    </div>
                    <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4 text-2xl">
                            🛡️
                        </div>
                        <h3 className="font-bold text-white mb-2">Seguro</h3>
                        <p className="text-slate-400 text-sm">Nenhum dado é armazenado. Seus downloads são privados e seguros.</p>
                    </div>
                    <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                        <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center mb-4 text-2xl">
                            💎
                        </div>
                        <h3 className="font-bold text-white mb-2">Alta Qualidade</h3>
                        <p className="text-slate-400 text-sm">Suporte para 4K, HD e os melhores formatos disponíveis.</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VideoDownloader;
