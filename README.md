Sphere
=======

[![Gitter](https://img.shields.io/gitter/room/quickly/sphere.svg)](https://gitter.im/quickly/sphere)
[![ZenHub.io](https://img.shields.io/badge/supercharged%20by-zenhub.io-blue.svg)](https://zenhub.io)

[![GitHub release](https://img.shields.io/github/release/quickly/sphere.svg)](https://github.com/quickly/sphere/releases)
[![License](https://img.shields.io/badge/license-MPL%202.0-blue.svg)](LICENSE.md)
[![GitHub issues](https://img.shields.io/github/issues/quickly/sphere.svg)](https://github.com/quickly/sphere/issues)
[![Travis branch](https://img.shields.io/travis/quickly/sphere/master.svg)](https://travis-ci.org/quickly/sphere)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg)]()

Sphere is a nice database ORM for QtQuick's LocalStorage SQLite database.

### Installation

Coming soon to qpm!

### Examples

Define your models in ES6 using classes and decorators:

    export class SampleDocument extends Document {
        @field('string') title
        @field('string') body

        constructor(title, body) {
            super()
            this.title = title
            this.body = body
        }
    }

### Licensing

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
