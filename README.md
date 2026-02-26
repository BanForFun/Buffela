# Buffela binary format

Buffela (pronounced bah-FEH-lah) is an extensible, schema-based binary format.

First, you write the schema in good old YAML:

``` yaml
Uuid: String(36)
Timestamp: Double

Gender:
  - FEMALE
  - MALE

User:
  userId: Uuid

  Anonymous: {}

  Registered:
    verified: Boolean

    Viewer:
      birthDate: String # We'll implement our own custom "Date" type further along
      countryCode: Unsigned(10)
      phone: String
      gender: Gender

    Organizer:
      roles: String[UByte]
      userId: String
      email: String

AuthTokenPayload:
  issuedAt: Timestamp
  user: User

AuthTokenSignature:
  hmac256: Bytes(32)
```

Then you can import it in your favorite programming language - as long as it is Javascript, Typescript or Kotlin  ;) - and write type safe serialization and deserialization code.

Buffela supports all the types you would expect (strings, booleans, numbers), along with enums, subtypes (similar to kotlin's sealed types) and arrays (in both constant and variable sized variants). You can also easily extend buffela with your own types!



## What's new in version 3

- Type aliases
- Custom types
- Field overriding
- Object concatenation
- New 'Signed' and 'Unsigned' types
- Improved enumeration, subtype and boolean space efficiency (using bit packing)
- Better developer tools with detailed error messages and highlighting
- Smaller bundle size
- [Breaking API changes](./docs/migration.md)



## Why not protobuf

Buffela does away with forward and backward compatible schemata, in favor of schema readability and size efficiency. For the example we'll be building in this guide, the output will end up being more than 30% smaller than the equivalent protobuf! To achieve this size efficiency, buffela gives you more control over the format. You can manually specify the byte length of numbers (byte, short, integer, long), or even the bit length if you're so inclined. The same goes for arrays, you can make them fixed size or specify the byte/bit length of the item count. Additionally, you don't have to worry about field numbers and type safety is built in.

See [the equivalent protobuf schema](./js/examples/protobuf/AuthToken.proto) for comparison and decide for yourself which one you would prefer writing.



## Compatible languages

We currently support Javascript/Typescript and Kotlin Multiplatform.

There are two ways to implement a (de)serializer:

1. Reflection

   Go through the schema and decide how to encode/decode each field at runtime. This can be slow, especially for typed languages but it means that the schema needs no preprocessing.

2. Code generation

   Decide and write down the steps to encode/decode each field in a preprocessing step. Basically, compile the schema into code. Encoding or decoding at runtime is as fast as it can be.

Ideally, we would support both approaches for all supported languages, but ain't nobody got time for that. So here is what we currently support:

| Language              | Reflection based serialization | Reflection based deserialization | Serializer code generation | Deserializer code generation |
| --------------------- | ------------------------------ | -------------------------------- | -------------------------- | ---------------------------- |
| Javascript/Typescript | ✅                              | ✅                                | ❌                          | ❌                            |
| Kotlin Multiplatform  | ❌                              | ❌                                | ✅                          | ✅                            |



## Installation

### Javascript/Typescript

Install the schema parser

```shell
npm i @buffela/parser
```

You want to serialize?

```shell
npm i @buffela/serializer
```

You want to deserialize?

```shell
npm i @buffela/deserializer
```

You're a front end developer? 

Install the [buffer](https://www.npmjs.com/package/buffer) browser polyfill.



### JSDoc

Install typescript as a dev dependency

```shell
npm i -D typescript
```

Set up a simple tsconfig.json inside your project folder (don't worry it's for your editor, I won't have you compile anything)

```json
"compilerOptions": {
    "moduleResolution": "nodenext",
    "skipLibCheck": true
}
```



### Kotlin

You can run the developer tools through npm:

```shell
npx @buffela/tools-kotlin --help
```

The first time around it will ask you to download the package, press Enter to proceed.

>Don't know what npm is? Bless your innocent soul xD. I recommend installing node through nvm: https://github.com/nvm-sh/nvm
>
>Install nvm and then run `nvm install --lts`. Now you should have node and npm with it.

You'll also want to install some dependencies required by the generated code in your project:

- `gr.elaevents.buffela:serialization` ([Latest version](https://central.sonatype.com/artifact/gr.elaevents.buffela/serialization))
- `gr.elaevents.buffela:deserialization` ([Latest version](https://central.sonatype.com/artifact/gr.elaevents.buffela/deserialization))

You can skip installing either package if you're interested in only serializing or only deserializing.



## Usage

### Javascript/Typescript

Install the developer tools as a dev dependency

```shell
npm i -D @buffela/tools
```

Run the compiler

```shell
buffela-js YOUR_SCHEMA OUTPUT_DIR
```

This will generate a .json and a .ts file in the specified directory with the same name as your schema file

If you don't want type safety you can skip generating the .ts file by setting the `types` option to an empty string like this: `--types=`



### Javascript example

```js
const { parseSchema } = require('@buffela/parser')
const { registerSerializer } = require('@buffela/serializer')
const { registerDeserializer } = require('@buffela/deserializer')

/**
 * Do this only if you have generated types
 * @type {import('./YOUR_TYPES').default}
 */
const schema = parseSchema(require('./YOUR_JSON'))
registerSerializer(schema, {})
registerDeserializer(schema, {})

const buffer = schema.AuthTokenPayload.serialize({
    issuedAt: Date.now(),
    user: {
        userId: '588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11',
        User_type: schema.User.Registered,
        verified: true,
        Registered_type: schema.User.Registered.Viewer,
        birthDate: '2003-22-07',
        countryCode: 30,
        phone: '1234567890',
        gender: schema.Gender.MALE
    }
})

const payload = schema.AuthTokenPayload.deserialize(buffer)
```



### Typescript example

```js
import { parseSchema } from '@buffela/parser'
import { registerSerializer } from '@buffela/serializer'
import { registerDeserializer } from '@buffela/deserializer'

import type Schema from './YOUR_TYPES'
import schemaObject from './YOUR_JSON' assert { type: 'json' }

/**
 * Do this only if you have generated types
 * @type {import('./AuthToken').default}
 */
const schema = parseSchema(schemaObject) as Schema
registerSerializer(schema, {})
registerDeserializer(schema, {})

const buffer = schema.AuthTokenPayload.serialize({
    issuedAt: Date.now(),
    user: {
        userId: '588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11',
        User_type: schema.User.Registered,
        verified: true,
        Registered_type: schema.User.Registered.Viewer,
        birthDate: '2003-22-07',
        countryCode: 30,
        phone: '1234567890',
        gender: schema.Gender.MALE
    }
})

const payload = schema.AuthTokenPayload.deserialize(buffer)
```



### Kotlin example

Run the kotlin compiler

```shell
npx @buffela/tools-kotlin compile YOUR_SCHEMA OUTPUT_DIR --package=YOUR_PACKAGE
```

This will create a .kt file in the specified directory with the same name as your buffela schema

```kotlin
package YOUR_PACKAGE

import gr.elaevents.buffela.serialization.serialize
import gr.elaevents.buffela.deserialization.deserialize

fun main() {
    val bytes = AuthTokenPayload(
        issuedAt = System.currentTimeMillis().toDouble(),
        user = User.Registered.Viewer(
            userId = "588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11",
            verified = true,
            birthDate = "2003-22-07",
            countryCode = 30u,
            phone = "1234567890",
            gender = Gender.MALE
        )
    ).serialize()

    val payload = AuthTokenPayload.deserialize(bytes)
}
```



## Schema validation

We provide a JSON schema for in-editor validation of your buffela schemata. 

Note that while your editor highlights all errors, the error messages are not very descriptive. If you need more detailed errors, you can run the compiler for your language of choice.

### Javascript/Typescript

Since we expect you'll be writing schemata in a development environment, the schema is bundled with the developer tools that you probably already need. 

After installing the tools, you can find the schema at `node_modules/@buffela/tools-common/schemata/buffela-schema.json`.

### Kotlin

You can export the JSON schema through the command line tool:

```shell
npx @buffela/tools-kotlin schema
```

This will create a buffela-schema.json file in your current directory.

Please make sure to run the command again after every [minor or major](https://semver.org/#summary) buffela update in order to get the latest features.

### Installation

[Install on JetBrains products](https://www.jetbrains.com/help/idea/json.html#ws_json_schema_add_custom_procedure) (Please select the latest schema version)

For VS Code, install the [RedHat YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) and [associate the JSON schema](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml#associating-a-schema-to-a-glob-pattern-via-yaml.schemas)



## Schema syntax

### Root types

The top level types inside your buffela schema are called root types. Their name must (1) start with a capital letter and (2) only contain letters and numbers.

Going back to our example:

```yaml
Gender:
  [...]

User:
  [...]

AuthTokenPayload:
  [...]
  
AuthTokenSignature:
	[...]
```

`Gender`, `User`, `AuthTokenPayload` and `AuthTokenSignature` are all root types. 

Root types can be either *object types* or *enumeration types*.



#### Enumeration types

Enumeration types represent single-choice types. 

They are arrays that can only contain unique values. 

Their values must (1) be in all uppercase and (2) only contain letters, numbers and underscores.

Here is an enumeration type from our example:

```yaml
Gender:
  - FEMALE
  - MALE
```



#### Object types

Object types represent a collection of fields.

They are objects that contain key-values pairs.

The keys are the field names, and they must (1) start with a lowercase letter and (2) only contain letters and numbers.

The values are the field types.

Here is an object from our example:

```yaml
AuthTokenPayload:
  issuedAt: Timestamp
  user: User
```



### Field types

#### References

You can reference other enumeration and object types. For example:

```yaml
gender: Gender
user: User
```



#### Fixed-size primitives

These are the supported fixed-size primitive types along with their mapping to the supported languages and their size in bits.

| Buffela Type | Javascript Type | Kotlin Type | Bit Length | Description                                                  |
| ------------ | --------------- | ----------- | ---------- | ------------------------------------------------------------ |
| **Byte**     | number          | Byte        | 8          | Integers from -128 to 127                                    |
| **UByte**    | number          | UByte       | 8          | Integers from 0 to 255                                       |
| **Short**    | number          | Short       | 16         | Integers from -32,768 to 32,767                              |
| **UShort**   | number          | UShort      | 16         | Integers from 0 to 65,535                                    |
| **Int**      | number          | Int         | 32         | Integers from -2,147,483,648 to 2,147,483,647                |
| **UInt**     | number          | UInt        | 32         | Integers from 0 to 4,294,967,295                             |
| **Long**     | BigInt          | Long        | 64         | Integers from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 |
| **ULong**    | BigInt          | ULong       | 64         | Integers from 0 to 18,446,744,073,709,551,615                |
| **Float**    | number          | Float       | 32         | Decimals from 3.4 E-38 to 3.4 E +38                          |
| **Double**   | number          | Double      | 64         | Decimals from 1.7 E -308 to 1.7 E +308                       |
| **Boolean**  | boolean         | Boolean     | 1          | True or False                                                |

 Here is an example:

```yaml
verified: Boolean
```



#### Constant-sized primitives

These are the supported constant-sized primitive types along with their mapping to the supported languages and their size in bits.

| Buffela Type    | Javascript Type | Kotlin Type | Bit Length | Description                           |
| --------------- | --------------- | ----------- | ---------- | ------------------------------------- |
| **Signed(N)**   | number          | Int         | N          | Integers from -2^(N-1) to 2^(N-1) - 1 |
| **Unsigned(N)** | number          | UInt        | N          | Integers from 0 to 2^N - 1            |

N must always be <= 31.

Here is an example:

```yaml
countryCode: Unsigned(10)
```



#### Strings

Strings and sentinel types meaning that you can *optionally* specify a constant length if you know it beforehand in order to save one byte.

Both of these examples are valid:

```yaml
email: String
userId: String(36)
```



#### Typed arrays

These are the supported typed array primitive types along with their mapping to the supported languages.

| Buffela Type     | Javascript Type | Kotlin Type  |
| ---------------- | --------------- | ------------ |
| **UByteArray**   | Uint8Array      | UByteArray   |
| **ByteArray**    | Int8Array       | ByteArray    |
| **UShortArray**  | Uint16Array     | UShortArray  |
| **ShortArray**   | Int16Array      | ShortArray   |
| **UIntArray**    | Uint32Array     | UIntArray    |
| **IntArray**     | Int32Array      | IntArray     |
| **LongArray**    | BigInt64Array   | LongArray    |
| **ULongArray**   | BigUint64Array  | ULongArray   |
| **FloatArray**   | Float32Array    | FloatArray   |
| **DoubleArray**  | Float64Array    | DoubleArray  |
| **BooleanArray** | boolean[]       | BooleanArray |

Typed array types require a parameter that specifies the length. 

You must either pass a constant length (e.g. 10) or, if your array needs to have a variable length, you must pass the numeric type that will be used to store the length. Said type will constrain the maximum length of your array. The following types are accepted: UByte, UShort, Int and Unsigned(N).

All of these examples are valid:

```yaml
vector: FloatArray(10) # This array must have a length of exactly 10 floats
vector: FloatArray(UByte) # This array can have a length of up to 255 floats
vector: FloatArray(Unsigned(10)) # This array can have a length of up to 1023 floats
```



#### Bytes

The Bytes type maps to Buffer in JS and ByteArray in Kotlin. Like a typed array, it also requires a parameter that specifies the length, and the same rules apply.



### Arrays

You can add a `[LENGTH]` prefix to any type to create an array of that type. You can also chain them to create N-dimensional arrays. The length can be either a constant or a length type just like the parameter of typed arrays.

All of these examples are valid:

```yaml
roles: String[10] # This array must have a length of exactly 10 strings
roles: String[UByte] # This array can have a length of up to 255 strings
roles: String[Unsigned(10)] # This array can have a length of up to 1023 strings
```

Don't get confused with typed arrays, you can also make them higher-dimensional:

```yaml
temperature: FloatArray(10)[10][10] # This represents a 10x10x10 cube of floats
```



### Custom primitives

In our example, we store dates (specifically the birth date of registered viewers) as strings. This is not very efficient and takes 10 bytes (=80 bits) to store. With a custom type we could wind that down to only 22 bits. Specifically, we could combine the month and year into a single 17-bit number using the following formula: `year * 12 + (month - 1)` and store the day in a 5-bit number, allowing us to represent any date between `0000-00-00` and `10922-08-31`.  As this type requires math operations, we cannot use a simple object type but we can extend buffela with our own custom primitive.

A custom type consists of a serializer and a deserializer. We will have to make use of the SerializerBuffer and DeserializerBuffer APIs.

| SerializerBuffer Methods                        | DeserializerBuffer Methods         |
| ----------------------------------------------- | ---------------------------------- |
| **writeByte**(byte)                             | **readByte**()                     |
| **writeUByte**(uByte)                           | **readUByte**()                    |
| **writeShort**(short)                           | **readShort**()                    |
| **writeUShort**(uShort)                         | **readUShort**()                   |
| **writeInt**(int)                               | **readInt**()                      |
| **writeUInt**(uInt)                             | **readUInt**()                     |
| **writeLong**(long)                             | **readLong**()                     |
| **writeULong**(uLong)                           | **readULong**()                    |
| **writeFloat**(float)                           | **readFloat**()                    |
| **writeDouble**(double)                         | **readDouble**()                   |
| **writeBoolean**(boolean)                       | **readBoolean**()                  |
| **writeString**(string, nullTerminated = false) | **readString**(length = untilNull) |
| **writeBytes**(bytes)                           | **readBytes**(length)              |
| **writeSigned**(value, bitLength)               | **readSigned**(bitLength)          |
| **writeUnsigned**(value, bitLength)             | **readUnsigned**(bitLength)        |

There are also some read-only properties:

- `SerializerBuffer.size`: How many bytes have been written to the buffer thus far
- `DeserializeBuffer.position`: How many bytes have been read from the buffer thus far



#### JSDoc/Typescript

For JSDoc or Typescript we need to create a folder called *primitives* alongside our schema type definition file. Inside the *primitives* folder we will create a .ts file named after our new type (in this case 'Date.ts'), write the interface, and make it the default export:

```ts
export default interface Date {
    year: number;
    month: number;
    day: number;
}
```



#### Javascript/Typescript

We now need to create and register a serializer for our type. We do this in our `registerSerializer` call:

```js
registerSerializer(schema, {
    Date: {
        serialize(buffer, value) {
            const yearMonth = value.year * 12 + (value.month - 1)
            const day = value.day - 1

            buffer.writeUnsigned(yearMonth, 17)
            buffer.writeUnsigned(day, 5)
        }
    }
})
```

Same story for the deserializer:

```js
registerDeserializer(schema, {
    Date: {
        deserialize(buffer) {
            const yearMonth = buffer.readUnsigned(17)
            const day = buffer.readUnsigned(5)

            return {
                year: Math.floor(yearMonth / 12),
                month: yearMonth % 12 + 1,
                day: day + 1
            }
        }
    }
})
```



#### Kotlin

In Kotlin, custom types are data classes. The custom classes must be defined in the same package as the generated code. We begin by defining the class:

```kotlin
data class Date(val year: Int, val month: Int, val day: Int)
```

Then we extend SerializerBuffer with a method called write*Type* (in this case writeDate):

```kotlin
import gr.elaevents.buffela.serialization.SerializerBuffer

fun SerializerBuffer.writeDate(date: Date) {
    val yearMonth = date.year * 12 + (date.month - 1)
    val day = date.day - 1

    writeUnsigned(yearMonth.toUInt(), 17)
    writeUnsigned(day.toUInt(), 5)
}
```

Similarly, extend DeserializerBuffer with read*Type* (readDate):

```kotlin
fun DeserializerBuffer.readDate(): Date {
    val yearMonth = readUnsigned(17).toInt()
    val day = readUnsigned(5).toInt()

    return Date(
        year = yearMonth / 12,
        month = yearMonth % 12 + 1,
        day = day + 1
    )
}
```



#### Schema

Now we can finally use our type, so simply change

```yaml
birthDate: String
```

to

```yaml
birthDate: Date
```



### Type aliases

You may find yourself using a type with a specific parameter or array length over and over again in your schema. That is why aliases exist. Simply define a type alias in your schema to any primitive or root type:

```yaml
Uuid: String(36)
```

Your could also use aliases for purely semantic reasons:

```yaml
Timestamp: Double
```

Have in mind though that alias resolution is not recursive, or put more simply, you cannot use aliases inside an alias.



### Sub (object) types

Sometimes you may need an object that can take multiple forms. In our example we create an authentication token for all users, registered or not, containing a unique user id. But our registered users will have additional fields, like whether their credentials are verified. Additionally, we have two types of users: viewers and organizers. Organizers register by email and viewers register by phone. To represent this hierarchy we can use subtypes.

```yaml
User:
  [...]
  
  Anonymous: {}

	Registered:
		[...]
		
		Viewer: 
			[...]
			
    Organizer:
    	[...]
```

In our example, `Anonymous` and `Registered` are subtypes of `User`. A subtype inherits all fields from its parent type, and can have other subtypes of its own. In the compiled representation the structure is flattened, meaning that all fields live in the same level.

`Anonymous` is kind of special in that it doesn't define any fields nor does it have any subtypes. In this case the value must be `{}` (an empty object).



#### Subtype specification

How you specify a subtype differs from language to language:

In **Javascript**, the compiled type will have an additional field for each abstract (non-leaf) type named *Type*_type. For the above example you need to specify a User_type, and if the user type is set to registered you must additionally specify a Registered_type. These subtypes live inside the object returned by parseSchema, in the same path as defined in the schema:

```js
const schema = parseSchema(...)

const user = {
	User_type: schema.User.Registered,
	Registered_type: schema.User.Registered.Viewer,
 	[...]
}
```

In **Kotlin**, subtypes are just nested classes. So to create a registered viewer you would do:

```kotlin
val user = User.Registered.Viewer(
	[...]
)
```



#### Field overriding

You may need to override the type of a field only for specific subtypes. To do this, simply define the field again inside the subtype with the modified type. For our example, let's say that organizers can choose any user id they want, while all other users get automatically generated UUIDs. You would write this as:

```yaml
User:
  userId: Uuid # Resolves to String(36)
  [...]
  
	Registered:
		[...]
			
    Organizer:
    	userId: String
```

With this mechanism you can safely override the length parameter or an array's i-th dimension length (e.g. String -> String(10), Int[10] -> Int[UByte]). The only rule is that all type overrides should map to the same native type in your language of choice.

In advanced scenarios, you could also override with a more specific custom primitive (e.g Date -> DateTime).

In extreme scenarios, and if you're exclusively using Javascript, you could even override with a different numeric type (e.g. Int -> Double) as these both map to the same 'number' type. This, conversely, would be invalid in Kotlin.



## Root type concatenation

In some cases you may want to serialize multiple root types into a single buffer. In this case you must work directly with the SerializerBuffer and DeserializerBuffer classes.



### Simple example

If you're using buffela for client-server communication you may want to add a version header to all packets.



#### Javascript/Typescript

```javascript
const buffer = new SerializerBuffer()

schema.Header.serialize({ version: 2 }, buffer)
schema.Body.serialize({ ... }, buffer)

const bytes = buffer.toBytes()
```

```javascript
const buffer = new DeserializerBuffer(bytes)

const header = schema.Header.deserialize(buffer)
if (header.version !== 2)
	throw new Error("Packet version not supported")

const body = schema.Body.deserialize(buffer)
```



#### Kotlin

```kotlin
val buffer = SerializerBuffer()

val header = Header(version = 2)
header.serialize(buffer)

val body = Body(...)
body.serialize(buffer)

val bytes = buffer.toBytes()
```

```kotlin
val buffer = DeserializerBuffer(bytes)

val header = Header.deserialize(buffer)
if (header.version != 2)
	throw IllegalStateException("Packet version not supported")

val body = Body.deserialize(buffer)
```



### Bit buffer

Buffela uses bit packing internally to minimize the output size, but that means that the boundary between consecutive types inside the buffer may not be byte-aligned. To ensure that the next serialize()/deserialize() call begins at a byte boundary, you can call the clearBitBuffer() method on the SerializerBuffer/DeserializerBuffer. This is useful when trying to isolate the bytes belonging to a specific type in order to hash or sign them. Note that if you clear the bit buffer between two serialize() calls, then you must also clear it between the deserialize() calls and vice versa.



### Advanced example

In our example, we want to serialize our payload, then read it back as bytes in order to calculate the HMAC-256 signature and then write the calculated signature into the same buffer.



#### Javascript/Typescript

```js
const buffer = new SerializerBuffer()

// Write the payload into the buffer
schema.AuthTokenPayload.serialize({ ... })

// Read the serialized payload and sign it
const payloadBytes = buffer.toBytes()
const hmac256 = sign(payloadBytes)

// Clear the bit buffer
buffer.clearBitBuffer()

// Write the signature into the buffer
schema.AuthTokenSignature.serialize({ hmac256 })

// Get the combined payload + signature as bytes
const bytes = buffer.toBytes()
```

```js
const buffer = new Deserializer(bytes)

// Deserialize the payload
const payload = schema.AuthTokenPayload.deserialize(buffer)

// The deserializer has only read the payload, all bytes up to the current position must be the payload
const payloadBytes = bytes.subarray(0, buffer.position)

// Clear the bit buffer
buffer.clearBitBuffer()

// Continue to deserialize the signature
const signature = schema.AuthTokenSignature.deserialize(buffer)

// Verify the signature
verify(payloadBytes, signature.hmac256)
```

View the [complete example](./js/examples/buffela/complex.js)



#### Kotlin

```kotlin
val buffer = SerializerBuffer()

// Write the payload into the buffer
val payload = AuthTokenPayload(...)
payload.serialize(buffer)

// Read the serialized payload and sign it
val payloadBytes = payload.toBytes()
val hmac256 = sign(payloadBytes)

// Clear the bit buffer
buffer.clearBitBuffer()

// Write the signature into the buffer
val signature = AuthTokenSignature(hmac256 = hmac256)
signature.serialize(buffer)

// Get the combined payload + signature as bytes
val bytes = buffer.toBytes()
```

```kotlin
val buffer = DeserializerBuffer(bytes)

// Deserialize the payload
val payload = AuthTokenPayload.deserialize(buffer)

// The deserializer has only read the payload, all bytes up to the current position must be the payload
val payloadBytes = bytes.sliceArray(0 until buffer.position)

// Clear the bit buffer
buffer.clearBitBuffer()

// Continue to deserialize the signature
val signature = AuthTokenSignature.deserialize(buffer)

// Verify the signature
verify(payloadBytes, signature.hmac256)
```

View the [complete example](./kotlin/examples/src/main/kotlin/Complex.kt)
