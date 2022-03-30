const SOBJ = require('./dist/index');
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
    console.log(encrypted);
}).catch(err => {
    // something went horribly wrong
    console.error(err);
});
