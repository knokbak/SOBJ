[![Huntr](https://cdn.huntr.dev/huntr_security_badge_mono.svg)](https://huntr.dev)


## Signed OBJects
Signed Objects (or "SOBJ") are a way to store data in untrusted environments whilst still being able to verify the data was signed by the correct source. You can even encrypt the data after signing it to ensure it doesn't get into the wrong hands.

*SOBJ is similar to JSON Web Tokens, but does not follow the RFC 7519 standard.*

### Installation
```
$ npm install sobj
```
```js
const SOBJ = require('sobj');
// or 
import SOBJ from 'sobj';
```

### Usage
**Creating a Signed Object** is easy. You can either use the `sign` or `signSync` functions. The `sign` function returns a Promise, so you can use it in a `then` block.

> ⚠️ This does not encrypt the data, so if you're sending it to a non-trusted client, you could leak private data. Look below for the functions that encrypt the data as well as signing it.

```js
SOBJ.sign({
    foo: 'bar',
    fizz: 'buzz',
}, {
    algorithm: 'SHA3-384',
    key: 'some_very_special_secret',
    maxAge: 60 * 60 * 24 * 30, // 30 days
}).then(signed => {
    // Sc1~eyJ0IjoiU09CSiIsInYiOiIxLjAuMCIsImEiOiJTSEEzLTM4NCJ9~eyJkIjp7ImZvbyI6ImJhciIsImZpenoiOiJidXp6In0sInQiOjE2NDg2NzUzMDcsImVhIjoyNTkyMDAwfQ==~096da80aaa0a7fb90ea87ddf0fb4fee7fedf11f34acb2a8a3e213703d317defe9abde52022fbd03b71254df3de67f6fe
    console.log(signed);
}).catch(err => {
    // something went horribly wrong
    console.error(err);
})
```

**Creating and encrypting a Signed Object** can be done using the `sign` and `signSync` functions like before with only a couple of new option variables.

```js
SOBJ.sign({
    foo: 'bar',
    fizz: 'buzz',
}, {
    algorithm: 'SHA3-384',
    encryption: 'AES',
    key: 'some_very_special_secret',
    encryptionKey: 'another_very_special_secret',
    maxAge: 60 * 60 * 24 * 30, // 30 days
}).then(encrypted => {
    // Sc1E~eyJ0IjoiU09CSiIsInYiOiIxLjAuMCIsImEiOiJTSEEzLTM4NCIsImUiOiJBRVMifQ==~U2FsdGVkX19CboKdrdRq6Sr5CaBCn8E6i9xz+Qvs1j8Q64MyAlth8SF85YDzaUqxkp5BD1neCbZ4Yll+LCm1hqR/hwy9khtkoVceL8PC73AeenNN7aVeo9XGChgar8cWTnpdN148gSVWP6RbmPo4L3Txccssd+T844nAA7Rl0cWcMPyTZOI63HXn0nqFqGBAOkZ+knQuByBah8zo7g48dpB3tksQ28QthQi9awv65ARtOxcn/qYwZ8ASWSvHSeQasvpkS2lrh8kJZ5qqUPmA/Q==
    console.log(encrypted);
}).catch(err => {
    // something went horribly wrong
    console.error(err);
});
```

**Verifying a Signed Object** is as easy as creating a Signed Object. Just use the `verify` and `verifySync` functions.

> ⚠️ The `verify` and `verifySync` functions throw an error if verification fails.

```js
SOBJ.verify(obj, {
    key: 'some_very_special_secret',
}).then(verified => {
    // the object was verified
    console.log(verified);
}).catch(err => {
    // the object was probably invalid or corrupted
    console.error(err);
});
```

... and **unencrypting and then verifying a Signed Object** is easy too!

```js
SOBJ.verify(obj, {
    key: 'some_very_special_secret',
    encryptionKey: 'another_very_special_secret',
}).then(verified => {
    // the object was unencrypted and verified
    console.log(verified);
}).catch(err => {
    // the object was probably invalid or corrupted
    console.error(err);
});
```

### API documentation

#### SOBJ.sign(object, options)
Sign an object. Returns `Promise<string>`.

> ⚠️ You may only provide one of `options.maxAge` or `options.expiresAt`. If you provide both, an error will be thrown.

- `object`: Required. The object to sign.
- `options.algorithm` (`HashingAlgorithm`): Required. The algorithm to use.
- `options.encryption` (`EncryptionAlgorithm`): Optional. The algorithm to use for encryption. If not provided, no encryption will be used and the object will only be signed.
- `options.key` (`string`): Required. The key to use.
- `options.encryptionKey` (`string`): Optional. The key to use for encryption. Required if `options.encryption` is provided.
- `options.maxAge` (`number`): Optional. The maximum age of the signed object. The number is treated as seconds.
- `options.expiresAt` (`number` | `Date`): Optional. The date when the signed object expires. The number is treated as seconds since the epoch. If a Date object is passed, we'll handle the rest.
- `options.notBefore` (`number` | `Date`): Optional. The date when the signed object begins to be valid. The number is treated as seconds since the epoch. If a Date object is passed, we'll handle the rest.
- `options.subject` (`string`): Optional. A unique ID that relates to the receiver or subject of the object.
- `options.issuer` (`string`): Optional. A unique ID that relates to the sender or issuer of the object.

#### SOBJ.signSync(object, options)
Sign an object. Returns `string`.

> ⚠️ You may only provide one of `options.maxAge` or `options.expiresAt`. If you provide both, an error will be thrown.

- `object`: Required. The object to sign.
- `options.algorithm` (`HashingAlgorithm`): Required. The algorithm to use.
- `options.encryption` (`EncryptionAlgorithm`): Optional. The algorithm to use for encryption. If not provided, no encryption will be used and the object will only be signed.
- `options.key` (`string`): Required. The key to use.
- `options.encryptionKey` (`string`): Optional. The key to use for encryption. Required if `options.encryption` is provided.
- `options.maxAge` (`number`): Optional. The maximum age of the signed object. The number is treated as seconds.
- `options.expiresAt` (`number` | `Date`): Optional. The date when the signed object expires. The number is treated as seconds since the epoch. If a Date object is passed, we'll handle the rest.
- `options.notBefore` (`number` | `Date`): Optional. The date when the signed object begins to be valid. The number is treated as seconds since the epoch. If a Date object is passed, we'll handle the rest.
- `options.subject` (`string`): Optional. A unique ID that relates to the receiver or subject of the object.
- `options.issuer` (`string`): Optional. A unique ID that relates to the sender or issuer of the object.

#### SOBJ.verify(token, options)
Verify an object. Returns `Promise<any>`.

- `token`: Required. The token to verify.
- `options.key` (`string`): Required. The key to use.
- `options.encryptionKey` (`string`): Required. The key to use for decryption.
- `options.subject` (`string`): Optional. A unique ID that relates to the receiver or subject of the object.
- `options.issuer` (`string`): Optional. A unique ID that relates to the sender or issuer of the object.
- `options.allowedAlgorithms` (`HashingAlgorithm[]`): Optional. The algorithms that are allowed to be used. If not provided, all algorithms are allowed.
- `options.allowedEncryptionAlgorithms` (`EncryptionAlgorithm[]`): Optional. The encryption algorithms that are allowed. If not provided, all encryption algorithms are allowed.

#### SOBJ.verifySync(token, options)
Verify an object. Returns `any`.

- `token`: Required. The token to verify.
- `options.key` (`string`): Required. The key to use.
- `options.encryptionKey` (`string`): Required. The key to use for decryption.
- `options.subject` (`string`): Optional. A unique ID that relates to the receiver or subject of the object.
- `options.issuer` (`string`): Optional. A unique ID that relates to the sender or issuer of the object.
- `options.allowedAlgorithms` (`HashingAlgorithm[]`): Optional. The algorithms that are allowed to be used. If not provided, all algorithms are allowed.
- `options.allowedEncryptionAlgorithms` (`EncryptionAlgorithm[]`): Optional. The encryption algorithms that are allowed. If not provided, all encryption algorithms are allowed.
