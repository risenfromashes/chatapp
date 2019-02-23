var shell = require('shelljs')


shell.cp('-R', './src/public/', './dist/')
shell.cp('src/server/config/config.json', './dist/server/config')