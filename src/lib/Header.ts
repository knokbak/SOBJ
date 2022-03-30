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

import { EncryptionAlgorithm } from "../util/Constants";

const Package = require('../package.json');

export default class Header {

    static generate (options: {
        algorithm: string,
        encryption?: EncryptionAlgorithm,
    }): Object {
        options = options ?? {};
        if (!options.algorithm) {
            throw new Error('algorithm is required');
        }
        let head: any = {
            t: 'SOBJ',
            v: Package?.version ?? '1.0.0',
            a: options.algorithm,
        };
        if (options.encryption) {
            head.e = options.encryption;
        }
        return head;
    }

}
