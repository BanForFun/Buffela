# Migration guide

## Version 5

### Buffela Schema

- `Unsigned` type was merged with `UInt` e.g. `Unsigned(10)` is now `UInt(10)`
- `Signed` type was merged with `Int` e.g. `Signed(10)` is now `Int(10)`
- Custom primitives now need to be declared using the syntax `PRIMITIVE: Primitive()`

### Javascript Tooling

- The default command was renamed to `convert`
- Changed the output behavior
- Replaced `--json` option with `--jsonDir`
- Replaced `--types` option with `--typeDefDir`

See the new [tooling guide](./tooling.md) for more details

### Kotlin Tooling

- Changed the output behavior
- Replaced `--package` option with `--packageRoot`

See the new [tooling guide](./tooling.md) for more details

### Javascript

- The `instanceOf()` method of object types was renamed to `isInstance()` and you can now use it on the root abstract type too

### Typescript/JSDoc

- Changed the way custom primitive types are declared. See the 'Custom Primitives' section of the readme for more details

### SerializerBuffer

- `writeString()` no longer accepts a second parameter to make the string null terminated. You can achieve the same effect by calling `writeByte(0)` right after
- `clearBitBuffer()` renamed to `alignToByte()`

### DeserializerBuffer

- `clearBitBuffer()` renamed to `alignToByte()`



## Version 4

### JavaScript/TypeScript

- `SCHEMA.serialize()` now returns a `Uint8Array` instead of a `Buffer`
- `SerializeBuffer.toBytes()` now returns a `Uint8Array` instead of a `Buffer`
- `SerializeBuffer.writeBytes()` now takes a `Uint8Array` instead of a `Buffer`
- `SCHEMA.deserialize()` now takes a `Uint8Array` instead of a `Buffer`
- `DeserializerBuffer()` constructor now takes a `Uint8Array` instead of a `Buffer`
- `DeserializerBuffer.readBytes()` now returns a `Uint8Array` instead of a `Buffer`
- Instead of having a `X_type` property for each level of a nested subtype hierarchy, you now only need to provide one `_type` property with the leaf type
- To check if an object is a subtype of a nested type, instead of checking each level one by one, you can now use the new `NESTED_TYPE.instanceOf(value)` function



## Version 3

### JSON Schema

- The JSON Schema was moved from `node_modules/@buffela/parser/schemas/buffela.json` to `node_modules/@buffela/tools-common/schemata/buffela-schema.json`

### Buffela Schema

- Constant fields are no longer allowed. For versioning refer to the 'Root type concatenation' section of the README
- Buffer was renamed to Bytes
- Type fields are no longer allowed. They are now automatically generated

### JS Tooling

- `buffela-to-types` was replaced by `buffela-js`, dropping JSON input support
- `buffela-to-json` was replaced by `buffela-js`, dropping JSON input support
- It is no longer recommended to parse the buffela schemata directly from YAML. Instead, you should use `buffela-js`  which converts your schemata into both JSON and type definitions, and then import the generated JSON file

### JavaScript/TypeScript

- `parseBuffelaSchema()` was renamed to `parseSchema()`
- `serializeCalf()` and `deserializeCalf()` were removed. Instead you must call `registerSerializer(schema, {})` and `registerDeserializer(schema, {})` directly after parsing the schema. Then you can use `schema.ROOT_TYPE.serialize()` and `schema.ROOT_TYPE.deserialize()`
- Type fields are now automatically generated with the name `X_type` (e.g. `User_type`.)

### Kotlin Tooling

- `buffela-kotlin generate` is now `buffela-kotlin compile` , dropping JSON input support

### Kotlin

- Uninstall `org.jetbrains.kotlinx:kotlinx-io-core` and `gr.elaevents.buffela.schema:utils`. Replace them with `gr.elaevents.buffela:serialization` and `gr.elaevents.buffela:deserialization`



## Version 2

This was the first publicly available version
