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

import CryptoJS from 'crypto-js';
import EncryptionError from '../errors/EncryptionError';
import { EncryptionAlgorithm } from '../util/Constants';

export default class Encryption {

    static encrypt (data: string, key: string, algorithm: EncryptionAlgorithm): string {
        switch (algorithm) {
            case 'AES': {
                return CryptoJS.AES.encrypt(data, key).toString();
            }
            case 'TDES': {
                return CryptoJS.TripleDES.encrypt(data, key).toString();
            }
            case 'Rabbit': {
                return CryptoJS.Rabbit.encrypt(data, key).toString();
            }
            case 'RC4': {
                return CryptoJS.RC4.encrypt(data, key).toString();
            }
            default: {
                throw new EncryptionError('unsupported encryption algorithm; one of `AES`, `TDES`, `Rabbit`, `RC4` expected');
            }
        }
    }

    static decrypt (data: string, key: string, algorithm: EncryptionAlgorithm): string {
        switch (algorithm) {
            case 'AES': {
                return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
            }
            case 'TDES': {
                return CryptoJS.TripleDES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
            }
            case 'Rabbit': {
                return CryptoJS.Rabbit.decrypt(data, key).toString(CryptoJS.enc.Utf8);
            }
            case 'RC4': {
                return CryptoJS.RC4.decrypt(data, key).toString(CryptoJS.enc.Utf8);
            }
            default: {
                throw new EncryptionError('unsupported encryption algorithm; one of `AES`, `TDES`, `Rabbit`, `RC4` expected');
            }
        }
    }

}
