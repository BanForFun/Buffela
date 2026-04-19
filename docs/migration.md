# Buffela migration guide

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

### JS tools

- `buffela-to-types` was replaced by `buffela-js`, dropping JSON input support
- `buffela-to-json` was replaced by `buffela-js`, dropping JSON input support
- It is no longer recommended to parse the buffela schemata directly from YAML. Instead, you should use `buffela-js`  which converts your schemata into both JSON and type definitions, and then import the generated JSON file

### JavaScript/TypeScript

- `parseBuffelaSchema()` was renamed to `parseSchema()`
- `serializeCalf()` and `deserializeCalf()` were removed. Instead you must call `registerSerializer(schema, {})` and `registerDeserializer(schema, {})` directly after parsing the schema. Then you can use `schema.ROOT_TYPE.serialize()` and `schema.ROOT_TYPE.deserialize()`
- Type fields are now automatically generated with the name `X_type` (e.g. `User_type`.)

### Kotlin tools

- `buffela-kotlin generate` is now `buffela-kotlin compile` , dropping JSON input support

### Kotlin

- Uninstall `org.jetbrains.kotlinx:kotlinx-io-core` and `gr.elaevents.buffela.schema:utils`. Replace them with `gr.elaevents.buffela:serialization` and `gr.elaevents.buffela:deserialization`



## Version 2

This was the first publicly available version
