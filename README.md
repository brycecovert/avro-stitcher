avro-stitch
===========



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/avro-stitch.svg)](https://npmjs.org/package/avro-stitch)
[![Downloads/week](https://img.shields.io/npm/dw/avro-stitch.svg)](https://npmjs.org/package/avro-stitch)
[![License](https://img.shields.io/npm/l/avro-stitch.svg)](https://github.com/brycecovert/avro-stitcher/blob/master/package.json)



Avro supports the abilities to reference other schemas, but confluent's schema registry doesn't allow you to reference one schema from another. To better support this use case,
this tool will take a directory of `.avsc` files, each with a single record type in them, and a root entity, and will output one `.avsc` with everything in it. Avro has specific
rules about defining a record type before using it, and this tool will ensure that those rules are respected.
<!-- toc -->

# Usage

Imagine the following:

a.avsc:
```
{
    "name": "A",
    "type": "record",
    "fields": [
        {
            "name": "b",
            "type": "B"
        }
    ]
}
```

b.avsc
```
{
    "name": "B",
    "type": "record",
    "fields": [
        {
            "name": "a",
            "type": "A"
        }
    ]
}
```

If you ran avro-stitch this way:
```
$ avro-stitch -d ~/dev/schemas -r A -o target.avsc
```

You'd get this output:

target.avsc
```
{
    "name": "A",
    "type": "record",
    "fields": [
        {
            "name": "b",
            "type": {
              "name": "B",
              "type": "record",
              "fields": [
                  {
                      "name": "a",
                      "type": "A"
                  }
              ]
          }
        }
    ]
}
```

`target.avsc` should be usable in confluent's schema registry.

# Commands
