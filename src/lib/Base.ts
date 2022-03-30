/*
 * 
 * Copyright (C) https://github.com/knokbak, 2022
 * 
 * https://github.com/knokbak/sobj
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 */

import VerificationError from '../errors/VerificationError';
import { HashingAlgorithm, EncryptionAlgorithm } from '../util/Constants';
import Encryption from './Encryption';
import Hashing from './Hashing';
import Header from './Header';

export function sign (data: any, options: {
    algorithm: HashingAlgorithm,
    encryption?: EncryptionAlgorithm,
    key: string,
    encryptionKey?: string,
    maxAge?: number,
    expiresAt?: Date | number,
    notBefore?: Date | number,
    subject?: string,
    issuer?: string,
}): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            let result = signSync(data, options);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

export function signSync (data: any, options: {
    algorithm: HashingAlgorithm,
    encryption?: EncryptionAlgorithm,
    key: string,
    encryptionKey?: string,
    maxAge?: number,
    expiresAt?: Date | number,
    notBefore?: Date | number,
    subject?: string,
    issuer?: string,
}): string {
    options = options || {};
    if (!options.key || typeof options.key !== 'string') {
        throw new TypeError('key must be a string');
    }
    if (options.encryption && (!options.encryptionKey || typeof options.encryptionKey !== 'string')) {
        throw new TypeError('encryptionKey must be a string if you want to use encryption');
    }
    if (options.maxAge && options.expiresAt) {
        throw new Error('maxAge and expiresAt cannot be set at the same time');
    }
    if (options.maxAge && typeof options.maxAge !== 'number') {
        throw new TypeError('maxAge must be a number (seconds)');
    }
    if (options.expiresAt && !((options.notBefore instanceof Date) || typeof options.notBefore === 'number')) {
        throw new TypeError('expiresAt must be a Date or number (seconds since epoch)');
    }
    if (options.notBefore && !((options.notBefore instanceof Date) || typeof options.notBefore === 'number')) {
        throw new TypeError('notBefore must be a Date or number (seconds since epoch)');
    }
    if (options.subject && typeof options.subject !== 'string') {
        throw new TypeError('subject must be a string');
    }
    if (options.issuer && typeof options.issuer !== 'string') {
        throw new TypeError('issuer must be a string');
    }

    let header = Buffer.from(
        JSON.stringify(
            Header.generate({
                algorithm: options.algorithm,
                encryption: options.encryption,
            })
        )
    ).toString('base64');

    let base: {
        // data: any, // the actual data
        d: any,
        // expiresAt: number, // seconds since epoch
        ea?: number,
        // notBefore: number, // seconds since epoch
        nb?: number,
        // subject: string, // the subject of the token
        s?: string,
        // issuer: string, // the issuer/signer of the token
        i?: string,
        // timestamp: number, // seconds since epoch
        t: number,
    } = {
        d: data,
        t: Math.floor(Date.now() / 1000),
    };

    if (options.maxAge) {
        if (typeof options.maxAge === 'number') {
            base.ea = options.maxAge;
        }
    }
    if (options.expiresAt) {
        base.ea = convertDate(options.expiresAt);
    }
    if (options.notBefore) {
        base.nb = convertDate(options.notBefore);
    }
    if (options.subject) {
        base.s = options.subject;
    }
    if (options.issuer) {
        base.i = options.issuer;
    }

    let body = JSON.stringify(base);
    let encoded = Buffer.from(body).toString('base64');
    let signature = Hashing.signHash(options.algorithm, body, options.key);

    if (options.encryption && typeof options.encryptionKey === 'string') {
        let encrypted = Encryption.encrypt(`${encoded}~${signature}`, options.encryptionKey, options.encryption);
        return `Sc1E~${header}~${encrypted}`;
    } else {
        return `Sc1~${header}~${encoded}~${signature}`;
    }
}

export function verify (data: string, options: {
    key: string,
    encryptionKey?: string,
    subject?: string,
    issuer?: string,
    allowedAlgorithms?: HashingAlgorithm[],
    allowedEncryptionAlgorithms?: EncryptionAlgorithm[],
}): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
            let result = verifySync(data, options);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

export function verifySync (data: string, options: {
    key: string,
    encryptionKey?: string,
    subject?: string,
    issuer?: string,
    allowedAlgorithms?: HashingAlgorithm[],
    allowedEncryptionAlgorithms?: EncryptionAlgorithm[],
}): any {
    options = options || {};
    if (!options.key || typeof options.key !== 'string') {
        throw new TypeError('key must be a string');
    }

    let parts = data.split('~');
    if (parts.length !== 3 && parts.length !== 4) {
        throw new VerificationError('invalid data format');
    }

    let supported = ['Sc1', 'Sc1E'];
    if (supported.indexOf(parts[0]) === -1) {
        throw new VerificationError('unsupported token type; only Sc1 and Sc1E are supported by this version of SOBJ');
    }

    let header: any;
    try {
        header = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (!header || !header.t || !header.v || !header.a) throw null;
        if (header.t !== 'SOBJ') throw null;
    } catch (e) {
        throw new VerificationError('token had an invalid or corrupted header');
    }

    if (options.allowedAlgorithms && options.allowedAlgorithms.indexOf(header.a) === -1) {
        throw new VerificationError('token uses an algorithm that is not allowed by `options.allowedAlgorithms`');
    }

    if (header.e) {
        if (!options.encryptionKey || typeof options.encryptionKey !== 'string') {
            throw new VerificationError('token is encrypted but no encryption key was provided');
        }
        if (options.allowedEncryptionAlgorithms && options.allowedEncryptionAlgorithms.indexOf(header.e) === -1) {
            throw new VerificationError('token uses an encryption algorithm that is not allowed by `options.allowedEncryptionAlgorithms`');
        }
        let decrypted = Encryption.decrypt(parts[2], options.encryptionKey, header.e);
        let decryptedParts = decrypted.split('~');
        if (decryptedParts.length !== 2) {
            throw new VerificationError('token had an invalid or corrupted unencrypted body');
        }
        let signature = decryptedParts[1];
        let unencoded = Buffer.from(decryptedParts[0], 'base64').toString('utf8');
        return verifyValidity(header, unencoded, signature, options).d;
    } else {
        let signature = parts[3];
        let unencoded = Buffer.from(parts[2], 'base64').toString('utf8');
        return verifyValidity(header, unencoded, signature, options).d;
    }
}

function verifyValidity (header: any, unencoded: string, signature: string, options: any): any {
    let verifySignature = Hashing.signHash(header.a, unencoded, options.key);
    if (signature !== verifySignature) {
        throw new VerificationError('the token\'s signature is invalid; the token\'s content may have been modified after it was signed');
    }
    let body = JSON.parse(unencoded);
    if (body.ea && body.ea < Math.floor(Date.now() / 1000)) {
        throw new VerificationError('the token has expired');
    }
    if (body.nb && body.nb > Math.floor(Date.now() / 1000)) {
        throw new VerificationError('the token is not yet valid');
    }
    if (options.subject && body.s !== options.subject) {
        throw new VerificationError('the token\'s subject does not match the expected subject');
    }
    if (options.issuer && body.i !== options.issuer) {
        throw new VerificationError('the token\'s issuer does not match the expected issuer');
    }
    return body;
}

function convertDate (date: Date | number): number {
    if (date instanceof Date) {
        return Math.floor((date.getTime() - Date.now()) / 1000);
    } else if (typeof date === 'number') {
        return date;
    }
    throw new TypeError('date must be a Date or number (seconds since epoch)');
}
