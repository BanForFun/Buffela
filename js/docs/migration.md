# Version 3 migration guide

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

### Javascript/Typescript

- `parseBuffelaSchema()` was renamed to `parseSchema()`
- `serializeCalf()` and `deserializeCalf()` were removed. Instead you must call `registerSerializer(schema, {})` and `registerDeserializer(schema, {})` directly after parsing the schema. Then you can use `schema.TYPE.serialize()` and `schema.TYPE.deserialize()`
- Type fields are now automatically generated with the name `OBJECT_type` (e.g. `User_type`.)

### Kotlin tools

- `buffela-kotlin generate` is now `buffela-kotlin compile` , dropping JSON input support

### Kotlin

- Uninstall `org.jetbrains.kotlinx:kotlinx-io-core` and `gr.elaevents.buffela.schema:utils`. Replace them with `gr.elaevents.buffela:serialization` and `gr.elaevents.buffela:deserialization`
