# Refresh tokens module

Tokens are stored in two structures:

- Regular key-value: `refresh_token:{tokenHash}`:`{uid: userId, ua: userAgent}`
- Key-set: `user:{userId}:tokens`:`[tokenHash1, tokenHash2]`

This is made for quick check if token exists in memory for refresh tokens operation (system only knows refresh token), and for revoke purposes (system only knows userId)
