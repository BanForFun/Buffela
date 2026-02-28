const crypto = require('node:crypto');

const secret = "your-secret-key";

/**
 *
 * @param {Buffer} buffer
 */
function sign(buffer) {
    return /** @type {Buffer} */ crypto.createHmac('sha256', secret)
        .update(buffer)
        .digest()
}

/**
 *
 * @param {Buffer} buffer
 * @param {Buffer} expectedSignature
 */
function assertSigned(buffer, expectedSignature) {
    const signature = sign(buffer);

    if (signature.length !== expectedSignature.length)
        throw new Error('Invalid signature length')

    if (!crypto.timingSafeEqual(signature, expectedSignature))
        throw new Error('Invalid signature')
}

module.exports = { sign, assertSigned }