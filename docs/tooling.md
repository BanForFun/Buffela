# Tooling guide

## Common options

This section applies to both the kotlin and the javascript tooling.

### Input

The first argument is the input schema. This can either be:

1. A file
2. A directory: Will match all files inside it recursively
3. An extension pattern (e.g. *.yaml): Will match all files with the given extension inside the current working directory recursively

**Warning!** Most shells will expand the '*' character so if you're using an extension pattern, make sure to wrap it in single quotes to make it a string literal e.g. `'*.yaml'`

### Output

The second argument is the output directory. When not provided it defaults to the current working directory

In any case, the output will attempt to match the input's directory structure. For example, if the schema file is at './a/b/schema.yaml', relative to the current working directory, the output will be at '*OUTPUT_DIR*/a/b/schema.*EXT*'. If the schema is not inside the current working directory, e.g. '../schema.yaml', the output will be at the current working directory. More examples:

| Input file        | Output directory | Output file             |
| ----------------- | ---------------- | ----------------------- |
| ./a/b/schema.yaml | . (Default)      | ./a/b/schema.EXT        |
| ./a/b/schema.yaml | ../out           | ../out/a/b/schema.*EXT* |
| ./a/b/schema.yaml | ./a              | ./a/a/b/schema.*EXT*    |

### Root directories

For complex multi module projects, you can provide multiple root directories using the `--rootDirs` (`-r`) option, separated by space (e.g. `--rootDirs a b`). These will replace the current working directory for the input and output path resolution. See the examples section for your language of choice for more details.

### Watch mode

You can specify the `--watch` (`-w`) option so that the tooling runs again on every change to your schema

### Disabling (de)serialization

If you don't need (de)serialization capabilities for a specific schema, you can disable the (de)serializer generation by specifying `--no-deserializer` or `--no-serializer` respectively.



## Javascript/Typescript options

### Json output

You can specify a more specific output directory for the json file using the `--jsonDir` (`-j`) option. This is resolved relative to the global output directory.

### Type definition output

You can specify a more specific output directory for the type definition file using the `--typeDefDir` (`-t`) option. This is resolved relative to the global output directory. You can also disable type definiton output by setting the output directory to an empty string: `--typeDefDir=` (note the trailing '=').

### Example

Say you have the following directory structure:

```
features/
  featureA/
    buffela/
      schemas/
        FeatureA.buffela.yaml
      json/
      types/
  featureB/
    buffela/
      schemas/
        FeatureB.buffela.yaml
      json/
      types/
```

You could use the command:

```shell
buffela-js . ../ --jsonDir=./json --typeDefDir=./types --rootDirs "./features/*/buffela/schemas"
# Note: The directories glob is expanded by your shell at the time you run the command, 
# meaning that if you add a new feature directory you'll need to run the command again
```



## Kotlin options

### Package root

The compiler automatically infers the package name from the output file path. But, if you are using a compact directory structure (without the whole com/example/domain kind of directory structure), you can specify a root package name to prepend to the inferred one using the `--packageRoot` (`-p`) option.

### Example 1

Say you have the following directory structure:

```
features/
  featureA/
    src/
      main/
        buffela/
          featureA/
            FeatureA.buffela.yaml
        kotlin/
          featureA/
  featureB/
    src/
      main/
        buffela/
          featureB/
            FeatureB.buffela.yaml
        kotlin/
          featureB/
```

You could use the command:

```shell
npx @buffela/tools-kotlin compile . ../kotlin --packageRoot=com.example.app --rootDirs "./features/*/src/main/buffela"
# Note: The directories glob is expanded by your shell at the time you run the command, 
# meaning that if you add a new feature directory you'll need to run the command again
```

### Example 2

Say you have the following directory structure:

```
features/
  featureA/
    src/
      main/
        buffela/
          com/
            example/
              app/
                featureA/
                  FeatureA.buffela.yaml
        kotlin/
          com/
            example/
              app/
                featureA/
  featureB/
    src/
      main/
        buffela/
          com/
            example/
              app/
                featureB/
                  FeatureB.buffela.yaml
        kotlin/
          com/
            example/
              app/
                featureB/
```

You could use the command:

```shell
npx @buffela/tools-kotlin compile . ../kotlin --rootDirs "./features/*/src/main/buffela"
# Note: The directories glob is expanded by your shell at the time you run the command, 
# meaning that if you add a new feature directory you'll need to run the command again
```
