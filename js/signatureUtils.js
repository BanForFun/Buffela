const crypto = require('crypto');

const secret = "your-secret-key";

function sign(buffer) {
    return crypto.createHmac('sha256', secret)
        .update(buffer)
        .digest();
}

function verify(buffer, expectedSignature) {
    const signature = sign(buffer);

    if (signature.length !== expectedSignature.length)
        throw new Error('Invalid signature length')

    if (!crypto.timingSafeEqual(signature, expectedSignature))
        throw new Error('Invalid signature')
}

module.exports = { sign, verify }