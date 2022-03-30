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
import HashingError from '../errors/HashingError';
import { HashingAlgorithm } from '../util/Constants';

export default class Hashing {

    static hash (algorithm: HashingAlgorithm, data: string): string {
        if (typeof data !== 'string') {
            throw new HashingError('data must be a string');
        }

        let run = Hashing.toCryptoJS(algorithm);
        return run(data).toString();
    }

    static signHash (algorithm: HashingAlgorithm, data: string, password: string): string {
        if (typeof data !== 'string') {
            throw new HashingError('data must be a string');
        }
        if (typeof password !== 'string') {
            throw new HashingError('password must be a string');
        }

        let run = Hashing.toCryptoJS(algorithm);
        return run(`${data}|${password}`).toString();
    }

    private static toCryptoJS (algorithm: HashingAlgorithm): Function {
        switch (algorithm) {
            case 'SHA256': {
                return CryptoJS.SHA256;
            }
            case 'SHA384': {
                return CryptoJS.SHA384;
            }
            case 'SHA512': {
                return CryptoJS.SHA512;
            }
            case 'SHA3-256': {
                return Hashing.cryptoJS3_256;
            }
            case 'SHA3-384': {
                return Hashing.cryptoJS3_384;
            }
            case 'SHA3-512': {
                return Hashing.cryptoJS3_512;
            }
            default: {
                throw new HashingError('unsupported hashing algorithm');
            }
        }
    }

    private static cryptoJS3_256 (data: string) {
        return CryptoJS.SHA3(data, { outputLength: 256 });
    }

    private static cryptoJS3_384 (data: string) {
        return CryptoJS.SHA3(data, { outputLength: 384 });
    }

    private static cryptoJS3_512 (data: string) {
        return CryptoJS.SHA3(data, { outputLength: 512 });
    }

}
