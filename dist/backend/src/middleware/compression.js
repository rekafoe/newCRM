"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressionMiddleware = compressionMiddleware;
const zlib_1 = require("zlib");
function compressionMiddleware(req, res, next) {
    const originalSend = res.send;
    const acceptEncoding = req.headers['accept-encoding'] || '';
    // Проверяем, поддерживает ли клиент сжатие
    if (!acceptEncoding.includes('gzip') && !acceptEncoding.includes('deflate')) {
        return next();
    }
    // Определяем метод сжатия
    const useGzip = acceptEncoding.includes('gzip');
    const compressionMethod = useGzip ? zlib_1.gzip : zlib_1.deflate;
    // Устанавливаем заголовки
    res.setHeader('Content-Encoding', useGzip ? 'gzip' : 'deflate');
    res.setHeader('Vary', 'Accept-Encoding');
    // Переопределяем метод send для сжатия ответа
    res.send = function (data) {
        if (res.headersSent) {
            return originalSend.call(this, data);
        }
        // Сжимаем только JSON и текстовые данные
        if (typeof data === 'string' || Buffer.isBuffer(data)) {
            compressionMethod(data, (err, compressed) => {
                if (err) {
                    console.error('Ошибка сжатия:', err);
                    originalSend.call(this, data);
                }
                else {
                    res.setHeader('Content-Length', compressed.length);
                    originalSend.call(this, compressed);
                }
            });
            return res;
        }
        else {
            return originalSend.call(this, data);
        }
    };
    next();
}
