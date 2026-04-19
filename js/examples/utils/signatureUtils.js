const crypto = require('node:crypto');

const secret = "your-secret-key";

/**
 *
 * @param {Uint8Array} buffer
 */
function sign(buffer) {
    return /** @type {Uint8Array} */ crypto.createHmac('sha256', secret)
        .update(buffer)
        .digest()
}

/**
 *
 * @param {Uint8Array} buffer
 * @param {Uint8Array} expectedSignature
 */
function assertSigned(buffer, expectedSignature) {
    const signature = sign(buffer);

    if (signature.length !== expectedSignature.length)
        throw new Error('Invalid signature length')

    if (!crypto.timingSafeEqual(signature, expectedSignature))
        throw new Error('Invalid signature')
}

module.exports = { sign, assertSigned }