// Setup simples de testes para funções utilitárias
// Agente A: Use estas Regexes no seu VideoController/Utils

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const INSTAGRAM_REGEX = /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/;
const TIKTOK_REGEX = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+$/;

describe('Utils - Platform Detection Regex', () => {

    test('Deve identificar URLs do YouTube', () => {
        expect(YOUTUBE_REGEX.test('https://www.youtube.com/watch?v=123')).toBe(true);
        expect(YOUTUBE_REGEX.test('https://youtu.be/123')).toBe(true);
        expect(YOUTUBE_REGEX.test('invalid-link')).toBe(false);
    });

    test('Deve identificar URLs do Instagram', () => {
        expect(INSTAGRAM_REGEX.test('https://instagram.com/reel/123')).toBe(true);
        expect(INSTAGRAM_REGEX.test('https://www.instagram.com/p/123')).toBe(true);
    });

    test('Deve identificar URLs do TikTok', () => {
        expect(TIKTOK_REGEX.test('https://www.tiktok.com/@user/video/123')).toBe(true);
        expect(TIKTOK_REGEX.test('https://vm.tiktok.com/123')).toBe(true);
    });
});
