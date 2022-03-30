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

// This project's contributors stand with Ukraine:
//   - Project HOPE: https://bit.ly/3LhDk9D
//   - Run: npm i withukraine@1.0.1
require('withukraine');

import { sign, signSync, verify, verifySync } from './lib/Base';
import { HashingAlgorithm, EncryptionAlgorithm } from './util/Constants';

export {
    sign,
    signSync,
    verify,
    verifySync,
    HashingAlgorithm,
    EncryptionAlgorithm,
};
