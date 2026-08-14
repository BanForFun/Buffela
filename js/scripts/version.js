const fs = require('fs')

if (process.argv.length !== 3) {
    console.error('Usage: node version.js VERSION')
    process.exit(1)
}

const packagePath = 'package.json'
const packageContents = fs.readFileSync(packagePath, 'utf8')

const packageObject = JSON.parse(packageContents)
packageObject.version = process.argv[2]

const newPackageContents = JSON.stringify(packageObject, null, 2)
fs.writeFileSync(packagePath, newPackageContents)